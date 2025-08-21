const express = require("express");
const { createWorker } = require("tesseract.js");
const upload = require("../middleware/upload");
const router = express.Router();
const { VoterCardInfo } = require("../models/Govtdb");
const uploadgovt = require("../middleware/govt-upload");

router.get("/", uploadgovt.single("document"), (req, res) => {
  res.render("testupload");
});
router.post("/upload", uploadgovt.single("document"), async (req, res) => {
  const worker = await createWorker("eng");
  const ret = await worker.recognize(req.file.path);
  console.log(ret.data.text);
  const lines = ret.data.text.split("\n").map((l) => l.trim());
  const idRegex = /^\d{4}(?: \d{4}){3}$/;

  // Find the matching line for each field
  const idLine = lines.find((l) => idRegex.test(l));
  const nameLine = lines.find((l) => l.startsWith("Name:"));
  const fatherLine = lines.find((l) => l.startsWith("Father Name:"));
  const dobLine = lines.find((l) => l.startsWith("Date OF Birth:"));
  const idCleaned = idLine?.replace(/\s+/g, "") || "";
  if (!idCleaned) {
    console.error("ID not found — check format or regex");
  } else {
    await worker.terminate();
    const voterCardInfo = new VoterCardInfo({
      voterId: idCleaned,
      name: nameLine?.replace("Name:", "").trim() || "",
      fatherName: fatherLine?.replace("Father Name:", "").trim() || "",
      dob: dobLine?.replace("Date OF Birth:", "").trim() || "",
      voterIdImage: `/uploads/govt/${req.file.filename}`, // Store relative path for web access
    });
    await voterCardInfo.save();
    res.send("Document uploaded and data extracted successfully.");
  }
});

module.exports = router;
