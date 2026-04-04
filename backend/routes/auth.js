const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Agency = require('../models/Agency');
const { auth } = require('../middleware/auth');

// @route   POST api/auth/register-agency
// @desc    Register a new user AND create their agency profile
// @access  Public
router.post(
  '/register-agency',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('location.lat', 'Latitude is required').isNumeric(),
    check('location.lng', 'Longitude is required').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, type, location } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Create Agency Profile First
      const newAgency = new Agency({
        name,
        type,
        email,
        phone,
        location,
        status: 'active'
      });
      await newAgency.save();

      // Create User Linked to Agency
      user = new User({
        name,
        email,
        password,
        role: 'agency',
        agencyId: newAgency._id
      });
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      res.json({ token, user: { id: user._id, name, email, role: user.role, agencyId: newAgency._id } });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Login and get token
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          agencyId: user.agencyId
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/forgot-password
// @desc    Generate password reset token
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // In a real app, send email. For demo, return token.
    res.json({ msg: 'Email sent (Simulation)', resetToken });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/auth/reset-password/:token
// @desc    Reset password using token
router.put('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
