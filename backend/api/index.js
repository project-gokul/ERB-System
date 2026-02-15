import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// ================= CONFIG =================
dotenv.config();

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
import authRoutes from "../routes/authRoutes.js";
import facultyRoutes from "../routes/facultyRoutes.js";
import studentRoutes from "../routes/studentRoutes.js";
import subjectRoutes from "../routes/subjectRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.json({ message: "Backend running on Vercel 🚀" });
});

// ================= MONGODB (SERVERLESS SAFE) =================
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected ✅");
}

connectDB().catch((err) => {
  console.error("MongoDB error ❌", err);
});

// ❗ IMPORTANT
export default app;