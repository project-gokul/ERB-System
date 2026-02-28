const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,           // ✅ CHANGED
  secure: false,       // ✅ MUST BE FALSE
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, resetLink) => {
  try {
    await transporter.sendMail({
      from: `"ERB System" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error; // important so route catches it
  }
};

module.exports = sendMail;