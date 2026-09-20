const { test, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
const { app } = require('../index');
const User = require('../models/user.model');
const cloudinary = require('../config/Cloudinary');
let server, base, user, upload, destroy, temporaryPath;

before(async () => {
  server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
beforeEach(() => {
  mock.restoreAll();
  temporaryPath = undefined;
  user = {
    _id: '507f1f77bcf86cd799439011',
    role: 'student',
    studentProfile: { resume: 'https://example.test/old.pdf', resumePublicId: 'CPMS/Resume/old.pdf' },
    save: mock.fn(async () => {}),
  };
  mock.method(User, 'findOne', async () => user);
  upload = mock.method(cloudinary.uploader, 'upload', async file => {
    temporaryPath = file;
    return { secure_url: 'https://example.test/new.pdf', public_id: 'CPMS/Resume/new.pdf' };
  });
  destroy = mock.method(cloudinary.uploader, 'destroy', async () => ({ result: 'ok' }));
});
async function request({ auth = true, content = '%PDF-1.7\nfixture', type = 'application/pdf', owner, noFile = false } = {}) {
  const body = new FormData();
  if (!noFile) body.append('resume', new Blob([content], { type }), 'resume.pdf');
  if (owner) body.append('userId', owner);
  const headers = auth ? { Authorization: `Bearer ${jwt.sign({ userId: user._id }, process.env.JWT_SECRET)}` } : {};
  return fetch(`${base}/student/upload-resume`, { method: 'POST', body, headers });
}
test('anonymous resume uploads are rejected before storage', async () => {
  assert.equal((await request({ auth: false })).status, 401);
  assert.equal(upload.mock.callCount(), 0);
});
test('non-student accounts cannot upload a student resume', async () => {
  user.role = 'management_admin';
  assert.equal((await request()).status, 403);
  assert.equal(upload.mock.callCount(), 0);
});
test('another student ID cannot overwrite their resume', async () => {
  assert.equal((await request({ owner: '507f1f77bcf86cd799439012' })).status, 403);
  assert.equal(upload.mock.callCount(), 0);
});
test('missing and disguised non-PDF files are rejected', async () => {
  assert.equal((await request({ noFile: true })).status, 400);
  assert.equal((await request({ content: 'not a PDF' })).status, 400);
  assert.equal((await request({ type: 'text/plain' })).status, 400);
  assert.equal(upload.mock.callCount(), 0);
});
test('files over 5 MB return an actionable JSON error', async () => {
  const result = await request({ content: Buffer.alloc(5 * 1024 * 1024 + 1) });
  assert.equal(result.status, 413);
  assert.match((await result.json()).msg, /5 MB/);
  assert.equal(upload.mock.callCount(), 0);
});
test('a successful upload saves the new resume before removing the old one', async () => {
  destroy.mock.mockImplementation(async id => {
    assert.equal(user.save.mock.callCount(), 1);
    assert.equal(id, 'CPMS/Resume/old.pdf');
  });
  assert.equal((await request()).status, 200);
  assert.equal(user.studentProfile.resumePublicId, 'CPMS/Resume/new.pdf');
  assert.equal(destroy.mock.callCount(), 1);
  // Cleanup runs after the HTTP response has been queued.
  await new Promise(resolve => setTimeout(resolve, 25));
  await assert.rejects(fs.access(temporaryPath), { code: 'ENOENT' });
});
test('storage failures preserve the existing resume', async () => {
  upload.mock.mockImplementation(async () => { throw new Error('Storage unavailable'); });
  assert.equal((await request()).status, 500);
  assert.equal(user.studentProfile.resume, 'https://example.test/old.pdf');
  assert.equal(user.save.mock.callCount(), 0);
  assert.equal(destroy.mock.callCount(), 0);
});
test('database failures remove the new upload and retain the old stored file', async () => {
  user.save.mock.mockImplementation(async () => { throw new Error('Database unavailable'); });
  assert.equal((await request()).status, 500);
  assert.equal(destroy.mock.callCount(), 1);
  assert.equal(destroy.mock.calls[0].arguments[0], 'CPMS/Resume/new.pdf');
});
