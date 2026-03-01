const nodemailer = require("nodemailer");

// ================= CREATE TRANSPORTER =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be Gmail App Password
  },
});

// ================= VERIFY CONNECTION =================
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail server connection failed:", error);
  } else {
    console.log("✅ Mail server ready");
  }
});

// ================= RESET PASSWORD EMAIL =================
const sendResetMail = async (to, resetLink) => {
  try {
    await transporter.sendMail({
      from: `"ERB System" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset</h2>
          <p>You requested to reset your password.</p>
          <p>
            <a 
              href="${resetLink}" 
              target="_blank"
              style="
                display:inline-block;
                padding:10px 15px;
                background:#4f46e5;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </p>
          <p>This link expires in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log("✅ Reset email sent successfully");
  } catch (error) {
    console.error("❌ Reset email failed:", error.message);
    throw error;
  }
};

// ================= APPROVAL STATUS EMAIL =================
const sendStatusMail = async (to, status) => {
  try {
    await transporter.sendMail({
      from: `"ERB System" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Certificate Status Update",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Certificate Status Update</h2>
          <p>Your certificate has been:</p>
          <h3 style="color:${
            status === "approved"
              ? "#22c55e"
              : status === "rejected"
              ? "#ef4444"
              : "#facc15"
          }">
            ${status.toUpperCase()}
          </h3>
          <p>Please login to your dashboard for more details.</p>
        </div>
      `,
    });

    console.log("✅ Status email sent successfully");
  } catch (error) {
    console.error("❌ Status email failed:", error.message);
    throw error;
  }
};

// ================= EXPORT =================
module.exports = {
  sendResetMail,
  sendStatusMail,
};