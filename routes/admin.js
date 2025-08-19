const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

// Middleware to check admin (approvalLevel 4)
function adminOnly(req, res, next) {
  if (req.user && req.user.approvalLevel === 4) return next();
  return res.status(403).send('Forbidden: Admins only');
}

// GET /admin/meetings - show meeting creation form
router.get('/admin/meetings', auth, adminOnly, (req, res) => {
  res.render('admin-meetings');
});

// POST /admin/meetings - create a new meeting
router.post('/admin/meetings', auth, adminOnly, async (req, res) => {
  const { date, agenda } = req.body;
  try {
    await Meeting.create({ date, agenda });
    res.redirect('/meeting-minutes');
  } catch (err) {
    res.status(400).send('Error creating meeting');
  }
});

const Spending = require('../models/Spending');
// GET /admin/spendings - show spending creation form
router.get('/admin/spendings', auth, adminOnly, (req, res) => {
  res.render('admin-spendings');
});

// POST /admin/spendings - create a new spending
router.post('/admin/spendings', auth, adminOnly, async (req, res) => {
  const { date, department, description, amount, status } = req.body;
  try {
    await Spending.create({ date, department, description, amount, status });
    res.redirect('/spendings');
  } catch (err) {
    res.status(400).send('Error creating spending');
  }
});

module.exports = router;
