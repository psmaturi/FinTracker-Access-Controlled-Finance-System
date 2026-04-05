const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/rbacMiddleware");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  register,
  login,
  getAllUsers,
  createUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
} = require("../controllers/authController");

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

router.post("/users", authenticate, requireAdmin, asyncHandler(createUser));
router.get("/users", authenticate, requireAdmin, asyncHandler(getAllUsers));
router.patch(
  "/users/:id/status",
  authenticate,
  requireAdmin,
  asyncHandler(updateUserStatus)
);
router.patch(
  "/users/:id/role",
  authenticate,
  requireAdmin,
  asyncHandler(updateUserRole)
);
router.delete("/users/:id", authenticate, requireAdmin, asyncHandler(deleteUser));

module.exports = router;
