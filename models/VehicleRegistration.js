const mongoose = require('mongoose');

const vehicleRegistrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  vehicleType: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  chassisNumber: { type: String, required: true },
  engineNumber: { type: String, required: true },
  proofIdentity: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  proofResidence: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VehicleRegistration', vehicleRegistrationSchema);
