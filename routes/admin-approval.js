const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs"); // Add bcryptjs

// Middleware to check admin (approvalLevedl 4)
function adminOnly(req, res, next) {
  if (req.user && req.user.approvalLevel === 4) return next();
  return res.status(403).send("Forbidden: Admins only");
}

// GET /admin - show users pending approval
router.get("/admin", auth, adminOnly, async (req, res) => {
  const users = await User.find({ approvalLevel: 0 });
  const user = await User.findById(req.user.userId);
  res.render("admin", { users, user: user || null });
});


// POST /admin/approve/:id - approve a user and verify their documents
router.post("/admin/approve/:id", async (req, res) => {
  const userId = req.params.id;
  // Set approvalLevel to 1
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { approvalLevel: 1 } },
    { new: true }
  );
  // Mark all vaultDocs as verified
  if (user && user.vaultDocs && user.vaultDocs.length > 0) {
    const Document = require("../models/Document");
    await Document.updateMany(
      { _id: { $in: user.vaultDocs } },
      { $set: { status: "verified" } }
    );
  }
  res.json({ success: true, pingId: user.pingId });
});

module.exports = router;
