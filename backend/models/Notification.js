const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);