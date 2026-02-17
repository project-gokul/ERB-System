const express = require("express");
const upload = require("../middleware/upload");
const Certificate = require("../models/Certificate");
const authMiddleware = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const Notification = require("../models/Notification");

const router = express.Router();

// ================= ROLE HELPER =================
const allowFacultyOrAdmin = (role) =>
  role === "Faculty" || role === "admin" || role === "HOD";

// ================= UPLOAD CERTIFICATE =================
router.post(
  "/upload",
  authMiddleware,
  upload.single("certificate"),
  async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(400).json({ message: "User ID missing in token" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const certificate = new Certificate({
        studentId: req.user.id,
        title: req.body.title,
        fileUrl: `/uploads/certificates/${req.file.filename}`,
        status: "pending",
      });

      await certificate.save();
      res.status(201).json(certificate);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ================= GET MY CERTIFICATES =================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const certs = await Certificate.find({ studentId: req.user.id });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE CERTIFICATE (FIXED) =================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      _id: req.params.id,
      studentId: req.user.id,
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // 🔥 DELETE FILE FROM DISK
    const filePath = path.join(
      __dirname,
      "..",
      cert.fileUrl // /uploads/certificates/xxx.png
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 🔥 DELETE FROM DB
    await cert.deleteOne();

    res.json({ message: "Certificate deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ALL CERTIFICATES (ADMIN / FACULTY) =================
router.get("/admin/all", authMiddleware, async (req, res) => {
  if (!allowFacultyOrAdmin(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const certs = await Certificate.find().populate("studentId", "email");
  res.json(certs);
});

// ================= APPROVE / REJECT =================
router.patch("/admin/:id/status", authMiddleware, async (req, res) => {
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

  res.json(cert);
});
router.post(
  "/upload",
  authMiddleware,
  upload.single("certificate"),
  async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(400).json({ message: "User ID missing" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const certificate = new Certificate({
        studentId: req.user.id,
        title: req.body.title,
        fileUrl: `/uploads/certificates/${req.file.filename}`,
        status: "pending",
      });

      await certificate.save();

      // 🔔 CREATE NOTIFICATION FOR FACULTY / HOD / ADMIN
      const roles = ["Faculty", "HOD", "admin"];

      const notifications = roles.map((role) => ({
        recipientRole: role,
        message: `New certificate uploaded by student`,
        certificateId: certificate._id,
      }));

      await Notification.insertMany(notifications);

      res.status(201).json(certificate);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;