const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // store hashed password in real app
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
