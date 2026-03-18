const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const facultyController = require("../controllers/facultyController");

/* =====================================================
   CREATE FACULTY (STATIC + DYNAMIC FIELDS)
===================================================== */
router.post("/", authMiddleware, facultyController.createFaculty);

/* =====================================================
   GET ALL FACULTY
===================================================== */
router.get("/", authMiddleware, facultyController.getAllFaculty);

/* =====================================================
   DELETE A DYNAMIC COLUMN (GLOBAL)
   MUST COME BEFORE /:id
===================================================== */
router.delete("/column/:columnName", authMiddleware, facultyController.deleteColumn);

/* =====================================================
   UPDATE FACULTY (INLINE EDIT SAFE)
===================================================== */
router.put("/:id", authMiddleware, facultyController.updateFaculty);

/* =====================================================
   DELETE FACULTY
===================================================== */
router.delete("/:id", authMiddleware, facultyController.deleteFaculty);

/* =====================================================
   COUNT TOTAL FACULTY
===================================================== */
router.get("/count", authMiddleware, facultyController.getFacultyCount);

/* =====================================================
   YEAR-WISE FACULTY COUNT
===================================================== */
router.get("/year-count", authMiddleware, facultyController.getFacultyYearCount);

module.exports = router;