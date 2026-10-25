const mongoose = require('mongoose');

const placeVideoSchema = new mongoose.Schema({
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attraction',
    required: true,
    index: true
  },
  youtubeVideoId: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  channelName: {
    type: String,
    default: 'Travel Channel',
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Travel Vlog',
      'Tourist Review',
      'Historical Info',
      'Walking Tour',
      'Travel Guide',
      'Things to Do'
    ],
    default: 'Travel Vlog'
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlaceVideo', placeVideoSchema);
