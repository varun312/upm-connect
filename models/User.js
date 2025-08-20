const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  adres: { type: String, required: true }, // Address
  issuedate: { type: Date, required: true },
  pingId: { type: String, required: false },
  password: { type: String, required: false },
  proofResidence: {
    type: { type: String, required: true },
    file: { type: String, required: true }
  },
  proofIdentity: {
    type: { type: String, required: true },
    file: { type: String, required: true }
  },
  approvalLevel: { type: Number, min: 0, max: 5, default: 0, required: true },
  chipSerialNumber: { type: String, required: false },
  vaultDocs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
});

module.exports = mongoose.model('User', userSchema);