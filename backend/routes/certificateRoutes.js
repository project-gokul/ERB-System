const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const certificateController = require("../controllers/certificateController");

const router = express.Router();

/* =========================================================
   ================= UPLOAD CERTIFICATE ====================
========================================================= */
router.post(
  "/upload",
  authMiddleware,
  certificateController.uploadCertificate
);

/* =========================================================
   ================= GET MY CERTIFICATES ===================
========================================================= */
router.get("/my", authMiddleware, certificateController.getMyCertificates);

/* =========================================================
   ================= DELETE CERTIFICATE ====================
========================================================= */
router.delete("/:id", authMiddleware, certificateController.deleteCertificate);

/* =========================================================
   ============= GET ALL CERTIFICATES (ADMIN) ==============
========================================================= */
router.get("/admin/all", authMiddleware, certificateController.getAllCertificatesAdmin);

/* =========================================================
   ================= APPROVE / REJECT ======================
========================================================= */
router.patch("/admin/:id/status", authMiddleware, certificateController.updateCertificateStatus);

module.exports = router;
