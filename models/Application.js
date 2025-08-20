const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  pingId: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

module.exports = mongoose.model('Application', ApplicationSchema);
