const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { requireAnalystOrAdmin } = require("../middleware/rbacMiddleware");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  getSummary,
  getCategorySummary,
  getMonthlySummary,
} = require("../controllers/summaryController");

router.get("/", authenticate, requireAnalystOrAdmin, asyncHandler(getSummary));
router.get(
  "/category",
  authenticate,
  requireAnalystOrAdmin,
  asyncHandler(getCategorySummary)
);
router.get(
  "/monthly",
  authenticate,
  requireAnalystOrAdmin,
  asyncHandler(getMonthlySummary)
);

module.exports = router;
