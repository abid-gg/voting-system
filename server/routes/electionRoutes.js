// routes/electionRoutes.js
const express = require('express');
const router = express.Router();

const { createOrUpdateElection, getCurrentElection, getAllElections, getElectionById } = require('../controllers/electionController');


router.post('/create-or-update', createOrUpdateElection);
router.get('/current', getCurrentElection);
router.get('/all', getAllElections); // Get all elections
router.get('/:id', getElectionById); // Get election by id with candidates

module.exports = router;
