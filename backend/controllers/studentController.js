const Student = require("../models/Student");
const fetchSheetData = require("../services/googlesheet");

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

const deleteColumn = async (req, res) => {
  try {
    const { columnName } = req.params;

    if (!columnName) {
      return res.status(400).json({ message: "Column name required" });
    }

    let updateQuery;

    if (CORE_FIELDS.includes(columnName)) {
      updateQuery = { $unset: { [columnName]: "" } };
    } else {
      updateQuery = { $unset: { [`extraFields.${columnName}`]: "" } };
    }

    const result = await Student.updateMany({}, updateQuery);

    res.json({
      message: `Column '${columnName}' deleted successfully`,
      modified: result.modifiedCount,
    });

  } catch (err) {
    console.error("DELETE COLUMN ERROR:", err);
    res.status(500).json({ message: "Failed to delete column" });
  }
};

const createStudent = async (req, res) => {
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

    if (!name || !rollNo || !department || !year || !email) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const exists = await Student.findOne({ rollNo });
    if (exists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const student = await Student.create({
      name,
      rollNo,
      department,
      year,
      phoneNo: phoneNo || "",
      email,
      extraFields,
    });

    res.status(201).json(student);
  } catch (err) {
    console.error("CREATE STUDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("FETCH STUDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const importStudents = async (req, res) => {
  try {
    const { sheetUrl, sheetName } = req.body;

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({ message: "Invalid Google Sheet URL" });
    }

    const sheetData = await fetchSheetData(
      sheetId,
      sheetName || "Form responses 1"
    );

    if (!sheetData.length) {
      return res.status(400).json({ message: "No valid data found in sheet" });
    }

    let imported = 0;

    for (const row of sheetData) {
      if (!row.rollNo) continue;

      await Student.updateOne(
        { rollNo: row.rollNo },
        {
          $set: {
            name: row.name || "",
            department: row.department || "",
            year: row.year || "",
            phoneNo: row.phone || row.phoneNo || "",
            email: row.email || "",
            extraFields: row.extraFields || {},
          },
        },
        { upsert: true }
      );

      imported++;
    }

    res.json({
      message: "Google Sheet imported successfully",
      count: imported,
    });

  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ message: "Import failed" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const existingStudent = await Student.findById(req.params.id);

    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const updatedData = {
      ...req.body,
    };

    // 🔥 IMPORTANT: Merge extraFields instead of overwrite
    if (req.body.extraFields) {
      updatedData.extraFields = {
        ...Object.fromEntries(existingStudent.extraFields || []),
        ...req.body.extraFields,
      };
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE STUDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  deleteColumn,
  createStudent,
  getAllStudents,
  deleteStudent,
  importStudents,
  updateStudent
};
