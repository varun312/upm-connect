const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  agenda: { type: String, required: true }
});

module.exports = mongoose.model('Meeting', meetingSchema);
