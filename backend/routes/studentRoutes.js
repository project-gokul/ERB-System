const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

/* =====================================================
   DELETE ANY COLUMN (MUST BE ABOVE /:id ROUTE)
===================================================== */
router.delete("/column/:columnName", authMiddleware, studentController.deleteColumn);

/* =====================================================
   CREATE STUDENT
===================================================== */
router.post("/", authMiddleware, studentController.createStudent);

/* =====================================================
   GET ALL STUDENTS
===================================================== */
router.get("/", authMiddleware, studentController.getAllStudents);

/* =====================================================
   IMPORT FROM GOOGLE SHEET
===================================================== */
router.post("/import", authMiddleware, studentController.importStudents);

/* =====================================================
   DELETE STUDENT
===================================================== */
router.delete("/:id", authMiddleware, studentController.deleteStudent);

/* =====================================================
   UPDATE STUDENT
===================================================== */
router.put("/:id", authMiddleware, studentController.updateStudent);

module.exports = router;