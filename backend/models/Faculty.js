const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    // 🔹 DEFAULT FIELDS
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    year: {
      type: String,
      required: true,
    },

    extraFields: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faculty", facultySchema);