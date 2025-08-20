const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Registration route
router.post(
  "/register",
  upload.fields([
    { name: "proof-residence", maxCount: 1 },
    { name: "proof-identity", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      "first-name": firstName,
      "last-name": lastName,
      dob,
      gender,
      adres,
      "issue-date": issuedate,
      "proof-residence-type": proofResidenceType,
      "proof-identity-type": proofIdentityType,
    } = req.body;
    try {
      const user = await new User({
        firstName,
        lastName,
        dob,
        gender,
        adres,
        issuedate,
        proofResidence: {
          type: proofResidenceType,
          file: req.files["proof-residence"]
            ? req.files["proof-residence"][0].filename
            : undefined,
        },
        proofIdentity: {
          type: proofIdentityType,
          file: req.files["proof-identity"]
            ? req.files["proof-identity"][0].filename
            : undefined,
        },
      });
      await user.save();
      if (!user) {
        return res.send("User creation failed");
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true });

      res.redirect("/login");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === 11000) {
        // MongoDB duplicate key error
        return res.status(400).send("User already exists");
      }
      res.status(400).send("Registration error: " + err.message);
    }
  }
);

// Login route
router.post("/login", async (req, res) => {
  const {
    "first-name": firstName,
    "last-name": lastName,
    pingId: pingId,
    password,
  } = req.body;

  // Find user by firstName, lastName, and pingId
  const user = await User.findOne({ firstName, lastName, pingId }).populate(
    "vaultDocs"
  );

  if (!user) {
    // User not found by names and pingId
    return res.status(400).send("User not found");
  }

  if (!user.pingId) {
    // pingId missing
    return res.status(400).send("Review pending");
  }

  // Check password
  if (!user.password) {
    return res.status(400).send("Password not set");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send("Invalid credentials");

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true });

  // Populate user's applications array (references)
  await user.populate("applications");
  // After successful login, redirect to dashboard for consistency
  res.redirect("/dashboard");
});

module.exports = router;
