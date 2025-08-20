const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Registration route
router.post('/register', upload.fields([
  { name: 'proof-residence', maxCount: 1 },
  { name: 'proof-identity', maxCount: 1 }
]), async (req, res) => {
  const {
    'first-name': firstName,
    'last-name': lastName,
    dob,
    gender,
    adres,
    'issue-date': issuedate,
    'proof-residence-type': proofResidenceType,
    'proof-identity-type': proofIdentityType
  } = req.body;

  console.log("h");

  try {
    console.log("a");
  
    console.log("shit");
    console.log(req.body);
    const user = new User({
      firstName,
      lastName,
      dob,
      gender,
      adres,
      issuedate,
      proofResidence: {
        type: proofResidenceType,
        file: req.files['proof-residence'] ? req.files['proof-residence'][0].filename : undefined
      },
      proofIdentity: {
        type: proofIdentityType,
        file: req.files['proof-identity'] ? req.files['proof-identity'][0].filename : undefined
      }
    });

    console.log("here");
    console.log(user);

    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.status(400).send('User already exists');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { 'first-name': firstName, 'last-name': lastName, 'pingId': pingId, password } = req.body;

  // Find user by firstName, lastName, and pingId
  const user = await User.findOne({ firstName, lastName, pingId }).populate('vaultDocs');

  if (!user) {
    // User not found by names and pingId
    return res.status(400).send('User not found');
  }

  if (!user.pingId) {
    // pingId missing
    return res.status(400).send('Review pending');
  }

  // Check password
  if (!user.password) {
    return res.status(400).send('Password not set');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });

  // Pass vaultDocs to dashboard view
  res.render('dashboard', { vaultDocs: user.vaultDocs || [] });
});

module.exports = router;