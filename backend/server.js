const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// ================= IMPORT ROUTES =================
const authRoutes = require("../routes/authRoutes");
const facultyRoutes = require("../routes/facultyRoutes");
const studentRoutes = require("../routes/studentRoutes");
const subjectRoutes = require("../routes/subjectRoutes");

const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*", // later restrict to frontend URL
    credentials: true,
  })
);

app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend running on Vercel 🚀",
  });
});

// ================= MONGODB CONNECTION =================
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected ✅");
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ❌ NO app.listen()
// ✅ EXPORT app
module.exports = app;