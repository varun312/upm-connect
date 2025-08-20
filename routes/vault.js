const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Import User model

// POST /vault/upload
router.post('/vault/upload', auth, upload.single('file'), async (req, res) => {
  try {
    // Extract user id from JWT (assuming auth middleware sets req.user)
    const userId = req.user && req.user.userId ? req.user.userId : null;
    if (!userId) return res.status(401).json({ error: 'Invalid or missing JWT' });

    // Get user from DB to fetch pingId
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const pingId = user.pingId;
    if (!pingId) return res.status(400).json({ error: 'User missing pingId' });

    const { docType, source } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Use only the file name instead of the full path
    const filePath = req.file.filename;

    // Create document with pingId
    const doc = await Document.create({
      pingId,
      docType,
      filePath,
      source
    });

    // Add document reference to user's vaultDocs
    user.vaultDocs.push(doc._id);
    await user.save();

    res.json({ id: doc._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /vault/download/:docId - download a document file
router.get('/vault/download/:docId', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const filePath = path.resolve(doc.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });
    res.download(filePath, path.basename(filePath));
  } catch (err) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// GET /vault - show document vault page
router.get('/vault', auth, async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    const user = await User.findById(req.user.userId); // Fetch full user object
    res.render('vault', { docs, user: user || null });
  } catch (err) {
    res.status(500).send('Error loading vault');
  }
});

module.exports = router;