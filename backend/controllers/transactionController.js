const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { formatINR } = require("../utils/currency");
const { AppError } = require("../utils/AppError");

function isAdmin(req) {
  return req.user && req.user.role === "admin";
}

/** Admin without userId → all users' transactions; optional userId narrows. */
function resolveListScope(req) {
  if (isAdmin(req)) {
    if (req.query.userId) {
      if (!mongoose.isValidObjectId(req.query.userId)) {
        throw new AppError("Invalid userId query parameter", 400);
      }
      return { allUsers: false, ownerId: req.query.userId };
    }
    return { allUsers: true, ownerId: null };
  }
  return { allUsers: false, ownerId: req.user._id };
}

async function resolveCreateUserId(req) {
  if (isAdmin(req) && req.body.userId) {
    if (!mongoose.isValidObjectId(req.body.userId)) {
      throw new AppError("Invalid userId: must be a valid user id", 400);
    }
    const target = await User.findById(req.body.userId);
    if (!target) {
      throw new AppError("Target user not found", 404);
    }
    return req.body.userId;
  }
  return req.user._id;
}

function findTransactionQuery(req, transactionId) {
  const q = { _id: transactionId, isDeleted: false };
  if (!isAdmin(req)) {
    q.userId = req.user._id;
  }
  return q;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeTransaction(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    _id: o._id,
    id: o._id.toString(),
    userId: o.userId,
    amount: o.amount,
    amountFormatted: formatINR(o.amount),
    type: o.type,
    category: o.category,
    date: o.date,
    notes: o.notes || "",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function validateTransactionBody(body, partial = false) {
  const errors = [];
  const { amount, type, category, date, notes } = body;

  if (!partial || amount !== undefined) {
    if (amount === undefined || amount === null || amount === "") {
      errors.push("amount is required");
    } else {
      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) {
        errors.push("amount must be a number greater than 0");
      }
    }
  }

  if (!partial || type !== undefined) {
    if (!type && !partial) errors.push("type is required");
    else if (type && !["income", "expense"].includes(type)) {
      errors.push('type must be "income" or "expense"');
    }
  }

  if (!partial || category !== undefined) {
    if (!category && !partial) errors.push("category is required");
    else if (category !== undefined && String(category).trim() === "") {
      errors.push("category cannot be empty");
    }
  }

  if (!partial || date !== undefined) {
    if (!date && !partial) errors.push("date is required");
    else if (date) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        errors.push("date must be a valid date");
      }
    }
  }

  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    errors.push("notes must be a string");
  }

  return errors;
}

function buildListFilter(scope, query) {
  const conditions = [{ isDeleted: false }];
  if (!scope.allUsers) {
    conditions.unshift({ userId: new mongoose.Types.ObjectId(scope.ownerId) });
  }

  if (query.type) {
    if (!["income", "expense"].includes(query.type)) {
      return { error: 'Invalid type filter. Use "income" or "expense".' };
    }
    conditions.push({ type: query.type });
  }

  if (query.startDate || query.endDate) {
    const range = {};
    if (query.startDate) {
      const s = new Date(query.startDate);
      if (Number.isNaN(s.getTime())) return { error: "Invalid startDate" };
      range.$gte = s;
    }
    if (query.endDate) {
      const e = new Date(query.endDate);
      if (Number.isNaN(e.getTime())) return { error: "Invalid endDate" };
      range.$lte = e;
    }
    conditions.push({ date: range });
  }

  const hasCategory = query.category && String(query.category).trim();
  const hasSearch = query.search && String(query.search).trim();

  if (hasCategory && hasSearch) {
    const catRegex = new RegExp(`^${escapeRegex(String(query.category).trim())}$`, "i");
    const searchRegex = new RegExp(escapeRegex(String(query.search).trim()), "i");
    conditions.push({ category: catRegex });
    conditions.push({ notes: searchRegex });
  } else if (hasCategory) {
    conditions.push({
      category: new RegExp(`^${escapeRegex(String(query.category).trim())}$`, "i"),
    });
  } else if (hasSearch) {
    const term = escapeRegex(String(query.search).trim());
    const searchRegex = new RegExp(term, "i");
    conditions.push({
      $or: [{ category: searchRegex }, { notes: searchRegex }],
    });
  }

  return { filter: { $and: conditions } };
}

const listTransactions = async (req, res) => {
  const scope = resolveListScope(req);
  const { filter, error } = buildListFilter(scope, req.query);
  if (error) {
    throw new AppError(error, 400);
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    Transaction.countDocuments(filter),
    Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
  ]);

  res.json({
    transactions: docs.map((d) => serializeTransaction(d)),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
};

const getTransactionById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid transaction id", 400);
  }

  const doc = await Transaction.findOne(findTransactionQuery(req, id));

  if (!doc) {
    throw new AppError("Transaction not found", 404);
  }

  res.json(serializeTransaction(doc));
};

const createTransaction = async (req, res) => {
  const errors = validateTransactionBody(req.body, false);
  if (errors.length) {
    throw new AppError(errors.join("; "), 400);
  }

  const ownerId = await resolveCreateUserId(req);
  const { amount, type, category, date, notes } = req.body;

  const doc = await Transaction.create({
    userId: ownerId,
    amount: Number(amount),
    type,
    category: String(category).trim(),
    date: new Date(date),
    notes: notes != null ? String(notes) : "",
  });

  res.status(201).json(serializeTransaction(doc));
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid transaction id", 400);
  }

  const { amount, type, category, date, notes } = req.body;
  const hasUpdate =
    amount !== undefined ||
    type !== undefined ||
    category !== undefined ||
    date !== undefined ||
    notes !== undefined;

  if (!hasUpdate) {
    throw new AppError(
      "At least one field must be provided: amount, type, category, date, or notes.",
      400
    );
  }

  const errors = validateTransactionBody(req.body, true);
  if (errors.length) {
    throw new AppError(errors.join("; "), 400);
  }

  const doc = await Transaction.findOne(findTransactionQuery(req, id));

  if (!doc) {
    throw new AppError("Transaction not found", 404);
  }

  if (amount !== undefined) doc.amount = Number(amount);
  if (type !== undefined) doc.type = type;
  if (category !== undefined) doc.category = String(category).trim();
  if (date !== undefined) doc.date = new Date(date);
  if (notes !== undefined) doc.notes = String(notes);

  const n = Number(doc.amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new AppError("amount must be a number greater than 0", 400);
  }

  await doc.save();
  res.json(serializeTransaction(doc));
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid transaction id", 400);
  }

  const doc = await Transaction.findOne(findTransactionQuery(req, id));

  if (!doc) {
    throw new AppError("Transaction not found", 404);
  }

  doc.isDeleted = true;
  await doc.save();

  res.json({ message: "Transaction deleted", _id: doc._id });
};

module.exports = {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
