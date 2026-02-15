const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// ===== Import routes (note the ../) =====
const authRoutes = require("../routes/authRoutes");
const facultyRoutes = require("../routes/facultyRoutes");
const studentRoutes = require("../routes/studentRoutes");
const subjectRoutes = require("../routes/subjectRoutes");

const app = express();

// ===== Middleware =====
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ===== MongoDB connection (serverless-safe) =====
let cachedConnection = null;

async function connectDB() {
  if (cachedConnection) return cachedConnection;

  cachedConnection = await mongoose.connect(process.env.MONGO_URI);
  return cachedConnection;
}

// Ensure DB is connected for every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);

// ===== Health check =====
app.get("/", (req, res) => {
  res.json({ message: "Backend running on Vercel 🚀" });
});

// ❌ NO app.listen()
// ✅ EXPORT the app
module.exports = app;