const User = require("../models/user");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    let { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Normalize role to lowercase
    role = (role || "hod").toLowerCase();

    const allowedRoles = ["student", "faculty", "hod", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const roleMapping = {
      "hod": "HOD",
      "faculty": "Faculty",
      "student": "Student",
      "admin": "Admin"
    };
    const dbRole = roleMapping[role];

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
      role: dbRole || role,
    });

    await newUser.save();

    res.status(201).json({
      message: `${role.toUpperCase()} registered successfully \u2705`,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error \u274c" });
  }
};

const login = async (req, res) => {
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
      {
        id: user._id,
        role: user.role.toLowerCase(), // normalize
        email: user.email,
      },
      process.env.JWT_SECRET || 'test_secret', // fallback for tests
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful \u2705",
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
    res.status(500).json({ message: "Server error \u274c" });
  }
};

const hodDashboard = (req, res) => {
  if (req.user.role !== "hod") {
    return res.status(403).json({ message: "Access denied \u274c (HOD only)" });
  }

  res.json({ message: "Welcome HOD Dashboard \u2705", user: req.user });
};

const facultyDashboard = (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied \u274c (Faculty only)" });
  }

  res.json({ message: "Welcome Faculty Dashboard \u2705", user: req.user });
};

const studentDashboard = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied \u274c (Student only)",
      });
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.json({
      message: "Welcome Student Dashboard \u2705",
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
    res.status(500).json({ message: "Server error \u274c" });
  }
};

const genericDashboard = (req, res) => {
  res.json({
    message: `Welcome ${req.user.role.toUpperCase()} Dashboard \u2705`,
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  hodDashboard,
  facultyDashboard,
  studentDashboard,
  genericDashboard
};
