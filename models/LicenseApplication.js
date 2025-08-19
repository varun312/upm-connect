const mongoose = require('mongoose');

const LicenseApplicationSchema = new mongoose.Schema({
  citizenId: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  licenseType: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  docRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]
});

module.exports = mongoose.model('LicenseApplication', LicenseApplicationSchema);
