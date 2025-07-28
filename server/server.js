// ...existing code...

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path'); // Added path module
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

// Import routes

app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/candidate', require('./routes/candidateRoutes'));
app.use('/api/election', require('./routes/electionRoutes'));
app.use('/api/vote', require('./routes/voteRoutes'));

app.get('/', (req, res) => {
  res.send('Online Voting System API');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
app.use('/uploads/candidate_images', express.static(path.join(__dirname, 'uploads/candidate_images')));

let Election;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");

    Election = require('./models/Election');

    // ⏰ Schedule election check every minute
    cron.schedule('* * * * *', async () => {
      try {
        const election = await Election.findOne();
        if (!election || !election.startTime || !election.endTime) {
          console.log('⚠️ No valid election scheduled.');
          return;
        }

        const now = new Date();
        console.log('⏱️ Cron running at', now.toISOString());
        console.log('🗳️ Election startTime:', election.startTime);
        console.log('🛑 Election endTime:', election.endTime);
        console.log('📌 Current status:', election.started ? 'RUNNING' : 'NOT STARTED');

        // ✅ Start election automatically
        if (!election.started && now >= election.startTime && now < election.endTime) {
          election.started = true;
          await election.save();
          console.log('✅ Election started automatically.');
        }

        // ✅ End election automatically
        if (election.started && now >= election.endTime) {
          election.started = false;
          await election.save();
          console.log('🛑 Election ended automatically.');
        }

      } catch (error) {
        console.error('❌ Error in election cron job:', error.message);
      }
    });

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
