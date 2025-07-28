const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  otp: { type: String },                 // for OTP verification
  otpExpires: { type: Date },            // OTP expiry time
  hasVoted: { type: Boolean, default: false },
  votedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
