const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanAmount: { type: Number, required: true },
  loanPurpose: { type: String, required: true },
  tenure: { type: Number, required: true },
  annualIncome: { type: Number, required: true },
  proofIdentity: { type: String, required: true },
  proofResidence: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
