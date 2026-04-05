const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.get("/", authenticate, asyncHandler(listTransactions));
router.get("/:id", authenticate, asyncHandler(getTransactionById));
router.post("/", authenticate, asyncHandler(createTransaction));
router.put("/:id", authenticate, asyncHandler(updateTransaction));
router.delete("/:id", authenticate, asyncHandler(deleteTransaction));

module.exports = router;
