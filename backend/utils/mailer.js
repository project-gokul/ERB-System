const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ✅ Verify transporter once at startup (optional but recommended)
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error ❌", error);
  } else {
    console.log("Email transporter ready ✅");
  }
});

module.exports = async (to, link) => {
  try {
    await transporter.sendMail({
      from: `"Dept System" <${process.env.EMAIL}>`, // ✅ REQUIRED
      to,
      subject: "Reset Your Password",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${link}">${link}</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });
  } catch (error) {
    console.error("Email send failed ❌", error);
    throw error; // 🔴 IMPORTANT: let route catch this
  }
};