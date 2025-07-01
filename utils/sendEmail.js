const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // atau gunakan mail provider lain
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Kode OTP untuk Ganti Password',
    text: `Kode OTP Anda adalah: ${otp}`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;
