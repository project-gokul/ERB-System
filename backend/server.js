// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// ================= CHECK ENV =================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in environment variables");
  process.exit(1);
}

// ================= INIT APP =================
const app = express();

// ================= CORS CONFIG =================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ================= BODY PARSER =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
// VERY IMPORTANT for certificate preview
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= IMPORT ROUTES =================
const authRoutes = require("./routes/authRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend running 🚀",
    mongoState: mongoose.connection.readyState,
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ================= CONNECT DB + START SERVER =================
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log("\u2705 MongoDB Connected");

      const PORT = process.env.PORT || 5000;

      app.listen(PORT, () => {
        console.log(`\ud83d\ude80 Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("\u274c MongoDB Connection Failed:", err.message);
      process.exit(1);
    });

  // ================= MONGOOSE EVENTS =================
  mongoose.connection.on("connected", () => {
    console.log("\ud83d\udce6 Mongoose connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("\u274c Mongoose error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("\u26a0\ufe0f Mongoose disconnected");
  });
}

module.exports = app;