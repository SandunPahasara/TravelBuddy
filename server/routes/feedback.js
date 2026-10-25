const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PlaceFeedback = require('../models/PlaceFeedback');
const Attraction = require('../models/Attraction');
const { authenticateUser, optionalAuth } = require('../middleware/auth');

// GET /api/places/:placeId/feedback - Get category feedback summary and comments
router.get('/places/:placeId/feedback', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const feedbacks = await PlaceFeedback.find({ placeId }).sort({ createdAt: -1 });
    const count = feedbacks.length;

    let averages = {
      cleanliness: 0,
      safety: 0,
      accessibility: 0,
      facilities: 0,
      parking: 0,
      familyFriendly: 0,
      overall: 0
    };

    if (count > 0) {
      const totals = feedbacks.reduce(
        (acc, item) => ({
          cleanliness: acc.cleanliness + (item.cleanliness || 4),
          safety: acc.safety + (item.safety || 4),
          accessibility: acc.accessibility + (item.accessibility || 4),
          facilities: acc.facilities + (item.facilities || 4),
          parking: acc.parking + (item.parking || 4),
          familyFriendly: acc.familyFriendly + (item.familyFriendly || 4)
        }),
        { cleanliness: 0, safety: 0, accessibility: 0, facilities: 0, parking: 0, familyFriendly: 0 }
      );

      averages = {
        cleanliness: Number((totals.cleanliness / count).toFixed(1)),
        safety: Number((totals.safety / count).toFixed(1)),
        accessibility: Number((totals.accessibility / count).toFixed(1)),
        facilities: Number((totals.facilities / count).toFixed(1)),
        parking: Number((totals.parking / count).toFixed(1)),
        familyFriendly: Number((totals.familyFriendly / count).toFixed(1))
      };

      const sumAll = (
        averages.cleanliness +
        averages.safety +
        averages.accessibility +
        averages.facilities +
        averages.parking +
        averages.familyFriendly
      );
      averages.overall = Number((sumAll / 6).toFixed(1));
    }

    // Filter recent comments
    const recentComments = feedbacks
      .filter(f => f.comments && f.comments.trim().length > 0)
      .slice(0, 10)
      .map(f => ({
        id: f._id,
        userName: f.userName,
        comments: f.comments,
        createdAt: f.createdAt
      }));

    // If user is logged in, return their feedback
    let userFeedback = null;
    if (req.user) {
      userFeedback = feedbacks.find(f => f.userId.toString() === req.user._id.toString()) || null;
    }

    res.json({
      success: true,
      data: {
        totalResponses: count,
        averages,
        recentComments,
        userFeedback
      }
    });
  } catch (error) {
    console.error('GET feedback error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
});

// POST /api/places/:placeId/feedback - Submit/update category feedback
router.post('/places/:placeId/feedback', authenticateUser, async (req, res) => {
  try {
    const { placeId } = req.params;
    const {
      cleanliness,
      safety,
      accessibility,
      facilities,
      parking,
      familyFriendly,
      comments
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    const clampRating = (val) => {
      const num = Number(val);
      if (isNaN(num)) return 4;
      return Math.min(5, Math.max(1, num));
    };

    const payload = {
      placeId,
      userId: req.user._id,
      userName: req.user.name || 'Visitor',
      cleanliness: clampRating(cleanliness),
      safety: clampRating(safety),
      accessibility: clampRating(accessibility),
      facilities: clampRating(facilities),
      parking: clampRating(parking),
      familyFriendly: clampRating(familyFriendly),
      comments: comments ? comments.trim() : ''
    };

    // Upsert feedback
    const feedback = await PlaceFeedback.findOneAndUpdate(
      { placeId, userId: req.user._id },
      { $set: payload },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for helping future visitors!',
      data: feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
});

module.exports = router;
