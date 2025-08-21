const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const BusinessApplication = require('../models/BusinessApplication');
const LoanApplication = require('../models/LoanApplication');
const VehicleRegistration = require('../models/VehicleRegistration');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /application-form - render form
router.get('/application-form', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).populate('vaultDocs');
  let proofDocs = [];
  if (user) {
    // Add vaultDocs
    if (user.vaultDocs && user.vaultDocs.length > 0) {
      proofDocs = user.vaultDocs.map(doc => ({ id: doc._id, docType: doc.docType || doc.filePath }));
    }
  }
  res.render('application-form', { user: user || null, proofDocs });
});

// POST /application-form - save form data
router.post('/application-form', auth, async (req, res) => {
  try {
    const { pingId, password, category } = req.body;
    // Find user by pingId
    const user = await User.findOne({ pingId });
    if (!user) return res.status(400).send('Invalid Ping ID');
    // Check password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid password');
    // Create application
    const app = new Application({ pingId, category });
    await app.save();
    // Add application reference to user's applications array
    user.applications.push(app._id);
    await user.save();
    res.send('Application submitted!');
  } catch (err) {
    console.log(err);
    res.status(400).send('Error submitting application');
  }
});

// GET /business-application-form - render business form
router.get('/business-application-form', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).populate('vaultDocs');
  let proofDocs = [];
  if (user && user.vaultDocs && user.vaultDocs.length > 0) {
    proofDocs = user.vaultDocs.map(doc => ({ id: doc._id, docType: doc.docType || doc.filePath }));
  }
  res.render('business-application-form', { user: user || null, proofDocs });
});

// POST /business-application - save business form data
const mongoose = require('mongoose');
router.post('/business-application', auth, async (req, res) => {
  try {
    const { businessName, businessType, registrationNumber, gstNumber, proofIdentity, proofResidence } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(400).send('User not found');
    // Only store as ObjectId if valid
    console.log(proofIdentity, proofResidence);
    const proofIdentityId = mongoose.Types.ObjectId.isValid(proofIdentity) ? proofIdentity : null;
    const proofResidenceId = mongoose.Types.ObjectId.isValid(proofResidence) ? proofResidence : null;
    const app = new BusinessApplication({
      user: user._id,
      businessName,
      businessType,
      registrationNumber,
      gstNumber,
      proofIdentity: proofIdentityId,
      proofResidence: proofResidenceId
    });
    await app.save();
    user.applications.push(app._id);
    await user.save();
    res.send('Business application submitted!');
  } catch (err) {
    console.log(err);
    res.status(400).send('Error submitting business application');
  }
});

// GET /loan-application-form - render loan form
router.get('/loan-application-form', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).populate('vaultDocs');
  let proofDocs = [];
  if (user && user.vaultDocs && user.vaultDocs.length > 0) {
    proofDocs = user.vaultDocs.map(doc => ({ id: doc._id, docType: doc.docType || doc.filePath }));
  }
  res.render('loan-application-form', { user: user || null, proofDocs });
});

// POST /loan-application-form - save loan form data
router.post('/loan-application', auth, async (req, res) => {
  try {
    const { loanAmount, loanPurpose, tenure, annualIncome, proofIdentity, proofResidence } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(400).send('User not found');
    const proofIdentityId = mongoose.Types.ObjectId.isValid(proofIdentity) ? proofIdentity : null;
    const proofResidenceId = mongoose.Types.ObjectId.isValid(proofResidence) ? proofResidence : null;
    const app = new LoanApplication({
      user: user._id,
      loanAmount,
      loanPurpose,
      tenure,
      annualIncome,
      proofIdentity: proofIdentityId,
      proofResidence: proofResidenceId
    });
    await app.save();
    user.applications.push(app._id);
    await user.save();
    res.send('Loan application submitted!');
  } catch (err) {
    console.log(err);
    res.status(400).send('Error submitting loan application');
  }
});

// GET /vehicle-registration-form - render vehicle registration form
router.get('/vehicle-registration-form', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).populate('vaultDocs');
  let proofDocs = [];
  if (user && user.vaultDocs && user.vaultDocs.length > 0) {
    proofDocs = user.vaultDocs.map(doc => ({ id: doc._id, docType: doc.docType || doc.filePath }));
  }
  res.render('vehicle-registration-form', { user: user || null, proofDocs });
});

// POST /vehicle-registration-form - save vehicle registration form data
router.post('/vehicle-registration', auth, async (req, res) => {
  try {
    const { ownerName, vehicleType, vehicleModel, chassisNumber, engineNumber, proofIdentity, proofResidence } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(400).send('User not found');
    const proofIdentityId = mongoose.Types.ObjectId.isValid(proofIdentity) ? proofIdentity : null;
    const proofResidenceId = mongoose.Types.ObjectId.isValid(proofResidence) ? proofResidence : null;
    const app = new VehicleRegistration({
      user: user._id,
      ownerName,
      vehicleType,
      vehicleModel,
      chassisNumber,
      engineNumber,
      proofIdentity: proofIdentityId,
      proofResidence: proofResidenceId
    });
    await app.save();
    user.applications.push(app._id);
    await user.save();
    res.send('Vehicle registration application submitted!');
  } catch (err) {
    console.log(err);
    res.status(400).send('Error submitting vehicle registration application');
  }
});

module.exports = router;