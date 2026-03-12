const express = require("express");
const multer = require("multer");
const upload = require("../middleware/upload");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* =========================================================
   ================= ROLE HELPER ===========================
========================================================= */

const allowFacultyOrAdmin = (role) => {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return ["faculty", "hod", "admin"].includes(normalizedRole);
};

/* =========================================================
   ================= UPLOAD CERTIFICATE ====================
========================================================= */

router.post(
  "/upload",
  authMiddleware,
  upload.single("certificate"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.id;
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      // safer file URL
      const fileUrl = `/uploads/certificates/${req.file.filename}`;

      const certificate = await Certificate.create({
        studentId: userId,
        title,
        fileUrl,
        status: "pending",
      });

      /* ================= CREATE NOTIFICATIONS ================= */

      const roles = ["faculty", "hod", "admin"];

      const notifications = roles.map((role) => ({
        recipientRole: role,
        message: "New certificate uploaded by student",
        certificateId: certificate._id,
        isRead: false,
      }));

      await Notification.insertMany(notifications);

      res.status(201).json({
        message: "Certificate uploaded successfully",
        certificate,
      });

    } catch (err) {

      console.error("UPLOAD ERROR:", err);

      res.status(500).json({
        message: "Upload failed",
      });

    }
  }
);

/* =========================================================
   ================= GET MY CERTIFICATES ===================
========================================================= */

router.get("/my", authMiddleware, async (req, res) => {
  try {

    const userId = req.user.id;

    const certificates = await Certificate.find({
      studentId: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(certificates);

  } catch (err) {

    console.error("FETCH MY ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch certificates",
    });

  }
});

/* =========================================================
   ================= DELETE CERTIFICATE ====================
========================================================= */

router.delete("/:id", authMiddleware, async (req, res) => {
  try {

    const userId = req.user.id;

    const cert = await Certificate.findOne({
      _id: req.params.id,
      studentId: userId,
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const relativePath = cert.fileUrl.split("/uploads/")[1];

    const absolutePath = path.join(
      __dirname,
      "..",
      "uploads",
      relativePath
    );

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await cert.deleteOne();

    res.json({
      message: "Certificate deleted successfully",
    });

  } catch (err) {

    console.error("DELETE ERROR:", err);

    res.status(500).json({
      error: "Failed to delete certificate",
    });

  }
});

/* =========================================================
   ============= GET ALL CERTIFICATES (ADMIN) ==============
========================================================= */

router.get("/admin/all", authMiddleware, async (req, res) => {
  try {

    if (!allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const certificates = await Certificate.find({
      status: { $ne: "rejected" },
    })
      .populate("studentId", "email")
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);

  } catch (err) {

    console.error("ADMIN FETCH ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch certificates",
    });

  }
});

/* =========================================================
   ================= APPROVE / REJECT ======================
========================================================= */

router.patch("/admin/:id/status", authMiddleware, async (req, res) => {
  try {

    if (!allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const cert = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    res.json({
      message: `Certificate ${status} successfully`,
      certificate: cert,
    });

  } catch (err) {

    console.error("STATUS UPDATE ERROR:", err);

    res.status(500).json({
      error: "Failed to update status",
    });

  }
});

module.exports = router;