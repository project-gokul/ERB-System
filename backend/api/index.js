import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "../routes/authRoutes.js";
import facultyRoutes from "../routes/facultyRoutes.js";
import studentRoutes from "../routes/studentRoutes.js";
import subjectRoutes from "../routes/subjectRoutes.js";

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// MongoDB (serverless-safe)
let cached = false;
async function connectDB() {
  if (cached) return;
  await mongoose.connect(process.env.MONGO_URI);
  cached = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "DB connection failed" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend running on Vercel 🚀" });
});

export default app;