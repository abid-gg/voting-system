const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

// Route to cast a vote
router.post('/cast', voteController.castVote);

// Route to get vote counts for an election
router.get('/counts', voteController.getVoteCounts);

module.exports = router;
