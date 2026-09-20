const cloudinary = require('../../config/Cloudinary.js');
const fs = require('node:fs/promises');

const UploadResume = async (req, res) => {
  let uploaded;
  let saved = false;
  try {
    if (!req.file) return res.status(400).json({ msg: 'No resume uploaded' });
    // Ownership comes from authentication, never from a submitted student ID.
    if (req.body.userId && req.body.userId !== String(req.user._id)) {
      return res.status(403).json({ msg: 'You can only upload your own resume.' });
    }
    const contents = await fs.readFile(req.file.path);
    if (req.file.mimetype !== 'application/pdf' || contents.subarray(0, 5).toString() !== '%PDF-') {
      return res.status(400).json({ msg: 'Only PDF files are allowed.' });
    }
    const previousId = req.user.studentProfile.resumePublicId;
    uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: 'CPMS/Resume',
      resource_type: 'raw',
      public_id: `${req.user._id}_${Date.now()}.pdf`,
    });
    req.user.studentProfile.resume = uploaded.secure_url;
    req.user.studentProfile.resumePublicId = uploaded.public_id;
    await req.user.save();
    saved = true;
    // Remove the previous document only after the replacement is saved.
    if (previousId) {
      await cloudinary.uploader.destroy(previousId, { resource_type: 'raw' })
        .catch(() => console.warn('Previous resume could not be removed from storage.'));
    }
    return res.status(200).json({ msg: 'Resume uploaded successfully!', url: uploaded.secure_url });
  } catch {
    if (uploaded && !saved) {
      await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: 'raw' }).catch(() => {});
    }
    return res.status(500).json({ msg: 'Unable to upload resume. Please try again.' });
  } finally {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
  }
};

module.exports = UploadResume;
