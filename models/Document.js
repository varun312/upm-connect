const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  pingId: { type: String, required: true },
  docType: { type: String },
  filePath: { type: String, required: true },
  source: { type: String, enum: ['service-center', 'scanner', 'mail-in'] },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Document', documentSchema);
