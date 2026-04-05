const { AppError } = require("../utils/AppError");

const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (req.user.role !== "admin") {
      return next(
        new AppError("Access denied. Administrator role required for this action.", 403)
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};

const requireAnalystOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!["analyst", "admin"].includes(req.user.role)) {
      return next(
        new AppError(
          "Access denied. Analyst or administrator role required for summaries.",
          403
        )
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAdmin, requireAnalystOrAdmin };
