// One-time database seeder script
// Run with: node data/seedDB.js

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Attraction = require('../models/Attraction');
const initialAttractions = require('./attractionsSeed');

async function seedDatabase() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelbuddy';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove old data
    const deleted = await Attraction.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing attractions`);

    // Strip the manual 'id' field (MongoDB uses _id)
    const cleaned = initialAttractions.map(({ id, ...rest }) => rest);

    // Insert seed data
    const inserted = await Attraction.insertMany(cleaned);
    console.log(`✅ Seeded ${inserted.length} attractions into MongoDB!`);

    inserted.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.name} (${item.category}) — ${item.distanceKm} km`);
    });

    console.log('\n🎉 Database seeded successfully! You can now start the server.');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();
