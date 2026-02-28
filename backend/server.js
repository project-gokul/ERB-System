// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// ================= CHECK ENV =================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env file");
  process.exit(1);
}

// ================= IMPORT ROUTES =================
const authRoutes = require("./routes/authRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const chatRoutes = require("./routes/chatRoutes");

// ================= INIT APP =================
const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/chat", chatRoutes);
// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend running 🚀",
    mongoState: mongoose.connection.readyState,
  });
});

/*
MongoDB readyState:
0 = disconnected
1 = connected
2 = connecting
3 = disconnecting
*/

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ================= CONNECT MONGODB + START SERVER =================
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// ================= MONGOOSE EVENTS =================
mongoose.connection.on("connected", () => {
  console.log("📦 Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected");
});