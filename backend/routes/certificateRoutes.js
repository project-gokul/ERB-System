const express = require("express");
const upload = require("../middleware/upload");
const Certificate = require("../models/Certificate");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* ========================================================
   ================= ROLE HELPER (FIXED) ==================
   ======================================================== */

const allowFacultyOrAdmin = (role) => {
  if (!role) return false;

  const normalizedRole = role.toLowerCase();

  return ["faculty", "hod", "admin"].includes(normalizedRole);
};

/* ========================================================
   ================= UPLOAD CERTIFICATE ===================
   ======================================================== */

router.post(
  "/upload",
  authMiddleware,
  upload.single("certificate"),
  async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const filePath = `/uploads/certificates/${req.file.filename}`;

      const certificate = await Certificate.create({
        studentId: userId,
        title: req.body.title,
        fileUrl: filePath,
        status: "pending",
      });

      /* 🔔 Create notifications for Faculty/HOD/Admin */
      const roles = ["faculty", "hod", "admin"];

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

/* ========================================================
   ================= GET MY CERTIFICATES ==================
   ======================================================== */

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const certs = await Certificate.find({ studentId: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(certs);

  } catch (err) {
    console.error("FETCH MY ERROR:", err);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

/* ========================================================
   ================= DELETE CERTIFICATE ===================
   ======================================================== */

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const cert = await Certificate.findOne({
      _id: req.params.id,
      studentId: userId,
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    /* Delete file from disk */
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

/* ========================================================
   ============ GET ALL CERTIFICATES (ADMIN) =============
   ======================================================== */

router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    if (!allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const certs = await Certificate.find({
      status: { $ne: "rejected" },
    })
      .populate("studentId", "email")
      .sort({ createdAt: -1 });

    res.status(200).json(certs);

  } catch (err) {
    console.error("ADMIN FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

/* ========================================================
   ================= APPROVE / REJECT =====================
   ======================================================== */

router.patch("/admin/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
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
      certificate: cert,
    });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;