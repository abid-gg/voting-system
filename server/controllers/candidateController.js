// Create candidate with image upload
exports.createCandidate = async (req, res) => {
  try {
    const { name, position, email, password, offering } = req.body;
    let imageUrl = '';
    if (req.file) {
      // Save relative path for frontend
      imageUrl = `/uploads/candidate_images/${req.file.filename}`;
    }
    const candidate = new Candidate({
      name,
      position,
      email,
      password,
      offering,
      imageUrl
    });
    await candidate.save();
    res.status(201).json({ message: 'Candidate added!', candidate });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to add candidate' });
  }
};
// Returns total number of candidates
exports.getTotalCandidatesCount = async (req, res) => {
  try {
    const count = await require('../models/Candidate').countDocuments();
    res.json({ totalCandidates: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get candidates count' });
  }
};
const Candidate = require('../models/Candidate');

exports.loginCandidate = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt with:', email, password);

  try {
    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      console.log(`No candidate found with email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`Candidate found: ${candidate.email}`);
    console.log(`Provided password: ${password}`);
    console.log(`Stored password: ${candidate.password}`);

    if (candidate.password !== password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Candidate login successful');
    const { password: pwd, ...candidateData } = candidate.toObject();
    res.status(200).json(candidateData);

  } catch (err) {
    console.error('🔥 Server error during candidate login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};
