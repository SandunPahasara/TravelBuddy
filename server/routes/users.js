const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Review = require('../models/Review');
const Recommendation = require('../models/Recommendation');
const Attraction = require('../models/Attraction');

// GET /api/users/:id - Public User Profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('name profilePicture bio role createdAt');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    // Calculate public stats
    const reviews = await Review.find({ userId: user._id, status: 'active' }).populate('placeId', 'name category images');
    const recommendations = await Recommendation.find({ userId: user._id }).populate('placeId', 'name category distanceKm images');

    const totalRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRatingGiven = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
        stats: {
          reviewsCount: reviews.length,
          recommendationsCount: recommendations.length,
          averageRatingGiven: Number(averageRatingGiven)
        },
        reviews,
        recommendations
      }
    });
  } catch (error) {
    console.error('GET /api/users/:id error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
