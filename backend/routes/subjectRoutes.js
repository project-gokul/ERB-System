import express from "express";
import Subject from "../models/Subject.js";

const router = express.Router();

/* =====================================================
   HEALTH CHECK
===================================================== */
router.get("/", (req, res) => {
  res.json({ message: "Subject route working ✅" });
});

/* =====================================================
   ADD SUBJECT
   POST /api/subjects/add
===================================================== */
router.post("/add", async (req, res) => {
  try {
    const { subjectName, subjectCode, department, year } = req.body;

    if (!subjectName || !subjectCode || !department || !year) {
      return res.status(400).json({
        message:
          "All fields are required (subjectName, subjectCode, department, year)",
      });
    }

    const existing = await Subject.findOne({ subjectCode });
    if (existing) {
      return res.status(409).json({
        message: "Subject with this code already exists",
      });
    }

    const subject = await Subject.create({
      subjectName,
      subjectCode,
      department,
      year,
    });

    res.status(201).json({
      message: "Subject added successfully ✅",
      subject,
    });
  } catch (error) {
    console.error("ADD SUBJECT ERROR ❌", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   ADD / UPDATE MATERIAL LINK
   PUT /api/subjects/material/:id
===================================================== */
router.put("/material/:id", async (req, res) => {
  try {
    const { materialLink } = req.body;

    if (!materialLink) {
      return res.status(400).json({
        message: "Material link is required",
      });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { materialLink },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Material link updated successfully ✅",
      subject,
    });
  } catch (error) {
    console.error("UPDATE MATERIAL LINK ERROR ❌", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   GET SUBJECTS BY YEAR
   GET /api/subjects/:year
===================================================== */
router.get("/:year", async (req, res) => {
  try {
    const year = decodeURIComponent(req.params.year);
    const subjects = await Subject.find({ year });

    res.status(200).json(subjects);
  } catch (error) {
    console.error("FETCH SUBJECTS ERROR ❌", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   DELETE SUBJECT
   DELETE /api/subjects/:id
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully ✅",
    });
  } catch (error) {
    console.error("DELETE SUBJECT ERROR ❌", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* ================= EXPORT ================= */
export default router;