// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, vote, getTotalVoters } = require('../controllers/userController');
// GET /api/user/total/count
router.get('/total/count', getTotalVoters);

// POST /api/user/send-otp
router.post('/send-otp', sendOTP);

// POST /api/user/verify-otp
router.post('/verify-otp', verifyOTP);

// POST /api/user/vote
router.post('/vote', vote);

module.exports = router;
