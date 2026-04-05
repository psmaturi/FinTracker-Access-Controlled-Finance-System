const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { formatINR } = require("../utils/currency");
const { AppError } = require("../utils/AppError");

const IST = "Asia/Kolkata";

function isAdmin(req) {
  return req.user && req.user.role === "admin";
}

/** Admin: omit userId → aggregate all users; userId narrows to one user. */
function resolveAggregateUserId(req) {
  if (isAdmin(req)) {
    if (req.query.userId) {
      if (!mongoose.isValidObjectId(req.query.userId)) {
        throw new AppError("Invalid userId query parameter", 400);
      }
      return req.query.userId;
    }
    return null;
  }
  return req.user._id;
}

function baseMatch(userId) {
  const m = { isDeleted: false };
  if (userId != null) {
    m.userId = new mongoose.Types.ObjectId(userId);
  }
  return m;
}

const getSummary = async (req, res) => {
  const uid = resolveAggregateUserId(req);
  const match = baseMatch(uid);
  const [row] = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncomeValue: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        totalExpenseValue: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
  ]);

  const totalIncomeValue = row?.totalIncomeValue ?? 0;
  const totalExpenseValue = row?.totalExpenseValue ?? 0;
  const netBalanceValue = totalIncomeValue - totalExpenseValue;

  res.json({
    totalIncome: formatINR(totalIncomeValue),
    totalExpense: formatINR(totalExpenseValue),
    netBalance: formatINR(netBalanceValue),
    totalIncomeValue,
    totalExpenseValue,
    netBalanceValue,
  });
};

const getCategorySummary = async (req, res) => {
  const uid = resolveAggregateUserId(req);
  const match = baseMatch(uid);
  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const byCategory = {};
  for (const r of rows) {
    const cat = r._id.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { category: cat, income: 0, expense: 0 };
    }
    if (r._id.type === "income") byCategory[cat].income = r.total;
    if (r._id.type === "expense") byCategory[cat].expense = r.total;
  }

  const categories = Object.values(byCategory).map((c) => {
    const net = c.income - c.expense;
    return {
      category: c.category,
      income: c.income,
      expense: c.expense,
      net,
      incomeFormatted: formatINR(c.income),
      expenseFormatted: formatINR(c.expense),
      netFormatted: formatINR(net),
    };
  });

  res.json({ categories });
};

const getMonthlySummary = async (req, res) => {
  const uid = resolveAggregateUserId(req);
  const match = baseMatch(uid);
  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $addFields: {
        periodKey: {
          $dateToString: {
            format: "%Y-%m",
            date: "$date",
            timezone: IST,
          },
        },
      },
    },
    {
      $group: {
        _id: "$periodKey",
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const trends = rows.map((r) => {
    const parts = String(r._id).split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const label = `${months[month - 1]} ${year}`;
    const net = r.income - r.expense;
    return {
      year,
      month,
      label,
      periodKey: r._id,
      income: r.income,
      expense: r.expense,
      net,
      incomeFormatted: formatINR(r.income),
      expenseFormatted: formatINR(r.expense),
      netFormatted: formatINR(net),
    };
  });

  res.json({ monthlyTrends: trends });
};

module.exports = {
  getSummary,
  getCategorySummary,
  getMonthlySummary,
};
