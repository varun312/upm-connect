const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true }
});

module.exports = mongoose.model('Spending', spendingSchema);
