const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Add bcryptjs

// Middleware to check admin (approvalLevel 4)
function adminOnly(req, res, next) {
  if (req.user && req.user.approvalLevel === 4) return next();
  return res.status(403).send('Forbidden: Admins only');
}

// GET /admin - show users pending approval
router.get('/admin', auth, adminOnly, async (req, res) => {
  const users = await User.find({ approvalLevel: 0 });
  const user = await User.findById(req.user.userId);
  res.render('admin', { users, user: user || null });
});

// POST /admin/approve/:id - approve a user
router.post('/admin/approve/:id', async (req, res) => {
  const userId = req.params.id;
  // Generate a random 12-digit numeric pingId
  const pingId = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  const plainPassword = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash password

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { approvalLevel: 1, pingId, password: hashedPassword } },
    { new: true }
  );
  res.json({ success: true, pingId: user.pingId, password: plainPassword }); // Return plain password to admin
});

module.exports = router;