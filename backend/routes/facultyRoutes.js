import express from "express";

import Faculty from "../models/Faculty.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   CREATE FACULTY (STATIC + DYNAMIC FIELDS)
   POST /api/faculty
===================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, department, year, extraFields = {} } = req.body;

    if (!name || !email || !department || !year) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const existing = await Faculty.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Faculty already exists",
      });
    }

    const faculty = await Faculty.create({
      name,
      email,
      department,
      year,
      extraFields,
    });

    res.status(201).json(faculty);
  } catch (err) {
    console.error("CREATE FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   GET ALL FACULTY
   GET /api/faculty
===================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ createdAt: -1 });
    res.json(faculty);
  } catch (err) {
    console.error("FETCH FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   DELETE A DYNAMIC COLUMN (GLOBAL)
   DELETE /api/faculty/column/:columnName
   ⚠ MUST COME BEFORE /:id
===================================================== */
router.delete("/column/:columnName", authMiddleware, async (req, res) => {
  try {
    const { columnName } = req.params;

    if (!columnName) {
      return res.status(400).json({
        message: "Column name is required",
      });
    }

    await Faculty.updateMany(
      {},
      { $unset: { [`extraFields.${columnName}`]: "" } }
    );

    res.json({
      message: `Column '${columnName}' deleted successfully`,
    });
  } catch (err) {
    console.error("DELETE COLUMN ERROR:", err);
    res.status(500).json({ message: "Failed to delete column" });
  }
});

/* =====================================================
   UPDATE FACULTY (INLINE EDIT SAFE)
   PUT /api/faculty/:id
===================================================== */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   DELETE FACULTY
   DELETE /api/faculty/:id
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Faculty.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    res.json({ message: "Faculty deleted successfully" });
  } catch (err) {
    console.error("DELETE FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   COUNT TOTAL FACULTY
   GET /api/faculty/count
===================================================== */
router.get("/count", authMiddleware, async (req, res) => {
  try {
    const count = await Faculty.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("COUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   YEAR-WISE FACULTY COUNT
   GET /api/faculty/year-count
===================================================== */
router.get("/year-count", authMiddleware, async (req, res) => {
  try {
    const data = await Faculty.aggregate([
      {
        $group: {
          _id: "$year",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      "1st": 0,
      "2nd": 0,
      "3rd": 0,
      "4th": 0,
    };

    data.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (err) {
    console.error("YEAR COUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;