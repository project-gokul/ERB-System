const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

/* =====================================================
   REGISTER API
===================================================== */
router.post("/register", authController.register);

/* =====================================================
   LOGIN API
===================================================== */
router.post("/login", authController.login);

/* =====================================================
   DASHBOARDS (CASE SAFE)
===================================================== */
router.get("/hod-dashboard", authMiddleware, authController.hodDashboard);
router.get("/faculty-dashboard", authMiddleware, authController.facultyDashboard);
router.get("/student-dashboard", authMiddleware, authController.studentDashboard);
router.get("/dashboard", authMiddleware, authController.genericDashboard);

module.exports = router;