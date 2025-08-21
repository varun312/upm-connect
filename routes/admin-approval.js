const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs"); // Add bcryptjs
const { VoterCardInfo } = require("../models/Govtdb");
const Document = require("../models/Document");

// Helper function to fetch all documents by pingId
async function getDocumentsByPingId(pingId) {
  try {
    const documents = await Document.find({ pingId: pingId });
    return {
      success: true,
      documents: documents,
      count: documents.length,
    };
  } catch (error) {
    console.error("Error fetching documents by pingId:", error);
    return {
      success: false,
      error: error.message,
      documents: [],
      count: 0,
    };
  }
}

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

// POST /admin/document-verification/approve - called from compare.ejs approve button
router.post(
  "/admin/document-verification/approve",
  auth,
  adminOnly,
  async (req, res) => {
    const { userId, documentId } = req.body;

    try {
      // Find user by pingId
      const user = await User.findOne({ pingId: userId });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Set approvalLevel to 1
      await User.findByIdAndUpdate(
        user._id,
        { $set: { approvalLevel: 1 } },
        { new: true }
      );

      // Mark all vaultDocs as verified
      if (user.vaultDocs && user.vaultDocs.length > 0) {
        await Document.updateMany(
          { _id: { $in: user.vaultDocs } },
          { $set: { status: "verified" } }
        );
      }

      res.json({ success: true, message: "User approved successfully" });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ success: false, message: "Error approving user" });
    }
  }
);

// POST /admin/document-verification/reject - called from compare.ejs reject button
router.post(
  "/admin/document-verification/reject",
  auth,
  adminOnly,
  async (req, res) => {
    const { userId, documentId } = req.body;

    try {
      // Find user by pingId
      const user = await User.findOne({ pingId: userId });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Set approvalLevel to -1 (rejected)
      await User.findByIdAndUpdate(
        user._id,
        { $set: { approvalLevel: -1 } },
        { new: true }
      );

      // Mark all vaultDocs as rejected
      if (user.vaultDocs && user.vaultDocs.length > 0) {
        await Document.updateMany(
          { _id: { $in: user.vaultDocs } },
          { $set: { status: "rejected" } }
        );
      }

      res.json({ success: true, message: "User rejected successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ success: false, message: "Error rejecting user" });
    }
  }
);

router.get("/admin/compare/:id", auth, adminOnly, async (req, res) => {
  const pingId = req.params.id;

  try {
    // Fetch user by pingId
    const user = await User.findOne({ pingId: pingId });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Fetch all documents matching the pingId
    const documents = await Document.find({ pingId: pingId });
    const filteredDocuments = documents.filter(
      (doc) => doc.docType === "voter-card"
    );

    const govtDocuments = await VoterCardInfo.find({
      voterId: filteredDocuments.map((doc) => doc.documentTypeId),
    });
    console.log(`Found ${documents.length} documents for pingId: ${pingId}`);

    res.render("compare", {
      user: user || null,
      documents: documents,
      govtDocuments: govtDocuments,
      userImage: documents.length > 0 ? documents[0].filePath : null,
      govtImage:
        govtDocuments.length > 0 ? govtDocuments[0].voterIdImage : null,
      documentId: documents.length > 0 ? documents[0]._id : null,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).send("Error fetching documents");
  }
});

module.exports = router;
