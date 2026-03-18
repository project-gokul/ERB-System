// routes/certificateRoutes.js

const express = require("express");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const certificateController = require("../controllers/certificateController");

const router = express.Router();

/* =========================================================
   ================= MULTER ERROR HANDLER ==================
========================================================= */

const handleUpload = (req, res, next) => {
  const singleUpload = upload.single("certificate"); // ✅ MUST MATCH frontend

  singleUpload(req, res, function (err) {
    if (err) {
      console.error("MULTER ERROR:", err);

      // ✅ File size error
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File too large (Max 5MB allowed)",
        });
      }

      // ✅ File type error
      return res.status(400).json({
        message: err.message || "File upload failed",
      });
    }

    // ❌ No file uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    next();
  });
};

/* =========================================================
   ================= UPLOAD CERTIFICATE ====================
========================================================= */

router.post(
  "/upload",
  authMiddleware,
  handleUpload, // 🔥 FIXED MIDDLEWARE
  certificateController.uploadCertificate
);

/* =========================================================
   ================= GET MY CERTIFICATES ===================
========================================================= */

router.get(
  "/my",
  authMiddleware,
  certificateController.getMyCertificates
);

/* =========================================================
   ================= DELETE CERTIFICATE ====================
========================================================= */

router.delete(
  "/:id",
  authMiddleware,
  certificateController.deleteCertificate
);

/* =========================================================
   ============= GET ALL CERTIFICATES (ADMIN) ==============
========================================================= */

router.get(
  "/admin/all",
  authMiddleware,
  certificateController.getAllCertificatesAdmin
);

/* =========================================================
   ================= APPROVE / REJECT ======================
========================================================= */

router.patch(
  "/admin/:id/status",
  authMiddleware,
  certificateController.updateCertificateStatus
);

module.exports = router;
