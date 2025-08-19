const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  approvalLevel: { type: Number, min: 0, max: 3, default: 0 },
  address: { type: String }, // Added address field
  name: { type: String },
  dob: { type: Date },
  gender: { type: String },
  issuedate: { type: Date },
  chipSerialNumber: { type: String },
  vaultDocs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  applications: [{ type: mongoose.Schema.Types.ObjectId }]
});

module.exports = mongoose.model('User', userSchema);