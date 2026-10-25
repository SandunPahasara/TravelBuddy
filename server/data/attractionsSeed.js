// Initial Seed Data for Panadura & Surrounding Local Tourist Attractions (within 25 km radius)
// Coordinates reference location: Panadura Town Center (6.6991191, 79.9304626)

const initialAttractions = [
  {
    id: "attraction-1",
    name: "Panadura Beach",
    category: "Beach",
    distanceKm: 4.6,
    latitude: 6.7135,
    longitude: 79.9048,
    shortDescription: "A beautiful golden sand coastline perfect for sunset walks, swimming, and relaxing by the ocean.",
    description: "Panadura Beach is a serene coastal destination offering long stretches of fine golden sand and rhythmic Indian Ocean waves. It is popular among local residents and visitors for evening walks, family picnics, enjoying street food, and catching breathtaking tropical sunsets.",
    openingHours: "Open 24 Hours (Best time: 4:00 PM - 6:30 PM)",
    entranceFee: "Free",
    visitDurationMinutes: 90,
    facilities: ["Parking", "Food Stalls", "Seating Benches", "Restroom Nearby"],
    parkingInfo: "Ample vehicle parking available along Beach Road.",
    travelTips: "Be cautious when swimming during high tide seasons. Bring sunscreen and enjoy local fresh coconut vendors.",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-2",
    name: "Rankoth Viharaya - Panadura",
    category: "Religious",
    distanceKm: 4.4,
    latitude: 6.7142,
    longitude: 79.9095,
    shortDescription: "Historical Buddhist temple known for its ancient stupa and peace-filled sacred environment.",
    description: "Rankoth Viharaya is one of the most prominent historic Buddhist temples in Panadura. Featuring a towering white stupa, tranquil preaching halls, and traditional Sinhala temple architecture, it plays a vital role in local religious heritage.",
    openingHours: "06:00 AM - 08:30 PM daily",
    entranceFee: "Free (Donations Welcome)",
    visitDurationMinutes: 45,
    facilities: ["Parking", "Shoe Counter", "Restroom", "Flower Vendors"],
    parkingInfo: "Dedicated temple grounds parking available.",
    travelTips: "Please dress modestly (covering shoulders and knees) and remove footwear before entering temple grounds.",
    images: [
      "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1609949279531-cf48d64bed89?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-3",
    name: "Panadura Urban Park",
    category: "Recreation",
    distanceKm: 3.9,
    latitude: 6.7110,
    longitude: 79.9070,
    shortDescription: "A modern green public park featuring jogging paths, kids play areas, and shaded relaxation spots.",
    description: "Located right near the heart of Panadura, the Urban Park provides a lush green sanctuary for fitness enthusiasts, families, and morning joggers. It includes paved walking tracks, outdoor fitness equipment, and children's recreation zones.",
    openingHours: "05:30 AM - 08:00 PM daily",
    entranceFee: "Free",
    visitDurationMinutes: 60,
    facilities: ["Walking Track", "Children Play Area", "Restrooms", "Drinking Water"],
    parkingInfo: "Convenient parking along the park perimeter.",
    travelTips: "Great spot for an early morning stroll or evening exercise. Soft drinks and snacks available nearby.",
    images: [
      "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-4",
    name: "Bolgoda Lake",
    category: "Nature",
    distanceKm: 15.0,
    latitude: 6.7441,
    longitude: 79.9482,
    shortDescription: "Sri Lanka's largest natural freshwater lake, famous for boat rides, kayaking, and rich birdlife.",
    description: "Bolgoda Lake is an expansive freshwater ecosystem featuring intricate mangrove waterways, islands, and diverse flora and fauna. Visitors can enjoy boat safaris, bird watching, luxury eco-resorts, and water sports.",
    openingHours: "Boat safaris operate 07:00 AM - 06:00 PM",
    entranceFee: "Free (Boat rides approx LKR 3,000 - 6,000 per hour)",
    visitDurationMinutes: 120,
    facilities: ["Boat Rides", "Restaurants", "Resorts", "Parking", "Water Sports"],
    parkingInfo: "Available at boat launching jetties and lakefront hotels.",
    travelTips: "Book boat tours ahead of time for sunrise or sunset views. Excellent spot for nature photography.",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-5",
    name: "Richmond Castle - Kalutara",
    category: "Heritage",
    distanceKm: 19.0,
    latitude: 6.5989,
    longitude: 79.9818,
    shortDescription: "An exquisite early 20th-century mansion blending Indian and European architectural styles.",
    description: "Richmond Castle is a majestic 99-room Edwardian mansion built between 1900 and 1910 by Mudaliyar Don Arthur de Silva Wijesinghe Siriwardena. Set within a 42-acre estate, it features teak wood floors, stained glass windows, and grand marble statues.",
    openingHours: "08:30 AM - 04:30 PM daily",
    entranceFee: "LKR 200 (Locals) / LKR 1,000 (Foreigners)",
    visitDurationMinutes: 90,
    facilities: ["Guided Tours", "Parking", "Restrooms", "Garden Walks"],
    parkingInfo: "On-site secure parking inside mansion gates.",
    travelTips: "Take a guided tour to learn the romantic and tragic history of the palace owner.",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-6",
    name: "Kalutara Bodhiya",
    category: "Religious",
    distanceKm: 16.0,
    latitude: 6.5866,
    longitude: 79.9602,
    shortDescription: "Famous Buddhist shrine with the world's only hollow Stupa and a sacred Bo tree.",
    description: "Situated beside the Kalu Ganga river bridge, Kalutara Bodhiya is one of the most revered pilgrimage sites in Sri Lanka. It houses a hollow stupa with breathtaking interior murals depicting the Jataka tales, surrounding a sacred Bo tree.",
    openingHours: "05:00 AM - 09:00 PM daily",
    entranceFee: "Free",
    visitDurationMinutes: 60,
    facilities: ["Restrooms", "Information Counter", "Shoe Counter", "Parking"],
    parkingInfo: "Public parking available under the bridge and near temple entry.",
    travelTips: "Remove shoes and hats. Walk inside the hollow stupa to view the golden shrine and hand-painted wall frescoes.",
    images: [
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-7",
    name: "Sri Lanka Air Force Museum - Ratmalana",
    category: "Museum",
    distanceKm: 18.0,
    latitude: 6.8183,
    longitude: 79.8893,
    shortDescription: "A comprehensive aviation museum displaying historical aircraft, helicopters, and military artifacts.",
    description: "The SLAF Museum at Ratmalana Air Force base features vintage aircraft, fighter jets, transport planes, radar systems, and historical military memorabilia tracing the history of Sri Lanka's aviation defense.",
    openingHours: "08:30 AM - 04:30 PM (Closed Mondays)",
    entranceFee: "LKR 300 (Locals) / LKR 1,500 (Foreigners)",
    visitDurationMinutes: 100,
    facilities: ["Souvenir Shop", "Cafeteria", "Restrooms", "Parking", "Guided Exhibits"],
    parkingInfo: "Dedicated visitors parking lot in front of museum gate.",
    travelTips: "Carry a photo ID card. Great educational visit for children and military history enthusiasts.",
    images: [
      "https://images.unsplash.com/photo-1519074069444-1ba4ea161b61?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-8",
    name: "Attidiya Bird Sanctuary",
    category: "Wildlife",
    distanceKm: 21.0,
    latitude: 6.8458,
    longitude: 79.8972,
    shortDescription: "Protected marshland habitat home to over 50 species of migratory and endemic wetland birds.",
    description: "Attidiya Bird Sanctuary is a biodiversity hotspot located in suburban Western Province. The wetland marshes, canals, and reeds provide refuge to herons, egrets, kingfishers, butterflies, and water monitor lizards.",
    openingHours: "06:00 AM - 06:00 PM daily",
    entranceFee: "Free",
    visitDurationMinutes: 90,
    facilities: ["Observation Deck", "Walking Path", "Parking"],
    parkingInfo: "Limited parking near the wildlife conservation office entrance.",
    travelTips: "Visit early morning (6:30 AM - 8:30 AM) for bird activity. Bring binoculars and insect repellent.",
    images: [
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-9",
    name: "Bellanwila Rajamaha Viharaya",
    category: "Religious",
    distanceKm: 22.0,
    latitude: 6.8492,
    longitude: 79.8938,
    shortDescription: "Historic temple housing a sacred Bodhi tree planted in the 3rd century BC.",
    description: "Bellanwila Rajamaha Viharaya is renowned for its sacred Bodhi Tree, believed to be one of the thirty-two saplings originating from the Jaya Sri Maha Bodhi in Anuradhapura. The annual Bellanwila Esala Perahera is a major cultural highlight.",
    openingHours: "06:00 AM - 08:30 PM daily",
    entranceFee: "Free",
    visitDurationMinutes: 60,
    facilities: ["Shoe Counter", "Restroom", "Parking", "Flower Stalls"],
    parkingInfo: "Ample temple parking ground across the main street.",
    travelTips: "Visit during early morning or late afternoon for quiet chanting sessions.",
    images: [
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "attraction-10",
    name: "Dehiwala Zoological Gardens",
    category: "Wildlife",
    distanceKm: 23.0,
    latitude: 6.8569,
    longitude: 79.8732,
    shortDescription: "National zoo boasting a vast collection of mammals, birds, reptiles, and a walk-through aquarium.",
    description: "Established in 1936, the Dehiwala National Zoo is one of Asia's oldest zoological gardens. It houses hundreds of wild animals from across the world, including elephants, big cats, primates, an aviary, and a marine life aquarium.",
    openingHours: "08:30 AM - 05:30 PM daily",
    entranceFee: "LKR 500 (Locals) / LKR 3,500 (Foreigners)",
    visitDurationMinutes: 180,
    facilities: ["Food Court", "Restrooms", "Aquarium", "Souvenir Shop", "First Aid"],
    parkingInfo: "Paid multi-story parking garage located directly across the zoo entrance.",
    travelTips: "Plan at least 2 to 3 hours. Wear comfortable walking shoes and stay hydrated.",
    images: [
      "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=80"
    ]
  }
];

module.exports = initialAttractions;
