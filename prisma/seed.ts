import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Roamly database...');

  // Clean existing data in reverse dependency order
  await prisma.upload.deleteMany();
  await prisma.article.deleteMany();
  await prisma.entitlement.deleteMany();
  await prisma.expertQuote.deleteMany();
  await prisma.expertEnquiry.deleteMany();
  await prisma.shareToken.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.tripRevision.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.staySelection.deleteMany();
  await prisma.tripCity.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.hotelOffer.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.city.deleteMany();
  await prisma.tripTemplate.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.travellerPreferences.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@roamly.test',
      phone: '+15559998888',
      name: 'Elena Rostova (Admin)',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  const expertUser = await prisma.user.create({
    data: {
      email: 'expert@roamly.test',
      phone: '+15557776666',
      name: 'Wayman Surya (Bali Travel Specialist)',
      role: 'expert',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@roamly.test',
      phone: '+15551234567',
      name: 'Alex Morgan',
      role: 'customer',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      preferences: {
        create: {
          adults: 2,
          children: 0,
          infants: 0,
          elders: 0,
          occasion: 'leisure',
          pace: 'balanced',
          dietary: 'none',
          interests: JSON.stringify(['culture', 'nature', 'food', 'beach']),
          budgetTier: 'comfort',
        },
      },
    },
  });

  // 2. Seed Creators (clearly marked demo)
  const creatorMaya = await prisma.creator.create({
    data: {
      name: 'Maya Chen',
      handle: 'wanderlust_maya',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      bio: 'Southeast Asia slow-traveler & photographer. 45 countries explored. (Demo Creator Profile)',
      isVerified: true,
      isDemo: true,
    },
  });

  const creatorKenji = await prisma.creator.create({
    data: {
      name: 'Kenji Sato',
      handle: 'tokyo_curator',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      bio: 'Tokyo native uncovering hidden kissaten, architectural gems & ramen alleyways. (Demo Creator Profile)',
      isVerified: true,
      isDemo: true,
    },
  });

  // 3. Seed Destinations
  const destBali = await prisma.destination.create({
    data: {
      slug: 'bali',
      name: 'Bali',
      country: 'Indonesia',
      region: 'Southeast Asia',
      heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80',
      description: 'Lush terraced hillsides, sacred water temples, world-class beach breaks, and sunset cliffside sanctuaries across the Island of the Gods.',
      currency: 'IDR',
      timezone: 'Asia/Makassar',
      suggestedDurationDays: 7,
      bestMonths: JSON.stringify(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']),
      visaInfo: JSON.stringify({
        requirements: 'Visa on Arrival (VoA) valid for 30 days available for 97 nationalities. Electronic VoA (e-VoA) can be applied online prior to travel.',
        cost: 'IDR 500,000 (~$32 USD)',
        sourceUrl: 'https://molina.imigrasi.go.id/',
        lastVerified: '2026-09-01',
      }),
      weatherNotes: 'Dry season runs April to October with low humidity and pleasant sea breezes. Wet season runs November to March with brief afternoon tropical showers.',
    },
  });

  const destThailand = await prisma.destination.create({
    data: {
      slug: 'thailand',
      name: 'Thailand',
      country: 'Thailand',
      region: 'Southeast Asia',
      heroImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80',
      description: 'Gilded Buddhist temples, vibrant street food night markets, tropical karst islands, and ancient Northern mountain culture.',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
      suggestedDurationDays: 9,
      bestMonths: JSON.stringify(['Nov', 'Dec', 'Jan', 'Feb', 'Mar']),
      visaInfo: JSON.stringify({
        requirements: 'Visa exemption scheme allows tourists from 93 countries to stay up to 60 days without a visa for tourism purposes.',
        cost: 'Free for eligible exemption passports',
        sourceUrl: 'https://thaiembassy.com/',
        lastVerified: '2026-08-15',
      }),
      weatherNotes: 'Cool and dry from November to February. Hot season from March to May. Monsoon rains primarily between July and October.',
    },
  });

  const destJapan = await prisma.destination.create({
    data: {
      slug: 'japan',
      name: 'Japan',
      country: 'Japan',
      region: 'East Asia',
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
      description: 'Hyper-futuristic neon metropolises seamlessly harmonised with tranquil Zen bamboo groves, alpine onsen, and world-renowned gastronomy.',
      currency: 'JPY',
      timezone: 'Asia/Tokyo',
      suggestedDurationDays: 8,
      bestMonths: JSON.stringify(['Mar', 'Apr', 'May', 'Oct', 'Nov']),
      visaInfo: JSON.stringify({
        requirements: 'Visa waiver agreements with 71 countries and regions for stays up to 90 days for tourism purposes.',
        cost: 'Free for visa waiver nationals',
        sourceUrl: 'https://www.mofa.go.jp/',
        lastVerified: '2026-09-10',
      }),
      weatherNotes: 'Spring (cherry blossoms in April) and Autumn (foliage in November) offer crisp, dry weather. Summer is hot and humid.',
    },
  });

  // 4. Seed Cities
  // Bali Cities
  const cityUbud = await prisma.city.create({
    data: {
      slug: 'ubud',
      name: 'Ubud',
      destinationId: destBali.id,
      heroImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
      description: 'The cultural and spiritual heart of Bali, nestled among emerald river valleys and terraced rice paddies.',
      defaultNights: 3,
      lat: -8.5069,
      lng: 115.2625,
    },
  });

  const citySeminyak = await prisma.city.create({
    data: {
      slug: 'seminyak',
      name: 'Seminyak',
      destinationId: destBali.id,
      heroImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      description: 'Upscale coastal playground known for designer boutiques, sunset beach clubs, and vibrant dining.',
      defaultNights: 2,
      lat: -8.6913,
      lng: 115.1682,
    },
  });

  const cityUluwatu = await prisma.city.create({
    data: {
      slug: 'uluwatu',
      name: 'Uluwatu',
      destinationId: destBali.id,
      heroImage: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80',
      description: 'Dramatic limestone sea cliffs, legendary surf breaks, and ancient sunset temple fire dances.',
      defaultNights: 2,
      lat: -8.8291,
      lng: 115.0849,
    },
  });

  const cityCanggu = await prisma.city.create({
    data: {
      slug: 'canggu',
      name: 'Canggu',
      destinationId: destBali.id,
      heroImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1200&q=80',
      description: 'Bohemian surf enclave brimming with specialty coffee roasters, beachside lofts, and creative community spaces.',
      defaultNights: 2,
      lat: -8.6500,
      lng: 115.1389,
    },
  });

  // Thailand Cities
  const cityBangkok = await prisma.city.create({
    data: {
      slug: 'bangkok',
      name: 'Bangkok',
      destinationId: destThailand.id,
      heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
      description: 'Thailands kinetic capital, where Grand Palaces sit alongside bustling river taxis and rooftop cocktail lounges.',
      defaultNights: 3,
      lat: 13.7563,
      lng: 100.5018,
    },
  });

  const cityPhuket = await prisma.city.create({
    data: {
      slug: 'phuket',
      name: 'Phuket',
      destinationId: destThailand.id,
      heroImage: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80',
      description: 'The Pearl of the Andaman, renowned for turquoise waters, limestone karst bays, and vibrant Sino-Portuguese Old Town.',
      defaultNights: 3,
      lat: 7.8804,
      lng: 98.3923,
    },
  });

  // Japan Cities
  const cityTokyo = await prisma.city.create({
    data: {
      slug: 'tokyo',
      name: 'Tokyo',
      destinationId: destJapan.id,
      heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      description: 'The world’s most dynamic metropolis, blending cutting-edge innovation, Michelin gastronomy, and ancient Meiji sanctuaries.',
      defaultNights: 4,
      lat: 35.6762,
      lng: 139.6503,
    },
  });

  const cityKyoto = await prisma.city.create({
    data: {
      slug: 'kyoto',
      name: 'Kyoto',
      destinationId: destJapan.id,
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      description: 'The imperial capital of Japan, home to over a thousand historic Buddhist temples, geisha districts, and serene Zen rock gardens.',
      defaultNights: 3,
      lat: 35.0116,
      lng: 135.7681,
    },
  });

  // 5. Seed Airports
  await prisma.airport.createMany({
    data: [
      { iata: 'DPS', name: 'Ngurah Rai International Airport', cityId: citySeminyak.id, country: 'Indonesia', lat: -8.7482, lng: 115.1672 },
      { iata: 'BKK', name: 'Suvarnabhumi Airport', cityId: cityBangkok.id, country: 'Thailand', lat: 13.6900, lng: 100.7501 },
      { iata: 'DMK', name: 'Don Mueang International Airport', cityId: cityBangkok.id, country: 'Thailand', lat: 13.9126, lng: 100.6067 },
      { iata: 'HKT', name: 'Phuket International Airport', cityId: cityPhuket.id, country: 'Thailand', lat: 8.1132, lng: 98.3169 },
      { iata: 'HND', name: 'Haneda Airport', cityId: cityTokyo.id, country: 'Japan', lat: 35.5494, lng: 139.7798 },
      { iata: 'NRT', name: 'Narita International Airport', cityId: cityTokyo.id, country: 'Japan', lat: 35.7720, lng: 140.3929 },
      { iata: 'KIX', name: 'Kansai International Airport', cityId: cityKyoto.id, country: 'Japan', lat: 34.4320, lng: 135.2304 },
    ],
  });

  // 6. Seed Activities for Bali
  const actMonkeyForest = await prisma.activity.create({
    data: {
      slug: 'sacred-monkey-forest',
      title: 'Sacred Monkey Forest Sanctuary',
      cityId: cityUbud.id,
      category: 'nature',
      description: 'Wander through ancient nutmeg groves and mystical 14th-century temple ruins inhabited by over 1,000 Balinese long-tailed macaques.',
      durationMinutes: 120,
      estimatedCostMinor: 8000000, // IDR 80,000 (~$5 USD)
      currency: 'IDR',
      lat: -8.5188,
      lng: 115.2582,
      address: 'Jl. Monkey Forest, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
      ]),
      highlights: JSON.stringify(['Centuries-old banyan trees', 'Pura Dalem Agung Padangtegal', 'Close encounter with playful macaques']),
      accessibilityNotes: 'Paved stone paths with gentle ramps; some stepped areas near stream valley.',
      practicalTips: 'Secure sunglasses, hats, and shiny items inside your backpack before entering.',
      bookingRequired: false,
    },
  });

  const actTegallalang = await prisma.activity.create({
    data: {
      slug: 'tegallalang-rice-terraces',
      title: 'Tegallalang Rice Terraces Trek',
      cityId: cityUbud.id,
      category: 'nature',
      description: 'Explore the iconic emerald cascading rice paddies sculpted along the cliffside using the UNESCO-inscribed Subak cooperative water irrigation system.',
      durationMinutes: 150,
      estimatedCostMinor: 2500000, // IDR 25,000 (~$1.60 USD)
      currency: 'IDR',
      lat: -8.4326,
      lng: 115.2789,
      address: 'Jl. Raya Tegallalang, Gianyar, Bali',
      coverImage: 'https://images.unsplash.com/photo-1531761535209-180857e963b9?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Sunrise panoramic viewpoint', 'Subak UNESCO irrigation heritage', 'Artisanal organic coconut water stalls']),
      accessibilityNotes: 'Steep natural dirt stairways and uneven muddy ridges; good walking shoes required.',
      practicalTips: 'Arrive at 07:00 AM for soft morning golden light and cooler temperatures.',
      bookingRequired: false,
    },
  });

  const actTirtaEmpul = await prisma.activity.create({
    data: {
      slug: 'tirta-empul-purification',
      title: 'Tirta Empul Holy Water Temple Purification',
      cityId: cityUbud.id,
      category: 'culture',
      description: 'Participate in the sacred Melukat cleansing ritual in crystal-clear natural mountain spring pools sacred to Balinese Hindus since 962 AD.',
      durationMinutes: 120,
      estimatedCostMinor: 5000000, // IDR 50,000 (~$3.20 USD)
      currency: 'IDR',
      lat: -8.4149,
      lng: 115.3151,
      address: 'Jl. Tirta, Manukaya, Tampaksiring, Gianyar, Bali',
      coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Traditional Melukat ritual sarong ceremony', '30 natural stone spring spouts', 'Historic Presidential Palace backdrop']),
      accessibilityNotes: 'Changing facilities available on-site; flat courtyard access to temple perimeter.',
      practicalTips: 'Hire an official local temple guide at the entrance for respectful ritual step-by-step guidance.',
      bookingRequired: false,
    },
  });

  const actCookingClass = await prisma.activity.create({
    data: {
      slug: 'paon-bali-cooking-class',
      title: 'Traditional Balinese Village Cooking Class',
      cityId: cityUbud.id,
      category: 'food',
      description: 'Morning market spice discovery followed by hands-on preparation of 8 traditional dishes in an authentic rural family compound.',
      durationMinutes: 240,
      estimatedCostMinor: 40000000, // IDR 400,000 (~$25 USD)
      currency: 'IDR',
      lat: -8.4950,
      lng: 115.2690,
      address: 'Laplapan Village, Ubud, Bali',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Morning local spice market walking tour', 'Preparation of Base Gede spice paste', 'Communal feast overlooking valley']),
      accessibilityNotes: 'Ground-level outdoor covered kitchen; vegetarian and vegan friendly menus provided.',
      practicalTips: 'Come hungry! You will feast on everything prepared during the class.',
      bookingRequired: true,
    },
  });

  const actCampuhanRidge = await prisma.activity.create({
    data: {
      slug: 'campuhan-ridge-walk',
      title: 'Campuhan Ridge Sunset Walk',
      cityId: cityUbud.id,
      category: 'nature',
      description: 'A gentle 2km scenic trail following the narrow grassy spine between the sacred Wos rivers with rolling jungle gorge vistas.',
      durationMinutes: 90,
      estimatedCostMinor: 0,
      currency: 'IDR',
      lat: -8.5034,
      lng: 115.2546,
      address: 'Kelusa, Payangan, Jl. Raya Campuhan, Sayan, Ubud, Bali',
      coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Panoramic jungle river valleys', 'Karsa Kafe scenic refreshment stop', 'Soft sunset sea breezes']),
      accessibilityNotes: 'Paved stone path with mild gradient; easy 45-minute stroll each way.',
      practicalTips: 'Start from Warwick Ibah Villas access trail around 5:00 PM.',
      bookingRequired: false,
    },
  });

  // Seminyak Activities
  const actPotatoHead = await prisma.activity.create({
    data: {
      slug: 'potato-head-beach-club',
      title: 'Sunset Session at Desa Potato Head',
      cityId: citySeminyak.id,
      category: 'entertainment',
      description: 'Zero-waste beachfront creative hub featuring architectural amphitheater, horizon pool, bespoke tropical cocktails, and curated vinyl soundscapes.',
      durationMinutes: 180,
      estimatedCostMinor: 35000000, // IDR 350,000 (~$22 USD)
      currency: 'IDR',
      lat: -8.6833,
      lng: 115.1506,
      address: 'Jl. Petitenget No.51B, Seminyak, Kuta Utara, Bali',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Oceanfront infinity pool loungers', 'Zero-waste circular mixology', 'Unobstructed Indian Ocean sunset views']),
      accessibilityNotes: 'Fully wheelchair and stroller accessible throughout beachfront decks and ramps.',
      practicalTips: 'Book daybed minimum spend packages 3–7 days in advance during dry season.',
      bookingRequired: true,
    },
  });

  const actEatStreet = await prisma.activity.create({
    data: {
      slug: 'eat-street-culinary-stroll',
      title: 'Jalan Kayu Aya (Eat Street) Culinary Stroll',
      cityId: citySeminyak.id,
      category: 'food',
      description: 'Explore Seminyak’s premier dining boulevard, discovering world-class Indonesian-French fusion, gelato bars, and chic cocktail hideaways.',
      durationMinutes: 150,
      estimatedCostMinor: 25000000, // IDR 250,000 (~$16 USD)
      currency: 'IDR',
      lat: -8.6875,
      lng: 115.1583,
      address: 'Jl. Kayu Aya, Seminyak, Kuta, Bali',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Gourmet bistro hopping', 'Artisanal local boutiques', 'Lively nighttime atmosphere']),
      accessibilityNotes: 'Paved sidewalk; occasional kerb steps along cross streets.',
      practicalTips: 'Walk rather than drive, as Kayu Aya experiences heavy vehicular traffic between 6 and 9 PM.',
      bookingRequired: false,
    },
  });

  // Uluwatu Activities
  const actUluwatuTemple = await prisma.activity.create({
    data: {
      slug: 'uluwatu-temple-kecak-dance',
      title: 'Uluwatu Cliff Temple & Kecak Sunset Fire Dance',
      cityId: cityUluwatu.id,
      category: 'culture',
      description: 'Perched 70 metres atop sheer limestone ocean cliffs, witness the hypnotic rhythmic Kecak chorus reenacting the Ramayana epic against fiery sea horizons.',
      durationMinutes: 150,
      estimatedCostMinor: 15000000, // IDR 150,000 (~$10 USD)
      currency: 'IDR',
      lat: -8.8291,
      lng: 115.0849,
      address: 'Pecatu, South Kuta, Badung Regency, Bali',
      coverImage: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['70-metre dramatic cliffside panorama', 'Live 50-person acapella Kecak choir', 'Spectacular sunset backdrop']),
      accessibilityNotes: 'Gradual ramp up to outer temple; amphitheater has stepped tiered stone seating.',
      practicalTips: 'Ticket queue opens at 4:30 PM; performance begins promptly at 6:00 PM.',
      bookingRequired: true,
    },
  });

  const actPadangPadang = await prisma.activity.create({
    data: {
      slug: 'padang-padang-beach',
      title: 'Padang Padang Beach & Surf Cove',
      cityId: cityUluwatu.id,
      category: 'nature',
      description: 'A sheltered white-sand bay reached through an exotic hollow limestone crevice, famed for world-class barrel surfing and turquoise swimming waters.',
      durationMinutes: 180,
      estimatedCostMinor: 1500000, // IDR 15,000 (~$1 USD)
      currency: 'IDR',
      lat: -8.8111,
      lng: 115.1037,
      address: 'Jl. Labuansait, Pecatu, Kuta Selatan, Bali',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Unique natural rock cave staircase entrance', 'Pristine calm swimming lagoon at mid-tide', 'Beachside fresh fruit and coconut stands']),
      accessibilityNotes: 'Narrow stepped cavern descent; not suitable for heavy wheelchairs or large strollers.',
      practicalTips: 'Visit around morning mid-tide for the best combination of swimmable calm water and soft sand space.',
      bookingRequired: false,
    },
  });

  const actJimbaranDinner = await prisma.activity.create({
    data: {
      slug: 'jimbaran-bay-seafood-dinner',
      title: 'Jimbaran Bay Candlelit Beach Seafood Dinner',
      cityId: cityUluwatu.id,
      category: 'food',
      description: 'Sink your toes in soft sand at sunset while dining on freshly grilled red snapper, jumbo tiger prawns, and squid barbecued over aromatic coconut husks.',
      durationMinutes: 120,
      estimatedCostMinor: 30000000, // IDR 300,000 (~$19 USD)
      currency: 'IDR',
      lat: -8.7733,
      lng: 115.1667,
      address: 'Pantai Muaya, Jimbaran, Kuta Selatan, Bali',
      coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      highlights: JSON.stringify(['Beach tables directly at high-tide line', 'Coconut husk smoky grill flavor', 'Strolling serenader acoustic musicians']),
      accessibilityNotes: 'Tables are directly on soft dry beach sand.',
      practicalTips: 'Reserve for 5:30 PM to enjoy pre-sunset drinks before dinner arrives around dusk.',
      bookingRequired: true,
    },
  });

  // 7. Seed Hotels for Bali with Multi-Provider Price Offers
  // Hotel 1: Maya Ubud Resort & Spa
  const hotelMayaUbud = await prisma.hotel.create({
    data: {
      slug: 'maya-ubud-resort-and-spa',
      name: 'Maya Ubud Resort & Spa',
      cityId: cityUbud.id,
      starRating: 5.0,
      reviewScore: 9.3,
      reviewCount: 1420,
      address: 'Jl. Gunung Sari Peliatan, Ubud, Bali',
      lat: -8.5134,
      lng: 115.2756,
      coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      ]),
      amenities: JSON.stringify(['Infinity Valley Pool', 'Petanu River Spa', 'Yoga Pavilion', 'Free Shuttle to Ubud Center', 'High-Speed Wi-Fi', 'Complimentary Afternoon Tea']),
      description: 'Ten hectares of secluded hillside garden sanctuaries nestled between the Petanu River valley and rolling rice fields.',
      checkInTime: '14:00',
      checkOutTime: '12:00',
    },
  });

  // Multi-provider offers for Maya Ubud (3 nights)
  await prisma.hotelOffer.createMany({
    data: [
      {
        hotelId: hotelMayaUbud.id,
        provider: 'Agoda',
        roomType: 'Superior Forest View Suite',
        mealBasis: 'Breakfast Included',
        cancellationPolicy: 'Free cancellation until 48h prior',
        pricePerNightMinor: 18500, // $185.00
        totalPriceMinor: 55500, // $555.00 for 3 nights
        currency: 'USD',
        taxesAndFeesMinor: 5500,
        providerUrl: 'https://agoda.com/demo/maya-ubud',
        isDirect: false,
        occupancy: 2,
      },
      {
        hotelId: hotelMayaUbud.id,
        provider: 'Booking.com',
        roomType: 'Superior Forest View Suite',
        mealBasis: 'Breakfast Included',
        cancellationPolicy: 'Free cancellation until 24h prior',
        pricePerNightMinor: 19800, // $198.00
        totalPriceMinor: 59400,
        currency: 'USD',
        taxesAndFeesMinor: 5900,
        providerUrl: 'https://booking.com/demo/maya-ubud',
        isDirect: false,
        occupancy: 2,
      },
      {
        hotelId: hotelMayaUbud.id,
        provider: 'Direct Resort Website',
        roomType: 'Superior Forest View Suite + Spa Perk',
        mealBasis: 'Breakfast Included + 1hr Massage',
        cancellationPolicy: 'Free cancellation until 7 days prior',
        pricePerNightMinor: 21000, // $210.00
        totalPriceMinor: 63000,
        currency: 'USD',
        taxesAndFeesMinor: 0,
        providerUrl: 'https://mayaresorts.com/ubud',
        isDirect: true,
        occupancy: 2,
      },
    ],
  });

  // Hotel 2: Hotel Indigo Bali Seminyak Beach
  const hotelIndigo = await prisma.hotel.create({
    data: {
      slug: 'hotel-indigo-seminyak-beach',
      name: 'Hotel Indigo Bali Seminyak Beach',
      cityId: citySeminyak.id,
      starRating: 5.0,
      reviewScore: 9.2,
      reviewCount: 980,
      address: 'Jl. Camplung Tanduk No.10, Seminyak, Bali',
      lat: -8.6942,
      lng: 115.1554,
      coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      ]),
      amenities: JSON.stringify(['Beachfront Access', 'Multiple Lagoon Pools', 'Sava Spa', '24-Hour Fitness', 'SugarSand Beach Club', 'Specialty Coffee Bar']),
      description: 'Boutique lifestyle resort infusing colorful Balinese weaving motifs and bohemian coast culture right on Seminyak beach.',
      checkInTime: '15:00',
      checkOutTime: '12:00',
    },
  });

  await prisma.hotelOffer.createMany({
    data: [
      {
        hotelId: hotelIndigo.id,
        provider: 'Booking.com',
        roomType: 'Standard King Room with Balcony',
        mealBasis: 'Room Only',
        cancellationPolicy: 'Free cancellation until 72h prior',
        pricePerNightMinor: 16500, // $165.00
        totalPriceMinor: 33000, // $330.00 for 2 nights
        currency: 'USD',
        taxesAndFeesMinor: 3300,
        providerUrl: 'https://booking.com/demo/hotel-indigo-seminyak',
        isDirect: false,
        occupancy: 2,
      },
      {
        hotelId: hotelIndigo.id,
        provider: 'Expedia',
        roomType: 'Standard King Room with Balcony',
        mealBasis: 'Breakfast Included',
        cancellationPolicy: 'Non-refundable (Save 12%)',
        pricePerNightMinor: 15200,
        totalPriceMinor: 30400,
        currency: 'USD',
        taxesAndFeesMinor: 3000,
        providerUrl: 'https://expedia.com/demo/hotel-indigo',
        isDirect: false,
        occupancy: 2,
      },
      {
        hotelId: hotelIndigo.id,
        provider: 'Direct IHG',
        roomType: 'Standard King Room with Balcony',
        mealBasis: 'Breakfast Included + Welcome Cocktail',
        cancellationPolicy: 'Free cancellation until 24h prior',
        pricePerNightMinor: 17500,
        totalPriceMinor: 35000,
        currency: 'USD',
        taxesAndFeesMinor: 0,
        providerUrl: 'https://ihg.com/hotelindigo/seminyak',
        isDirect: true,
        occupancy: 2,
      },
    ],
  });

  // Hotel 3: Radisson Blu Resort Uluwatu
  const hotelRadissonBlu = await prisma.hotel.create({
    data: {
      slug: 'radisson-blu-resort-uluwatu',
      name: 'Radisson Blu Resort Bali Uluwatu',
      cityId: cityUluwatu.id,
      starRating: 5.0,
      reviewScore: 9.0,
      reviewCount: 650,
      address: 'Jl. Pemutih, Labuan Sait, Pecatu, Bali',
      lat: -8.8083,
      lng: 115.1098,
      coverImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      ]),
      amenities: JSON.stringify(['Cliffside Ocean Views', 'Surfer Shuttle to Padang Padang', 'Spa & Wellness', 'Luciole Italian Restaurant', 'Free Cabanas']),
      description: 'Sophisticated cliffside getaway perched moments from world-class surf breaks with panoramic ocean-facing horizons.',
      checkInTime: '15:00',
      checkOutTime: '12:00',
    },
  });

  await prisma.hotelOffer.createMany({
    data: [
      {
        hotelId: hotelRadissonBlu.id,
        provider: 'Agoda',
        roomType: 'Deluxe Ocean View Room',
        mealBasis: 'Breakfast Included',
        cancellationPolicy: 'Free cancellation until 48h prior',
        pricePerNightMinor: 14500, // $145.00
        totalPriceMinor: 29000, // $290.00 for 2 nights
        currency: 'USD',
        taxesAndFeesMinor: 2900,
        providerUrl: 'https://agoda.com/demo/radisson-blu-uluwatu',
        isDirect: false,
        occupancy: 2,
      },
      {
        hotelId: hotelRadissonBlu.id,
        provider: 'Direct Radisson',
        roomType: 'Deluxe Ocean View Room',
        mealBasis: 'Breakfast Included',
        cancellationPolicy: 'Free cancellation until 24h prior',
        pricePerNightMinor: 15500,
        totalPriceMinor: 31000,
        currency: 'USD',
        taxesAndFeesMinor: 0,
        providerUrl: 'https://radissonhotels.com/uluwatu',
        isDirect: true,
        occupancy: 2,
      },
    ],
  });

  // 8. Seed Trip Templates
  const templateBaliEssential = await prisma.tripTemplate.create({
    data: {
      slug: 'bali-essential-culture-cliffs',
      title: 'Essential Bali: Culture, Coast & Cliffs',
      subtitle: 'A complete 7-day multi-city journey balancing Ubud jungle heritage, Seminyak beach vitality, and Uluwatu ocean horizons.',
      destinationId: destBali.id,
      durationDays: 7,
      nights: 6,
      creatorId: creatorMaya.id,
      isPaid: false,
      priceMinor: 0,
      currency: 'USD',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      ]),
      citiesJson: JSON.stringify([
        { cityName: 'Ubud', citySlug: 'ubud', nights: 3 },
        { cityName: 'Seminyak', citySlug: 'seminyak', nights: 2 },
        { cityName: 'Uluwatu', citySlug: 'uluwatu', nights: 1 },
      ]),
      activityCount: 9,
      highlightPills: JSON.stringify(['Subak Rice Terraces', 'Holy Spring Water Cleansing', 'Potato Head Sunset', 'Cliff Kecak Dance', 'Cooking Class']),
      snapshotJson: JSON.stringify({
        notes: 'Balanced itinerary designed to minimize travel time across Bali’s varying micro-regions.',
      }),
    },
  });

  const templateTokyoKyoto = await prisma.tripTemplate.create({
    data: {
      slug: 'tokyo-kyoto-cultural-discovery',
      title: 'Tokyo to Kyoto: Shinkansen Highlights',
      subtitle: 'Experience the electric modernity of Tokyo paired with the centuries-old Zen heritage of Kyoto over 7 unforgettable days.',
      destinationId: destJapan.id,
      durationDays: 7,
      nights: 6,
      creatorId: creatorKenji.id,
      isPaid: false,
      priceMinor: 0,
      currency: 'USD',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      ]),
      citiesJson: JSON.stringify([
        { cityName: 'Tokyo', citySlug: 'tokyo', nights: 4 },
        { cityName: 'Kyoto', citySlug: 'kyoto', nights: 2 },
      ]),
      activityCount: 8,
      highlightPills: JSON.stringify(['Bullet Train Shinkansen', 'Fushimi Inari Shrine', 'Shinjuku Neon Alleyways', 'Arashiyama Bamboo']),
      snapshotJson: JSON.stringify({
        notes: 'High-speed transit journey connecting Japan’s modern and imperial capitals.',
      }),
    },
  });

  // 9. Create a Realistic Demo Seeded Trip (Alex Morgan's Trip / Ready-Made Bali Trip)
  const tripStartDate = new Date('2026-12-01T10:00:00Z');
  const tripEndDate = new Date('2026-12-07T18:00:00Z');

  const seedTrip = await prisma.trip.create({
    data: {
      title: 'Bali Culture & Coastal Escape',
      destinationId: destBali.id,
      userId: demoUser.id,
      startDate: tripStartDate,
      endDate: tripEndDate,
      nights: 6,
      adults: 2,
      children: 0,
      infants: 0,
      elders: 0,
      occasion: 'leisure',
      pace: 'balanced',
      dietary: 'none',
      status: 'active',
      departureAirport: 'DPS',
      returnAirport: 'DPS',
      isPublic: true,
      currency: 'USD',
    },
  });

  // Trip Cities
  await prisma.tripCity.createMany({
    data: [
      { tripId: seedTrip.id, cityId: cityUbud.id, nights: 3, orderIndex: 0 },
      { tripId: seedTrip.id, cityId: citySeminyak.id, nights: 2, orderIndex: 1 },
      { tripId: seedTrip.id, cityId: cityUluwatu.id, nights: 1, orderIndex: 2 },
    ],
  });

  // Trip Days (Day 1 to Day 7)
  const day1 = await prisma.tripDay.create({
    data: {
      tripId: seedTrip.id,
      dayNumber: 1,
      date: new Date('2026-12-01T00:00:00Z'),
      cityId: cityUbud.id,
      title: 'Arrive in Paradise & Gentle Ridge Walk',
      notes: 'Arrival at DPS airport, scenic transfer to Ubud, check-in, and sunset stroll along the ridge.',
    },
  });

  const day2 = await prisma.tripDay.create({
    data: {
      tripId: seedTrip.id,
      dayNumber: 2,
      date: new Date('2026-12-02T00:00:00Z'),
      cityId: cityUbud.id,
      title: 'Sacred Temples & Forest Inhabitants',
      notes: 'Morning holy spring water cleansing followed by afternoon at the sacred monkey forest.',
    },
  });

  const day3 = await prisma.tripDay.create({
    data: {
      tripId: seedTrip.id,
      dayNumber: 3,
      date: new Date('2026-12-03T00:00:00Z'),
      cityId: cityUbud.id,
      title: 'Cascading Terraces & Culinary Craft',
      notes: 'Sunrise trek among Tegallalang rice paddies and immersive afternoon cooking class.',
    },
  });

  const day4 = await prisma.tripDay.create({
    data: {
      tripId: seedTrip.id,
      dayNumber: 4,
      date: new Date('2026-12-04T00:00:00Z'),
      cityId: citySeminyak.id,
      title: 'Transfer to Coast & Beach Club Sunset',
      notes: 'Drive south towards Seminyak, afternoon pool lounging, and sunset at Desa Potato Head.',
    },
  });

  const day5 = await prisma.tripDay.create({
    data: {
      tripId: seedTrip.id,
      dayNumber: 5,
      date: new Date('2026-12-05T00:00:00Z'),
      cityId: citySeminyak.id,
      title: 'Coastal Leisure & Eat Street Hopping',
      notes: 'Morning surf stroll, spa treatment, and evening culinary crawl on Jalan Kayu Aya.',
    },
  });

  const day6 = await prisma.tripDay.create({
    data: {
      tripId: seedTrip.id,
      dayNumber: 6,
      date: new Date('2026-12-06T00:00:00Z'),
      cityId: cityUluwatu.id,
      title: 'Limestone Cliffs & Kecak Fire Dance',
      notes: 'Transfer to Uluwatu, relaxing at Padang Padang beach, and cliffside Kecak dance at sunset.',
    },
  });

  const day7 = await prisma.tripDay.create({
    data: {
      tripId: seedTrip.id,
      dayNumber: 7,
      date: new Date('2026-12-07T00:00:00Z'),
      cityId: cityUluwatu.id,
      title: 'Farewell Bay Feast & Departure',
      notes: 'Last swim at the cliff pool, sunset seafood lunch at Jimbaran Bay, and airport transfer.',
    },
  });

  // Seed Itinerary Items
  // Day 1
  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day1.id,
      type: 'flight',
      title: 'Arrive at Ngurah Rai International Airport (DPS)',
      startTime: '10:30',
      endTime: '11:45',
      durationMinutes: 75,
      locationName: 'DPS Airport',
      lat: -8.7482,
      lng: 115.1672,
      costMinor: 0,
      priceBasis: 'per_group',
      notes: 'Flight GA-842. Collect luggage, pass customs, and activate local eSIM.',
      bookingStatus: 'booked',
      orderIndex: 0,
      metadata: JSON.stringify({ flightNumber: 'GA-842' }),
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day1.id,
      type: 'transfer',
      title: 'Private Airport Transfer to Ubud Resort',
      startTime: '12:00',
      endTime: '13:30',
      durationMinutes: 90,
      locationName: 'DPS to Ubud',
      costMinor: 2500, // $25.00
      priceBasis: 'per_group',
      notes: 'Air-conditioned private van transfer through Denpasar and Batubulan craft villages.',
      bookingStatus: 'shortlisted',
      orderIndex: 1,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day1.id,
      type: 'stay',
      title: 'Check-in: Maya Ubud Resort & Spa',
      startTime: '14:00',
      endTime: '15:00',
      durationMinutes: 60,
      locationName: 'Maya Ubud Resort & Spa',
      lat: -8.5134,
      lng: 115.2756,
      costMinor: 55500, // $555.00 (3 nights)
      priceBasis: 'per_room_night',
      notes: 'Superior Forest View Suite booked with breakfast included.',
      bookingStatus: 'booked',
      orderIndex: 2,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day1.id,
      type: 'activity',
      activityId: actCampuhanRidge.id,
      title: 'Campuhan Ridge Sunset Walk',
      startTime: '17:00',
      endTime: '18:30',
      durationMinutes: 90,
      locationName: 'Campuhan Ridge, Ubud',
      lat: -8.5034,
      lng: 115.2546,
      costMinor: 0,
      priceBasis: 'per_person',
      notes: 'Wear comfortable walking shoes. Stop for fresh dragon fruit juice at Karsa Kafe.',
      bookingStatus: 'planned',
      orderIndex: 3,
    },
  });

  // Day 2
  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day2.id,
      type: 'activity',
      activityId: actTirtaEmpul.id,
      title: 'Tirta Empul Holy Water Temple Purification',
      startTime: '09:00',
      endTime: '11:00',
      durationMinutes: 120,
      locationName: 'Tirta Empul Temple, Tampaksiring',
      lat: -8.4149,
      lng: 115.3151,
      costMinor: 640, // ~$6.40 for 2 persons
      priceBasis: 'per_person',
      notes: 'Sarongs provided. Respectful attire requested.',
      bookingStatus: 'planned',
      orderIndex: 0,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day2.id,
      type: 'meal',
      title: 'Traditional Warung Lunch & Crispy Duck',
      startTime: '12:30',
      endTime: '13:45',
      durationMinutes: 75,
      locationName: 'Bebek Bengil (Dirty Duck Diner), Ubud',
      lat: -8.5147,
      lng: 115.2632,
      costMinor: 2200, // $22.00
      priceBasis: 'per_group',
      notes: 'Famous smoked and crispy duck served in traditional thatched gazebos overlooking rice fields.',
      bookingStatus: 'planned',
      orderIndex: 1,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day2.id,
      type: 'activity',
      activityId: actMonkeyForest.id,
      title: 'Sacred Monkey Forest Sanctuary',
      startTime: '15:00',
      endTime: '17:00',
      durationMinutes: 120,
      locationName: 'Monkey Forest Sanctuary, Ubud',
      lat: -8.5188,
      lng: 115.2582,
      costMinor: 1000, // $10.00 for 2
      priceBasis: 'per_person',
      notes: 'Keep shiny accessories safely stowed.',
      bookingStatus: 'planned',
      orderIndex: 2,
    },
  });

  // Day 3
  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day3.id,
      type: 'activity',
      activityId: actTegallalang.id,
      title: 'Tegallalang Rice Terraces Trek',
      startTime: '07:30',
      endTime: '10:00',
      durationMinutes: 150,
      locationName: 'Tegallalang, Gianyar',
      lat: -8.4326,
      lng: 115.2789,
      costMinor: 320,
      priceBasis: 'per_person',
      notes: 'Cool early morning light and fewer crowds.',
      bookingStatus: 'planned',
      orderIndex: 0,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day3.id,
      type: 'activity',
      activityId: actCookingClass.id,
      title: 'Traditional Balinese Village Cooking Class',
      startTime: '11:00',
      endTime: '15:00',
      durationMinutes: 240,
      locationName: 'Paon Bali Cooking Class, Laplapan',
      lat: -8.4950,
      lng: 115.2690,
      costMinor: 5000, // $50.00 for 2
      priceBasis: 'per_person',
      notes: 'Includes market visit and multi-course lunch.',
      bookingStatus: 'shortlisted',
      orderIndex: 1,
    },
  });

  // Day 4
  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day4.id,
      type: 'transfer',
      title: 'Scenic Transfer: Ubud to Seminyak Coast',
      startTime: '11:00',
      endTime: '12:30',
      durationMinutes: 90,
      locationName: 'Ubud to Seminyak',
      costMinor: 2000,
      priceBasis: 'per_group',
      notes: 'Private air-conditioned car transfer.',
      bookingStatus: 'planned',
      orderIndex: 0,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day4.id,
      type: 'stay',
      title: 'Check-in: Hotel Indigo Seminyak Beach',
      startTime: '14:00',
      endTime: '14:30',
      durationMinutes: 30,
      locationName: 'Hotel Indigo Seminyak',
      lat: -8.6942,
      lng: 115.1554,
      costMinor: 33000, // $330.00 for 2 nights
      priceBasis: 'per_room_night',
      notes: 'Balcony king room overlooking pool lagoon.',
      bookingStatus: 'booked',
      orderIndex: 1,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day4.id,
      type: 'activity',
      activityId: actPotatoHead.id,
      title: 'Sunset Session at Desa Potato Head',
      startTime: '16:30',
      endTime: '20:00',
      durationMinutes: 210,
      locationName: 'Desa Potato Head, Seminyak',
      lat: -8.6833,
      lng: 115.1506,
      costMinor: 4500, // $45.00
      priceBasis: 'per_group',
      notes: 'Daybed reserved at oceanfront pool.',
      bookingStatus: 'booked',
      orderIndex: 2,
    },
  });

  // Day 5
  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day5.id,
      type: 'free_time',
      title: 'Morning Coastal Stroll & Coffee Tasting',
      startTime: '09:00',
      endTime: '11:30',
      durationMinutes: 150,
      locationName: 'Seminyak Beach',
      costMinor: 1200,
      priceBasis: 'per_group',
      notes: 'Try single-origin Kintamani pour-over at Revolver Espresso.',
      bookingStatus: 'planned',
      orderIndex: 0,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day5.id,
      type: 'activity',
      activityId: actEatStreet.id,
      title: 'Jalan Kayu Aya (Eat Street) Culinary Stroll',
      startTime: '18:30',
      endTime: '21:00',
      durationMinutes: 150,
      locationName: 'Jalan Kayu Aya, Seminyak',
      lat: -8.6875,
      lng: 115.1583,
      costMinor: 3500,
      priceBasis: 'per_group',
      notes: 'Dinner at Merah Putih followed by handmade gelato.',
      bookingStatus: 'planned',
      orderIndex: 1,
    },
  });

  // Day 6
  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day6.id,
      type: 'transfer',
      title: 'Transfer to Bukit Peninsula (Uluwatu)',
      startTime: '10:30',
      endTime: '11:45',
      durationMinutes: 75,
      locationName: 'Seminyak to Uluwatu',
      costMinor: 2200,
      priceBasis: 'per_group',
      notes: 'Drive south through Pecatu hills.',
      bookingStatus: 'planned',
      orderIndex: 0,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day6.id,
      type: 'activity',
      activityId: actPadangPadang.id,
      title: 'Padang Padang Beach & Surf Cove',
      startTime: '12:30',
      endTime: '15:30',
      durationMinutes: 180,
      locationName: 'Padang Padang Beach',
      lat: -8.8111,
      lng: 115.1037,
      costMinor: 200,
      priceBasis: 'per_person',
      notes: 'Mid-tide swimming and fresh young coconuts.',
      bookingStatus: 'planned',
      orderIndex: 1,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day6.id,
      type: 'activity',
      activityId: actUluwatuTemple.id,
      title: 'Uluwatu Cliff Temple & Kecak Sunset Fire Dance',
      startTime: '16:30',
      endTime: '19:00',
      durationMinutes: 150,
      locationName: 'Uluwatu Temple, Pecatu',
      lat: -8.8291,
      lng: 115.0849,
      costMinor: 2000,
      priceBasis: 'per_person',
      notes: 'Performance begins at 18:00 sharp against sunset.',
      bookingStatus: 'booked',
      orderIndex: 2,
    },
  });

  // Day 7
  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day7.id,
      type: 'activity',
      activityId: actJimbaranDinner.id,
      title: 'Jimbaran Bay Farewell Seafood Feast',
      startTime: '13:00',
      endTime: '15:00',
      durationMinutes: 120,
      locationName: 'Pantai Muaya, Jimbaran',
      lat: -8.7733,
      lng: 115.1667,
      costMinor: 3800,
      priceBasis: 'per_group',
      notes: 'Charcoal-grilled snapper and jumbo prawns right on the sand.',
      bookingStatus: 'planned',
      orderIndex: 0,
    },
  });

  await prisma.itineraryItem.create({
    data: {
      tripId: seedTrip.id,
      dayId: day7.id,
      type: 'transfer',
      title: 'Airport Drop-off at DPS',
      startTime: '15:30',
      endTime: '16:15',
      durationMinutes: 45,
      locationName: 'Jimbaran to DPS Airport',
      costMinor: 1500,
      priceBasis: 'per_group',
      notes: 'Terminal 2 International departures.',
      bookingStatus: 'planned',
      orderIndex: 1,
    },
  });

  // Stay selections
  await prisma.staySelection.createMany({
    data: [
      {
        tripId: seedTrip.id,
        cityId: cityUbud.id,
        hotelId: hotelMayaUbud.id,
        checkInDate: new Date('2026-12-01T14:00:00Z'),
        checkOutDate: new Date('2026-12-04T11:00:00Z'),
        nights: 3,
        roomType: 'Superior Forest View Suite',
        provider: 'Agoda',
        totalPriceMinor: 55500,
        currency: 'USD',
        bookingStatus: 'booked',
        bookingReference: 'AG-9821447',
        notes: 'Includes breakfast buffet each morning.',
      },
      {
        tripId: seedTrip.id,
        cityId: citySeminyak.id,
        hotelId: hotelIndigo.id,
        checkInDate: new Date('2026-12-04T14:00:00Z'),
        checkOutDate: new Date('2026-12-06T11:00:00Z'),
        nights: 2,
        roomType: 'Standard King Room with Balcony',
        provider: 'Booking.com',
        totalPriceMinor: 33000,
        currency: 'USD',
        bookingStatus: 'booked',
        bookingReference: 'BK-3392811',
        notes: 'Balcony room facing garden lagoon.',
      },
      {
        tripId: seedTrip.id,
        cityId: cityUluwatu.id,
        hotelId: hotelRadissonBlu.id,
        checkInDate: new Date('2026-12-06T14:00:00Z'),
        checkOutDate: new Date('2026-12-07T11:00:00Z'),
        nights: 1,
        roomType: 'Deluxe Ocean View Room',
        provider: 'Direct Radisson',
        totalPriceMinor: 15500,
        currency: 'USD',
        bookingStatus: 'shortlisted',
        notes: 'Awaiting promotional discount confirmation.',
      },
    ],
  });

  // Share Token for public read-only link
  await prisma.shareToken.create({
    data: {
      tripId: seedTrip.id,
      token: 'bali-escape-demo-token-77',
      isRevoked: false,
    },
  });

  // Seed Articles (Essentials, Etiquette, eSIM)
  await prisma.article.createMany({
    data: [
      {
        slug: 'bali-connectivity-esim-guide',
        title: 'Bali eSIM & Mobile Connectivity Guide',
        destinationId: destBali.id,
        category: 'essentials',
        excerpt: 'How to obtain reliable 4G/5G data coverage instantly upon landing at Ngurah Rai Airport.',
        content: 'Telkomsel offers the widest coverage across Bali, especially in jungle valleys around Ubud and Sidemen. Pre-installing an eSIM profile (e.g. Airalo, Holafly, or Telkomsel Tourist Prepaid) before departure saves up to 45 minutes of airport kiosk queueing.',
        coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      },
      {
        slug: 'bali-temple-etiquette-rules',
        title: 'Essential Temple Etiquette & Sacred Customs',
        destinationId: destBali.id,
        category: 'etiquette',
        excerpt: 'Respectful guidelines for sarong wear, ceremonial offerings (Canang Sari), and prayer zones.',
        content: 'Always wear a sarong and sash covering legs and shoulders when entering any temple courtyard. Never step directly on Canang Sari offerings placed on pavements. During prayer ceremonies, keep your head lower than seated priests.',
        coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      },
      {
        slug: 'bali-transport-ridehailing-apps',
        title: 'Getting Around Bali: Grab, Gojek & Private Drivers',
        destinationId: destBali.id,
        category: 'guide',
        excerpt: 'When to hire a full-day private driver versus using Gojek or Grab for short hops.',
        content: 'For day trips involving multiple sights (such as Tegallalang, Tirta Empul, and coffee plantations), a private driver costs roughly IDR 600,000–800,000 (~$40–$50 USD) for 10 hours including petrol. For local hops in Seminyak, Canggu, or Sanur, Grab and Gojek apps provide transparent metered fares.',
        coverImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

