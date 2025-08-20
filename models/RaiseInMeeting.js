const mongoose = require("mongoose");

const raiseInMeetingSchema = new mongoose.Schema({
  spendingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Spending",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RaiseInMeeting", raiseInMeetingSchema);
