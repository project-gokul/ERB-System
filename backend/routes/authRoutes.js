import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/user.js";
import Student from "../models/Student.js";
import authMiddleware from "../middleware/authMiddleware.js";
import sendMail from "../utils/mailer.js";

const router = express.Router();

/* =====================================================
   REGISTER
===================================================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !department || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      role,
    });

    res.status(201).json({
      message: `${role} registered successfully ✅`,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
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

    let account =
      (await User.findOne({ email })) ||
      (await Student.findOne({ email }));

    if (!account) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    account.resetToken = token;
    account.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await account.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendMail(account.email, resetLink);

    res.json({ message: "Reset link sent to email ✅" });
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

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    let account =
      (await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() },
      })) ||
      (await Student.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() },
      }));

    if (!account) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    account.password = await bcrypt.hash(password, 10);
    account.resetToken = null;
    account.resetTokenExpiry = null;
    await account.save();

    res.status(200).json({
      message: "Password reset successful ✅",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   ROLE DASHBOARDS
===================================================== */

router.get("/hod-dashboard", authMiddleware, (req, res) => {
  if (req.user.role !== "HOD") {
    return res.status(403).json({ message: "Access denied ❌ (HOD only)" });
  }
  res.json({ message: "Welcome HOD Dashboard ✅", user: req.user });
});

router.get("/faculty-dashboard", authMiddleware, (req, res) => {
  if (req.user.role !== "Faculty") {
    return res
      .status(403)
      .json({ message: "Access denied ❌ (Faculty only)" });
  }
  res.json({ message: "Welcome Faculty Dashboard ✅", user: req.user });
});

router.get("/student-dashboard", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res
        .status(403)
        .json({ message: "Access denied ❌ (Student only)" });
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.json({
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

/* =====================================================
   GENERIC DASHBOARD
===================================================== */
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: `Welcome ${req.user.role} Dashboard ✅`,
    user: req.user,
  });
});

export default router;