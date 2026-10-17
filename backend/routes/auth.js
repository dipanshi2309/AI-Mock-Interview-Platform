const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Simple validation
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check for existing user
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // Create user object
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.users.create({
      username,
      email,
      password: hashedPassword
    });

    // Create token
    const payload = { id: newUser._id, username: newUser.username };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkeymockaiinterview12345!',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check for user
    const user = await db.users.findByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials (User does not exist)' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials (Incorrect password)' });
    }

    // Create token
    const payload = { id: user._id, username: user.username };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkeymockaiinterview12345!',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Return user without password
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Auth check error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
