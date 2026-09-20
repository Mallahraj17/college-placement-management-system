# Local setup

Use Node.js 24 LTS, npm, a running MongoDB instance, and a Cloudinary account for uploads. Email features also need Gmail SMTP credentials. Do not commit passwords, API keys, or real student records.

## Start locally (PowerShell)

In the backend directory:

```powershell
npm ci
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Edit backend/.env. Put the generated value in JWT_SECRET. Set MONGODB_URL to your own MongoDB connection string (the original README incorrectly used MONGO_URI). Set Cloudinary and email values from your own accounts. The copy command is for first-time setup; retain an existing .env.

```powershell
npm run dev
```

In a second terminal, in the frontend directory:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173. The API uses port 4518 by default. Restart Vite after editing frontend/.env; its variables are embedded at build time.

Set backend FRONTEND_URL to your deployed frontend address before using account emails. It defaults to http://localhost:5173 for local development. Project branding and maintenance contact: Raj.

Student signup creates an unapproved student account. Placement access requires approval through the original administration workflow. An empty database has no initial administrator; the upstream project does not include an administrator seed command.

## Fixes in this copy

- Updated dependency lockfiles; removed unused Cloudinary storage adapter and direct dependencies that Express already manages.
- Added environment examples and ignored credentials, generated builds, coverage, and logs.
- Fixed missing error-state handlers, missing navigation, and profile redirects that previously triggered for every server error.
- Resume uploads now require an authenticated student, enforce ownership, limit uploads to 5 MB, check the PDF MIME type and header, and remove temporary files.
- Resume replacement saves the new document before removing the old one. New uploads are rolled back if the database save fails. Legacy resumes without a recorded Cloudinary public ID are retained to avoid deleting the wrong file.
- Backend startup reports missing configuration and database connection failures instead of running with an unavailable database.

## Verification and limits

Run `npm test` in backend for upload authorization, validation, size limit, replacement, and rollback regression tests. These tests use mocked database and Cloudinary clients; they do not send documents to a real account.

Run `npm run build` in frontend for the production build. Run `npm audit` in each directory to recheck dependency advisories.

The inherited frontend still has lint findings (unused imports, missing prop validation, and React effect/dependency patterns). Run `npm run lint` to inspect them; this copy does not disable those rules to hide the findings. A complete application security review and end-to-end testing against real MongoDB, Cloudinary, and email accounts have not been performed.

Use the local setup above for initial development. The inherited Docker/Kubernetes deployment definitions have not been validated by this change.
