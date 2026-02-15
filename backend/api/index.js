import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "../routes/authRoutes.js";
import facultyRoutes from "../routes/facultyRoutes.js";
import studentRoutes from "../routes/studentRoutes.js";
import subjectRoutes from "../routes/subjectRoutes.js";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: "*", // later replace with frontend URL
    credentials: true,
  })
);

app.use(express.json());

/* ================= MONGODB CONNECTION (VERCEL SAFE) ================= */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
    throw err;
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(500).json({ message: "Database connection failed ❌" });
  }
});

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend running on Vercel 🚀" });
});

export default app;