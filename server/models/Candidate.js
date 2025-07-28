const mongoose = require('mongoose');


const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },    // e.g. "Mayor"
  offering: { type: String },                     // campaign promises
  voteCount: { type: Number, default: 0 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String }, // path or URL to candidate image
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
