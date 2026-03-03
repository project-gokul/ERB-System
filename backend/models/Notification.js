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
    recipientId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  refPath: "recipientModel"
},

recipientRole: {
  type: String,
  required: true
},

recipientModel: {
  type: String,
  required: true,
  enum: ["Student", "Faculty", "Admin"]
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);