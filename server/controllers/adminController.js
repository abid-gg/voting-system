// Get all admins (for management UI)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};
// Add a new admin
exports.addAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const exists = await Admin.findOne({ username });
    if (exists) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created', admin: { _id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

// Edit an existing admin (username or password)
exports.editAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    if (username) admin.username = username;
    if (password) admin.password = password;
    await admin.save();
    res.json({ message: 'Admin updated', admin: { _id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin' });
  }
};
const Election = require('../models/Election');


const Admin = require('../models/Admin');

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Don't send password back
    const { password: pwd, ...adminData } = admin.toObject();
    res.status(200).json(adminData);
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.startElection = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Start and end time required' });
    }

    // Always create a new election document
    const election = new Election({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      started: false
    });

    await election.save();

    res.json({ message: 'Election scheduled successfully', election });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.endElection = async (req, res) => {
  try {
    // Find the latest election (by startTime or _id desc)
    const election = await Election.findOne().sort({ startTime: -1, _id: -1 });
    if (!election) {
      return res.status(404).json({ message: 'No election found' });
    }

    election.started = false;
    election.endTime = new Date();
    await election.save();

    res.json({ message: 'Election ended' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.getElectionStatus = async (req, res) => {
  try {
    // Find the latest election (by startTime or _id desc)
    const election = await Election.findOne().sort({ startTime: -1, _id: -1 });
    if (!election) {
      return res.status(404).json({ message: 'No election found' });
    }

    const now = new Date();
    let status = 'not-started';
    let startCountdown = null;
    let timeRemaining = null;

    if (election.startTime && now >= election.startTime) {
      if (election.endTime && now < election.endTime) {
        status = 'running';
      } else {
        status = 'ended';
      }
    }

    // Calculate countdown to start if not started yet
    if (status === 'not-started' && election.startTime) {
      const diff = election.startTime.getTime() - now.getTime();
      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        startCountdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      } else {
        startCountdown = '00:00:00';
      }
    }

    // Calculate remaining time if election is running
    if (status === 'running' && election.endTime) {
      const diff = election.endTime.getTime() - now.getTime();
      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        timeRemaining = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      } else {
        timeRemaining = '00:00:00';
      }
    }

    res.json({
      status,
      startCountdown,
      timeRemaining,
      startTime: election.startTime ? election.startTime.toISOString() : null,
      endTime: election.endTime ? election.endTime.toISOString() : null,
    });

  } catch (error) {
    console.error('Error fetching election status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper
function formatDiff(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Helper to print the latest election status in terminal/cron
async function printLatestElectionStatus() {
  const election = await Election.findOne().sort({ startTime: -1, _id: -1 });
  if (!election) {
    console.log('No election found');
    return;
  }
  const now = new Date();
  let status = 'not-started';
  if (election.startTime && now >= election.startTime) {
    if (election.endTime && now < election.endTime) {
      status = 'running';
    } else {
      status = 'ended';
    }
  }
  // Always use this helper to print the latest election status
  // Usage: await printLatestElectionStatus();
}

// Example usage in a cron/interval:
// setInterval(printLatestElectionStatus, 60000); // every minute
