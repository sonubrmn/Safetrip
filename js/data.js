/**
 * SAFETRIP - Central State & Data Store
 * Built for Smart India Hackathon Prototype
 * Designed for seamless transition to Python FastAPI backend.
 */

class SafeTripEventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in event handler for ${event}:`, err);
      }
    });
  }
}

const SafeTripEvents = new SafeTripEventBus();

// High-definition inline SVG fallback generator for destination cards
function getDestinationFallbackSvg(name, statusClass) {
  const isCaution = statusClass === "caution";
  const primaryBg = isCaution ? "#b45309" : "#0f172a";
  const accent = isCaution ? "#f59e0b" : "#10b981";
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g_${statusClass}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${primaryBg}"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g_${statusClass})"/>
    <!-- Monument arch architectural silhouette -->
    <path d="M160 400 L160 220 Q200 160 300 160 Q400 160 440 220 L440 400 Z" fill="#ffffff" opacity="0.08"/>
    <path d="M220 400 L220 250 Q260 200 300 200 Q340 200 380 250 L380 400 Z" fill="#ffffff" opacity="0.12"/>
    <circle cx="300" cy="120" r="16" fill="${accent}" opacity="0.3"/>
    <text x="50%" y="76%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${name}</text>
    <text x="50%" y="86%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94a3b8" text-anchor="middle">Rajasthan Heritage Safety Grid</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SafeTripData = {
  // Current Active Tourist State (Global Demo Tourist: Sid)
  tourist: {
    id: "ST-8F42A1",
    name: "Sid",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43210",
    nationality: "IND",
    emergencyContact: {
      name: "Guardian",
      relation: "Emergency Contact",
      phone: "+91 98765 12345"
    },
    blockchainHash: "0x7f8a92d4e1b8c3f69a1029c48e718b52a91e4b3c",
    blockNumber: "19,482,041",
    verificationNetwork: "Polygon PoS / ZK-Identity Protocol",
    status: "Verified",
    lastSynced: "2 min ago",
    currentLocation: {
      name: "Hawa Mahal Precinct, Jaipur",
      coords: [26.9239, 75.8267], // lat, lng
      zoneId: "safe-heritage-corridor"
    },
    safetyScore: 84,
    riskLevel: "LOW RISK", // "LOW RISK" | "CAUTION" | "HIGH RISK" | "EMERGENCY"
    riskFactors: [
      { name: "Safe Heritage Zone", scoreDelta: 0, type: "safe" },
      { name: "Emergency Services Nearby (< 800m)", scoreDelta: 0, type: "safe" },
      { name: "Active Verified Connection", scoreDelta: 0, type: "safe" }
    ],
    checkInIntervalMinutes: 30,
    checkInTimeRemainingSeconds: 18 * 60 + 24, // 18m 24s left
    checkInStatus: "ACTIVE" // "ACTIVE" | "WARNING" | "MISSED"
  },

  // City center for Jaipur demonstration
  center: [26.9220, 75.8267],

  // Geofenced Areas
  geofences: [
    {
      id: "safe-heritage-corridor",
      name: "City Palace & Hawa Mahal Heritage Zone",
      type: "safe",
      color: "#10b981",
      fillColor: "#10b981",
      riskScore: 92,
      description: "Well-lit tourist corridor with continuous police beat patrols and CCTV surveillance.",
      coordinates: [
        [26.9290, 75.8210],
        [26.9285, 75.8310],
        [26.9195, 75.8305],
        [26.9190, 75.8205]
      ]
    },
    {
      id: "safe-amber-palace",
      name: "Amber Fort Courtyard & Entry Precinct",
      type: "safe",
      color: "#10b981",
      fillColor: "#10b981",
      riskScore: 91,
      description: "Official tourist precinct with Rajasthan Tourist Assistance Force (TAF) booth.",
      coordinates: [
        [26.9880, 75.8480],
        [26.9885, 75.8550],
        [26.9820, 75.8540],
        [26.9815, 75.8475]
      ]
    },
    {
      id: "caution-nahargarh-trail",
      name: "Nahargarh Ridge Road (Night Caution Zone)",
      type: "caution",
      color: "#f59e0b",
      fillColor: "#f59e0b",
      riskScore: 64,
      description: "Isolated winding road with blind turns and limited lighting after 7:00 PM.",
      coordinates: [
        [26.9420, 75.8110],
        [26.9450, 75.8200],
        [26.9360, 75.8215],
        [26.9340, 75.8130]
      ]
    },
    {
      id: "caution-bazaar-alleys",
      name: "Tripolia Bazaars Narrow Lanes",
      type: "caution",
      color: "#f59e0b",
      fillColor: "#f59e0b",
      riskScore: 68,
      description: "Dense foot traffic and narrow lanes. Higher incidence of lost personal items.",
      coordinates: [
        [26.9260, 75.8140],
        [26.9260, 75.8210],
        [26.9200, 75.8205],
        [26.9205, 75.8135]
      ]
    },
    {
      id: "restricted-nahargarh-cliff",
      name: "Nahargarh Cliff Edge (Hazard Zone)",
      type: "restricted",
      color: "#ef4444",
      fillColor: "#ef4444",
      riskScore: 18,
      description: "Steep drop-off with structural barrier gaps. Restricted area prohibited after dark.",
      coordinates: [
        [26.9410, 75.8140],
        [26.9435, 75.8185],
        [26.9385, 75.8190],
        [26.9370, 75.8150]
      ]
    },
    {
      id: "restricted-nullah-construction",
      name: "Amanishah Basin Reconstruction Area",
      type: "restricted",
      color: "#ef4444",
      fillColor: "#ef4444",
      riskScore: 22,
      description: "Active civic excavation and flash-hazard channel. Unauthorized entry strictly barred.",
      coordinates: [
        [26.9080, 75.7720],
        [26.9120, 75.7780],
        [26.9040, 75.7820],
        [26.9010, 75.7750]
      ]
    }
  ],

  // Emergency Facilities (Hospitals, Police, Tourist Assistance)
  emergencyServices: [
    {
      id: "hospital-sms",
      name: "Sawai Man Singh (SMS) Hospital",
      type: "hospital",
      category: "Level 1 Trauma & Emergency",
      coords: [26.8972, 75.8164],
      phone: "0141-2560291",
      distance: "2.4 km",
      openHours: "24/7 Emergency Available"
    },
    {
      id: "hospital-santokba",
      name: "Santokba Durlabhji Memorial Hospital",
      type: "hospital",
      category: "Multi-specialty Critical Care",
      coords: [26.8872, 75.8078],
      phone: "0141-2566251",
      distance: "3.8 km",
      openHours: "24/7 Emergency Available"
    },
    {
      id: "police-tourist",
      name: "Rajasthan Tourist Police Assistance Thana",
      type: "police",
      category: "Dedicated Tourist Protection Unit",
      coords: [26.9242, 75.8270],
      phone: "1363 / 0141-2601980",
      distance: "120 m",
      openHours: "24/7 Patrol Station"
    },
    {
      id: "police-manak",
      name: "Manak Chowk Police Station",
      type: "police",
      category: "City Walled District Station",
      coords: [26.9215, 75.8230],
      phone: "112 / 0141-2601112",
      distance: "450 m",
      openHours: "24/7 Law Enforcement"
    },
    {
      id: "police-amber",
      name: "Amber Fort Police Post",
      type: "police",
      category: "Heritage Security Outpost",
      coords: [26.9850, 75.8520],
      phone: "0141-2530101",
      distance: "8.2 km",
      openHours: "24/7 Security"
    }
  ],

  // Destination Safety Insight Cards
  // Destination Safety & Intelligence Cards
  destinations: [
    {
      id: "amber-fort",
      name: "Amber Fort",
      location: "Amer, Jaipur",
      coords: [26.9855, 75.8513],
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
      safetyScore: 91,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "8.4 km",
      highlight: "Continuous tourist police presence & active illumination",
      crowdDensity: "Moderate",
      safeHours: "08:00 AM – 06:30 PM",
      famousFor: "Iconic 16th-century Rajput-Mughal hilltop fortress, Sheesh Mahal (Mirror Palace), and Maota Lake panoramic vistas.",
      bestTime: "Early morning 8:30 AM to avoid steep afternoon sun.",
      recommendedTime: "2.5 – 3 Hours",
      accessibility: "Cobblestone ramps and golf carts available from lower parking to Suraj Pol.",
      familyFriendly: true,
      budgetEstimate: "₹100 (Indian) / ₹500 (Foreign)",
      features: ["Active Guard Patrols", "Emergency Call Boxes", "First Aid Post"]
    },
    {
      id: "city-palace",
      name: "City Palace",
      location: "Old City, Jaipur",
      coords: [26.9258, 75.8236],
      image: "https://images.unsplash.com/photo-1603288967262-6e2717904094?w=800&auto=format&fit=crop&q=80",
      safetyScore: 86,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "1.2 km",
      highlight: "High security perimeter & verified guide registration",
      crowdDensity: "High",
      safeHours: "09:00 AM – 07:00 PM",
      famousFor: "Chandra Mahal royal residence, Peacock Gate courtyards, and world's largest sterling silver urns (Gangajalis).",
      bestTime: "Late afternoon (3:30 PM – 5:30 PM) when courtyards are shaded.",
      recommendedTime: "2 Hours",
      accessibility: "Wheelchair ramps available across main courtyards; paved flat walking surfaces.",
      familyFriendly: true,
      budgetEstimate: "₹300 (Museum Pass)",
      features: ["Smart CCTV Coverage", "Official Guides Only", "Pedestrian Zone"]
    },
    {
      id: "hawa-mahal",
      name: "Hawa Mahal",
      location: "Badi Choupad, Jaipur",
      coords: [26.9239, 75.8267],
      image: "https://images.unsplash.com/photo-1609948549021-95be246dbece?w=800&auto=format&fit=crop&q=80",
      safetyScore: 93,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "0.4 km",
      highlight: "Surrounded by heritage police posts & dense foot traffic",
      crowdDensity: "Very High",
      safeHours: "09:00 AM – 08:00 PM",
      famousFor: "Palace of Winds with 953 jharokha honeycombed pink sandstone windows designed for royal court ladies.",
      bestTime: "Early morning sunrise (7:30 AM) when the eastern facade catches golden light.",
      recommendedTime: "1 Hour",
      accessibility: "Steep internal ramps, narrow stone passages; ground-level viewing is accessible.",
      familyFriendly: true,
      budgetEstimate: "₹50 (Indian) / ₹200 (Foreign)",
      features: ["120m to Police Post", "High Ambient Lighting", "Zero-Tolerance Zone"]
    },
    {
      id: "jal-mahal",
      name: "Jal Mahal",
      location: "Man Sagar Lake, Jaipur",
      coords: [26.9535, 75.8462],
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80",
      safetyScore: 89,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "5.1 km",
      highlight: "Waterfront promenade with regular motorcycle patrol",
      crowdDensity: "Moderate",
      safeHours: "06:00 AM – 09:00 PM",
      famousFor: "Symmetrical submerged water palace sitting in the center of Man Sagar Lake against Aravalli hills.",
      bestTime: "Sunset 5:30 PM for night illumination along the lakeside walkway.",
      recommendedTime: "45 Minutes",
      accessibility: "Wide, flat paved pedestrian promenade with safety railings.",
      familyFriendly: true,
      budgetEstimate: "Free Promenade Viewing",
      features: ["Lake Safety Barriers", "Quick Highway Access", "Patrol Unit"]
    },
    {
      id: "nahargarh",
      name: "Nahargarh Fort",
      location: "Aravalli Hills, Jaipur",
      coords: [26.9372, 75.8155],
      image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80",
      safetyScore: 61,
      riskLevel: "CAUTION",
      statusClass: "caution",
      distance: "4.5 km",
      highlight: "Isolated mountain ridge; caution advised after sunset",
      crowdDensity: "Low to Moderate",
      safeHours: "10:00 AM – 05:30 PM",
      famousFor: "Madhavendra Bhawan nine royal suites and sweeping panoramic sunset ridge overlooking the entire Pink City.",
      bestTime: "Golden hour 4:00 PM – 5:30 PM (depart before dark).",
      recommendedTime: "1.5 – 2 Hours",
      accessibility: "Uneven hill trails and parapet steps; caution required along edges.",
      familyFriendly: false,
      budgetEstimate: "₹50 (Indian) / ₹200 (Foreign)",
      features: ["Ridge Warnings", "Limited Cell Coverage", "Recommend Daytime Only"]
    },
    {
      id: "jantar-mantar",
      name: "Jantar Mantar",
      location: "City Palace Complex, Jaipur",
      coords: [26.9248, 75.8246],
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80",
      safetyScore: 92,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "1.0 km",
      highlight: "UNESCO World Heritage site inside high-security heritage precinct",
      crowdDensity: "Moderate",
      safeHours: "09:00 AM – 06:30 PM",
      famousFor: "World's largest stone sundial (Samrat Yantra) and 19 architectural astronomical instruments built by Sawai Jai Singh II.",
      bestTime: "Midday (11:30 AM – 1:30 PM) when sun angle allows direct solar readings.",
      recommendedTime: "1.5 Hours",
      accessibility: "Completely level paved stone garden paths, highly accessible for elderly.",
      familyFriendly: true,
      budgetEstimate: "₹50 (Indian) / ₹200 (Foreign)",
      features: ["UNESCO Heritage Guard", "Shaded Rest Arbors", "Audio Guide Desk"]
    },
    {
      id: "albert-hall",
      name: "Albert Hall Museum",
      location: "Ram Niwas Garden, Jaipur",
      coords: [26.9116, 75.8195],
      image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=800&auto=format&fit=crop&q=80",
      safetyScore: 90,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "2.1 km",
      highlight: "Rajasthan's oldest state museum set in illuminated royal gardens",
      crowdDensity: "Moderate",
      safeHours: "09:00 AM – 08:00 PM",
      famousFor: "Indo-Saracenic royal architecture, authentic Egyptian mummy, ivory carvings, and evening neon illumination.",
      bestTime: "Evening 6:30 PM for spectacular exterior facade lighting.",
      recommendedTime: "1.5 Hours",
      accessibility: "Ramped entrance, elevator access to gallery levels.",
      familyFriendly: true,
      budgetEstimate: "₹40 (Indian) / ₹300 (Foreign)",
      features: ["Garden Security Beat", "Well-illuminated Perimeters", "CCTV Monitoring"]
    },
    {
      id: "patrika-gate",
      name: "Patrika Gate",
      location: "Jawahar Circle, Jaipur",
      coords: [26.8375, 75.8080],
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80",
      safetyScore: 94,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "9.2 km",
      highlight: "Vibrant hand-painted archways in south Jaipur park ring",
      crowdDensity: "Moderate",
      safeHours: "06:00 AM – 09:30 PM",
      famousFor: "Ornate pastel frescoes portraying Rajasthani history, culture, and architecture; premier photography spot.",
      bestTime: "Morning 7:30 AM – 9:00 AM before photo enthusiasts gather.",
      recommendedTime: "45 Minutes",
      accessibility: "Wide paved pedestrian walkway, zero steps, park benches.",
      familyFriendly: true,
      budgetEstimate: "Free Public Access",
      features: ["Park Police Patrol", "Open Public Garden", "24/7 Security Booth"]
    }
  ],

  // Distinct Authentic Experiences (Activities to Do & Participate In)
  experiences: [
    {
      id: "exp-blue-pottery",
      title: "Blue Pottery Hand-Molding Masterclass",
      category: "Artisan Workshop",
      location: "Sanganer Heritage Enclave, Jaipur",
      coords: [26.8180, 75.7720],
      duration: "2 Hours",
      priceEst: "₹850 / person",
      priceNum: 850,
      safetyScore: 94,
      statusClass: "safe",
      recommendedTime: "10:30 AM – 12:30 PM",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80",
      description: "Learn authentic cobalt-glaze ceramic casting directly from a 4th-generation Jaipur master craftsman.",
      whyRecommended: "Verified artisan guild, indoor well-ventilated studio, located in verified tourist heritage corridor.",
      tags: ["Hands-on Craft", "Family Friendly", "Souvenir Included"]
    },
    {
      id: "exp-block-print",
      title: "Natural Dye Bagru Woodblock Printing",
      category: "Textile & Craft",
      location: "Bagru Craft Hamlet, Jaipur Outer",
      coords: [26.8120, 75.5450],
      duration: "2.5 Hours",
      priceEst: "₹700 / person",
      priceNum: 700,
      safetyScore: 88,
      statusClass: "safe",
      recommendedTime: "09:30 AM – 12:00 PM",
      image: "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=800&auto=format&fit=crop&q=80",
      description: "Carve teakwood stamps and stamp organic cotton scarves using 300-year-old plant-based Dabu mud resist dyes.",
      whyRecommended: "Sustainable rural artisan coop, verified Rajasthan Tourism partner, daytime only.",
      tags: ["Heritage Craft", "Eco-friendly", "Keepsake Scarf"]
    },
    {
      id: "exp-food-walk",
      title: "Old Walled City Evening Culinary Walk",
      category: "Culinary Heritage",
      location: "Johari & Bapu Bazaar, Jaipur",
      coords: [26.9215, 75.8240],
      duration: "1.5 Hours",
      priceEst: "₹550 / person",
      priceNum: 550,
      safetyScore: 92,
      statusClass: "safe",
      recommendedTime: "06:00 PM – 07:30 PM",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
      description: "Taste 6 verified century-old recipes: crisp pyaaz kachori, saffron lassi, malai ghewar, and spiced kanji wada.",
      whyRecommended: "Guided by certified local historian, stays along primary illuminated beat-patrolled corridor.",
      tags: ["Foodie", "Walking Tour", "Veg Friendly"]
    },
    {
      id: "exp-folk-evening",
      title: "Rajasthani Folk Music & Kathputli Evening",
      category: "Folk Performance",
      location: "Old City Haveli Courtyard, Jaipur",
      coords: [26.9270, 75.8250],
      duration: "2 Hours",
      priceEst: "₹650 / person",
      priceNum: 650,
      safetyScore: 95,
      statusClass: "safe",
      recommendedTime: "07:00 PM – 09:00 PM",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
      description: "Intimate acoustic recital of Manganiyar & Langa folk ragas paired with traditional Rajasthani string puppet storytelling.",
      whyRecommended: "Private heritage haveli, seated comfort, highly suitable for elderly travelers and families.",
      tags: ["Music & Dance", "Elderly Friendly", "Cultural Immersion"]
    },
    {
      id: "exp-nahargarh-sunset",
      title: "Nahargarh Ridge Sunset Photo Walk",
      category: "Scenic & Photography",
      location: "Nahargarh Fort Ridge, Jaipur",
      coords: [26.9375, 75.8150],
      duration: "2 Hours",
      priceEst: "₹450 / person",
      priceNum: 450,
      safetyScore: 78,
      statusClass: "caution",
      recommendedTime: "04:30 PM – 06:30 PM",
      image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80",
      description: "Panoramic golden-hour views over the pink city from the ramparts with designated photo vista spots.",
      whyRecommended: "Guided group transit recommended; group departs before dark at 6:45 PM to avoid unlit ridge curves.",
      tags: ["Golden Hour", "Photography", "Daylight Preferred"]
    }
  ],

  // Local Food Intelligence
  localFoods: [
    {
      id: "food-dal-baati",
      name: "Dal Baati Churma",
      hindiName: "दाल बाटी चूरमा",
      category: "Royal Thali Platter",
      priceEst: "₹220 – ₹450",
      dietary: "Vegetarian / Jain Option",
      dietaryClass: "veg",
      description: "Crispy ghee-baked wheat flour dumplings paired with spiced five-lentil panchmel dal and sweet crushed churma.",
      famousAt: "Laxmi Misthan Bhandar (LMB) & Rawat Restaurant",
      safetyNote: "Freshly prepared in high-turnover verified kitchens; safe and hygienic."
    },
    {
      id: "food-pyaaz-kachori",
      name: "Pyaaz Kachori & Mirchi Bada",
      hindiName: "प्याज़ कचौरी और मिर्ची बड़ा",
      category: "Heritage Savory Snack",
      priceEst: "₹40 – ₹70",
      dietary: "Vegetarian",
      dietaryClass: "veg",
      description: "Flaky golden crust stuffed with spiced caramelised onions and green chillies, served with sweet tamarind chutney.",
      famousAt: "Rawat Mishthan Bhandar (Station Road) & Sodhani Sweets",
      safetyNote: "Always served piping hot straight from cauldron oil."
    },
    {
      id: "food-ghewar",
      name: "Malai Ghewar",
      hindiName: "मलाई घेवर",
      category: "Traditional Honeycomb Sweet",
      priceEst: "₹120 – ₹240",
      dietary: "Vegetarian",
      dietaryClass: "veg",
      description: "Disc-shaped honeycomb pastry soaked in saffron sugar syrup, topped with rich clotted cream (malai) and silver leaf.",
      famousAt: "LMB Johari Bazaar & Sambhar Fini Sweet House",
      safetyNote: "Best consumed fresh daily; heritage certified sweets."
    },
    {
      id: "food-laal-maas",
      name: "Laal Maas",
      hindiName: "लाल मांस",
      category: "Fiery Rajput Meat Curry",
      priceEst: "₹380 – ₹580",
      dietary: "Non-Vegetarian",
      dietaryClass: "non-veg",
      description: "Smoked tender goat meat slow-cooked in a fiery gravy of authentic Mathania red chillies, mustard oil, and garlic.",
      famousAt: "Handi Restaurant (MI Road) & Niros",
      safetyNote: "Authentic spice level is high; mild version can be requested."
    },
    {
      id: "food-ker-sangri",
      name: "Ker Sangri & Bajre ki Roti",
      hindiName: "केर सांगरी और बाजरे की रोटी",
      category: "Desert Foraged Delicacy",
      priceEst: "₹180 – ₹320",
      dietary: "Vegan / Gluten-Free Aware",
      dietaryClass: "veg",
      description: "Wild dried desert berries (ker) and desert beans (sangri) sautéed with whole spices, served with rustic pearl millet flatbread.",
      famousAt: "Chokhi Dhani & 1135 AD Amber",
      safetyNote: "Gentle on digestion, nutrient-dense traditional food."
    },
    {
      id: "food-lassi",
      name: "Special Malai Kulhad Lassi",
      hindiName: "स्पेशल मलाई कुल्हड़ लस्सी",
      category: "Chilled Saffron Probiotic",
      priceEst: "₹50 – ₹90",
      dietary: "Vegetarian",
      dietaryClass: "veg",
      description: "Thick hand-churned yogurt flavored with cardamom and kewra, served ice-cold in unglazed clay cups with thick rabdi clotted cream.",
      famousAt: "Lassiwala (Shop 312, MI Road, since 1944)",
      safetyNote: "Look for Shop 312 with official green signboard. Serves until batch runs out by 3:00 PM."
    }
  ],

  // Curated Accommodations with Safety Intel
  accommodations: [
    {
      id: "stay-zostel",
      name: "Zostel Jaipur Heritage Hostel & Suites",
      type: "Backpacker / Solo Traveler",
      priceNight: "₹750 (Dorm) / ₹2,200 (Private)",
      priceNum: 750,
      distance: "400m from Hawa Mahal",
      rating: "4.8 / 5.0",
      safetyScore: 94,
      statusClass: "safe",
      cancellation: "Free Cancellation (Demo)",
      payLater: true,
      whyRecommended: "Located inside verified heritage corridor, 24/7 security front desk, 120m to tourist police.",
      features: ["Female-only Dorms Available", "Curfew-free Safe Card Access", "Rooftop Social Cafe"]
    },
    {
      id: "stay-arya-niwas",
      name: "Hotel Arya Niwas Heritage",
      type: "Budget Heritage & Family Friendly",
      priceNight: "₹2,400 / night",
      priceNum: 2400,
      distance: "1.8 km from City Palace",
      rating: "4.7 / 5.0",
      safetyScore: 92,
      statusClass: "safe",
      cancellation: "Free Cancellation (Demo)",
      payLater: true,
      whyRecommended: "Spacious peaceful courtyard, low-walking elevator access, highly recommended for families and seniors.",
      features: ["Pure Veg Certified Kitchen", "Eco-friendly Solar Powered", "Doctor On-Call 24/7"]
    },
    {
      id: "stay-umaid-bhawan",
      name: "Umaid Bhawan Boutique Heritage Hotel",
      type: "Cultural Boutique",
      priceNight: "₹3,800 / night",
      priceNum: 3800,
      distance: "2.6 km from Old City",
      rating: "4.6 / 5.0",
      safetyScore: 90,
      statusClass: "safe",
      cancellation: "Free Cancellation (Demo)",
      payLater: true,
      whyRecommended: "Safe residential enclave (Bani Park), CCTV monitored perimeter, quick hospital road access.",
      features: ["Fresco Painted Suites", "Swimming Pool", "Curated Private Car Hire"]
    }
  ],

  // Local Translation Phrases
  translationPhrases: [
    {
      id: "tr-fare",
      category: "Auto / Taxi",
      english: "Brother, how much will you charge to go to Hawa Mahal by meter?",
      hindi: "भैया, हवा महल जाने का मीटर से कितना किराया होगा?",
      phonetic: "Bhaiya, Hawa Mahal jaane ka meter se kitna kiraya hoga?",
      tip: "Show this to the driver before getting in."
    },
    {
      id: "tr-police",
      category: "Emergency & Direction",
      english: "Excuse me, where is the nearest police assistance post or tourist helpline?",
      hindi: "माफ़ कीजिये, यहाँ सबसे नज़दीकी पुलिस सहायता चौकी कहाँ है?",
      phonetic: "Maaf kijiye, yahan sabse nazdeeki police sahayata chowki kahan hai?",
      tip: "Use if lost or needing immediate guidance."
    },
    {
      id: "tr-spicy",
      category: "Food & Dining",
      english: "Please make the food less spicy with very little chilli and clean drinking water.",
      hindi: "कृपया खाना कम तीखा बनाइए, मिर्ची कम डालना और साफ़ पानी देना।",
      phonetic: "Kripya khana kam teekha banaiye, mirchi kam daalna aur saaf paani dena.",
      tip: "Handy at local dhabas and traditional sweet shops."
    },
    {
      id: "tr-discount",
      category: "Bazaar Shopping",
      english: "What is your best final price for this handicraft? Please give a fair rate.",
      hindi: "इस हस्तशिल्प की सही और वाजिब कीमत क्या होगी? थोड़ा ठीक दाम लगाइए।",
      phonetic: "Is hastshilp ki sahi aur waajib keemat kya hogi? Thoda theek daam lagaiye.",
      tip: "Polite negotiation for Johari and Bapu bazaar handicrafts."
    },
    {
      id: "tr-safe-time",
      category: "Safety & Timing",
      english: "Is this road well-lit and safe to walk right now, or should I take an auto?",
      hindi: "क्या यह रास्ता अभी पैदल जाने के लिए सुरक्षित और रौशन है, या ऑटो ले लूँ?",
      phonetic: "Kya yeh raasta abhi paidal jaane ke liye surakshit aur raushan hai, ya auto le loon?",
      tip: "Helpful for evening strolls near monument lanes."
    }
  ],

  // Saved My Trip Items
  myTrip: [
    {
      id: "trip-init-1",
      title: "Amber Fort Heritage Exploration",
      type: "place",
      targetId: "amber-fort",
      day: "Day 1",
      time: "09:00 AM",
      estCost: "₹100",
      status: "Planned",
      safetyScore: 91
    },
    {
      id: "trip-init-2",
      title: "Old Walled City Evening Food Walk",
      type: "experience",
      targetId: "exp-food-walk",
      day: "Day 1",
      time: "06:00 PM",
      estCost: "₹550",
      status: "Planned",
      safetyScore: 92
    }
  ],

  // Safest vs Fastest Route Data
  routes: {
    originName: "Hawa Mahal Heritage Gate",
    destinationName: "Nahargarh Scenic Viewpoint",
    fastest: {
      name: "Fastest Bypass Route",
      duration: "18 min",
      distance: "6.2 km",
      safetyScore: 68,
      riskLevel: "CAUTION",
      statusText: "Includes unpatrolled mountain bypass & unlit sections",
      cctvCoverage: "42%",
      patrolFrequency: "Every 4 hours",
      reason: "Shortest transit duration, but passes through low-visibility hillside lanes without continuous lighting.",
      color: "#94a3b8",
      dashArray: "6, 6",
      coordinates: [
        [26.9239, 75.8267],
        [26.9270, 75.8230],
        [26.9320, 75.8190],
        [26.9350, 75.8160],
        [26.9380, 75.8140],
        [26.9400, 75.8160]
      ]
    },
    safest: {
      name: "Safest Heritage Corridor Route",
      duration: "22 min",
      distance: "7.8 km",
      safetyScore: 94,
      riskLevel: "LOW RISK",
      statusText: "Patrolled heritage highway with high illumination & SOS points",
      cctvCoverage: "96%",
      patrolFrequency: "Every 15 mins",
      reason: "Continuous smart high-lux street lighting, frequent police beat checks (Beat 4), and 4 operational SOS call pillars along the entire transit corridor.",
      color: "#10b981",
      dashArray: null,
      coordinates: [
        [26.9239, 75.8267],
        [26.9280, 75.8290],
        [26.9350, 75.8340],
        [26.9450, 75.8370],
        [26.9490, 75.8290],
        [26.9450, 75.8210],
        [26.9400, 75.8160]
      ]
    }
  },

  // Authority Command Center Incidents (Demo Queue)
  incidents: [
    {
      id: "INC-1042",
      priority: "HIGH PRIORITY",
      priorityClass: "high",
      touristId: "ST-8F42A1",
      touristName: "Sid",
      locationName: "Nahargarh Cliff Edge (Hazard Zone)",
      coords: [26.9395, 75.8165],
      trigger: "SOS Manual Activation",
      aiRiskScore: 91,
      breakdown: [
        { label: "Restricted Zone Breach", score: "+30" },
        { label: "SOS Manual Activation", score: "+50" },
        { label: "Unusual Path Deviation", score: "+11" }
      ],
      timestamp: "10:42 AM",
      timeAgo: "2 mins ago",
      status: "ACTIVE", // "ACTIVE" | "DISPATCHED" | "RESOLVED"
      dispatchedUnit: null,
      deviceBattery: "78%",
      contact: "+91 98765 43210"
    },
    {
      id: "INC-1039",
      priority: "MEDIUM PRIORITY",
      priorityClass: "medium",
      touristId: "ST-4B19C3",
      touristName: "Elena Rostova",
      locationName: "Tripolia Bazaars Alley 4",
      coords: [26.9230, 75.8170],
      trigger: "Safety Check-In Missed (60 min)",
      aiRiskScore: 68,
      breakdown: [
        { label: "Missed Check-In Window", score: "+40" },
        { label: "Congested Low-Visibility Area", score: "+18" },
        { label: "Battery Under 20%", score: "+10" }
      ],
      timestamp: "10:15 AM",
      timeAgo: "29 mins ago",
      status: "DISPATCHED",
      dispatchedUnit: "PCR Unit 7 (Tourist Beat)",
      deviceBattery: "19%",
      contact: "+91 98112 34567"
    },
    {
      id: "INC-1035",
      priority: "LOW PRIORITY",
      priorityClass: "low",
      touristId: "ST-9D82F7",
      touristName: "Marcus Vance",
      locationName: "Amber Fort Outer Parking",
      coords: [26.9830, 75.8510],
      trigger: "Intermittent Network Re-connect",
      aiRiskScore: 35,
      breakdown: [
        { label: "Temporary Signal Fade", score: "+25" },
        { label: "High Area Safety Score", score: "-10" },
        { label: "Check-in OK", score: "+20" }
      ],
      timestamp: "09:50 AM",
      timeAgo: "54 mins ago",
      status: "RESOLVED",
      dispatchedUnit: "Verified via SMS Alert",
      deviceBattery: "92%",
      contact: "+44 7700 900077"
    },
    {
      id: "INC-1031",
      priority: "HIGH PRIORITY",
      priorityClass: "high",
      touristId: "ST-2A71E9",
      touristName: "Chloe Dupont",
      locationName: "Amanishah Basin Border",
      coords: [26.9060, 75.7760],
      trigger: "Geofence Boundary Breach",
      aiRiskScore: 82,
      breakdown: [
        { label: "Hazard Zone Entry", score: "+45" },
        { label: "Rapid Acceleration", score: "+22" },
        { label: "Late Night Stamp", score: "+15" }
      ],
      timestamp: "09:12 AM",
      timeAgo: "1 hr 32 mins ago",
      status: "RESOLVED",
      dispatchedUnit: "Patrol Thana 2 (Officer Meena)",
      deviceBattery: "64%",
      contact: "+33 612 345678"
    }
  ],

  // Authority Overview KPIs
  metrics: {
    activeTourists: 12483,
    highRiskCount: 27,
    sosAlertsCount: 4,
    geofenceBreachesCount: 19,
    systemStatus: "Operational"
  },

  // Simulated Tourists on Live Authority Map
  liveTourists: [
    { id: "ST-8F42A1", name: "Sid", coords: [26.9239, 75.8267], risk: "LOW RISK", score: 84 },
    { id: "ST-4B19C3", name: "Elena Rostova", coords: [26.9230, 75.8170], risk: "CAUTION", score: 68 },
    { id: "ST-1102A9", name: "Rohan Verma", coords: [26.9265, 75.8240], risk: "LOW RISK", score: 94 },
    { id: "ST-7782C1", name: "Priya Nair", coords: [26.9855, 75.8513], risk: "LOW RISK", score: 91 },
    { id: "ST-9912D4", name: "Liam O'Connor", coords: [26.9395, 75.8165], risk: "HIGH RISK", score: 91 },
    { id: "ST-3342E2", name: "Kavita Rao", coords: [26.9656, 75.8458], risk: "LOW RISK", score: 89 },
    { id: "ST-5521B7", name: "Kenji Sato", coords: [26.9060, 75.7760], risk: "CAUTION", score: 62 },
  ],
  aiLanguage: "auto"
};

// Store Helper Methods with LocalStorage Cross-Tab Synchronization
const SafeTripStore = {
  getTourist() {
    return SafeTripData.tourist;
  },

  addToMyTrip(item) {
    if (!SafeTripData.myTrip) SafeTripData.myTrip = [];
    const exists = SafeTripData.myTrip.find(i => i.id === item.id || (i.title && i.title === item.title));
    if (!exists) {
      SafeTripData.myTrip.push({
        id: item.id || `trip-${Date.now()}`,
        title: item.title,
        type: item.type || "place",
        day: item.day || "Day 1",
        time: item.time || "Scheduled",
        estCost: item.estCost || item.priceEst || "Free",
        safetyScore: item.safetyScore || 90,
        status: "Planned"
      });
      this.saveState();
      SafeTripEvents.emit("mytrip:updated", SafeTripData.myTrip);
      return true;
    }
    return false;
  },

  getMyTrip() {
    return SafeTripData.myTrip || [];
  },

  removeFromMyTrip(id) {
    if (!SafeTripData.myTrip) return;
    SafeTripData.myTrip = SafeTripData.myTrip.filter(i => i.id !== id);
    this.saveState();
    SafeTripEvents.emit("mytrip:updated", SafeTripData.myTrip);
  },

  setAiLanguage(lang) {
    SafeTripData.aiLanguage = lang;
    this.saveState();
    SafeTripEvents.emit("language:changed", lang);
  },

  getAiLanguage() {
    return SafeTripData.aiLanguage || "auto";
  },

  saveState() {
    try {
      localStorage.setItem("safetrip_demo_state", JSON.stringify({
        tourist: SafeTripData.tourist,
        incidents: SafeTripData.incidents,
        metrics: SafeTripData.metrics,
        geofences: SafeTripData.geofences,
        myTrip: SafeTripData.myTrip,
        aiLanguage: SafeTripData.aiLanguage,
        lastUpdated: Date.now()
      }));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  },

  initSync() {
    const cached = localStorage.getItem("safetrip_demo_state");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.tourist) Object.assign(SafeTripData.tourist, parsed.tourist);
        if (parsed.incidents && Array.isArray(parsed.incidents)) SafeTripData.incidents = parsed.incidents;
        if (parsed.metrics) Object.assign(SafeTripData.metrics, parsed.metrics);
        if (parsed.geofences && Array.isArray(parsed.geofences)) SafeTripData.geofences = parsed.geofences;
        if (parsed.myTrip && Array.isArray(parsed.myTrip)) SafeTripData.myTrip = parsed.myTrip;
        if (parsed.aiLanguage) SafeTripData.aiLanguage = parsed.aiLanguage;
      } catch (err) {
        console.warn("State restore error:", err);
      }
    }

    // Cross-tab storage event synchronization
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("storage", (e) => {
        if (e.key === "safetrip_demo_state" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed.tourist) Object.assign(SafeTripData.tourist, parsed.tourist);
            if (parsed.incidents && Array.isArray(parsed.incidents)) SafeTripData.incidents = parsed.incidents;
            if (parsed.metrics) Object.assign(SafeTripData.metrics, parsed.metrics);
            if (parsed.geofences && Array.isArray(parsed.geofences)) SafeTripData.geofences = parsed.geofences;
            if (parsed.myTrip && Array.isArray(parsed.myTrip)) SafeTripData.myTrip = parsed.myTrip;
            if (parsed.aiLanguage) SafeTripData.aiLanguage = parsed.aiLanguage;

            SafeTripEvents.emit("state:synced", SafeTripData);
            SafeTripEvents.emit("tourist:location_changed", SafeTripData.tourist);
            SafeTripEvents.emit("tourist:risk_updated", SafeTripData.tourist);
            SafeTripEvents.emit("metrics:updated", SafeTripData.metrics);
            SafeTripEvents.emit("mytrip:updated", SafeTripData.myTrip);
          } catch (err) {
            console.error("Cross-tab sync error:", err);
          }
        }
      });
    }
  },

  updateTouristLocation(coords, zoneName, riskLevel, score, alertMsg = null) {
    SafeTripData.tourist.currentLocation.coords = coords;
    SafeTripData.tourist.currentLocation.name = zoneName;
    SafeTripData.tourist.riskLevel = riskLevel;
    SafeTripData.tourist.safetyScore = score;

    // Update live tourists list for authority view
    const sidEntry = SafeTripData.liveTourists.find(t => t.id === SafeTripData.tourist.id);
    if (sidEntry) {
      sidEntry.coords = coords;
      sidEntry.risk = riskLevel;
      sidEntry.score = score;
    }

    this.saveState();

    SafeTripEvents.emit("tourist:location_changed", {
      coords,
      zoneName,
      riskLevel,
      score,
      alertMsg
    });
  },

  setRiskLevel(riskLevel, score, factors = []) {
    SafeTripData.tourist.riskLevel = riskLevel;
    SafeTripData.tourist.safetyScore = score;
    if (factors.length) {
      SafeTripData.tourist.riskFactors = factors;
    }
    this.saveState();
    SafeTripEvents.emit("tourist:risk_updated", { riskLevel, score, factors });
  },

  triggerEmergencySOS() {
    SafeTripData.tourist.riskLevel = "EMERGENCY";
    SafeTripData.tourist.safetyScore = 15;
    SafeTripData.metrics.sosAlertsCount += 1;
    SafeTripData.metrics.highRiskCount += 1;

    // Update live tourists list
    const sidEntry = SafeTripData.liveTourists.find(t => t.id === SafeTripData.tourist.id);
    if (sidEntry) {
      sidEntry.risk = "HIGH RISK";
      sidEntry.score = 15;
    }

    const newIncident = {
      id: `INC-${Math.floor(1050 + Math.random() * 50)}`,
      priority: "CRITICAL SOS",
      priorityClass: "emergency",
      touristId: SafeTripData.tourist.id,
      touristName: SafeTripData.tourist.name, // "Sid"
      locationName: SafeTripData.tourist.currentLocation.name,
      coords: [...SafeTripData.tourist.currentLocation.coords],
      trigger: "SOS Manual Activation",
      aiRiskScore: 98,
      breakdown: [
        { label: "SOS Manual Activation", score: "+55" },
        { label: "Distress Telemetry Flag", score: "+30" },
        { label: "Live Emergency Escalation", score: "+13" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: "Just now",
      status: "ACTIVE",
      dispatchedUnit: null,
      deviceBattery: "76%",
      contact: SafeTripData.tourist.phone
    };

    SafeTripData.incidents.unshift(newIncident);
    this.saveState();

    SafeTripEvents.emit("sos:triggered", newIncident);
    SafeTripEvents.emit("metrics:updated", SafeTripData.metrics);
    return newIncident;
  },

  triggerRestrictedBreach() {
    const coords = [26.9395, 75.8165];
    const zoneName = "Nahargarh Cliff Edge (Hazard Zone)";
    
    SafeTripData.tourist.currentLocation.coords = coords;
    SafeTripData.tourist.currentLocation.name = zoneName;
    SafeTripData.tourist.riskLevel = "HIGH RISK";
    SafeTripData.tourist.safetyScore = 24;
    SafeTripData.metrics.geofenceBreachesCount += 1;

    const sidEntry = SafeTripData.liveTourists.find(t => t.id === SafeTripData.tourist.id);
    if (sidEntry) {
      sidEntry.coords = coords;
      sidEntry.risk = "HIGH RISK";
      sidEntry.score = 24;
    }

    // Add/update active geofence breach incident in command center queue
    let existingInc = SafeTripData.incidents.find(i => i.id === "INC-1042");
    if (existingInc) {
      existingInc.status = "ACTIVE";
      existingInc.trigger = "Restricted Zone Breach";
      existingInc.locationName = zoneName;
      existingInc.coords = coords;
      existingInc.timeAgo = "Just now";
    } else {
      existingInc = {
        id: "INC-1042",
        priority: "HIGH PRIORITY",
        priorityClass: "high",
        touristId: SafeTripData.tourist.id,
        touristName: SafeTripData.tourist.name,
        locationName: zoneName,
        coords: coords,
        trigger: "Restricted Zone Breach",
        aiRiskScore: 91,
        breakdown: [
          { label: "Restricted Zone Breach", score: "+45" },
          { label: "Steep Terrain Hazard", score: "+25" },
          { label: "Unusual Path Deviation", score: "+21" }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeAgo: "Just now",
        status: "ACTIVE",
        dispatchedUnit: null,
        deviceBattery: "78%",
        contact: SafeTripData.tourist.phone
      };
      SafeTripData.incidents.unshift(existingInc);
    }

    this.saveState();

    SafeTripEvents.emit("tourist:location_changed", {
      coords,
      zoneName,
      riskLevel: "HIGH RISK",
      score: 24,
      alertMsg: "⚠️ You've entered a restricted area: Nahargarh Cliff Edge"
    });
    SafeTripEvents.emit("metrics:updated", SafeTripData.metrics);
    SafeTripEvents.emit("geofence:breach", existingInc);
  },

  returnToSafeCorridor() {
    const coords = [26.9245, 75.8250];
    const zoneName = "City Palace & Hawa Mahal Heritage Zone";
    
    SafeTripData.tourist.currentLocation.coords = coords;
    SafeTripData.tourist.currentLocation.name = zoneName;
    SafeTripData.tourist.riskLevel = "LOW RISK";
    SafeTripData.tourist.safetyScore = 88;

    const sidEntry = SafeTripData.liveTourists.find(t => t.id === SafeTripData.tourist.id);
    if (sidEntry) {
      sidEntry.coords = coords;
      sidEntry.risk = "LOW RISK";
      sidEntry.score = 88;
    }

    // Resolve breach incident if present
    const existingInc = SafeTripData.incidents.find(i => i.id === "INC-1042");
    if (existingInc && existingInc.status === "ACTIVE") {
      existingInc.status = "RESOLVED";
    }

    this.saveState();

    SafeTripEvents.emit("tourist:location_changed", {
      coords,
      zoneName,
      riskLevel: "LOW RISK",
      score: 88,
      alertMsg: null
    });
    SafeTripEvents.emit("metrics:updated", SafeTripData.metrics);
  },

  triggerMissedCheckIn() {
    SafeTripData.tourist.checkInStatus = "MISSED";
    SafeTripData.tourist.riskLevel = "CAUTION";
    SafeTripData.tourist.safetyScore = 58;

    this.saveState();

    SafeTripEvents.emit("checkin:missed", {
      lastLocation: SafeTripData.tourist.currentLocation.name,
      touristId: SafeTripData.tourist.id,
      riskLevel: "MEDIUM"
    });
  },

  performCheckIn() {
    SafeTripData.tourist.checkInStatus = "ACTIVE";
    SafeTripData.tourist.checkInTimeRemainingSeconds = 30 * 60;
    SafeTripData.tourist.riskLevel = "LOW RISK";
    SafeTripData.tourist.safetyScore = 86;

    this.saveState();

    SafeTripEvents.emit("checkin:completed", {
      timestamp: new Date().toLocaleTimeString(),
      nextCheckIn: "In 30 minutes"
    });
  },

  resolveIncident(incidentId) {
    const inc = SafeTripData.incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.status = "RESOLVED";
      if (SafeTripData.metrics.sosAlertsCount > 0 && (inc.priorityClass === "emergency" || inc.priority.includes("SOS"))) {
        SafeTripData.metrics.sosAlertsCount--;
      }
      this.saveState();
      SafeTripEvents.emit("incident:resolved", inc);
      SafeTripEvents.emit("metrics:updated", SafeTripData.metrics);
    }
  },

  dispatchIncident(incidentId, unitName = "Emergency Patrol Unit 4") {
    const inc = SafeTripData.incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.status = "DISPATCHED";
      inc.dispatchedUnit = unitName;
      this.saveState();
      SafeTripEvents.emit("incident:dispatched", inc);
    }
  },

  addGeofence(zone) {
    SafeTripData.geofences.push(zone);
    this.saveState();
    SafeTripEvents.emit("geofence:added", zone);
  },

  deleteGeofence(zoneId) {
    SafeTripData.geofences = SafeTripData.geofences.filter(z => z.id !== zoneId);
    this.saveState();
    SafeTripEvents.emit("geofence:deleted", zoneId);
  }
};

// ============================================================================
// SAFETRIP EXPLORE: EDITORIAL DISCOVERY DATA ARCHITECTURE
// ============================================================================
const SafeTripExplore = {
  categories: [
    {
      id: "destinations",
      name: "DESTINATIONS",
      shortLabel: "Destinations",
      badge: "Royal Heritage",
      subtitle: "Royal heritage cities, hill fortresses & iconic architectural marvels",
      icon: "🏛️"
    },
    {
      id: "experiences",
      name: "EXPERIENCES",
      shortLabel: "Experiences",
      badge: "Authentic & Living",
      subtitle: "Hands-on artisan workshops, heritage walks & acoustic folk nights",
      icon: "🎨"
    },
    {
      id: "stays",
      name: "STAYS",
      shortLabel: "Stays",
      badge: "Verified Safe",
      subtitle: "Heritage havelis, boutique garden rooms & verified backpacker hostels",
      icon: "🏨"
    },
    {
      id: "food",
      name: "FOOD & CULTURE",
      shortLabel: "Food & Culture",
      badge: "Century-Old Flavors",
      subtitle: "Royal thalis, sizzling street cauldron snacks & authentic sweet houses",
      icon: "🍲"
    },
    {
      id: "hidden-gems",
      name: "HIDDEN GEMS",
      shortLabel: "Hidden Gems",
      badge: "Beyond Tourist Trails",
      subtitle: "Ancient geometric stepwells, mountain spring kunds & quiet royal gardens",
      icon: "💎"
    }
  ],

  destinations: [
    {
      id: "jaipur",
      name: "Jaipur",
      title: "Jaipur — The Pink City",
      tagline: "Royal Palaces, Living Crafts & UNESCO Saffron Corridors",
      state: "Rajasthan",
      region: "Northern Rajasthan",
      heroImage: "https://images.unsplash.com/photo-1609948549021-95be246dbece?w=1600&auto=format&fit=crop&q=85",
      gallery: [
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1603288967262-6e2717904094?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80"
      ],
      safetyScore: 92,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      safeHours: "07:00 AM – 10:00 PM",
      policePost: "Tourist Police Beat 4 (Hawa Mahal, 120m)",
      idealDuration: "3 – 4 Days",
      estimatedBudget: "₹2,500 – ₹5,500 / day",
      bestTime: "October to March (Pleasant 18°C – 26°C)",
      accessibility: "Paved heritage corridors, battery golf carts at major monuments",
      description: "Founded in 1727 by astronomer-king Maharaja Sawai Jai Singh II, Jaipur is India's first planned city, arranged according to Vedic Vastu Shastra into 9 precision rectangular sectors. Famed for its terracotta-pink facade, majestic hill fortresses, bustling spice bazaars, and living royal traditions.",
      famousFor: [
        "Palace of Winds (Hawa Mahal) with 953 honeycomb windows",
        "Amer Fort's Sheesh Mahal inlaid with thousands of Belgian mirrors",
        "World's largest stone sundial at UNESCO Jantar Mantar",
        "Living artisan guilds: Sanganeri block printing & blue pottery",
        "Centuries-old jewelry, gemstone cutting & vibrant Johari Bazaar"
      ],
      dontMiss: [
        {
          title: "Amber Fort & Sheesh Mahal at Golden Hour",
          category: "Heritage Wonder",
          duration: "3 Hours",
          budget: "₹100 (Indian) / ₹500 (Foreign)",
          description: "Ascend the Sun Gate as morning light sets the Rajput-Mughal ramparts aglow. Step inside the Mirror Palace where a single candle flame illuminates the entire chamber through convex mirror mosaics.",
          insiderTip: "Arrive at 8:30 AM before tourist buses arrive. Walk down through the cobblestone Suraj Pol ramps."
        },
        {
          title: "Old Walled City Evening Culinary Trail",
          category: "Food & Senses",
          duration: "2 Hours",
          budget: "₹250 – ₹450 / person",
          description: "Wind through Johari and Bapu Bazaars. Taste piping-hot pyaaz kachori straight from bubbling copper cauldrons at Rawat, followed by saffron malai ghewar at LMB and thick kulhad lassi at Lassiwala.",
          insiderTip: "Johari Bazaar is beat-patrolled and well-lit until 9:30 PM. Look for Lassiwala Shop 312."
        },
        {
          title: "City Palace & The 4 Seasons Courtyard",
          category: "Living Royalty",
          duration: "2 Hours",
          budget: "₹300 (Museum pass)",
          description: "Explore the inner royal Pritam Niwas Chowk. Its four gates, representing four seasons and Hindu deities, feature Peacock mosaic carvings crafted from thousands of glass and stone tesserae.",
          insiderTip: "Hire a licensed tourism guide at the ticket desk to access private royal wing anecdotes."
        },
        {
          title: "Jal Mahal Promenade Sunset",
          category: "Scenic & Photography",
          duration: "1 Hour",
          budget: "Free Public Promenade",
          description: "Watch the submerged 5-story palace reflect across Man Sagar Lake while folk artists play traditional ravanahatha violins along the paved waterfront promenade.",
          insiderTip: "Police motorcycle units patrol every 200 meters. Great spot for evening chai and photography."
        }
      ],
      experiences: [
        "exp-blue-pottery",
        "exp-block-print",
        "exp-food-walk",
        "exp-folk-evening",
        "exp-nahargarh-sunset"
      ],
      places: [
        "hawa-mahal",
        "amber-fort",
        "city-palace",
        "jantar-mantar",
        "jal-mahal",
        "nahargarh",
        "albert-hall",
        "patrika-gate"
      ],
      foodHighlights: [
        "Dal Baati Churma (LMB)",
        "Pyaaz Kachori (Rawat)",
        "Malai Ghewar (Johari Bazaar)",
        "Kulhad Lassi (MI Road)"
      ]
    },
    {
      id: "udaipur",
      name: "Udaipur",
      title: "Udaipur — City of Lakes",
      tagline: "Marble Palaces, Serene Waters & Mewari Romance",
      state: "Rajasthan",
      region: "Southern Rajasthan",
      heroImage: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1600&auto=format&fit=crop&q=85",
      gallery: [
        "https://images.unsplash.com/photo-1588661799786-9a29e27c1d73?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=900&auto=format&fit=crop&q=80"
      ],
      safetyScore: 95,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      safeHours: "06:30 AM – 10:30 PM",
      policePost: "Surajpole Tourist Police Post (Lake Pichola)",
      idealDuration: "2 – 3 Days",
      estimatedBudget: "₹3,000 – ₹7,000 / day",
      bestTime: "September to March",
      accessibility: "Lakeside ghats have steps; battery ferries operate for water transit",
      description: "Surrounded by the ancient Aravalli Range and mirrored in five interconnected freshwater lakes, Udaipur is the romantic jewel of Mewar. Characterized by whitewashed waterfront mansions, marble courtyards, and tranquil sunset waters.",
      famousFor: [
        "Lake Pichola and the floating white marble Taj Lake Palace",
        "Rajasthan's largest royal palace complex: Udaipur City Palace",
        "Dharohar folk dance performances at 138-room Bagore Ki Haveli",
        "Intricate Mewari miniature paintings and leather diaries",
        "Sunset boat cruises around Jag Mandir island palace"
      ],
      dontMiss: [
        {
          title: "Lake Pichola Sunset Boat Cruise",
          category: "Scenic Wonder",
          duration: "1.5 Hours",
          budget: "₹450 – ₹800",
          description: "Drift past royal bathing ghats, whitewashed havelis, and the marble water palace as the evening sun dips behind the verdant hills.",
          insiderTip: "Board from the City Palace jetty at 5:00 PM for optimal sunset lighting."
        },
        {
          title: "Bagore Ki Haveli Evening Dharohar Dance",
          category: "Folk Performance",
          duration: "1.5 Hours",
          budget: "₹100 (Indian) / ₹150 (Foreign)",
          description: "Experience 70 minutes of authentic Rajasthani folk music, puppet theater, and the jaw-dropping 9-brass-pot head balancing dance in an open lakeside courtyard.",
          insiderTip: "Courtyard seating fills quickly; queue by 6:15 PM for front floor cushions."
        },
        {
          title: "Udaipur City Palace Museum & Balconies",
          category: "Heritage Wonder",
          duration: "2.5 Hours",
          budget: "₹350 (Entry pass)",
          description: "Wander through centuries of royal Mewar chambers, including the famous Mor Chowk adorned with vibrant glass peacocks and panoramic lake vistas.",
          insiderTip: "Hire a registered government guide at Badi Pol to hear the tale of Maharana Pratap."
        }
      ],
      experiences: [
        "exp-food-walk",
        "exp-folk-evening"
      ],
      places: ["city-palace", "jal-mahal"],
      foodHighlights: [
        "Mewari Dal Baati",
        "Gatta Curry",
        "Kachori at Jagdish Chowk"
      ]
    },
    {
      id: "jodhpur",
      name: "Jodhpur",
      title: "Jodhpur — The Blue City",
      tagline: "Indigo Alleys, Desert Sunshine & Mighty Mehrangarh",
      state: "Rajasthan",
      region: "Western Rajasthan",
      heroImage: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1600&auto=format&fit=crop&q=85",
      gallery: [
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=900&auto=format&fit=crop&q=80"
      ],
      safetyScore: 91,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      safeHours: "07:00 AM – 09:30 PM",
      policePost: "Sardar Market Clock Tower Police Post",
      idealDuration: "2 Days",
      estimatedBudget: "₹2,000 – ₹5,000 / day",
      bestTime: "October to March",
      accessibility: "Paved fort ramps with modern elevator option; narrow alleys best on foot",
      description: "Rising dramatically above the Thar desert sands, Jodhpur is dominated by the colossal 15th-century Mehrangarh Fort. Beneath the citadel lies a dense sea of Brahmin houses painted vivid indigo blue to deflect the desert heat.",
      famousFor: [
        "Colossal Mehrangarh Fort towering 400 feet above the city",
        "Labyrinthine indigo blue houses of Brahmapuri and Navchokiya",
        "Restored 18th-century carved sandstone stepwell Toorji Ka Jhalra",
        "Saffron-infused Makhaniya Lassi at the historic Clock Tower",
        "Handcrafted Jodhpuri mojari shoes and brass spice mortars"
      ],
      dontMiss: [
        {
          title: "Mehrangarh Fort Ramparts & Flying Fox",
          category: "Fortress Explorer",
          duration: "3 Hours",
          budget: "₹200 (Fort) / ₹1,600 (Zipline)",
          description: "Explore royal howdahs, gold palanquins, and cannon-lined battlements that look down upon the striking blue city.",
          insiderTip: "Take the internal elevator to the top gallery and walk down through the 7 victory gates."
        },
        {
          title: "Brahmapuri Blue City Guided Photo Walk",
          category: "Heritage Trail",
          duration: "2 Hours",
          budget: "Free (or ₹400 guided)",
          description: "Meander narrow stone lanes where women prepare sun-dried papads and doors are framed by hand-painted Lord Ganesha crests.",
          insiderTip: "Early morning 7:00 AM offers the purest soft sunlight and quietest alleys."
        },
        {
          title: "Toorji Ka Jhalra Stepwell Cafe Rest",
          category: "Architectural Marvel",
          duration: "1 Hour",
          budget: "₹150 – ₹300",
          description: "Admire geometric 1740s sandstone carving at this restored royal stepwell while sipping cold brew at Stepwell Cafe.",
          insiderTip: "Watch local youths dive into the deep emerald water from high stone ledges in the afternoon."
        }
      ],
      experiences: [
        "exp-heritage-walk",
        "exp-food-walk"
      ],
      places: ["amber-fort", "hawa-mahal"],
      foodHighlights: [
        "Makhaniya Lassi",
        "Mirchi Bada",
        "Mawa Kachori",
        "Shahi Samosa"
      ]
    },
    {
      id: "jaisalmer",
      name: "Jaisalmer",
      title: "Jaisalmer — The Golden City",
      tagline: "Living Sandstone Citadel, Thar Dunes & Starlit Nights",
      state: "Rajasthan",
      region: "Thar Desert, Western Rajasthan",
      heroImage: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1600&auto=format&fit=crop&q=85",
      gallery: [
        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=900&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900&auto=format&fit=crop&q=80"
      ],
      safetyScore: 89,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      safeHours: "07:00 AM – 10:00 PM",
      policePost: "Sonar Qila Main Gate Police Assistance Booth",
      idealDuration: "2 – 3 Days",
      estimatedBudget: "₹2,500 – ₹6,000 / day",
      bestTime: "November to February",
      accessibility: "Stone cobbled fort ramps; desert dunes require 4x4 or camel transit",
      description: "Rising out of the yellow sand dunes of the great Thar Desert like a mirage, Jaisalmer is constructed entirely of honey-gold sandstone. Inside its 12th-century living fort, life continues unchanged with generations living inside its ancient bastions.",
      famousFor: [
        "Sonar Qila (Golden Fort): One of the world's only fully inhabited forts",
        "Intricate filigree stone lattice balconies at Patwon Ki Haveli",
        "Sunset camel safaris and overnight desert camping in Sam Dunes",
        "Seven interconnected 15th-century yellow marble Jain temples",
        "Desert folk ballads sung by Manganiyar musicians around campfires"
      ],
      dontMiss: [
        {
          title: "Living Fort Bastions & Jain Temples Walk",
          category: "Living History",
          duration: "3 Hours",
          budget: "Free Fort / ₹100 Temple Pass",
          description: "Wind through 800-year-old bastions inhabited by 3,000 residents. Discover yellow marble temples carved with celestial nymphs.",
          insiderTip: "Jain temples allow visitors from 7:00 AM to 12:00 PM only. Remove leather accessories."
        },
        {
          title: "Sam Sand Dunes Sunset Camel Safari",
          category: "Desert Expedition",
          duration: "3 Hours",
          budget: "₹800 – ₹1,800 (Camp included)",
          description: "Trek into undulating golden sand ripples on camelback as the sky transforms into violet and orange. Enjoy live Kalbelia dance.",
          insiderTip: "Book through verified tourist police registered camp operators only."
        },
        {
          title: "Patwon Ki Haveli Carved Stone Jaalis",
          category: "Artisan Architecture",
          duration: "1.5 Hours",
          budget: "₹100 (Indian) / ₹250 (Foreign)",
          description: "Marvel at 60 intricate carved balconies crafted by five brocade-merchant brothers over a span of 55 years.",
          insiderTip: "The 3rd haveli houses the most authentic intact period bedroom furnishings."
        }
      ],
      experiences: [
        "exp-desert-safari",
        "exp-folk-evening"
      ],
      places: ["amber-fort"],
      foodHighlights: [
        "Ker Sangri with Bajra Roti",
        "Gatte ki Sabzi",
        "Ghotua Ladoo"
      ]
    },
    {
      id: "pushkar",
      name: "Pushkar",
      title: "Pushkar — Sacred Lake Oasis",
      tagline: "52 Holy Bathing Ghats, Lord Brahma Shrine & Rose Valleys",
      state: "Rajasthan",
      region: "Central Rajasthan",
      heroImage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&auto=format&fit=crop&q=85",
      gallery: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=80"
      ],
      safetyScore: 93,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      safeHours: "06:00 AM – 09:30 PM",
      policePost: "Brahma Temple Chowk Police Help Post",
      idealDuration: "1 – 2 Days",
      estimatedBudget: "₹1,500 – ₹3,500 / day",
      bestTime: "October to March (Pushkar Fair in November)",
      accessibility: "Pedestrianized market ring, steps down to water ghats",
      description: "Nestled around a sacred desert lake believed to have formed when Lord Brahma dropped a lotus petal, Pushkar is one of India's oldest and holiest pilgrimage sites. Known for its tranquil bathing ghats, incense-scented alleys, and world-famous camel fair.",
      famousFor: [
        "The world's most famous 14th-century temple dedicated to Lord Brahma",
        "Pushkar Sarovar surrounded by 52 white stone bathing ghats",
        "Annual International Pushkar Camel & Cultural Fair",
        "Famous desert rose water, gulkand, and essential rose oils",
        "Chill rooftop cafes blending Rajasthani thalis with Mediterranean falafels"
      ],
      dontMiss: [
        {
          title: "Sunrise Prayers at Varaha Ghat",
          category: "Spiritual Harmony",
          duration: "1 Hour",
          budget: "Free",
          description: "Listen to temple bells and Vedic hymns echo across the calm water as morning sunlight turns the white ghats pink.",
          insiderTip: "Remove shoes before walking on the ghat steps. Politely decline unsolicited flower blessings."
        },
        {
          title: "Savitri Temple Hilltop Sunset Hike",
          category: "Panoramic Vista",
          duration: "2 Hours",
          budget: "Free (₹150 ropeway)",
          description: "Climb 1,000 stone steps or ride the aerial ropeway up Ratnagiri Hill for sweeping views of the entire desert basin.",
          insiderTip: "Take the cable car up before 5:00 PM and walk down as the lights flicker on across the town."
        }
      ],
      experiences: [
        "exp-food-walk",
        "exp-folk-evening"
      ],
      places: ["jantar-mantar"],
      foodHighlights: [
        "Rabdi Malpua",
        "Pushkar Scented Falafel",
        "Kachori with Sweet Tamarind"
      ]
    },
    {
      id: "mount-abu",
      name: "Mount Abu",
      title: "Mount Abu — Aravalli Hill Haven",
      tagline: "Parchment-Thin Dilwara Marble, Pine Mists & Sunset Lakes",
      state: "Rajasthan",
      region: "Sirohi, Southern Rajasthan",
      heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=85",
      gallery: [
        "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=900&auto=format&fit=crop&q=80"
      ],
      safetyScore: 94,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      safeHours: "07:00 AM – 09:00 PM",
      policePost: "Nakki Lake Police Assistance Desk",
      idealDuration: "2 Days",
      estimatedBudget: "₹2,500 – ₹5,500 / day",
      bestTime: "Year-Round (Pleasant alpine climate)",
      accessibility: "Wide paved walkways along Nakki Lake; hill viewpoints have paths",
      description: "The sole hill station in Rajasthan, Mount Abu is perched at 1,220 meters on a granite plateau. Surrounded by wildlife sanctuaries and pine groves, it is world-renowned for the Dilwara Temples, widely recognized as the pinnacle of marble craftsmanship in human history.",
      famousFor: [
        "Dilwara Jain Temples featuring stone carved so thin it is translucent",
        "Serene Nakki Lake and the legendary Toad Rock formation",
        "Guru Shikhar: The highest mountain summit in the Aravalli range (1,722m)",
        "Pleasant alpine breeze offering refuge from the Thar desert heat",
        "Panoramic sunset points overlooking rugged green valleys"
      ],
      dontMiss: [
        {
          title: "Dilwara Temples Translucent Marble Ceilings",
          category: "Sculptural Wonder",
          duration: "2 Hours",
          budget: "Free Entry",
          description: "Admire 11th-century marble pendant ceilings carved like hanging chandeliers with gossamer stone petals that seem weightless.",
          insiderTip: "Open to tourists from 12:00 PM to 5:00 PM. Strictly no photography or leather allowed inside."
        },
        {
          title: "Nakki Lake Evening Paddle & Promenade",
          category: "Alpine Relaxation",
          duration: "1.5 Hours",
          budget: "₹200 – ₹400 (Boat)",
          description: "Paddle across calm mountain waters flanked by towering rock formations and colonial pine-shaded cottages.",
          insiderTip: "Carry a light cardigan for cool evening mountain breezes."
        }
      ],
      experiences: [
        "exp-heritage-walk"
      ],
      places: ["albert-hall"],
      foodHighlights: [
        "Rajasthani Gatta Khichdi",
        "Fresh Fruit Shakes",
        "Hot Jalebi Rabdi"
      ]
    }
  ],

  experiences: [
    {
      id: "exp-blue-pottery",
      title: "Blue Pottery Masterclass with 4th-Gen Master",
      category: "Artisan Workshop",
      destinationId: "jaipur",
      location: "Sanganer Heritage Enclave, Jaipur",
      duration: "2 Hours",
      priceEst: "₹850 / person",
      priceNum: 850,
      safetyScore: 94,
      statusClass: "safe",
      recommendedTime: "10:30 AM – 12:30 PM",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&auto=format&fit=crop&q=80",
      description: "Learn authentic cobalt-glaze ceramic molding and hand-painting directly from master artisans in their historic sunlit courtyard studio.",
      whyRecommended: "Verified artisan guild partner, well-ventilated heritage studio, safe daytime activity with finished ceramic souvenir to take home.",
      tags: ["Hands-on Craft", "Family Friendly", "Take Home Ceramic"],
      suitableFor: "Couples, Families, Solo Creatives"
    },
    {
      id: "exp-block-print",
      title: "Bagru Natural Dye Woodblock Printing",
      category: "Textile Heritage",
      destinationId: "jaipur",
      location: "Bagru Artisan Hamlet, Jaipur",
      duration: "2.5 Hours",
      priceEst: "₹700 / person",
      priceNum: 700,
      safetyScore: 88,
      statusClass: "safe",
      recommendedTime: "09:30 AM – 12:00 PM",
      image: "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=900&auto=format&fit=crop&q=80",
      description: "Carve teakwood stamps and hand-print organic cotton scarves using 300-year-old Dabu mud resist and vegetable indigo vat dyes.",
      whyRecommended: "Sustainable village cooperative, verified Rajasthan Tourism craft partner, guided by local master printers.",
      tags: ["Eco-friendly", "Textile Art", "Organic Cotton"],
      suitableFor: "Craft Lovers, Sustainable Travelers"
    },
    {
      id: "exp-food-walk",
      title: "Old Walled City Evening Culinary Trail",
      category: "Culinary Heritage",
      destinationId: "jaipur",
      location: "Johari & Bapu Bazaars, Jaipur",
      duration: "1.5 Hours",
      priceEst: "₹550 / person",
      priceNum: 550,
      safetyScore: 92,
      statusClass: "safe",
      recommendedTime: "06:00 PM – 07:30 PM",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&auto=format&fit=crop&q=80",
      description: "Taste 6 verified century-old recipes: crisp pyaaz kachori, saffron kulhad lassi, hot malai ghewar, and spiced kanji wada along illuminated lanes.",
      whyRecommended: "Led by certified local food historians, stays along high-illumination beat-patrolled tourist corridors.",
      tags: ["Foodie", "Walking Tour", "Hygienic Verified"],
      suitableFor: "Foodies, Couples, Small Groups"
    },
    {
      id: "exp-folk-evening",
      title: "Rajasthani Folk Ragas & Kathputli Evening",
      category: "Acoustic Folk Performance",
      destinationId: "jaipur",
      location: "Old City Haveli Courtyard, Jaipur",
      duration: "2 Hours",
      priceEst: "₹650 / person",
      priceNum: 650,
      safetyScore: 95,
      statusClass: "safe",
      recommendedTime: "07:00 PM – 09:00 PM",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&auto=format&fit=crop&q=80",
      description: "Intimate acoustic recital of ancient Manganiyar desert melodies paired with colorful wooden Kathputli string-puppet folklore.",
      whyRecommended: "Private heritage courtyard, seated comfort with herbal tea, highly accessible for seniors and children.",
      tags: ["Folk Music", "Senior Friendly", "Cultural Storytelling"],
      suitableFor: "All Ages, Families, Seniors"
    },
    {
      id: "exp-nahargarh-sunset",
      title: "Nahargarh Ridge Golden Hour Photo Walk",
      category: "Scenic & Photography",
      destinationId: "jaipur",
      location: "Nahargarh Fort Ridge, Jaipur",
      duration: "2 Hours",
      priceEst: "₹450 / person",
      priceNum: 450,
      safetyScore: 78,
      statusClass: "caution",
      recommendedTime: "04:30 PM – 06:30 PM",
      image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=900&auto=format&fit=crop&q=80",
      description: "Sweeping panoramic vistas over the Pink City from high Aravalli ramparts as the setting sun turns the palace stone amber.",
      whyRecommended: "Guided group transit with early 6:45 PM departure before dark to avoid unlit hill curves.",
      tags: ["Sunset View", "Photography", "Daylight Guided"],
      suitableFor: "Photographers, Adventure Travelers"
    },
    {
      id: "exp-desert-safari",
      title: "Thar Desert Sunset Dune & Stargazing Safari",
      category: "Desert Expedition",
      destinationId: "jaisalmer",
      location: "Sam Sand Dunes, Jaisalmer",
      duration: "3.5 Hours",
      priceEst: "₹1,200 / person",
      priceNum: 1200,
      safetyScore: 89,
      statusClass: "safe",
      recommendedTime: "04:00 PM – 07:30 PM",
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=900&auto=format&fit=crop&q=80",
      description: "Ride camels into the deep undulating golden dunes, sip campfire cardamom chai, and watch constellations rise in pristine desert skies.",
      whyRecommended: "Verified Rajasthan Tourism eco-camp operator, equipped with satellite phone and licensed local guides.",
      tags: ["Dune Safari", "Stargazing", "Campfire"],
      suitableFor: "Couples, Adventurers, Families"
    },
    {
      id: "exp-heritage-walk",
      title: "1727 UNESCO Planned City Architecture Walk",
      category: "Architecture & History",
      destinationId: "jaipur",
      location: "Chandpole to Badi Choupad, Jaipur",
      duration: "2 Hours",
      priceEst: "₹500 / person",
      priceNum: 500,
      safetyScore: 96,
      statusClass: "safe",
      recommendedTime: "08:00 AM – 10:00 AM",
      image: "https://images.unsplash.com/photo-1603288967262-6e2717904094?w=900&auto=format&fit=crop&q=80",
      description: "Unravel the geometric genius of Jai Singh II's 18th-century street grid, hidden royal water harvesters, and carved temple shikharas.",
      whyRecommended: "Morning pedestrian walk, zero traffic in early hours, accompanied by certified heritage architect.",
      tags: ["UNESCO World Heritage", "Architectural Genius", "Morning Walk"],
      suitableFor: "Architects, Historians, Curious Travelers"
    }
  ],

  stays: [
    {
      id: "stay-alsisar",
      name: "Alsisar Haveli — Royal Heritage Courtyard",
      type: "Heritage Boutique Palace",
      destinationId: "jaipur",
      location: "Sansar Chandra Road, Jaipur (800m from Old City)",
      priceNight: "₹5,500 / night",
      priceNum: 5500,
      rating: "4.9 / 5.0",
      safetyScore: 96,
      statusClass: "safe",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop&q=80",
      description: "Restored 1892 Rajput noble palace with sunken swimming pool, hand-painted frescoed ceilings, and lush courtyard arbors.",
      whyRecommended: "24/7 private security detail, verified SafeTrip zone, quiet gated residential cul-de-sac.",
      features: ["Swimming Pool", "Heritage Dining", "24/7 Security", "Free High-Speed WiFi"],
      cancellation: "Free cancellation up to 48 hrs before arrival"
    },
    {
      id: "stay-zostel",
      name: "Zostel Jaipur Heritage Hostel & Private Suites",
      type: "Backpacker & Solo Traveler Hub",
      destinationId: "jaipur",
      location: "400m from Hawa Mahal, Badi Choupad",
      priceNight: "₹750 (Dorm) / ₹2,200 (Private Room)",
      priceNum: 750,
      rating: "4.8 / 5.0",
      safetyScore: 94,
      statusClass: "safe",
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80",
      description: "Vibrant community hostel set inside a restored heritage building with rooftop cafe looking out toward Nahargarh fort.",
      whyRecommended: "Biometric keycard security, women-only dorm options, 120m from Tourist Police Beat 4 post.",
      features: ["Female Dorms", "Rooftop Cafe", "Community Events", "Keycard Lockers"],
      cancellation: "Flexible cancellation (Demo)"
    },
    {
      id: "stay-arya-niwas",
      name: "Hotel Arya Niwas — Eco Heritage & Garden Retreat",
      type: "Family & Senior Boutique Stay",
      destinationId: "jaipur",
      location: "Sansar Chandra Road, Jaipur",
      priceNight: "₹2,400 / night",
      priceNum: 2400,
      rating: "4.7 / 5.0",
      safetyScore: 95,
      statusClass: "safe",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&auto=format&fit=crop&q=80",
      description: "Tranquil eco-friendly mansion with sprawling organic gardens, solar water heaters, and farm-fresh vegetarian kitchen.",
      whyRecommended: "Level ground access, high elderly rating, hospital 1.5 km away with direct taxi dispatch.",
      features: ["Organic Garden", "Pure Veg Kitchen", "Wheelchair Ramps", "Library"],
      cancellation: "Free cancellation (Demo)"
    },
    {
      id: "stay-khas-bagh",
      name: "Khas Bagh — Foothill Equestrian Farm Retreat",
      type: "Luxury Nature Farmstay",
      destinationId: "jaipur",
      location: "Amer Foothills, Jaipur Outer",
      priceNight: "₹6,200 / night",
      priceNum: 6200,
      rating: "4.9 / 5.0",
      safetyScore: 92,
      statusClass: "safe",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&auto=format&fit=crop&q=80",
      description: "Boutique equestrian manor surrounded by Aravalli hill greenery, offering polo pony riding, stone verandas, and organic dining.",
      whyRecommended: "Gated estate, verified private drivers, clean air away from city center.",
      features: ["Horse Riding", "Stone Pool", "Organic Farm Food", "Fireplace"],
      cancellation: "Free cancellation up to 72 hrs"
    }
  ],

  hiddenGems: [
    {
      id: "gem-panna-meena",
      name: "Panna Meena Ka Kund",
      destinationId: "jaipur",
      category: "Architectural Stepwell",
      tagline: "16th-Century Symmetrical Geometric Marvel",
      location: "Near Amer Fort, Amer, Jaipur",
      safetyScore: 93,
      statusClass: "safe",
      bestTime: "Early morning (07:30 AM – 09:00 AM) for dramatic shadow geometry",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&auto=format&fit=crop&q=80",
      description: "An ancient 16th-century stepped water reservoir designed so that nobody could use the same stairs to climb down and up twice. Its crisscrossing yellow sandstone flights create mesmerizing optical illusions.",
      whySpecial: "Just 10 minutes from crowded Amer Fort yet overlooked by 90% of tour coaches. Completely quiet and peaceful in the morning.",
      practicalTip: "Admission is free. Keep clear of the water edge railings; guard on duty."
    },
    {
      id: "gem-galta-ji",
      name: "Galta Ji (The Sacred Monkey Temple)",
      destinationId: "jaipur",
      category: "Sacred Mountain Spring",
      tagline: "Sacred Kunds in an Aravalli Mountain Gorge",
      location: "10 km East of Jaipur (Sun Temple Pass)",
      safetyScore: 82,
      statusClass: "caution",
      bestTime: "Late afternoon 04:00 PM – 05:30 PM for sunset over city",
      image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=900&auto=format&fit=crop&q=80",
      description: "A series of historic 18th-century pink pavilions nestled deep in a mountain crevasse, fed by a continuous natural mountain spring that cascades through seven sacred water tanks.",
      whySpecial: "Home to playful rhesus macaque troops and serene temple sadhus. The upper Sun Temple affords one of the best views of Jaipur.",
      practicalTip: "Avoid holding open food or drink containers near the monkeys. Visit with a companion during daylight hours."
    },
    {
      id: "gem-sisodia-bagh",
      name: "Sisodia Rani Ka Bagh",
      destinationId: "jaipur",
      category: "Terraced Royal Garden",
      tagline: "Tiered Water Fountains & Radha-Krishna Murals",
      location: "Jaipur-Agra Highway, Ghat Ki Guni",
      safetyScore: 92,
      statusClass: "safe",
      bestTime: "Morning 09:00 AM – 11:00 AM or late afternoon",
      image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=900&auto=format&fit=crop&q=80",
      description: "Built in 1728 by Maharaja Sawai Jai Singh II for his beloved queen from Udaipur, this terraced garden features multi-level water fountains, aromatic flowering shrubs, and painted pavilions depicting the love of Radha and Krishna.",
      whySpecial: "A lush, cool sanctuary of silence just 6 km from the old city walls with almost zero crowds.",
      practicalTip: "Ticket is ₹50 (Indian) / ₹200 (Foreign). Excellent spot for peaceful reading or photography."
    },
    {
      id: "gem-chand-baori",
      name: "Chand Baori (Abhaneri)",
      destinationId: "jaipur",
      category: "Deepest Ancient Stepwell",
      tagline: "3,500 Precision Steps Descending 13 Stories",
      location: "Abhaneri Village (95 km from Jaipur, easy day trip)",
      safetyScore: 90,
      statusClass: "safe",
      bestTime: "Morning 09:30 AM – 11:30 AM",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80",
      description: "Constructed in the 8th century by King Chanda of the Nikumbha Dynasty, Chand Baori is one of the deepest and largest stepwells on earth with 3,500 narrow steps arranged in perfect mathematical symmetry.",
      whySpecial: "A breathtaking engineering marvel that keeps the water 5–6 degrees cooler than ambient desert heat.",
      practicalTip: "Pair with a visit to the adjacent carved Harshat Mata Temple."
    },
    {
      id: "gem-amer-sagar",
      name: "Amer Sagar Lake Ruins",
      destinationId: "jaipur",
      category: "Hidden Hill Reservoir",
      tagline: "17th-Century Stepped Masonry in Secluded Hills",
      location: "Behind Kheri Gate, Amer Foothills",
      safetyScore: 85,
      statusClass: "safe",
      bestTime: "Post-monsoon (September – December) when water levels are high",
      image: "https://images.unsplash.com/photo-1588661799786-9a29e27c1d73?w=900&auto=format&fit=crop&q=80",
      description: "A forgotten 17th-century stepped stone masonry reservoir tucked away in the rugged hills behind Amer Fort, originally built to supply water to the royal armies.",
      whySpecial: "A secluded tranquil spot visited almost exclusively by local peacocks and migratory birds.",
      practicalTip: "Wear sturdy shoes as the approach trail is rocky."
    }
  ],

  // Utility Getters
  getDestinationById(id) {
    return this.destinations.find(d => d.id === id) || this.destinations[0];
  },

  getExperienceById(id) {
    return this.experiences.find(e => e.id === id);
  },

  getStayById(id) {
    return this.stays.find(s => s.id === id);
  },

  getGemById(id) {
    return this.hiddenGems.find(g => g.id === id);
  }
};

// Initialize synchronization
SafeTripStore.initSync();

// Export to window for vanilla JS modularity
window.SafeTripData = SafeTripData;
window.SafeTripStore = SafeTripStore;
window.SafeTripEvents = SafeTripEvents;
window.SafeTripExplore = SafeTripExplore;
window.getDestinationFallbackSvg = getDestinationFallbackSvg;
