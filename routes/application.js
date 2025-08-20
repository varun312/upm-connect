const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /application-form - render form
router.get('/application-form', auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.render('application-form', { user: user || null });
});

// POST /application-form - save form data
router.post('/application-form', auth, async (req, res) => {
  try {
    const { pingId, password, category } = req.body;
    // Find user by pingId
    const user = await User.findOne({ pingId });
    if (!user) return res.status(400).send('Invalid Ping ID');
    // Check password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid password');
    // Create application
    const app = new Application({ pingId, category });
    await app.save();
    // Add application reference to user's applications array
    user.applications.push(app._id);
    await user.save();
    res.send('Application submitted!');
  } catch (err) {
    console.log(err);
    res.status(400).send('Error submitting application');
  }
});

module.exports = router;