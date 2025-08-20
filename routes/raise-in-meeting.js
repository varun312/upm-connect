const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const RaiseInMeeting = require("../models/RaiseInMeeting");

router.post("/", auth, async (req, res) => {
  const { spendingId, message } = req.body;
  try {
    const newRaise = new RaiseInMeeting({
      userId: req.user.userId,
      spendingId,
      message,
    });
    await newRaise.save();
    res.send("Raised in meeting successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
