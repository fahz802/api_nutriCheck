const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  refresh_token: String,
  otp: String,
  otp_expiry: Date,
});

module.exports = mongoose.model('User', userSchema);