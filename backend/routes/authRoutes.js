const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Student = require("../models/Student");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authMiddleware = require("../middleware/authMiddleware");
const sendMail = require("../utils/mailer");

/* =====================================================
   REGISTER API
===================================================== */
router.post("/register", async (req, res) => {
  try {
    console.log("🔥 REGISTER HIT:", req.body);

    let { name, email, password, department, role } = req.body;

    // If role not sent, default to HOD
    if (!role) {
      role = "HOD";
    }

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      department,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: `${role} registered successfully ✅`,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   LOGIN API
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   FORGOT PASSWORD
===================================================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let account = await User.findOne({ email });

    if (!account) {
      account = await Student.findOne({ email });
    }

    if (!account) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    account.resetToken = token;
    account.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

    await account.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendMail(account.email, resetLink);

    res.status(200).json({
      message: "Reset link sent to email ✅",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   RESET PASSWORD
===================================================== */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user =
      (await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() },
      })) ||
      (await Student.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() },
      }));

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successful ✅",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ================= HOD DASHBOARD ================= */
router.get("/hod-dashboard", authMiddleware, (req, res) => {
  if (req.user.role !== "HOD") {
    return res.status(403).json({ message: "Access denied ❌ (HOD only)" });
  }

  res.status(200).json({
    message: "Welcome HOD Dashboard ✅",
    user: req.user,
  });
});

/* ================= FACULTY DASHBOARD ================= */
router.get("/faculty-dashboard", authMiddleware, (req, res) => {
  if (req.user.role !== "Faculty") {
    return res.status(403).json({ message: "Access denied ❌ (Faculty only)" });
  }

  res.status(200).json({
    message: "Welcome Faculty Dashboard ✅",
    user: req.user,
  });
});

/* ================= STUDENT DASHBOARD ================= */
router.get("/student-dashboard", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        message: "Access denied ❌ (Student only)",
      });
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.status(200).json({
      message: "Welcome Student Dashboard ✅",
      user: {
        id: req.user.id,
        name: student.name,
        department: student.department,
        year: student.year,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("STUDENT DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ================= GENERIC DASHBOARD ================= */
router.get("/dashboard", authMiddleware, (req, res) => {
  res.status(200).json({
    message: `Welcome ${req.user.role} Dashboard ✅`,
    user: req.user,
  });
});

module.exports = router;