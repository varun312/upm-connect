const mongoose = require('mongoose');

const businessApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  gstNumber: { type: String },
  proofIdentity: { type: String, required: true },
  proofResidence: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BusinessApplication', businessApplicationSchema);
