// server/seed.js
// Run: node seed.js

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Candidate = require('./models/Candidate');
const User = require('./models/User');
const Election = require('./models/Election');

const MONGO_URI = 'mongodb://localhost:27017/online-voting-system'; // Change if needed

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Clear existing data (optional)
  await Admin.deleteMany({});
  await Candidate.deleteMany({});
  await User.deleteMany({});
  await Election.deleteMany({});

  // Create Admin
  const admin = new Admin({
    username: 'admin',
    password: 'admin123' // Consider hashing in production
  });
  await admin.save();
  console.log('Admin created');

  // Create Candidate
  const candidate = new Candidate({
    email: 'candidate1@example.com',
    password: 'candidate123',
    name: 'Candidate One',
    position: 'President',
    offering: 'Transparency and Progress'
  });
  await candidate.save();
  console.log('Candidate created');

  // Create Voter
  const user = new User({
    email: 'voter1@example.com',
    name: 'Voter One',
    hasVoted: false
  });
  await user.save();
  console.log('Voter created');

  // Create Election
  const now = new Date();
  const election = new Election({
    startTime: new Date(now.getTime() + 60000), // starts in 1 min
    endTime: new Date(now.getTime() + 3600000), // ends in 1 hour
    started: false
  });
  await election.save();
  console.log('Election created');

  await mongoose.disconnect();
  console.log('Seeding done!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
