const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  openingHours: { type: String, default: "08:00 AM - 06:00 PM" },
  entranceFee: { type: String, default: "Free" },
  visitDurationMinutes: { type: Number, default: 60 },
  facilities: [{ type: String }],
  parkingInfo: { type: String, default: "Available" },
  travelTips: { type: String, default: "Wear comfortable shoes." },
  images: [{ type: String }],
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  recommendationCount: { type: Number, default: 0 },
  recommendationPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attraction', attractionSchema);
