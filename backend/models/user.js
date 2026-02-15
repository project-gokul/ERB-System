import mongoose from "mongoose";

// User (HOD / Faculty / Student) Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: String,
      enum: ["1st", "2nd", "3rd", "4th", "N/A"],
      default: "N/A",
    },

    role: {
      type: String,
      enum: ["HOD", "Faculty", "Student"],
      required: true,
    },

    // ✅ REQUIRED FOR FORGOT PASSWORD
    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;