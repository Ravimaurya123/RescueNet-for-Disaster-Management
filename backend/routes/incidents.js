const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Incident = require('../models/Incident');

// @route   GET api/incidents
// @desc    Get all active incidents
// @access  Public
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().populate('createdBy', 'name email').sort('-createdAt');
    res.json(incidents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/incidents
// @desc    Report a new incident
// @access  Private (admins and logged-in agencies can create)
router.post('/', auth, async (req, res) => {
  const { title, type, severity, location, description, affectedArea } = req.body;

  try {
    const newIncident = new Incident({
      title,
      type,
      severity,
      location,
      description,
      affectedArea,
      createdBy: req.user.id
    });

    const incident = await newIncident.save();
    res.json(incident);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/incidents/:id
// @desc    Update incident status or details
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, type, severity, location, description, affectedArea, status } = req.body;

  try {
    let incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ msg: 'Incident not found' });
    }

    // Permission check
    if (req.user.role !== 'admin' && incident.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to update this incident' });
    }

    incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: { title, type, severity, location, description, affectedArea, status } },
      { new: true }
    );

    res.json(incident);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/incidents/:id
// @desc    Delete an incident (Admin or Creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ msg: 'Incident not found' });
    }

    // Permission check
    if (req.user.role !== 'admin' && incident.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to delete this incident' });
    }

    await Incident.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Incident report removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
