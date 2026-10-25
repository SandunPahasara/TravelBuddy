const express = require('express');
const router = express.Router();
const Attraction = require('../models/Attraction');
const Review = require('../models/Review');
const Recommendation = require('../models/Recommendation');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/attractions/featured-sections - Aggregated sections for Homepage
router.get('/featured-sections', async (req, res) => {
  try {
    const all = await Attraction.find();

    // Top rated (places with reviews, sorted by avgRating descending)
    const topRated = [...all]
      .filter(a => a.reviewCount > 0 || a.avgRating > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
      .slice(0, 6);

    // Most recommended
    const mostRecommended = [...all]
      .sort((a, b) => b.recommendationCount - a.recommendationCount || b.avgRating - a.avgRating)
      .slice(0, 6);

    // Most reviewed
    const mostReviewed = [...all]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 6);

    // Recently reviewed places
    const recentReviews = await Review.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('placeId', 'name category distanceKm images avgRating reviewCount recommendationPercentage');

    const uniqueRecentMap = new Map();
    recentReviews.forEach(r => {
      if (r.placeId && !uniqueRecentMap.has(r.placeId._id.toString())) {
        uniqueRecentMap.set(r.placeId._id.toString(), {
          ...r.placeId.toObject(),
          latestReview: {
            title: r.title,
            rating: r.rating,
            userName: r.userName,
            createdAt: r.createdAt
          }
        });
      }
    });
    const recentlyReviewed = Array.from(uniqueRecentMap.values()).slice(0, 4);

    res.json({
      success: true,
      data: {
        topRated: topRated.length > 0 ? topRated : all.slice(0, 4),
        mostRecommended: mostRecommended.length > 0 ? mostRecommended : all.slice(0, 4),
        mostReviewed: mostReviewed.length > 0 ? mostReviewed : all.slice(0, 4),
        recentlyReviewed: recentlyReviewed.length > 0 ? recentlyReviewed : all.slice(0, 4)
      }
    });
  } catch (error) {
    console.error('GET featured-sections error:', error);
    res.status(500).json({ success: false, error: 'Failed to load featured sections' });
  }
});

// GET /api/attractions - List & filter attractions from MongoDB
router.get('/', async (req, res) => {
  try {
    const { category, maxDistance, minRating, search, sortBy } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (maxDistance && !isNaN(parseFloat(maxDistance))) {
      query.distanceKm = { $lte: parseFloat(maxDistance) };
    }

    if (minRating && !isNaN(parseFloat(minRating))) {
      query.avgRating = { $gte: parseFloat(minRating) };
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'rating') sortOptions = { avgRating: -1, reviewCount: -1 };
    if (sortBy === 'recommended') sortOptions = { recommendationCount: -1 };
    if (sortBy === 'reviews') sortOptions = { reviewCount: -1 };
    if (sortBy === 'distance') sortOptions = { distanceKm: 1 };
    if (sortBy === 'name') sortOptions = { name: 1 };

    const list = await Attraction.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('GET /api/attractions error:', error.message);
    res.status(500).json({ error: 'Failed to fetch attractions' });
  }
});

// GET /api/attractions/:id - Get single attraction from MongoDB
router.get('/:id', async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    if (!attraction) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    // Related attractions in same category or nearby
    const related = await Attraction.find({
      _id: { $ne: attraction._id },
      $or: [
        { category: attraction.category },
        { distanceKm: { $lte: attraction.distanceKm + 5 } }
      ]
    }).limit(3);

    res.json({
      success: true,
      data: attraction,
      related
    });
  } catch (error) {
    console.error('GET /api/attractions/:id error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/attractions - Add new attraction to MongoDB (Admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, category, shortDescription, description } = req.body;

    if (!name || !category || !shortDescription || !description) {
      return res.status(400).json({ error: 'Please enter all required fields (Name, Category, Descriptions).' });
    }

    const payload = {
      ...req.body,
      distanceKm: Number(req.body.distanceKm) || 5.0,
      latitude: Number(req.body.latitude) || 6.6991,
      longitude: Number(req.body.longitude) || 79.9304,
      visitDurationMinutes: Number(req.body.visitDurationMinutes) || 60,
      facilities: Array.isArray(req.body.facilities)
        ? req.body.facilities
        : (req.body.facilities ? req.body.facilities.split(',').map(s => s.trim()) : []),
      images: Array.isArray(req.body.images)
        ? req.body.images.filter(u => typeof u === 'string' && u.trim().length > 0)
        : (req.body.images && req.body.images.trim() ? [req.body.images.trim()] : [])
    };

    const created = await Attraction.create(payload);

    res.status(201).json({
      success: true,
      message: 'Attraction added successfully.',
      data: created
    });
  } catch (error) {
    console.error('POST /api/attractions error:', error.message);
    res.status(500).json({ error: 'Failed to add attraction' });
  }
});

// PUT /api/attractions/:id - Update attraction in MongoDB (Admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      distanceKm: req.body.distanceKm !== undefined ? Number(req.body.distanceKm) : undefined,
      latitude: req.body.latitude !== undefined ? Number(req.body.latitude) : undefined,
      longitude: req.body.longitude !== undefined ? Number(req.body.longitude) : undefined,
      visitDurationMinutes: req.body.visitDurationMinutes !== undefined ? Number(req.body.visitDurationMinutes) : undefined,
      facilities: Array.isArray(req.body.facilities)
        ? req.body.facilities
        : (typeof req.body.facilities === 'string' ? req.body.facilities.split(',').map(s => s.trim()) : undefined),
      images: Array.isArray(req.body.images)
        ? req.body.images.filter(u => typeof u === 'string' && u.trim().length > 0)
        : (req.body.images && req.body.images.trim() ? [req.body.images.trim()] : undefined)
    };

    // Remove undefined keys so they don't overwrite existing DB values
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const updated = await Attraction.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    res.json({
      success: true,
      message: 'Attraction updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('PUT /api/attractions/:id error:', error.message);
    res.status(500).json({ error: 'Failed to update attraction' });
  }
});

// DELETE /api/attractions/:id - Delete attraction from MongoDB (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Attraction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Attraction not found' });
    }
    res.json({
      success: true,
      message: 'Attraction deleted successfully.'
    });
  } catch (error) {
    console.error('DELETE /api/attractions/:id error:', error.message);
    res.status(500).json({ error: 'Failed to delete attraction' });
  }
});

module.exports = router;
