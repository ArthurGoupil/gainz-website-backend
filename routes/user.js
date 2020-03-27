const express = require("express");
const router = express.Router();
const User = require("../models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/users/signup", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const token = uid2(64);
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);

    const user = new User({
      email,
      token,
      salt,
      hash
    });

    await user.save();

    return res.status(200).json({
      _id: user._id,
      email: user.email,
      token: user.token
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
