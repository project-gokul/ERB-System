import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    // 🔹 DEFAULT FIELDS
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 DYNAMIC COLUMNS
    extraFields: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

const Faculty = mongoose.model("Faculty", facultySchema);

export default Faculty;