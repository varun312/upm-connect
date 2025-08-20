const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  pingId: { type: String, required: true },
  category: { type: String, required: true }
});

module.exports = mongoose.model('Application', ApplicationSchema);
