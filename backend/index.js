require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

// public folder for users profile
app.use('/profileImgs', express.static(path.join(__dirname, 'public/profileImgs')));
app.use('/resume', express.static(path.join(__dirname, 'public/resumes')));
app.use('/offerLetter', express.static(path.join(__dirname, 'public/offerLetter')));

// database import 
const mongodb = require('./config/MongoDB');


// routes for user
app.use('/user', require('./routes/user.route'));
// routes for student user
app.use('/student', require('./routes/student.route'));
// routes for tpo user
app.use('/tpo', require('./routes/tpo.route'));
// routes for management user
app.use('/management', require('./routes/management.route'));
// routes for admin user
app.use('/admin', require('./routes/superuser.route'));

// route for company
app.use('/company', require('./routes/company.route'));
// test route
app.use('/test', (req, res)=>{
  res.status(200).send("Working Fine!");
});


app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ msg: 'Files must be no larger than 5 MB.' });
  }
  if (err.name === 'MulterError') return res.status(400).json({ msg: 'Invalid file upload.' });
  return res.status(500).json({ msg: 'Internal server error.' });
});

async function start() {
  if (!process.env.MONGODB_URL || !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace-')) {
    throw new Error('Configure MONGODB_URL and a random JWT_SECRET (32+ characters) in backend/.env. See .env.example.');
  }
  try {
    await mongodb();
  } catch {
    throw new Error('Cannot connect to MongoDB. Check MONGODB_URL and ensure the database is running.');
  }
  const port = process.env.PORT || 4518;
  return app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}

if (require.main === module) {
  start().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
