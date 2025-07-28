const Vote = require('../models/Vote');

// Get vote counts for current election
exports.getVoteCounts = async (req, res) => {
  try {
    const { electionId } = req.query;
    if (!electionId) return res.status(400).json({ error: 'electionId required' });
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ error: 'Invalid electionId format' });
    }
    const votes = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: '$candidateId', count: { $sum: 1 } } }
    ]);
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get vote counts' });
  }
};

// Cast vote for candidate in current election
exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId, voterId } = req.body;
    if (!electionId || !candidateId || !voterId) {
      console.error('Missing required fields', { electionId, candidateId, voterId });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Prevent double voting
    const existing = await Vote.findOne({ electionId, voterId });
    if (existing) {
      console.error('Double voting attempt', { electionId, voterId });
      return res.status(400).json({ error: 'You have already voted in this election' });
    }
    // Validate candidate is in current election
    const Election = require('../models/Election');
    const election = await Election.findById(electionId);
    if (!election) {
      console.error('Election not found', { electionId });
      return res.status(400).json({ error: 'Election not found' });
    }
    if (!election.candidates.map(id => String(id)).includes(String(candidateId))) {
      console.error('Candidate not in current election', { candidateId, electionCandidates: election.candidates });
      return res.status(400).json({ error: 'Candidate not in current election' });
    }
    const vote = new Vote({ electionId, candidateId, voterId });
    await vote.save();
    res.json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(500).json({ error: error.message || 'Failed to cast vote' });
  }
};
