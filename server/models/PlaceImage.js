const mongoose = require('mongoose');

const placeImageSchema = new mongoose.Schema({
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attraction',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  imageUrl: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: '',
    maxlength: [200, 'Caption cannot exceed 200 characters']
  },
  altText: {
    type: String,
    default: '',
    maxlength: [150, 'Alt text cannot exceed 150 characters']
  },
  uploaderType: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlaceImage', placeImageSchema);
