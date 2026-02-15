import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// ================= LOAD ENV =================
dotenv.config();

// ================= IMPORT ROUTES =================
import authRoutes from "../routes/authRoutes.js";
import facultyRoutes from "../routes/facultyRoutes.js";
import studentRoutes from "../routes/studentRoutes.js";
import subjectRoutes from "../routes/subjectRoutes.js";

const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "*", // 🔴 TEMPORARY (we will restrict to frontend URL later)
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
    message: "Dept System Backend running on Vercel 🚀",
  });
});

// ================= MONGODB CONNECTION =================
// Prevent reconnecting on every request (important for serverless)
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch((err) => console.error("MongoDB Connection Error ❌", err));
}

// ❌ DO NOT use app.listen() on Vercel
export default app;