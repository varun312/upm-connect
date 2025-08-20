const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Spending = require('../models/Spending');
const User = require('../models/User');

// Middleware to check admin (approvalLevel 4)
function adminOnly(req, res, next) {
  if (req.user && req.user.approvalLevel === 4) return next();
  return res.status(403).send('Forbidden: Admins only');
}

// Approve an application
router.post('/admin/applications/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    await Application.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.redirect('/admin/applications');
  } catch (err) {
    res.status(500).send('Error approving application');
  }
});

// Reject an application
router.post('/admin/applications/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    await Application.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.redirect('/admin/applications');
  } catch (err) {
    res.status(500).send('Error rejecting application');
  }
});
// Approve a document
router.post('/admin/documents/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    await Document.findByIdAndUpdate(req.params.id, { status: 'verified' });
    res.redirect('/admin/documents');
  } catch (err) {
    res.status(500).send('Error approving document');
  }
});

// Reject a document
router.post('/admin/documents/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    await Document.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.redirect('/admin/documents');
  } catch (err) {
    res.status(500).send('Error rejecting document');
  }
});

// GET /admin/meetings - show meeting creation form
router.get('/admin/meetings', auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.render('admin-meetings', { user: user || null });
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

// GET /admin/spendings - show spending creation form
router.get('/admin/spendings', auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.render('admin-spendings', { user: user || null });
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

// GET /admin/applications - show applications table
router.get('/admin/applications', auth, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find().sort({ _id: -1 });
    // Get all pingIds from applications
    const pingIds = applications.map(app => app.pingId);
    // Fetch all users with those pingIds, populate vaultDocs
    const users = await User.find({ pingId: { $in: pingIds } })
      .populate('vaultDocs');
    const user = await User.findById(req.user.userId);
    res.render('admin-applications', { applications, users, user: user || null });
  } catch (err) {
    res.status(500).send('Error loading applications');
  }
});

// GET /admin/documents - show document requests table
router.get('/admin/documents', auth, adminOnly, async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    const user = await User.findById(req.user.userId);
    res.render('admin-documents', { documents, user: user || null });
  } catch (err) {
    res.status(500).send('Error loading documents');
  }
});

module.exports = router;
