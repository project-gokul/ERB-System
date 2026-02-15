import express from "express";
import Subject from "../models/Subject.js";

const router = express.Router();

/* ➕ ADD SUBJECT */
router.post("/add", async (req, res) => {
  try {
    const { subjectName, subjectCode, department, year } = req.body;

    // ✅ VALIDATION
    if (!subjectName || !subjectCode || !department || !year) {
      return res.status(400).json({
        message:
          "All fields are required (subjectName, subjectCode, department, year)",
      });
    }

    // ✅ CHECK DUPLICATE SUBJECT CODE
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
      message: "Subject added successfully",
      subject,
    });
  } catch (err) {
    console.error("ADD SUBJECT ERROR ❌", err);
    res.status(500).json({ message: err.message });
  }
});

/* 📎 ADD / UPDATE MATERIAL LINK FOR SUBJECT */
router.put("/material/:id", async (req, res) => {
  try {
    const { materialLink } = req.body;

    if (!materialLink) {
      return res.status(400).json({ message: "Material link is required" });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { materialLink },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({
      message: "Material link updated successfully",
      subject,
    });
  } catch (err) {
    console.error("UPDATE MATERIAL LINK ERROR ❌", err);
    res.status(500).json({ message: err.message });
  }
});

/* 📥 GET SUBJECTS BY YEAR */
router.get("/:year", async (req, res) => {
  try {
    const year = decodeURIComponent(req.params.year);
    const subjects = await Subject.find({ year });

    res.status(200).json(subjects);
  } catch (err) {
    console.error("FETCH SUBJECTS ERROR ❌", err);
    res.status(500).json({ message: err.message });
  }
});

/* ❌ DELETE SUBJECT */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("DELETE SUBJECT ERROR ❌", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/", (req, res) => {
  res.json({ message: "Subject route working ✅" });
});

export default router;