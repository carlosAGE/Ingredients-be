// models/scan.js
const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  result: { type: Object, required: true }, // raw OpenAI result or parsed JSON
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional for now
});

module.exports = mongoose.model('Scan', scanSchema);
