const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "admin",
    required: true
  }
});

module.exports = User;
