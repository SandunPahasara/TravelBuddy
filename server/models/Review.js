const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    required: true,
    trim: true
  },
  userProfilePicture: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  visitDate: {
    type: String,
    default: ''
  },
  recommendationStatus: {
    type: String,
    enum: ['Recommended', 'Not Recommended'],
    default: 'Recommended'
  },
  images: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' }
  }],
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'hidden'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce one review per user per place
reviewSchema.index({ placeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
