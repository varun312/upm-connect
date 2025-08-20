const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Import User model

// GET /meeting-minutes - show all meetings
router.get('/meeting-minutes', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ date: -1 });
    const user = await User.findById(req.user.userId); // Fetch full user object
    res.render('meeting-minutes', { meetings, user: user || null });
  } catch (err) {
    res.status(500).send('Error fetching meetings');
  }
});

// GET /meeting-minutes/:id - show meeting detail
router.get('/meeting-minutes/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).send('Meeting not found');
    const user = await User.findById(req.user.userId); // Fetch full user object
    res.render('meeting-detail', { meeting, user: user || null });
  } catch (err) {
    res.status(500).send('Error fetching meeting');
  }
});

module.exports = router;