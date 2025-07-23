const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middlewares/verifyToken');
const detectRoutes = require('./routes/detect');
const barcodeRoutes = require('./routes/barcode');
const riwayatRoutes = require('./routes/riwayat');
const monitoringRoutes = require('./routes/monitoring'); 
const home = require('./routes/home'); 
require('dotenv').config();
require('./config/db'); 

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Public routes (tidak perlu token)
app.post('/api/login', authRoutes.login);
app.post('/api/register', authRoutes.register);
app.post('/api/logout', authRoutes.logout);
app.post('/api/forget-password', authRoutes.forgetPassword);
app.post('/api/reset-password', authRoutes.resetPasswordWithOtp);
app.post('/api/verify-otp', authRoutes.verifyOtp);

// Middleware: semua route di bawah ini wajib token
app.use('/api', verifyToken);

// Protected routes (butuh token)
app.use('/api/detect', detectRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/riwayat', riwayatRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/home', home);
app.post('/api/send-otp', authRoutes.sendOtp);
app.post('/api/change-password', authRoutes.changePassword);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

});
