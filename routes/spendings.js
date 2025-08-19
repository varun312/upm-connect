const express = require('express');
const router = express.Router();
const Spending = require('../models/Spending');
const auth = require('../middleware/auth');

// GET /spendings - show all spendings
router.get('/spendings', auth, async (req, res) => {
  try {
    const spendings = await Spending.find().sort({ date: -1 });
    res.render('spendings', { spendings });
  } catch (err) {
    res.status(500).send('Error fetching spendings');
  }
});

module.exports = router;
