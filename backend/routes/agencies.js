const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Agency = require('../models/Agency');
const User = require('../models/User');

// @route   GET api/agencies
// @desc    Get all registered agencies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const agencies = await Agency.find().sort('-createdAt');
    res.json(agencies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/agencies
// @desc    Register a new agency (can be done by admin or the agency itself)
// @access  Private (for now)
router.post('/', auth, async (req, res) => {
  const { name, type, registrationNumber, contactPerson, email, phone, location, resources } = req.body;

  try {
    let agency = await Agency.findOne({ email });
    if (agency) {
      return res.status(400).json({ msg: 'Agency with this email already exists' });
    }

    agency = new Agency({ name, type, registrationNumber, contactPerson, email, phone, location, resources });
    await agency.save();

    // Link the current user to the agency if they aren't an admin
    if (req.user.role === 'agency') {
      await User.findByIdAndUpdate(req.user.id, { agencyId: agency._id });
    }

    res.json(agency);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/agencies/:id
// @desc    Update agency details (location, status, etc.)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, type, contactPerson, phone, location, status, resources, verified } = req.body;

  try {
    let agency = await Agency.findById(req.params.id);
    if (!agency) {
      return res.status(404).json({ msg: 'Agency not found' });
    }

    // Permission check: only admin or the agency owner can update
    if (req.user.role !== 'admin' && req.user.agencyId?.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Unauthorized to update this agency' });
    }

    const updatedFields = { name, type, contactPerson, phone, location, status, resources };
    if (req.user.role === 'admin') {
      updatedFields.verified = verified;
    }

    agency = await Agency.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true });
    res.json(agency);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/agencies/:id
// @desc    Delete an agency (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) {
      return res.status(404).json({ msg: 'Agency not found' });
    }

    // Delete associated User
    await User.deleteMany({ agencyId: req.params.id });
    
    // Delete Agency
    await Agency.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Agency and associated users removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
