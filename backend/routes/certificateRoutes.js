const express = require("express");
const upload = require("../middleware/upload");
const Certificate = require("../models/Certificate");
const authMiddleware = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const Notification = require("../models/Notification");

const router = express.Router();

// ================= ROLE HELPER =================
const allowFacultyOrAdmin = (role) => {
  return ["Faculty", "HOD", "admin"].includes(role);
};

// ========================================================
// ================= UPLOAD CERTIFICATE ===================
// ========================================================
router.post(
  "/upload",
  authMiddleware,
  upload.single("certificate"),
  async (req, res) => {
    try {
      console.log("USER:", req.user);
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({ message: "Invalid token - user missing" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const filePath = `/uploads/certificates/${req.file.filename}`;

      const certificate = new Certificate({
        studentId: userId,
        title: req.body.title,
        fileUrl: filePath,
        status: "pending",
      });

      await certificate.save();

      // 🔔 Notifications
      const roles = ["Faculty", "HOD", "admin"];

      const notifications = roles.map((role) => ({
        recipientRole: role,
        message: `New certificate uploaded by student`,
        certificateId: certificate._id,
      }));

      await Notification.insertMany(notifications);

      res.status(201).json({
        message: "Certificate uploaded successfully",
        certificate,
      });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: "Server error during upload" });
    }
  }
);

// ========================================================
// ================= GET MY CERTIFICATES ==================
// ========================================================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const certs = await Certificate.find({ studentId: userId })
      .sort({ uploadedAt: -1 });

    res.status(200).json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

// ========================================================
// ================= DELETE CERTIFICATE ===================
// ========================================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const cert = await Certificate.findOne({
      _id: req.params.id,
      studentId: userId,
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const absolutePath = path.join(__dirname, "..", cert.fileUrl);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await cert.deleteOne();

    res.json({ message: "Certificate deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete certificate" });
  }
});

// ========================================================
// ============ GET ALL CERTIFICATES (ADMIN) =============
// ========================================================
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (!allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const certs = await Certificate.find({
      status: { $ne: "rejected" }
    })
      .populate("studentId", "email")
      .sort({ uploadedAt: -1 });

    res.status(200).json(certs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

// ========================================================
// ================= APPROVE / REJECT =====================
// ========================================================
router.patch("/admin/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const cert = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({
      message: `Certificate ${status} successfully`,
      cert,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;