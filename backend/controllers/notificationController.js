const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role.toLowerCase();

    // 🔥 Convert to ObjectId (VERY IMPORTANT)
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const notifications = await Notification.find({
      recipientRole: userRole,
      recipientId: userObjectId,
      isRead: false, // optional (show only unread)
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
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipientId: userObjectId,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    return res.status(500).json({
      message: "Failed to update notification",
      error: err.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId: userObjectId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    return res.status(500).json({
      message: "Failed to delete notification",
      error: err.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  deleteNotification
};
