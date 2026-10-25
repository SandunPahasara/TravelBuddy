const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PlaceImage = require('../models/PlaceImage');
const Attraction = require('../models/Attraction');
const { authenticateUser, optionalAuth, authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/places/:placeId/images - Get gallery photographs for a place
router.get('/places/:placeId/images', async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    const dbImages = await PlaceImage.find({ placeId }).sort({ createdAt: -1 });

    // Also include any valid images from attraction.images that aren't already in dbImages
    const combined = [...dbImages.map(img => ({
      _id: img._id,
      imageUrl: img.imageUrl,
      caption: img.caption || attraction.name,
      altText: img.altText || `${attraction.name} scenic photo`,
      uploaderType: img.uploaderType,
      createdAt: img.createdAt
    }))];

    // Filter attraction images to only non-empty strings
    const validAttractionImages = (attraction.images || []).filter(u => typeof u === 'string' && u.trim().length > 0);

    validAttractionImages.forEach((url, i) => {
      const cleanUrl = url.trim();
      const exists = combined.some(item => item.imageUrl === cleanUrl);
      if (!exists) {
        combined.push({
          _id: `attraction-img-${i}`,
          imageUrl: cleanUrl,
          caption: `${attraction.name} - View ${i + 1}`,
          altText: `${attraction.name} photograph`,
          uploaderType: 'admin',
          createdAt: attraction.createdAt
        });
      }
    });

    res.json({
      success: true,
      count: combined.length,
      coverImage: validAttractionImages[0] || '',
      images: validAttractionImages,
      data: combined
    });
  } catch (error) {
    console.error('GET images error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch images' });
  }
});

// Multi-file upload middleware for images
const handleImageUploads = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.fields([
      { name: 'images', maxCount: 20 },
      { name: 'image', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  }
  next();
};

// POST /api/places/:placeId/images - Add single or multiple photographs (Admin or User)
router.post('/places/:placeId/images', authenticateUser, handleImageUploads, async (req, res) => {
  try {
    const { placeId } = req.params;
    const { imageUrl, imageUrls, caption, altText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    const urlsToAdd = [];

    // 1. Files uploaded via multipart
    if (req.files) {
      if (req.files['images'] && req.files['images'].length > 0) {
        req.files['images'].forEach(f => urlsToAdd.push(`/uploads/${f.filename}`));
      }
      if (req.files['image'] && req.files['image'].length > 0) {
        req.files['image'].forEach(f => urlsToAdd.push(`/uploads/${f.filename}`));
      }
    }

    // 2. URLs provided in request body
    if (imageUrls) {
      if (Array.isArray(imageUrls)) {
        imageUrls.forEach(u => typeof u === 'string' && u.trim() && urlsToAdd.push(u.trim()));
      } else if (typeof imageUrls === 'string') {
        try {
          const parsed = JSON.parse(imageUrls);
          if (Array.isArray(parsed)) {
            parsed.forEach(u => typeof u === 'string' && u.trim() && urlsToAdd.push(u.trim()));
          } else {
            imageUrls.split(/[\n,]/).map(s => s.trim()).filter(Boolean).forEach(u => urlsToAdd.push(u));
          }
        } catch {
          imageUrls.split(/[\n,]/).map(s => s.trim()).filter(Boolean).forEach(u => urlsToAdd.push(u));
        }
      }
    }

    if (imageUrl && typeof imageUrl === 'string') {
      imageUrl.split(/[\n,]/).map(s => s.trim()).filter(Boolean).forEach(u => {
        if (!urlsToAdd.includes(u)) urlsToAdd.push(u);
      });
    }

    if (urlsToAdd.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload image files or provide at least one valid image URL.'
      });
    }

    const uploaderType = req.user.role === 'admin' ? 'admin' : 'user';
    const createdDocuments = [];

    // Ensure valid ObjectId for userId or null
    const validUserId = (req.user && req.user._id && mongoose.Types.ObjectId.isValid(req.user._id))
      ? req.user._id
      : null;

    for (let i = 0; i < urlsToAdd.length; i++) {
      const imgUrl = urlsToAdd[i];
      const customCaption = caption
        ? (urlsToAdd.length > 1 ? `${caption.trim()} (${i + 1})` : caption.trim())
        : `${attraction.name} view ${attraction.images.length + i + 1}`;

      const newImage = await PlaceImage.create({
        placeId,
        userId: validUserId,
        imageUrl: imgUrl,
        caption: customCaption,
        altText: altText ? altText.trim() : `${attraction.name} tourist photograph`,
        uploaderType
      });

      createdDocuments.push(newImage);

      // Keep attraction.images array in sync
      if (!attraction.images.includes(imgUrl)) {
        attraction.images.push(imgUrl);
      }
    }

    await attraction.save();

    res.status(201).json({
      success: true,
      count: createdDocuments.length,
      message: `Successfully added ${createdDocuments.length} photograph${createdDocuments.length > 1 ? 's' : ''} to destination gallery.`,
      data: createdDocuments
    });
  } catch (error) {
    console.error('POST images error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to add images' });
  }
});

