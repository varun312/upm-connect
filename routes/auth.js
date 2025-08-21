const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs"); // Add fs module
const { encryptField, decryptField } = require("./../cryptoHelper");

const JWT_SECRET = process.env.JWT_SECRET;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
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
  // Remove issuedate from user input, use current date instead
      "proof-residence-type": proofResidenceType,
      "proof-identity-type": proofIdentityType,
    } = req.body;
      const pingId = Math.floor(
    100000000000 + Math.random() * 900000000000
  ).toString();
    const plainPassword = crypto
      .randomBytes(8)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash password
    try {
      // Prepare vaultDocs array
      const vaultDocs = [];
      let proofResidenceObj = undefined;
      let proofIdentityObj = undefined;
      // Save proofResidence as Document if uploaded
      if (req.files["proof-residence"] && req.files["proof-residence"][0]) {
        const Document = require("../models/Document");
        const doc = await Document.create({
          pingId,
          docType: proofResidenceType,
          filePath: req.files["proof-residence"][0].filename,
          source: "service-center"
        });
        vaultDocs.push(doc._id);
        proofResidenceObj = { type: proofResidenceType, file: req.files["proof-residence"][0].filename };
      }
      // Save proofIdentity as Document if uploaded
      if (req.files["proof-identity"] && req.files["proof-identity"][0]) {
        const Document = require("../models/Document");
        const doc = await Document.create({
          pingId,
          docType: proofIdentityType,
          filePath: req.files["proof-identity"][0].filename,
          source: "service-center"
        });
        vaultDocs.push(doc._id);
        proofIdentityObj = { type: proofIdentityType, file: req.files["proof-identity"][0].filename };
      }
      const user = await new User({
        firstName: encryptField(firstName),
        lastName: encryptField(lastName),
        dob,
        gender,
        adres: encryptField(adres),
        issuedate: new Date(),
        proofResidence: proofResidenceObj,
        proofIdentity: proofIdentityObj,
        pingId: pingId,
        password: hashedPassword,
        vaultDocs: vaultDocs
      });
      await user.save();
      if (!user) {
        return res.send("User creation failed");
      }
      res.send("pingId: "+ user.toJSON()["pingId"] + "<br>password: " + plainPassword);
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
  let {
    "first-name": firstName,
    "last-name": lastName,
    pingId,
    password,
  } = req.body;

  // Find user by pingId
  const user = await User.findOne({ pingId }).populate(
    "vaultDocs"
  );

  if (firstName !== decryptField(user.firstName) || lastName !== decryptField(user.lastName)) {
    // Name mismatch
    return res.status(400).send("User not found");
  }

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

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, { httpOnly: true });

  // Populate user's applications array (references)
  await user.populate("applications");
  // After successful login, redirect to dashboard for consistency
  res.redirect("/dashboard");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;
