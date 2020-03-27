const User = require("../models/User");

const isAdminAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
      role: "admin"
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized." });
    } else {
      req.user = user;
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized." });
  }
};

module.exports = isAdminAuthenticated;
