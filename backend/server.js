/**
 * FinTracker API entrypoint.
 * Optional auth + viewer method guard run before routes; errors flow to centralized handler.
 */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const { migrateLegacyUserRoles } = require("./utils/migrateLegacyRoles");
const { optionalAuthenticate } = require("./middleware/optionalAuthMiddleware");
const { viewerMethodGuard } = require("./middleware/viewerMethodGuard");
const { AppError } = require("./utils/AppError");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://fintracker-frontend-nine.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use(optionalAuthenticate);
app.use(viewerMethodGuard);

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/summary", summaryRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Email already exists" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error" });
});

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI environment variable is not set");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET environment variable is not set");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("MongoDB connected successfully");
    await migrateLegacyUserRoles();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
