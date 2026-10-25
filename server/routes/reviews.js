const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Attraction = require('../models/Attraction');
const Recommendation = require('../models/Recommendation');
const { authenticateUser, authenticateAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * Helper to recalculate and sync attraction stats from live database records
 */
async function syncAttractionStats(placeId) {
  try {
    const validReviews = await Review.find({ placeId, status: 'active' });
    const totalReviews = validReviews.length;

    let avgRating = 0;
    if (totalReviews > 0) {
      const sum = validReviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
    }

    const recCount = await Recommendation.countDocuments({ placeId });
    const recReviewsCount = validReviews.filter(r => r.recommendationStatus === 'Recommended').length;
    const recPercentage = totalReviews > 0
      ? Math.round((recReviewsCount / totalReviews) * 100)
      : (recCount > 0 ? 100 : 0);

    await Attraction.findByIdAndUpdate(placeId, {
      $set: {
        avgRating,
        reviewCount: totalReviews,
        recommendationCount: recCount,
        recommendationPercentage: recPercentage
      }
    });

    return { avgRating, totalReviews, recCount, recPercentage };
  } catch (err) {
    console.error('Error syncing attraction stats:', err);
  }
}

// GET /api/places/:placeId/reviews - List all active reviews for an attraction
router.get('/places/:placeId/reviews', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;
    const { sort = 'newest' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

    const reviews = await Review.find({
      placeId,
      status: 'active'
    }).sort(sortOption);

    // Check if the current user has already submitted a review
    let userReview = null;
    if (req.user) {
      userReview = reviews.find(r => r.userId.toString() === req.user._id.toString()) || null;
    }

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
      userReview
    });
  } catch (error) {
    console.error('GET reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// POST /api/places/:placeId/reviews - Submit or update review
router.post('/places/:placeId/reviews', authenticateUser, upload.array('photos', 5), async (req, res) => {
  try {
    const { placeId } = req.params;
    const { rating, title, reviewText, visitDate, recommendationStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5 stars.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Review title is required.' });
    }

    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({ success: false, error: 'Review experience text is required.' });
    }

    // Process uploaded review photos
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(f => ({
        url: `/uploads/${f.filename}`,
        caption: title.trim()
      }));
    } else if (req.body.imageUrls) {
      try {
        const parsed = JSON.parse(req.body.imageUrls);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.map(url => ({ url: typeof url === 'string' ? url : url.url, caption: '' }));
        }
      } catch (e) {
        if (typeof req.body.imageUrls === 'string') {
          imageUrls = [{ url: req.body.imageUrls, caption: '' }];
        }
      }
    }

    const recStatus = recommendationStatus === 'Not Recommended' ? 'Not Recommended' : 'Recommended';

    // Check if user already reviewed this place
    let existingReview = await Review.findOne({ placeId, userId: req.user._id });

    let savedReview;
    if (existingReview) {
      // Update existing review
      existingReview.rating = numRating;
      existingReview.title = title.trim();
      existingReview.reviewText = reviewText.trim();
      existingReview.visitDate = visitDate || existingReview.visitDate;
      existingReview.recommendationStatus = recStatus;
      if (imageUrls.length > 0) {
        existingReview.images = [...existingReview.images, ...imageUrls];
      }
      existingReview.updatedAt = new Date();
      existingReview.userName = req.user.name;
      existingReview.userProfilePicture = req.user.profilePicture;
      savedReview = await existingReview.save();
    } else {
      // Create new review
      savedReview = await Review.create({
        placeId,
        userId: req.user._id,
        userName: req.user.name,
        userProfilePicture: req.user.profilePicture,
        rating: numRating,
        title: title.trim(),
        reviewText: reviewText.trim(),
        visitDate: visitDate || '',
        recommendationStatus: recStatus,
        images: imageUrls
      });
    }

    // Sync recommendation record
    if (recStatus === 'Recommended') {
      await Recommendation.findOneAndUpdate(
        { placeId, userId: req.user._id },
        { placeId, userId: req.user._id, createdAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      await Recommendation.findOneAndDelete({ placeId, userId: req.user._id });
    }

    // Sync attraction stats
    const stats = await syncAttractionStats(placeId);

    res.status(existingReview ? 200 : 201).json({
      success: true,
      message: existingReview
        ? 'Your existing review has been updated successfully.'
        : 'Thank you! Your review and rating have been posted.',
      data: savedReview,
      stats
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// PUT /api/reviews/:reviewId - Edit own review
router.put('/reviews/:reviewId', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, reviewText, visitDate, recommendationStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Authorization: User must be author or admin
    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'You are not authorized to edit this review.' });
    }

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (numRating >= 1 && numRating <= 5) review.rating = numRating;
    }
    if (title) review.title = title.trim();
    if (reviewText) review.reviewText = reviewText.trim();
    if (visitDate !== undefined) review.visitDate = visitDate;
    if (recommendationStatus) {
      review.recommendationStatus = recommendationStatus;
      if (recommendationStatus === 'Recommended') {
        await Recommendation.findOneAndUpdate(
          { placeId: review.placeId, userId: review.userId },
          { placeId: review.placeId, userId: review.userId, createdAt: new Date() },
          { upsert: true }
        );
      } else {
        await Recommendation.findOneAndDelete({ placeId: review.placeId, userId: review.userId });
      }
    }

    review.updatedAt = new Date();
    const updated = await review.save();

    await syncAttractionStats(review.placeId);

    res.json({
      success: true,
      message: 'Review updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('PUT review error:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:reviewId - Delete review
router.delete('/reviews/:reviewId', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this review.' });
    }

    const placeId = review.placeId;
    await Review.findByIdAndDelete(reviewId);

    // Sync attraction stats
    const stats = await syncAttractionStats(placeId);

    res.json({
      success: true,
      message: 'Review deleted successfully.',
      stats
    });
  } catch (error) {
    console.error('DELETE review error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

// POST /api/reviews/:reviewId/report - Report review
router.post('/reviews/:reviewId/report', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    review.isReported = true;
    review.reportReason = reason || 'Flagged for moderation by user.';
    await review.save();

    res.json({
      success: true,
      message: 'Thank you for reporting. Our moderation team will review this content.'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ success: false, error: 'Failed to report review' });
  }
});

// GET /api/reviews/reported - List reported reviews (Admin only)
router.get('/reviews/reported', authenticateAdmin, async (req, res) => {
  try {
    const reported = await Review.find({ isReported: true })
      .populate('placeId', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: reported.length, data: reported });
  } catch (error) {
    console.error('GET reported reviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reported reviews' });
  }
});

// PATCH /api/reviews/:reviewId/moderate - Moderate review (Admin only)
router.patch('/reviews/:reviewId/moderate', authenticateAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, dismissReport } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (status && ['active', 'hidden'].includes(status)) {
      review.status = status;
    }
    if (dismissReport) {
      review.isReported = false;
      review.reportReason = '';
    }

    await review.save();
    await syncAttractionStats(review.placeId);

    res.json({
      success: true,
      message: `Review updated to ${review.status}.`,
      data: review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ success: false, error: 'Moderation failed' });
  }
});

module.exports = {
  router,
  syncAttractionStats
};
