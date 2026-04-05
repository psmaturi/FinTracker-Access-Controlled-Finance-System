const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/AppError");
const {
  isValidEmail,
  normalizeEmail,
  MIN_PASSWORD_LENGTH,
} = require("../utils/validators");

const ALLOWED_ROLES = ["viewer", "analyst", "admin"];

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function userResponse(userDoc) {
  const j = userDoc.toJSON ? userDoc.toJSON() : userDoc;
  return {
    id: j.id || (j._id && j._id.toString()),
    _id: j._id,
    name: j.name,
    email: j.email,
    role: j.role,
    isActive: j.isActive,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
  };
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("All fields are required: name, email, and password.", 400);
  }

  const emailNorm = normalizeEmail(email);
  if (!isValidEmail(emailNorm)) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  if (String(password).length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      400
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({
      name: String(name).trim(),
      email: emailNorm,
      password: hashedPassword,
      role: "viewer",
      isActive: true,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError("Email already exists", 409);
    }
    throw err;
  }

  res.status(201).json({ message: "User registered successfully" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const emailNorm = normalizeEmail(email);
  if (!isValidEmail(emailNorm)) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  const user = await User.findOne({ email: emailNorm });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.isActive === false) {
    throw new AppError("Account is deactivated", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken(user);

  res.json({
    token,
    user: userResponse(user),
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users.map((u) => userResponse(u)));
};

/**
 * Admin: create a user (any role).
 */
const createUser = async (req, res) => {
  const { name, email, password, role, isActive } = req.body;

  if (!name || !email || !password) {
    throw new AppError("name, email, and password are required.", 400);
  }

  const emailNorm = normalizeEmail(email);
  if (!isValidEmail(emailNorm)) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  if (String(password).length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      400
    );
  }

  const assignedRole = role || "viewer";
  if (!ALLOWED_ROLES.includes(assignedRole)) {
    throw new AppError(`role must be one of: ${ALLOWED_ROLES.join(", ")}`, 400);
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    throw new AppError("isActive must be a boolean when provided.", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await User.create({
      name: String(name).trim(),
      email: emailNorm,
      password: hashedPassword,
      role: assignedRole,
      isActive: isActive !== undefined ? isActive : true,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError("Email already exists", 409);
    }
    throw err;
  }

  res.status(201).json({ message: "User created", user: userResponse(user) });
};

/**
 * Admin: delete user and their transactions.
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid user id", 400);
  }

  if (req.user._id.equals(id)) {
    throw new AppError("You cannot delete your own account.", 400);
  }

  const target = await User.findById(id);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  const Transaction = require("../models/Transaction");
  await Transaction.deleteMany({ userId: id });
  await User.findByIdAndDelete(id);

  res.json({ message: "User deleted", id });
};

/**
 * Admin: activate / deactivate user.
 */
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid user id", 400);
  }

  if (typeof isActive !== "boolean") {
    throw new AppError("isActive is required and must be a boolean.", 400);
  }

  const target = await User.findById(id);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  if (target._id.equals(req.user._id) && isActive === false) {
    throw new AppError("You cannot deactivate your own account.", 400);
  }

  target.isActive = isActive;
  await target.save();

  res.json({
    message: "User status updated",
    user: userResponse(target),
  });
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid user id", 400);
  }

  if (!role || !ALLOWED_ROLES.includes(role)) {
    throw new AppError(`role must be one of: ${ALLOWED_ROLES.join(", ")}`, 400);
  }

  const target = await User.findById(id);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  if (target._id.equals(req.user._id) && role !== "admin") {
    throw new AppError("You cannot remove your own admin access", 400);
  }

  target.role = role;
  await target.save();

  res.json({
    message: "Role updated",
    user: userResponse(target),
  });
};

module.exports = {
  register,
  login,
  getAllUsers,
  createUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
};
