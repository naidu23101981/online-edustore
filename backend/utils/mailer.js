const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: `"Edustore" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Your OTP Code for Edustore',
    html: `
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>It will expire in 5 minutes.</p>
    `,
  });
}

module.exports = { sendOtpEmail }; // ✅ NAMED EXPORT
