const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

/* =========================================================
   ================= GET MY NOTIFICATIONS ==================
========================================================= */
router.get("/my", authMiddleware, notificationController.getMyNotifications);

/* =========================================================
   ================= MARK AS READ ==========================
========================================================= */
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);

/* =========================================================
   ================= DELETE NOTIFICATION ===================
========================================================= */
router.delete("/:id", authMiddleware, notificationController.deleteNotification);

module.exports = router;