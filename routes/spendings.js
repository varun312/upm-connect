const express = require('express');
const router = express.Router();
const Spending = require('../models/Spending');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Import User model

// GET /spendings - show all spendings
router.get('/spendings', auth, async (req, res) => {
  try {
    const spendings = await Spending.find().sort({ date: -1 });
    const user = await User.findById(req.user.userId); // Fetch full user object
    res.render('spendings', { spendings, user: user || null });
  } catch (err) {
    res.status(500).send('Error fetching spendings');
  }
});

module.exports = router;