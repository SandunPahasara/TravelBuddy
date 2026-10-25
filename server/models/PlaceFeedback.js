const mongoose = require('mongoose');

const placeFeedbackSchema = new mongoose.Schema({
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
  userName: {
    type: String,
    default: 'Anonymous Visitor'
  },
  cleanliness: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  safety: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  accessibility: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  facilities: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  parking: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  familyFriendly: {
    type: Number,
    min: 1,
    max: 5,
    default: 4
  },
  comments: {
    type: String,
    default: '',
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce one feedback per user per place (upsertable)
placeFeedbackSchema.index({ placeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PlaceFeedback', placeFeedbackSchema);
