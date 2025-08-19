const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Registration route
router.post('/register', async (req, res) => {
  const { username, password, name, dob, gender, address, issuedate, chipSerialNumber } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      name,
      dob,
      gender,
      address,
      issuedate,
      chipSerialNumber
    });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.status(400).send('User already exists');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('Invalid credentials');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid credentials');
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/dashboard');
});

module.exports = router;