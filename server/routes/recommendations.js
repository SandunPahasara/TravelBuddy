const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recommendation = require('../models/Recommendation');
const Review = require('../models/Review');
const Attraction = require('../models/Attraction');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const { syncAttractionStats } = require('./reviews');

// GET /api/places/:placeId/recommendations - Get place recommendation metrics
router.get('/places/:placeId/recommendations', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const totalRecommendations = await Recommendation.countDocuments({ placeId });
    const totalReviews = await Review.countDocuments({ placeId, status: 'active' });

    let percentage = 0;
    if (totalReviews > 0) {
      const recReviews = await Review.countDocuments({
        placeId,
        status: 'active',
        recommendationStatus: 'Recommended'
      });
      percentage = Math.round((recReviews / totalReviews) * 100);
    } else if (totalRecommendations > 0) {
      percentage = 100;
    }

    let hasRecommended = false;
    if (req.user) {
      const existing = await Recommendation.findOne({ placeId, userId: req.user._id });
      hasRecommended = !!existing;
    }

    res.json({
      success: true,
      data: {
        totalRecommendations,
        recommendationPercentage: percentage,
        hasRecommended,
        isRecommendedBadge: percentage >= 75 || totalRecommendations >= 3
      }
    });
  } catch (error) {
    console.error('GET recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

// POST /api/places/:placeId/recommendations - Recommend a place
router.post('/places/:placeId/recommendations', authenticateUser, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    // Check if already recommended
    const existing = await Recommendation.findOne({ placeId, userId: req.user._id });
    if (existing) {
      return res.json({
        success: true,
        message: 'You have already recommended this place.',
        hasRecommended: true
      });
    }

    await Recommendation.create({
      placeId,
      userId: req.user._id
    });

    const stats = await syncAttractionStats(placeId);

    res.status(201).json({
      success: true,
      message: `You recommended ${attraction.name}!`,
      hasRecommended: true,
      stats
    });
  } catch (error) {
    console.error('POST recommendation error:', error);
    res.status(500).json({ success: false, error: 'Failed to recommend place' });
  }
});

// DELETE /api/places/:placeId/recommendations - Remove recommendation
router.delete('/places/:placeId/recommendations', authenticateUser, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    await Recommendation.findOneAndDelete({ placeId, userId: req.user._id });
    const stats = await syncAttractionStats(placeId);

    res.json({
      success: true,
      message: 'Recommendation removed.',
      hasRecommended: false,
      stats
    });
  } catch (error) {
    console.error('DELETE recommendation error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove recommendation' });
  }
});

// GET /api/places/:placeId/ratings - Rating distribution and detailed metrics
router.get('/places/:placeId/ratings', async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const reviews = await Review.find({ placeId, status: 'active' });
    const total = reviews.length;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += r.rating;
    });

    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;
    const recCount = await Recommendation.countDocuments({ placeId });
    const recommendedReviews = reviews.filter(r => r.recommendationStatus === 'Recommended').length;
    const recommendationPercentage = total > 0
      ? Math.round((recommendedReviews / total) * 100)
      : (recCount > 0 ? 100 : 0);

    const distributionPercentages = {
      5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
      4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
      3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
      2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
      1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        averageRating,
        totalRatings: total,
        distribution,
        distributionPercentages,
        recommendationCount: recCount,
        recommendationPercentage,
        isRecommendedBadge: recommendationPercentage >= 75 || recCount >= 3
      }
    });
  } catch (error) {
    console.error('GET ratings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ratings summary' });
  }
});

module.exports = router;
