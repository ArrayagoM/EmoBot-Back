const mongoose = require('mongoose');

const emotionSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  mood: { type: String },
  isCritical: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Emotion', emotionSchema);
