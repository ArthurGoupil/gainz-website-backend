const express = require('express');
const router = express.Router();
const User = require('../models/User');

const isAdminAuthenticated = require('../middleware/isAdminAuthenticated');

const SHA256 = require('crypto-js/sha256');
const encBase64 = require('crypto-js/enc-base64');
const uid2 = require('uid2');

// Add user to database
router.post('/users/signup', isAdminAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.fields;
    const token = uid2(64);
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);

    const user = new User({
      email,
      token,
      salt,
      hash,
    });

    await user.save();

    return res.status(200).json({
      _id: user._id,
      email: user.email,
      token: user.token,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Signin to backoffice
router.post('/users/signin', async (req, res) => {
  const { email, password } = req.fields;
  try {
    const user = await User.findOne({ email });
    if (user) {
      if (SHA256(password + user.salt).toString(encBase64) === user.hash) {
        return res.json({
          _id: user._id,
          email: user.email,
          token: user.token,
        });
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } else {
      return res.status(400).json('User not found');
    }
  } catch (e) {
    return res.status(400).json({ message: 'An error occurred' });
  }
});

module.exports = router;
