const express = require("express");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientRole: req.user.role,
    })
      .sort({ createdAt: -1 })
      .populate("certificateId");

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;