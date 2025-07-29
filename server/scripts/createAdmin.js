require('dotenv').config();
// Script to create an admin user in MongoDB
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/online-voting-system';

async function createAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const username = 'admin'; // Change as needed
  const password = 'admin123'; // Change as needed

  let existing = await Admin.findOne({ username });
  if (existing) {
    console.log('Admin user already exists:', username);
    process.exit(0);
  }

  const admin = new Admin({ username, password });
  await admin.save();
  console.log('Admin user created:', username);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
