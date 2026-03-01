const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================= ENSURE FOLDER EXISTS =================
const uploadPath = path.join(__dirname, "..", "uploads", "certificates");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ================= STORAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// ================= FILE FILTER (IMPROVED) =================
const fileFilter = (req, file, cb) => {
  // Accept any image OR pdf
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only image or PDF files allowed"
      )
    );
  }
};

// ================= MULTER EXPORT =================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;