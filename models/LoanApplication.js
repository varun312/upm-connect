const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanAmount: { type: Number, required: true },
  loanPurpose: { type: String, required: true },
  tenure: { type: Number, required: true },
  annualIncome: { type: Number, required: true },
  proofIdentity: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  proofResidence: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
