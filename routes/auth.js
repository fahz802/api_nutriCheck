const User = require('../models/user');
const bcrypt = require('bcryptjs');
const sendOTP = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

// register
const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err); 
    res.status(500).json({ message: 'Register failed', error: err.message });
  }
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Email not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password' });

    const payload = {
      id_users: user._id,
      username: user.username,
      email: user.email
    };

    const accessToken = jwt.sign(payload, SECRET_KEY); 
    const refreshToken = jwt.sign({ id_users: user._id }, REFRESH_SECRET_KEY); 

    user.refresh_token = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// logout
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: 'Refresh token required' });

  try {
    const user = await User.findOne({ refresh_token: refreshToken });
    if (!user)
      return res.status(403).json({ message: 'Invalid refresh token' });

    user.refresh_token = null;
    await user.save();

    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60000); // berlaku 5 menit

  user.otp = otp;
  user.otp_expiry = expiry;
  await user.save();

  await sendOTP(email, otp);
  res.json({ message: 'Kode OTP telah dikirim ke email Anda' });
};

// Ganti password setelah verifikasi OTP
const changePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

  if (user.otp !== otp || new Date() > user.otp_expiry) {
    return res.status(400).json({ message: 'OTP salah atau kadaluarsa' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otp_expiry = null;
  await user.save();

  res.json({ message: 'Password berhasil diganti' });
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (user.otp !== otp || new Date() > user.otp_expiry) {
      return res.status(400).json({ message: 'OTP salah atau kadaluarsa' });
    }

    res.json({ message: 'OTP valid' });
  } catch (error) {
    console.error('Verifikasi OTP error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email wajib diisi' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email tidak ditemukan' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60000); // OTP berlaku 5 menit

    user.otp = otp;
    user.otp_expiry = expiry;
    await user.save();

    await sendOTP(email, otp);
    res.status(200).json({ message: 'Kode OTP telah dikirim ke email Anda' });
  } catch (err) {
    console.error('Forget Password Error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: 'Semua field wajib diisi' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    if (user.otp !== otp || new Date() > user.otp_expiry)
      return res.status(400).json({ message: 'OTP salah atau sudah kadaluarsa' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    res.status(200).json({ message: 'Password berhasil diganti' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};


module.exports = {
  register,
  login,
  logout,
  sendOtp,
  changePassword,
  verifyOtp,
  forgetPassword,
  resetPasswordWithOtp
};
