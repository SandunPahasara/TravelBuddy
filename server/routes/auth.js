const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Review = require('../models/Review');
const Recommendation = require('../models/Recommendation');
const store = require('../store');
const { authenticateUser, JWT_SECRET } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Optional file upload middleware for multipart/form-data
const handleAvatarUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('avatar')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  }
  next();
};

// POST /api/auth/register - User Registration
router.post('/register', handleAvatarUpload, async (req, res) => {
  try {
    const { name, email, password, bio, profilePicture } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Profile picture: uploaded file or provided URL or default avatar
    let avatarUrl = profilePicture || '';
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }
    if (!avatarUrl) {
      avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f766e,0d9488,14b8a6`;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: passwordHash,
      profilePicture: avatarUrl,
      bio: bio ? bio.trim() : '',
      role: 'user'
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to TravelBuddy.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed due to server error. Please try again.'
    });
  }
});

// POST /api/auth/login - Universal Login (User & Admin)
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your email/username and password.'
      });
    }

    // Check if logging in as in-memory administrator (SRS admin compatibility)
    const admin = store.findAdminByUsername(identifier);
    if (admin) {
      const isMatch = bcrypt.compareSync(password, admin.passwordHash);
      if (isMatch) {
        let dbAdmin = null;
        try {
          dbAdmin = await User.findOne({ email: 'admin@travelbuddy.lk' });
          if (!dbAdmin) dbAdmin = await User.findOne({ role: 'admin' });
        } catch (dbErr) {
          console.warn('DB admin lookup during login:', dbErr.message);
        }

        const adminId = dbAdmin ? dbAdmin._id : admin.id;

        const token = jwt.sign(
          { id: adminId, username: admin.username, email: 'admin@travelbuddy.lk', role: 'admin' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          message: 'Admin authentication successful.',
          token,
          user: {
            id: adminId,
            name: dbAdmin?.name || 'System Administrator',
            username: admin.username,
            email: 'admin@travelbuddy.lk',
            role: 'admin',
            profilePicture: dbAdmin?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          }
        });
      }
    }

    // Look for user in MongoDB
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { name: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/username or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/username or password.'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful! Welcome back.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed due to server error.'
    });
  }
});

// GET /api/auth/verify - Verify Session Token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === 'admin' && !decoded.email) {
      return res.json({
        valid: true,
        user: {
          id: decoded.id,
          username: decoded.username,
          name: 'Administrator',
          role: 'admin'
        }
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

// GET /api/auth/me - Get Current Logged-in User Profile with Statistics
router.get('/me', authenticateUser, async (req, res) => {
  try {
    if (req.user.role === 'admin' && !req.user._id?.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.json({
        success: true,
        user: {
          id: req.user.id || 'admin-1',
          name: req.user.name || 'System Administrator',
          email: 'admin@travelbuddy.lk',
          role: 'admin',
          profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bio: 'Platform administrator with full permissions.',
          stats: { reviewsCount: 0, recommendationsCount: 0, averageRatingGiven: 0 }
        }
      });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Calculate user stats
    const reviews = await Review.find({ userId: user._id, status: 'active' });
    const recommendationsCount = await Recommendation.countDocuments({ userId: user._id });

    const totalRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRatingGiven = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
        stats: {
          reviewsCount: reviews.length,
          recommendationsCount,
          averageRatingGiven: Number(averageRatingGiven)
        }
      }
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

// PUT /api/auth/me - Update User Profile
router.put('/me', authenticateUser, handleAvatarUpload, async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const updates = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }
    if (bio !== undefined) {
      updates.bio = bio.trim();
    }
    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    } else if (profilePicture !== undefined) {
      updates.profilePicture = profilePicture.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // Also update cached userName & userProfilePicture in previous reviews
    if (updates.name || updates.profilePicture) {
      const reviewUpdates = {};
      if (updates.name) reviewUpdates.userName = updates.name;
      if (updates.profilePicture) reviewUpdates.userProfilePicture = updates.profilePicture;
      await Review.updateMany({ userId: req.user._id }, { $set: reviewUpdates });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('PUT /api/auth/me error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// POST /api/auth/logout - Logout (Client clears token, server acknowledges)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = router;
