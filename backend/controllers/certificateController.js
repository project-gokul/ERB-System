const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");const allowFacultyOrAdmin = (role) => {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return ["faculty", "hod", "admin"].includes(normalizedRole);
};

const uploadCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, fileUrl } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!fileUrl) {
      return res.status(400).json({ message: "File URL is required" });
    }

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
    res.status(500).json({ message: "Upload failed" });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.find({
      studentId: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (err) {
    console.error("FETCH MY ERROR:", err);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const userId = req.user.id;

    const cert = await Certificate.findOne({
      _id: req.params.id,
      studentId: userId,
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Notice: We don't delete the remote ImgBB file here automatically since it doesn't provide a straightforward delete-by-url API without a separate delete URL/token.
    // If we wanted to, we would need to store the ImgBB delete_url when creating the certificate.

    await cert.deleteOne();

    res.json({ message: "Certificate deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete certificate" });
  }
};

const getAllCertificatesAdmin = async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
};

const updateCertificateStatus = async (req, res) => {
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
    res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = {
  uploadCertificate,
  getMyCertificates,
  deleteCertificate,
  getAllCertificatesAdmin,
  updateCertificateStatus
};
