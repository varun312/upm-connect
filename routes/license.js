const express = require('express');
const router = express.Router();
const LicenseApplication = require('../models/LicenseApplication');

// GET /apply-license - render form
router.get('/apply-license', (req, res) => {
  res.render('apply-license');
});

// POST /apply-license - save form data
router.post('/apply-license', async (req, res) => {
  try {
    const { citizenId, name, dob, gender, address, phone, licenseType, bloodGroup, docRefs } = req.body;
    const docRefsArr = docRefs ? docRefs.split(',').map(id => id.trim()).filter(Boolean) : [];
    const app = new LicenseApplication({
      citizenId,
      name,
      dob,
      gender,
      address,
      phone,
      licenseType,
      bloodGroup,
      docRefs: docRefsArr
    });
    await app.save();
    res.send('Application submitted!');
  } catch (err) {
    res.status(400).send('Error submitting application');
  }
});

module.exports = router;
