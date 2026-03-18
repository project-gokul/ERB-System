const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const fs = require("fs");
const path = require("path");

/* ================= ROLE CHECK ================= */

const allowFacultyOrAdmin = (role) => {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return ["faculty", "hod", "admin"].includes(normalizedRole);
};

/* ================= UPLOAD ================= */

const uploadCertificate = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

    // ✅ Auth check
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    // ✅ File check
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // ✅ Title check
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const userId = req.user.id;

    // ✅ File URL
    const fileUrl = `/uploads/certificates/${req.file.filename}`;

    // ✅ Save certificate
    const certificate = await Certificate.create({
      studentId: userId,
      title: title.trim(),
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

    return res.status(201).json({
      message: "Certificate uploaded successfully",
      certificate,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    return res.status(500).json({
      message: "Upload failed",
    });
  }
};

/* ================= GET MY CERTIFICATES ================= */

const getMyCertificates = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const certificates = await Certificate.find({
      studentId: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(certificates);
  } catch (err) {
    console.error("FETCH MY ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch certificates",
    });
  }
};

/* ================= DELETE ================= */

const deleteCertificate = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const cert = await Certificate.findOne({
      _id: req.params.id,
      studentId: userId,
    });

    if (!cert) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    // ✅ Safe file delete
    try {
      const relativePath = cert.fileUrl.split("/uploads/")[1];

      if (relativePath) {
        const absolutePath = path.join(
          __dirname,
          "..",
          "uploads",
          relativePath
        );

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }
    } catch (fileErr) {
      console.warn("File delete skipped:", fileErr.message);
    }

    await cert.deleteOne();

    return res.json({
      message: "Certificate deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);

    return res.status(500).json({
      error: "Failed to delete certificate",
    });
  }
};

/* ================= ADMIN GET ================= */

const getAllCertificatesAdmin = async (req, res) => {
  try {
    if (!req.user || !allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const certificates = await Certificate.find({
      status: { $ne: "rejected" },
    })
      .populate("studentId", "email")
      .sort({ createdAt: -1 });

    return res.status(200).json(certificates);
  } catch (err) {
    console.error("ADMIN FETCH ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch certificates",
    });
  }
};

/* ================= UPDATE STATUS ================= */

const updateCertificateStatus = async (req, res) => {
  try {
    if (!req.user || !allowFacultyOrAdmin(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
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

    return res.json({
      message: `Certificate ${status} successfully`,
      certificate: cert,
    });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);

    return res.status(500).json({
      error: "Failed to update status",
    });
  }
};

module.exports = {
  uploadCertificate,
  getMyCertificates,
  deleteCertificate,
  getAllCertificatesAdmin,
  updateCertificateStatus,
};
