const express = require("express");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   ================= GET MY NOTIFICATIONS ==================
========================================================= */

router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role.toLowerCase();

    const notifications = await Notification.find({
      recipientRole: userRole,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "certificateId",
        select: "title status fileUrl studentId",
        populate: {
          path: "studentId",
          select: "email name",
        },
      });

    return res.status(200).json(notifications);

  } catch (err) {
    console.error("NOTIFICATION FETCH ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: err.message,
    });
  }
});

/* =========================================================
   ================= MARK AS READ ==========================
========================================================= */

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({
      message: "Notification marked as read",
      notification,
    });

  } catch (err) {
    console.error("MARK READ ERROR:", err);
    return res.status(500).json({
      message: "Failed to update notification",
    });
  }
});

/* =========================================================
   ================= DELETE NOTIFICATION ===================
========================================================= */

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({
      message: "Notification deleted successfully",
    });

  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    return res.status(500).json({
      message: "Failed to delete notification",
    });
  }
});

module.exports = router;