const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const attractionRoutes = require('./routes/attractions');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const plannerRoutes = require('./routes/planner');
const { router: reviewRoutes } = require('./routes/reviews');
const feedbackRoutes = require('./routes/feedback');
const recommendationRoutes = require('./routes/recommendations');
const imageRoutes = require('./routes/images');
const videoRoutes = require('./routes/videos');

app.use('/api/attractions', attractionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api', reviewRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', imageRoutes);
app.use('/api', videoRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'online',
    system: 'Local Tourist Day-Visit Planner API',
    location: 'Panadura, Sri Lanka',
    database: dbStatus
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelbuddy';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('====================================================');
    console.log(' ✅ MongoDB Connected Successfully!');
    console.log(`    Database: travelbuddy`);
    console.log('====================================================');
  })
  .catch((err) => {
    console.error('====================================================');
    console.error(' ❌ MongoDB Connection FAILED!');
    console.error(`    Error: ${err.message}`);
    console.error('    Check your MONGO_URI in the .env file');
    console.error('====================================================');
  });

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` TravelBuddy Backend API running on port ${PORT}`);
  console.log(` Panadura Local Area Day-Visit Planner Active`);
  console.log(`====================================================`);
});
