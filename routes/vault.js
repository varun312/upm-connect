const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// POST /vault/upload
router.post('/vault/upload', upload.single('file'), async (req, res) => {
  try {
    const { pingId, docType, source } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;
    const doc = await Document.create({
      pingId,
      docType,
      filePath,
      source
    });
    res.json({ id: doc._id });
  } catch (err) {
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
router.get('/vault', async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.render('vault', { docs });
  } catch (err) {
    res.status(500).send('Error loading vault');
  }
});

module.exports = router;
