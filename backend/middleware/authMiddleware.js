const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");

/**
 * Verifies Bearer JWT, loads user from DB, attaches req.user (id via schema toJSON/virtual).
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new AppError("No token provided", 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(new AppError("Invalid or expired token", 401));
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    if (user.isActive === false) {
      return next(new AppError("Account is deactivated", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
