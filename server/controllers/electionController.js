// Get all elections
exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ startTime: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific election by id with candidates populated
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('candidates');
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

// Create or update election with selected candidates
exports.createOrUpdateElection = async (req, res) => {
  try {
    const { startTime, endTime, candidateIds } = req.body;
    // Always create a new Election document
    const election = new Election({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      candidates: candidateIds, // array of candidate ObjectIds
      started: false
    });
    await election.save();
    res.json({ message: 'Election scheduled successfully', election });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current election with selected candidates
exports.getCurrentElection = async (req, res) => {
  try {
    // Find the latest election (by startTime or _id desc)
    const election = await Election.findOne().sort({ startTime: -1, _id: -1 }).populate('candidates');
    if (!election) {
      return res.status(404).json({ message: 'No election found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
