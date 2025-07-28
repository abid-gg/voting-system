// Get total voters
exports.getTotalVoters = async (req, res) => {
  try {
    const totalVoters = await User.countDocuments();
    res.json({ totalVoters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get total voters' });
  }
};
// controllers/userController.js
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const nodemailer = require('nodemailer');
const Election = require('../models/Election');

// generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP to email
exports.sendOTP = async (req, res) => {
  const { email, name } = req.body;
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Voting',
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified', user });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// Vote
exports.vote = async (req, res) => {
  const { userId, candidateId } = req.body;

  try {
    // Check election status first
    const election = await Election.findOne();
    if (!election || !election.started) {
      return res.status(403).json({ error: 'Election is not running currently' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.hasVoted) {
      return res.status(400).json({ error: 'User has already voted' });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    user.hasVoted = true;
    user.votedTo = candidate._id;
    await user.save();

    candidate.voteCount = candidate.voteCount ? candidate.voteCount + 1 : 1;
    await candidate.save();

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Voting error:', error);
    res.status(500).json({ error: 'Voting failed due to server error' });
  }
};