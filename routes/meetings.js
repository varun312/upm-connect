const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

// GET /meeting-minutes - show all meetings
router.get('/meeting-minutes', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ date: -1 });
    res.render('meeting-minutes', { meetings });
  } catch (err) {
    res.status(500).send('Error fetching meetings');
  }
});

// GET /meeting-minutes/:id - show meeting detail
router.get('/meeting-minutes/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).send('Meeting not found');
    res.render('meeting-detail', { meeting });
  } catch (err) {
    res.status(500).send('Error fetching meeting');
  }
});

module.exports = router;
