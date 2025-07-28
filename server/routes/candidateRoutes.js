
const express = require('express');
const router = express.Router();
const {
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
  getTotalCandidatesCount,
  createCandidate
} = require('../controllers/candidateController');
const Candidate = require('../models/Candidate');
const upload = require('../middleware/uploadCandidateImage');

// Existing routes
router.post('/login', loginCandidate);
// Add candidate with image upload
router.post('/', upload.single('image'), createCandidate);
// More specific routes first
router.get('/total/count', getTotalCandidatesCount);
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Failed to get candidates' });
  }
});
router.get('/:id', getCandidateProfile);
router.put('/:id', updateCandidateProfile);

module.exports = router;