// DELETE /api/places/:placeId/images/:imageId - Delete photograph (Admin or Owner)
router.delete('/places/:placeId/images/:imageId', authenticateUser, async (req, res) => {
  try {
    const { placeId, imageId } = req.params;
    const { imageUrl } = req.body || {};

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    // Case 1: imageId is a PlaceImage document in MongoDB
    if (mongoose.Types.ObjectId.isValid(imageId)) {
      const image = await PlaceImage.findById(imageId);
      if (image) {
        const isOwner = Boolean(image.userId && req.user && req.user._id && image.userId.toString() === req.user._id.toString());
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ success: false, error: 'Unauthorized to delete this photograph' });
        }

        await PlaceImage.findByIdAndDelete(imageId);

        // Also remove from attraction.images
        attraction.images = (attraction.images || []).filter(u => u !== image.imageUrl);
        await attraction.save();

        return res.json({
          success: true,
          message: 'Photograph removed from gallery successfully.'
        });
      }
    }

    // Case 2: imageId is a direct attraction-img-index, or an imageUrl is provided, or admin wants to purge
    if (isAdmin) {
      let targetUrl = imageUrl;
      if (!targetUrl && imageId.startsWith('attraction-img-')) {
        const idx = parseInt(imageId.replace('attraction-img-', ''), 10);
        if (!isNaN(idx) && attraction.images && attraction.images[idx] !== undefined) {
          targetUrl = attraction.images[idx];
        }
      }

      if (targetUrl) {
        attraction.images = (attraction.images || []).filter(u => u !== targetUrl);
      } else {
        // Fallback: purge empty strings and whitespace
        attraction.images = (attraction.images || []).filter(u => u && u.trim().length > 0);
      }

      await attraction.save();

      return res.json({
        success: true,
        message: 'Photograph removed from destination successfully.'
      });
    }

    return res.status(400).json({ success: false, error: 'Unable to delete photograph: invalid ID or insufficient permissions.' });
  } catch (error) {
    console.error('DELETE image error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete photograph' });
  }
});

// PATCH /api/places/:placeId/cover-image - Set specific photo as the primary cover image (Admin only)
const handleSetCover = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { imageUrl, imageId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, error: 'Invalid place ID' });
    }

    const attraction = await Attraction.findById(placeId);
    if (!attraction) {
      return res.status(404).json({ success: false, error: 'Attraction not found' });
    }

    let targetImageUrl = imageUrl;

    // If imageId provided, lookup from PlaceImage
    if (!targetImageUrl && imageId && mongoose.Types.ObjectId.isValid(imageId)) {
      const placeImg = await PlaceImage.findById(imageId);
      if (placeImg) targetImageUrl = placeImg.imageUrl;
    }

    if (!targetImageUrl || typeof targetImageUrl !== 'string' || !targetImageUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide the image URL or ID to set as cover.'
      });
    }

    const cleanUrl = targetImageUrl.trim();

    // Reorder attraction.images array: target cleanUrl becomes index 0
    const filtered = (attraction.images || []).filter(img => img !== cleanUrl);
    attraction.images = [cleanUrl, ...filtered];

    await attraction.save();

    res.json({
      success: true,
      message: `"${attraction.name}" cover image updated successfully!`,
      coverImage: cleanUrl,
      images: attraction.images,
      data: attraction
    });
  } catch (error) {
    console.error('PATCH cover-image error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update cover image' });
  }
};

router.patch('/places/:placeId/cover-image', authenticateAdmin, handleSetCover);
router.put('/places/:placeId/cover-image', authenticateAdmin, handleSetCover);

module.exports = router;
