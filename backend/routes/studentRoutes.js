import express from "express";

import Student from "../models/Student.js";
import authMiddleware from "../middleware/authMiddleware.js";
import fetchSheetData from "../services/googlesheet.js";

const router = express.Router();

/* =====================================================
   HELPER: Extract Google Sheet ID
===================================================== */
const extractSheetId = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

/* =====================================================
   CORE (DEFAULT) COLUMNS
===================================================== */
const CORE_FIELDS = [
  "name",
  "rollNo",
  "department",
  "year",
  "phoneNo",
  "email",
];

/* =====================================================
   CREATE STUDENT
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      rollNo,
      department,
      year,
      phoneNo,
      email,
      extraFields = {},
    } = req.body;

    if (!name || !rollNo || !department || !year || !phoneNo || !email) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const exists = await Student.findOne({ rollNo });
    if (exists) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    const student = await Student.create({
      name,
      rollNo,
      department,
      year,
      phoneNo,
      email,
      extraFields,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   GET ALL STUDENTS
===================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    console.error("FETCH STUDENT ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   UPDATE STUDENT
===================================================== */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   DELETE STUDENT
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully ✅",
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
});

/* =====================================================
   IMPORT FROM GOOGLE SHEET
===================================================== */
router.post("/import", authMiddleware, async (req, res) => {
  try {
    const { sheetUrl, sheetName } = req.body;

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({
        message: "Invalid Google Sheet URL",
      });
    }

    const sheetData = await fetchSheetData(
      sheetId,
      sheetName || "Form responses 1"
    );

    if (!sheetData.length) {
      return res.status(400).json({
        message: "No valid data found in sheet",
      });
    }

    let imported = 0;

    for (const student of sheetData) {
      if (!student.rollNo) continue;

      await Student.updateOne(
        { rollNo: student.rollNo },
        {
          $set: {
            name: student.name,
            department: student.department,
            year: student.year,
            phoneNo: student.phoneNo,
            email: student.email,
            extraFields: student.extraFields || {},
          },
        },
        { upsert: true }
      );

      imported++;
    }

    res.status(200).json({
      message: "Google Sheet imported successfully ✅",
      count: imported,
    });
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    res.status(500).json({
      message: error.message || "Import failed ❌",
    });
  }
});

/* =====================================================
   DELETE ANY COLUMN (CORE + DYNAMIC)
===================================================== */
router.delete("/column/:columnName", authMiddleware, async (req, res) => {
  try {
    const { columnName } = req.params;

    if (!columnName) {
      return res.status(400).json({
        message: "Column name required",
      });
    }

    const updateQuery = CORE_FIELDS.includes(columnName)
      ? { $unset: { [columnName]: "" } }
      : { $unset: { [`extraFields.${columnName}`]: "" } };

    const result = await Student.updateMany({}, updateQuery);

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: "Column not found",
      });
    }

    res.status(200).json({
      message: `Column '${columnName}' deleted successfully ✅`,
    });
  } catch (error) {
    console.error("DELETE COLUMN ERROR:", error);
    res.status(500).json({ message: "Failed to delete column ❌" });
  }
});

/* =====================================================
   CLEAR DEFAULT COLUMN SAFELY
===================================================== */
router.put(
  "/column/default/:columnName",
  authMiddleware,
  async (req, res) => {
    const { columnName } = req.params;

    if (!CORE_FIELDS.includes(columnName)) {
      return res.status(400).json({
        message: "Invalid default column",
      });
    }

    await Student.updateMany({}, { $set: { [columnName]: "" } });

    res.status(200).json({
      message: `Default column '${columnName}' cleared ✅`,
    });
  }
);

/* ================= EXPORT ================= */
export default router;