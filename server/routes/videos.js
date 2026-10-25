const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PlaceVideo = require('../models/PlaceVideo');
const Attraction = require('../models/Attraction');
const { authenticateAdmin } = require('../middleware/auth');
const { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } = require('../utils/youtube');

// GET /api/places/:placeId/videos - Get YouTube videos for a place
router.get('/places/:placeId/videos', async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const videos = await PlaceVideo.find({ placeId }).sort({ createdAt: -1 });

    const formatted = videos.map(v => ({
      _id: v._id,
      placeId: v.placeId,
      youtubeVideoId: v.youtubeVideoId,
      videoUrl: v.videoUrl,
      embedUrl: getYouTubeEmbedUrl(v.youtubeVideoId),
      thumbnailUrl: getYouTubeThumbnail(v.youtubeVideoId),
      title: v.title,
      channelName: v.channelName,
      category: v.category,
      description: v.description,
      createdAt: v.createdAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('GET videos error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch videos' });
  }
});

// GET /api/videos/featured - Get featured videos across attractions for homepage
router.get('/videos/featured', async (req, res) => {
  try {
    const videos = await PlaceVideo.find()
      .populate('placeId', 'name category')
      .limit(6)
      .sort({ createdAt: -1 });

    const formatted = videos.map(v => ({
      _id: v._id,
      place: v.placeId,
      youtubeVideoId: v.youtubeVideoId,
      videoUrl: v.videoUrl,
      embedUrl: getYouTubeEmbedUrl(v.youtubeVideoId),
      thumbnailUrl: getYouTubeThumbnail(v.youtubeVideoId),
      title: v.title,
      channelName: v.channelName,
      category: v.category,
      description: v.description
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('GET featured videos error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured videos' });
  }
});

// POST /api/places/:placeId/videos - Add YouTube video (Admin only)
router.post('/places/:placeId/videos', authenticateAdmin, async (req, res) => {
  try {
    const { placeId } = req.params;
    const { url, youtubeVideoId, title, channelName, category, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    const inputUrlOrId = url || youtubeVideoId;
    const extractedId = extractYouTubeId(inputUrlOrId);

    if (!extractedId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL or Video ID. Please provide a valid YouTube link (e.g., https://www.youtube.com/watch?v=...) or an 11-character video ID.'
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Video title is required.'
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${extractedId}`;

    const newVideo = await PlaceVideo.create({
      placeId,
      youtubeVideoId: extractedId,
      videoUrl,
      title: title.trim(),
      channelName: channelName ? channelName.trim() : 'Travel Channel',
      category: category || 'Travel Vlog',
      description: description ? description.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'YouTube video added to destination successfully.',
      data: {
        ...newVideo.toObject(),
        embedUrl: getYouTubeEmbedUrl(extractedId),
        thumbnailUrl: getYouTubeThumbnail(extractedId)
      }
    });
  } catch (error) {
    console.error('POST video error:', error);
    res.status(500).json({ success: false, error: 'Failed to add video' });
  }
});

// PUT /api/places/:placeId/videos/:videoId - Edit YouTube video (Admin only)
router.put('/places/:placeId/videos/:videoId', authenticateAdmin, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { url, youtubeVideoId, title, channelName, category, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ success: false, error: 'Invalid video ID' });
    }

    const video = await PlaceVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const inputUrlOrId = url || youtubeVideoId;
    if (inputUrlOrId) {
      const extractedId = extractYouTubeId(inputUrlOrId);
      if (!extractedId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid YouTube URL or Video ID. Please provide a valid YouTube link.'
        });
      }
      video.youtubeVideoId = extractedId;
      video.videoUrl = `https://www.youtube.com/watch?v=${extractedId}`;
    }

    if (title && title.trim()) video.title = title.trim();
    if (channelName !== undefined) video.channelName = channelName.trim() || 'Travel Channel';
    if (category) video.category = category;
    if (description !== undefined) video.description = description.trim();

    const updated = await video.save();

    res.json({
      success: true,
      message: 'YouTube video updated successfully.',
      data: {
        ...updated.toObject(),
        embedUrl: getYouTubeEmbedUrl(updated.youtubeVideoId),
        thumbnailUrl: getYouTubeThumbnail(updated.youtubeVideoId)
      }
    });
  } catch (error) {
    console.error('PUT video error:', error);
    res.status(500).json({ success: false, error: 'Failed to update video' });
  }
});

// DELETE /api/places/:placeId/videos/:videoId - Delete YouTube video (Admin only)
router.delete('/places/:placeId/videos/:videoId', authenticateAdmin, async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ success: false, error: 'Invalid video ID' });
    }

    const deleted = await PlaceVideo.findByIdAndDelete(videoId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    res.json({
      success: true,
      message: 'YouTube video removed successfully.'
    });
  } catch (error) {
    console.error('DELETE video error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete video' });
  }
});

module.exports = router;
