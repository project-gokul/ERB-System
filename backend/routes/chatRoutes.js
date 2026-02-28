const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Certificate = require("../models/Certificate");
const authMiddleware = require("../middleware/authMiddleware");

/* ==============================
   MEMORY SYSTEM
============================== */
const memory = {};

/* ==============================
   UNIVERSAL FORMAT FUNCTION
============================== */
const formatDocument = (doc, title = "RECORD", index = null) => {
  const obj = doc.toObject({ flattenMaps: true });

  let output = "";

  if (index !== null) {
    output += `━━━━━━━━━━━━━━━━━━\n`;
    output += `${title} ${index}\n`;
    output += `━━━━━━━━━━━━━━━━━━\n\n`;
  }

  for (let key in obj) {
    if (
      key === "_id" ||
      key === "__v" ||
      key === "createdAt" ||
      key === "updatedAt"
    )
      continue;

    if (key === "extraFields" && typeof obj[key] === "object") {
      for (let subKey in obj[key]) {
        output += `${subKey.toUpperCase()}: ${obj[key][subKey]}\n\n`;
      }
    } else {
      output += `${key.toUpperCase()}: ${obj[key]}\n\n`;
    }
  }

  return output.trim();
};

/* ==============================
   ROUTER
============================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!req.body.message) {
      return res.json({ reply: "Please enter something." });
    }

    const msg = req.body.message.toLowerCase().trim();
    const userId = req.user?.id || "guest";

    /* ================= YEAR MEMORY ================= */
    if (memory[userId]?.step === "awaitingYear") {
      const year = msg.match(/\d+/)?.[0];

      if (!year || year < 1 || year > 4) {
        return res.json({ reply: "Enter a valid year (1-4)." });
      }

      memory[userId] = {};

      const students = await Student.find({ year }).limit(10);

      if (!students.length) {
        return res.json({ reply: "No students found." });
      }

      const result = students
        .map((s, i) => formatDocument(s, "STUDENT", i + 1))
        .join("\n\n");

      return res.json({ reply: result });
    }

    /* ================= GREETING ================= */
    if (/^(hi|hello|hey)\b/.test(msg)) {
      return res.json({
        reply: "Hello 👋 How can I help you?",
      });
    }

    /* ================= SMART STUDENT DETECTION ================= */
    if (msg.includes("student") && !msg.match(/\b\d+\b/)) {
      const students = await Student.find().limit(10);

      if (!students.length) {
        return res.json({ reply: "No students found." });
      }

      const result = students
        .map((s, i) => formatDocument(s, "STUDENT", i + 1))
        .join("\n\n");

      return res.json({ reply: result });
    }

    /* ================= FACULTY DETECTION ================= */
    if (msg.includes("faculty")) {
      const facultyList = await Faculty.find().limit(10);

      if (!facultyList.length) {
        return res.json({ reply: "No faculty found." });
      }

      const result = facultyList
        .map((f, i) => formatDocument(f, "FACULTY", i + 1))
        .join("\n\n");

      return res.json({ reply: result });
    }

    /* ================= TOTAL COUNTS ================= */
    if (msg.includes("how many students")) {
      const count = await Student.countDocuments();
      return res.json({ reply: `Total students: ${count}` });
    }

    if (msg.includes("how many faculty")) {
      const count = await Faculty.countDocuments();
      return res.json({ reply: `Total faculty: ${count}` });
    }

    if (msg.includes("how many certificates")) {
      const count = await Certificate.countDocuments();
      return res.json({ reply: `Total certificates: ${count}` });
    }

    /* ================= SEARCH BY ROLL ================= */
    const rollMatch = msg.match(/\b\d+\b/);

    if (rollMatch) {
      const student = await Student.findOne({
        rollNo: rollMatch[0],
      });

      if (student) {
        return res.json({
          reply: formatDocument(student, "STUDENT"),
        });
      }
    }

    /* ================= SEARCH BY NAME ================= */
    const student = await Student.findOne({
      name: { $regex: msg, $options: "i" },
    });

    if (student) {
      return res.json({
        reply: formatDocument(student, "STUDENT"),
      });
    }

    /* ================= DEFAULT ================= */
    return res.json({
      reply: "Can you rephrase that?",
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ reply: "Server error 😢" });
  }
});

module.exports = router;