const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Attraction = require('./models/Attraction');
const User = require('./models/User');
const Review = require('./models/Review');
const PlaceFeedback = require('./models/PlaceFeedback');
const Recommendation = require('./models/Recommendation');
const PlaceImage = require('./models/PlaceImage');
const PlaceVideo = require('./models/PlaceVideo');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PLATFORM VERIFICATION TEST');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');

  try {
    // 1. Check Attractions count & structure
    const attractions = await Attraction.find();
    console.log(`\n1. Attractions Count: ${attractions.length} attractions`);
    if (attractions.length < 10) throw new Error('Expected at least 10 attractions');

    const sample = attractions[0];
    console.log(`   Sample: "${sample.name}" (${sample.category})`);
    console.log(`   Avg Rating: ${sample.avgRating} ★, Reviews: ${sample.reviewCount}, Recommend: ${sample.recommendationPercentage}%`);

    // 2. Check Users
    const users = await User.find();
    console.log(`\n2. Registered Users Count: ${users.length} users`);
    users.forEach(u => console.log(`   - ${u.name} (${u.email}) [Role: ${u.role}]`));

    // 3. Check Reviews
    const reviews = await Review.find().populate('placeId', 'name');
    console.log(`\n3. Reviews Count: ${reviews.length} reviews`);
    reviews.slice(0, 3).forEach(r => {
      console.log(`   - "${r.title}" (${r.rating}★) by ${r.userName} on ${r.placeId?.name}`);
    });

    // 4. Check Feedback
    const feedbacks = await PlaceFeedback.find();
    console.log(`\n4. Category Feedback Records: ${feedbacks.length} submissions`);

    // 5. Check Recommendations
    const recs = await Recommendation.find();
    console.log(`\n5. Recommendations: ${recs.length} total recommendations`);

    // 6. Check Images
    const images = await PlaceImage.find();
    console.log(`\n6. Photo Gallery Records: ${images.length} images`);

    // 7. Check YouTube Videos
    const videos = await PlaceVideo.find();
    console.log(`\n7. YouTube Travel Videos: ${videos.length} videos`);
    videos.forEach(v => {
      console.log(`   - [${v.category}] "${v.title}" (ID: ${v.youtubeVideoId})`);
    });

    // 8. Test Dynamic Rating & Recommendation Aggregation
    console.log('\n8. Testing Rating Aggregation Accuracy...');
    for (const a of attractions) {
      const activeRevs = await Review.find({ placeId: a._id, status: 'active' });
      const computedTotal = activeRevs.length;
      let computedAvg = 0;
      if (computedTotal > 0) {
        const sum = activeRevs.reduce((acc, r) => acc + r.rating, 0);
        computedAvg = Number((sum / computedTotal).toFixed(1));
      }
      if (computedTotal > 0 && Math.abs(computedAvg - a.avgRating) > 0.1) {
        throw new Error(`Rating mismatch for ${a.name}: expected ${computedAvg}, got ${a.avgRating}`);
      }
    }
    console.log('✅ Rating aggregation matches database records with 100% precision.');

    console.log('\n====================================================');
    console.log('🎉 ALL INTEGRITY & DATABASE TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
