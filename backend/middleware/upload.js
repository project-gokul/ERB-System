const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* =========================================================
   ================= CREATE UPLOAD FOLDER ==================
========================================================= */

// Absolute path to uploads/certificates
const uploadDir = path.join(__dirname, "..", "uploads", "certificates");

// Create folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Upload folder created:", uploadDir);
} else {
  console.log("Upload folder already exists:", uploadDir);
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
    cb(new Error("Only PDF files are allowed"), false);
  }
};

/* =========================================================
   ================= MULTER CONFIG =========================
========================================================= */

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;