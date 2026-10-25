const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attraction',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce one active recommendation per user per place
recommendationSchema.index({ placeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
