const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* =========================================================
   ================= CREATE UPLOAD FOLDER ==================
========================================================= */

const uploadDir = path.join(__dirname, "..", "uploads", "certificates");

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Upload folder created:", uploadDir);
  } else {
    console.log("Upload folder already exists:", uploadDir);
  }
} catch (err) {
  console.error("Error creating upload folder:", err);
}

/* =========================================================
   ================= MULTER STORAGE CONFIG =================
========================================================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

/* =========================================================
   ================= FILE FILTER (PDF ONLY) =================
========================================================= */

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

/* =========================================================
   ================= MULTER CONFIG =========================
========================================================= */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;