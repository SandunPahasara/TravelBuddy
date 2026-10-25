/**
 * Comprehensive Database Seeder for Enhanced TravelBuddy System.
 * Run with: node data/seedEnhancedDB.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Attraction = require('../models/Attraction');
const User = require('../models/User');
const Review = require('../models/Review');
const PlaceFeedback = require('../models/PlaceFeedback');
const Recommendation = require('../models/Recommendation');
const PlaceImage = require('../models/PlaceImage');
const PlaceVideo = require('../models/PlaceVideo');
const initialAttractions = require('./attractionsSeed');
const { syncAttractionStats } = require('../routes/reviews');

async function seedEnhancedDatabase() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelbuddy';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // ── 1. Seed Registered Users ──────────────────────────────────────────
    console.log('\n--- Seeding Users ---');
    const passwordHash = await bcrypt.hash('Travel123!', 10);
    const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpassword', 10);

    const usersData = [
      {
        name: 'System Administrator',
        email: 'admin@travelbuddy.lk',
        password: adminPasswordHash,
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Senior administrator and curator of Panadura tourist destinations.',
        role: 'admin'
      },
      {
        name: 'Sarah Silva',
        email: 'sarah.silva@example.com',
        password: passwordHash,
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        bio: 'Travel blogger, beach sunset chaser, and local food enthusiast exploring the Western Province.',
        role: 'user'
      },
      {
        name: 'John Walker',
        email: 'john.walker@example.com',
        password: passwordHash,
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Visiting Sri Lanka from Australia. Passionate about cultural heritage, photography, and wildlife.',
        role: 'user'
      },
      {
        name: 'Kasun Perera',
        email: 'kasun.perera@example.com',
        password: passwordHash,
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        bio: 'Local resident of Panadura. Love cycling around Bolgoda Lake and documenting historic temples.',
        role: 'user'
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        password: passwordHash,
        profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        bio: 'Nature photographer and bird watcher spending winter along the Sri Lankan coastline.',
        role: 'user'
      }
    ];

    const seededUsers = [];
    for (const u of usersData) {
      const user = await User.findOneAndUpdate(
        { email: u.email },
        { $set: u },
        { upsert: true, new: true }
      );
      seededUsers.push(user);
    }
    console.log(`✅ Seeded ${seededUsers.length} users (Admin & Visitors)`);

    const sarah = seededUsers.find(u => u.email === 'sarah.silva@example.com');
    const john = seededUsers.find(u => u.email === 'john.walker@example.com');
    const kasun = seededUsers.find(u => u.email === 'kasun.perera@example.com');
    const elena = seededUsers.find(u => u.email === 'elena.rostova@example.com');
    const adminUser = seededUsers.find(u => u.role === 'admin');

    // ── 2. Ensure Attractions Exist ───────────────────────────────────────
    console.log('\n--- Checking Attractions ---');
    let attractions = await Attraction.find();
    if (attractions.length === 0) {
      console.log('Seeding initial 10 attractions...');
      const cleaned = initialAttractions.map(({ id, ...rest }) => rest);
      attractions = await Attraction.insertMany(cleaned);
      console.log(`✅ Seeded ${attractions.length} attractions.`);
    } else {
      console.log(`Found ${attractions.length} existing attractions.`);
    }

    // Map attractions by name for easy reference
    const attractionMap = {};
    attractions.forEach(a => {
      attractionMap[a.name] = a;
    });

    // ── 3. Clear Existing Related Data to Re-Seed Cleanly ─────────────────
    console.log('\n--- Refreshing Reviews, Feedback, Media & Recommendations ---');
    await Review.deleteMany({});
    await PlaceFeedback.deleteMany({});
    await Recommendation.deleteMany({});
    await PlaceImage.deleteMany({});
    await PlaceVideo.deleteMany({});

    // ── 4. Seed Photo Galleries (PlaceImage) ──────────────────────────────
    console.log('Seeding Place Photographs...');
    const imagesToSeed = [
      // Panadura Beach
      {
        placeName: 'Panadura Beach',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            caption: 'Golden sunset over the Indian Ocean at Panadura Beach',
            altText: 'Sunset at Panadura beach with waves crashing on golden sand'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
            caption: 'Coastal shoreline and palm-fringed coast of Panadura',
            altText: 'Palm trees along tropical beach coastline in Sri Lanka'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
            caption: 'Evening atmosphere and fishermen boats near the beach',
            altText: 'Sri Lankan traditional outrigger boats on the shore'
          }
        ]
      },
      // Rankoth Viharaya
      {
        placeName: 'Rankoth Viharaya - Panadura',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=1200&q=80',
            caption: 'Historic Rankoth Viharaya Sacred Stupa and temple grounds',
            altText: 'White Buddhist stupa under clear sky in Panadura'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?auto=format&fit=crop&w=1200&q=80',
            caption: 'Serene temple courtyard surrounded by sacred Bo trees',
            altText: 'Buddhist temple architectural details and oil lamps'
          }
        ]
      },
      // Richmond Castle
      {
        placeName: 'Richmond Castle - Kalutara',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
            caption: 'Majestic front facade of the Edwardian Richmond Castle mansion',
            altText: 'Historic colonial mansion surrounded by lush gardens'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            caption: 'Intricate teak wood carvings and historic interior halls',
            altText: 'Interior of colonial mansion with high ceilings'
          }
        ]
      },
      // Bolgoda Lake
      {
        placeName: 'Bolgoda Lake',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            caption: 'Scenic boat cruising through tranquil Bolgoda waterways',
            altText: 'Motorboat on wide freshwater lake at dawn'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
            caption: 'Mangrove islets and lush wildlife habitat of Bolgoda',
            altText: 'Mangrove green trees reflecting on calm lake water'
          }
        ]
      },
      // Kalutara Bodhiya
      {
        placeName: 'Kalutara Bodhiya',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1200&q=80',
            caption: 'The hollow Kalutara Chaitya overlooking the Kalu River',
            altText: 'White dome stupa of Kalutara Bodhiya beside river'
          }
        ]
      },
      // Air Force Museum
      {
        placeName: 'Sri Lanka Air Force Museum - Ratmalana',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea161b61?auto=format&fit=crop&w=1200&q=80',
            caption: 'Vintage fighter aircraft and helicopter exhibits at SLAF Museum',
            altText: 'Military airplane on display outdoors at aviation museum'
          }
        ]
      },
      // Dehiwala Zoo
      {
        placeName: 'Dehiwala Zoological Gardens',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
            caption: 'Majestic Asian elephants during feeding time at Dehiwala Zoo',
            altText: 'Elephant walking in greenery at zoological garden'
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
            caption: 'Big cats enclosure surrounded by lush botanical landscaping',
            altText: 'Lion resting in open zoo enclosure'
          }
        ]
      }
    ];

    for (const group of imagesToSeed) {
      const place = attractionMap[group.placeName];
      if (place) {
        for (const img of group.images) {
          await PlaceImage.create({
            placeId: place._id,
            userId: adminUser._id,
            imageUrl: img.imageUrl,
            caption: img.caption,
            altText: img.altText,
            uploaderType: 'admin'
          });
        }
      }
    }
    console.log('✅ Seeded Place Photographs');

    // ── 5. Seed Real YouTube Travel Videos ─────────────────────────────────
    console.log('Seeding YouTube Travel Videos...');
    const videosToSeed = [
      {
        placeName: 'Panadura Beach',
        videos: [
          {
            youtubeVideoId: 'WcniRGmNYCM',
            title: 'A Day at Panadura Beach: Hidden Gem of Sri Lanka',
            channelName: 'Ceylon Travel Diary',
            category: 'Travel Vlog',
            description: 'Join us as we explore the golden coastline, local street food vendors, and spectacular sunset at Panadura Beach.'
          },
          {
            youtubeVideoId: 'xl9SS3C-BEM',
            title: 'Panadura Beach Sri Lanka | A Day in Coastal Paradise',
            channelName: 'Island Explorer',
            category: 'Walking Tour',
            description: 'Relaxing 4K walking tour along Panadura Beach observing local fishing culture and the Indian Ocean coastline.'
          }
        ]
      },
      {
        placeName: 'Richmond Castle - Kalutara',
        videos: [
          {
            youtubeVideoId: 'E9_W2Qt85_0',
            title: 'Richmond Castle - Kalutara | Inside The Historic Mansion',
            channelName: 'Sri Lanka Heritage Trails',
            category: 'Historical Info',
            description: 'Step inside the magnificent 99-room Edwardian castle built in 1900, uncovering its architecture and rich history.'
          }
        ]
      },
      {
        placeName: 'Kalutara Bodhiya',
        videos: [
          {
            youtubeVideoId: 'GD6TLZbLF3o',
            title: 'Kalutara Bodhiya Full Tour & History',
            channelName: 'Sacred Ceylon',
            category: 'Tourist Review',
            description: 'A spiritual visit to one of Sri Lanka’s most venerated Buddhist shrines, featuring the world’s only hollow stupa.'
          }
        ]
      },
      {
        placeName: 'Bolgoda Lake',
        videos: [
          {
            youtubeVideoId: '7oagx77J6z8',
            title: 'Bolgoda Lake Boat Safari & Eco Tour',
            channelName: 'Wild Sri Lanka',
            category: 'Travel Guide',
            description: 'Explore the freshwater biodiversity, mangrove waterways, and bird sanctuaries across Bolgoda Lake on a motorboat safari.'
          }
        ]
      },
      {
        placeName: 'Sri Lanka Air Force Museum - Ratmalana',
        videos: [
          {
            youtubeVideoId: '05WZEUvgses',
            title: 'A Day at Ratmalana Air Force Museum Walkthrough',
            channelName: 'Aviation Lanka',
            category: 'Things to Do',
            description: 'Comprehensive guided walkthrough of vintage aircraft, fighter planes, radar rooms, and military aviation defense history.'
          }
        ]
      },
      {
        placeName: 'Dehiwala Zoological Gardens',
        videos: [
          {
            youtubeVideoId: 'lYfdW9X28nE',
            title: 'Sri Lanka Dehiwala Zoo Full Tour & Aquarium',
            channelName: 'Travel With Us',
            category: 'Travel Vlog',
            description: 'Full walking tour of the National Zoological Gardens in Dehiwala showing the elephant exhibits, marine life aquarium, and aviaries.'
          }
        ]
      }
    ];

    for (const group of videosToSeed) {
      const place = attractionMap[group.placeName];
      if (place) {
        for (const vid of group.videos) {
          await PlaceVideo.create({
            placeId: place._id,
            youtubeVideoId: vid.youtubeVideoId,
            videoUrl: `https://www.youtube.com/watch?v=${vid.youtubeVideoId}`,
            title: vid.title,
            channelName: vid.channelName,
            category: vid.category,
            description: vid.description
          });
        }
      }
    }
    console.log('✅ Seeded YouTube Travel Videos');

    // ── 6. Seed Realistic User Reviews & Recommendations ──────────────────
    console.log('Seeding Reviews & Recommendations...');
    const reviewsToSeed = [
      // Panadura Beach
      {
        placeName: 'Panadura Beach',
        user: sarah,
        rating: 5,
        title: 'Breathtaking tropical sunsets and vibrant evening vibe!',
        reviewText: 'Panadura Beach is our favorite weekend getaway. The ocean breeze is refreshing and watching the sun dip into the Indian Ocean while sipping fresh king coconut from local beachside stalls is pure bliss. Clean sandy shores and very safe for family strolls.',
        visitDate: 'October 2026',
        recommendationStatus: 'Recommended',
        images: [
          { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', caption: 'Sunset view from the beach benches' }
        ]
      },
      {
        placeName: 'Panadura Beach',
        user: john,
        rating: 4,
        title: 'Lovely beach for a long sunset walk',
        reviewText: 'Great place to unwind after visiting cultural spots during the day. Locals are welcoming and friendly. Waves can be strong during high tide so be mindful if swimming, but overall an authentic Sri Lankan coastal experience.',
        visitDate: 'September 2026',
        recommendationStatus: 'Recommended',
        images: []
      },
      {
        placeName: 'Panadura Beach',
        user: kasun,
        rating: 5,
        title: 'Proud of our hometown coastline!',
        reviewText: 'The municipal council has added convenient walking paths and parking. Perfect for evening jogging and casual street snack tasting. Highly recommended for any day itinerary passing through Panadura.',
        visitDate: 'October 2026',
        recommendationStatus: 'Recommended',
        images: []
      },

      // Rankoth Viharaya
      {
        placeName: 'Rankoth Viharaya - Panadura',
        user: john,
        rating: 5,
        title: 'Incredible spiritual serenity and rich Buddhist heritage',
        reviewText: 'A deeply peaceful sanctuary right in the middle of town. The towering white stupa is magnificent against the blue sky. Remember to dress modestly with shoulders and knees covered and remove your shoes before entering.',
        visitDate: 'October 2026',
        recommendationStatus: 'Recommended',
        images: []
      },
      {
        placeName: 'Rankoth Viharaya - Panadura',
        user: sarah,
        rating: 5,
        title: 'Calm and uplifting atmosphere',
        reviewText: 'I visited during the evening chanting ceremony. The temple flower vendors near the gate sell lovely jasmine and lotus blossoms. A must-visit landmark in Panadura.',
        visitDate: 'August 2026',
        recommendationStatus: 'Recommended',
        images: []
      },

      // Richmond Castle
      {
        placeName: 'Richmond Castle - Kalutara',
        user: john,
        rating: 5,
        title: 'Stunning architectural masterpiece with a fascinating past',
        reviewText: 'Richmond Castle exceeded all my expectations. The Italian marble statues, stained glass from Scotland, and Burmese teak woodwork are breathtaking. The local tour guide shared the poignant life story of Mudaliyar Don Arthur.',
        visitDate: 'September 2026',
        recommendationStatus: 'Recommended',
        images: [
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', caption: 'Richmond Castle main facade' }
        ]
      },
      {
        placeName: 'Richmond Castle - Kalutara',
        user: elena,
        rating: 4,
        title: 'Fabulous heritage site for photography lovers',
        reviewText: 'Loved photographing the symmetric corridors and historic gardens. Modest entrance fee which helps support the orphanage trust. Don’t miss the upstairs balcony view.',
        visitDate: 'October 2026',
        recommendationStatus: 'Recommended',
        images: []
      },

      // Bolgoda Lake
      {
        placeName: 'Bolgoda Lake',
        user: kasun,
        rating: 5,
        title: 'Best freshwater boat safari near Colombo and Panadura',
        reviewText: 'Bolgoda Lake is an eco-treasure. We chartered a private boat for 2 hours in the morning. Spotted kingfishers, purple herons, and water monitors swimming gracefully between mangrove roots. Refreshing drinks available at lakefront eco-resorts.',
        visitDate: 'October 2026',
        recommendationStatus: 'Recommended',
        images: [
          { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', caption: 'Morning mist on Bolgoda Lake' }
        ]
      },
      {
        placeName: 'Bolgoda Lake',
        user: elena,
        rating: 5,
        title: 'A paradise for bird watchers and wildlife photographers',
        reviewText: 'Over 40 bird species spotted in just a couple of hours. Very peaceful away from the coastal highway noise. Kayaking here is also great fun.',
        visitDate: 'September 2026',
        recommendationStatus: 'Recommended',
        images: []
      },

      // Kalutara Bodhiya
      {
        placeName: 'Kalutara Bodhiya',
        user: sarah,
        rating: 5,
        title: 'Iconic landmark with the world-famous hollow stupa',
        reviewText: 'Walking into the hollow stupa and gazing at the painted Buddhist murals on the dome is a memorable spiritual experience. Positioned right beside the scenic Kalu Ganga river.',
        visitDate: 'October 2026',
        recommendationStatus: 'Recommended',
        images: []
      },

      // SLAF Museum
      {
        placeName: 'Sri Lanka Air Force Museum - Ratmalana',
        user: john,
        rating: 4,
        title: 'Very engaging aviation history and military displays',
        reviewText: 'Fascinating collection of vintage fighter jets, helicopters, and radar equipment. Very well maintained and staff are informative. Great visit especially with kids or technology enthusiasts.',
        visitDate: 'August 2026',
        recommendationStatus: 'Recommended',
        images: []
      },

      // Dehiwala Zoo
      {
        placeName: 'Dehiwala Zoological Gardens',
        user: sarah,
        rating: 4,
        title: 'Huge variety of wildlife and great day trip',
        reviewText: 'One of the oldest zoos in Asia. The walk-through marine aquarium and butterfly gardens were highlights. Wear good walking shoes because the park grounds are quite extensive.',
        visitDate: 'July 2026',
        recommendationStatus: 'Recommended',
        images: []
      }
    ];

    for (const r of reviewsToSeed) {
      const place = attractionMap[r.placeName];
      if (place && r.user) {
        await Review.create({
          placeId: place._id,
          userId: r.user._id,
          userName: r.user.name,
          userProfilePicture: r.user.profilePicture,
          rating: r.rating,
          title: r.title,
          reviewText: r.reviewText,
          visitDate: r.visitDate,
          recommendationStatus: r.recommendationStatus,
          images: r.images || [],
          status: 'active'
        });

        // Add Recommendation record if recommended
        if (r.recommendationStatus === 'Recommended') {
          await Recommendation.create({
            placeId: place._id,
            userId: r.user._id
          });
        }
      }
    }
    console.log('✅ Seeded Reviews & Recommendations');

    // ── 7. Seed Place Feedback Across Categories ──────────────────────────
    console.log('Seeding Category-Based Visitor Feedback...');
    const feedbackData = [
      {
        placeName: 'Panadura Beach',
        user: sarah,
        cleanliness: 4,
        safety: 5,
        accessibility: 5,
        facilities: 4,
        parking: 4,
        familyFriendly: 5,
        comments: 'Very clean beach area, well-lit in the early evenings, and convenient parking along the promenade.'
      },
      {
        placeName: 'Panadura Beach',
        user: john,
        cleanliness: 4,
        safety: 4,
        accessibility: 5,
        facilities: 4,
        parking: 4,
        familyFriendly: 5,
        comments: 'Easy access from the main road. Great food stalls and benches.'
      },
      {
        placeName: 'Richmond Castle - Kalutara',
        user: john,
        cleanliness: 5,
        safety: 5,
        accessibility: 4,
        facilities: 4,
        parking: 5,
        familyFriendly: 5,
        comments: 'Immaculately maintained grounds. Plenty of secure shaded parking inside the gates.'
      },
      {
        placeName: 'Bolgoda Lake',
        user: kasun,
        cleanliness: 5,
        safety: 5,
        accessibility: 4,
        facilities: 5,
        parking: 4,
        familyFriendly: 5,
        comments: 'Eco-resorts around the lake provide clean restrooms and life jackets for boat tours.'
      },
      {
        placeName: 'Rankoth Viharaya - Panadura',
        user: sarah,
        cleanliness: 5,
        safety: 5,
        accessibility: 5,
        facilities: 4,
        parking: 4,
        familyFriendly: 5,
        comments: 'Extremely well-kept sacred grounds with dedicated shoe counters and peaceful gardens.'
      }
    ];

    for (const fb of feedbackData) {
      const place = attractionMap[fb.placeName];
      if (place && fb.user) {
        await PlaceFeedback.create({
          placeId: place._id,
          userId: fb.user._id,
          userName: fb.user.name,
          cleanliness: fb.cleanliness,
          safety: fb.safety,
          accessibility: fb.accessibility,
          facilities: fb.facilities,
          parking: fb.parking,
          familyFriendly: fb.familyFriendly,
          comments: fb.comments
        });
      }
    }
    console.log('✅ Seeded Category-Based Visitor Feedback');

    // ── 8. Recalculate Live Stats for All Attractions ─────────────────────
    console.log('\n--- Syncing Live Statistics for All Attractions ---');
    for (const place of attractions) {
      const stats = await syncAttractionStats(place._id);
      console.log(`   * ${place.name}: Rating = ${stats.avgRating} ★ (${stats.totalReviews} reviews, ${stats.recCount} recommendations, ${stats.recPercentage}% recommend)`);
    }

    console.log('\n====================================================');
    console.log('🎉 ENHANCED DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('   Users: admin@travelbuddy.lk / Travel123!');
    console.log('          sarah.silva@example.com / Travel123!');
    console.log('          john.walker@example.com / Travel123!');
    console.log('          kasun.perera@example.com / Travel123!');
    console.log('====================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedEnhancedDatabase();
