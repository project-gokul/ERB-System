const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },

    subjectCode: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
      required: true,
    },

    year: {
      type: String,
      required: true,
    },

    // ✅ NEW FIELD FOR DOWNLOAD / MATERIAL LINK
    materialLink: {
      type: String,
      default: "", // empty if not added
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);