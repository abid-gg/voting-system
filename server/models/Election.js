const mongoose = require('mongoose');


const electionSchema = new mongoose.Schema({
  started: { type: Boolean, default: false },
  startTime: { type: Date },
  endTime: { type: Date },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }], // selected candidates for this election
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
