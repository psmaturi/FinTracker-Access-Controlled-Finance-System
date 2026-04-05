const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Sets req.user when a valid Bearer token is present; skips inactive accounts.
 * Malformed tokens are ignored so public routes still work.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user && user.isActive === false) {
      req.user = null;
    } else {
      req.user = user || null;
    }
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { optionalAuthenticate };
