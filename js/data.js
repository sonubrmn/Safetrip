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
  destinations: [
    {
      id: "amber-fort",
      name: "Amber Fort",
      location: "Amer, Jaipur",
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80",
      safetyScore: 91,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "8.4 km",
      highlight: "Continuous tourist police presence & active illumination",
      crowdDensity: "Moderate",
      safeHours: "08:00 AM – 06:30 PM",
      features: ["Active Guard Patrols", "Emergency Call Boxes", "First Aid Post"]
    },
    {
      id: "city-palace",
      name: "City Palace",
      location: "Old City, Jaipur",
      image: "https://images.unsplash.com/photo-1603288967262-6e2717904094?w=800&auto=format&fit=crop&q=80",
      safetyScore: 86,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "1.2 km",
      highlight: "High security perimeter & verified guide registration",
      crowdDensity: "High",
      safeHours: "09:00 AM – 07:00 PM",
      features: ["Smart CCTV Coverage", "Official Guides Only", "Pedestrian Zone"]
    },
    {
      id: "hawa-mahal",
      name: "Hawa Mahal",
      location: "Badi Choupad, Jaipur",
      image: "https://images.unsplash.com/photo-1609948549021-95be246dbece?w=800&auto=format&fit=crop&q=80",
      safetyScore: 93,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "0.4 km",
      highlight: "Surrounded by heritage police posts & dense foot traffic",
      crowdDensity: "Very High",
      safeHours: "09:00 AM – 08:00 PM",
      features: ["120m to Police Post", "High Ambient Lighting", "Zero-Tolerance Zone"]
    },
    {
      id: "jal-mahal",
      name: "Jal Mahal",
      location: "Man Sagar Lake, Jaipur",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80",
      safetyScore: 89,
      riskLevel: "LOW RISK",
      statusClass: "safe",
      distance: "5.1 km",
      highlight: "Waterfront promenade with regular motorcycle patrol",
      crowdDensity: "Moderate",
      safeHours: "06:00 AM – 09:00 PM",
      features: ["Lake Safety Barriers", "Quick Highway Access", "Patrol Unit"]
    },
    {
      id: "nahargarh",
      name: "Nahargarh Fort",
      location: "Aravalli Hills, Jaipur",
      image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&auto=format&fit=crop&q=80",
      safetyScore: 61,
      riskLevel: "CAUTION",
      statusClass: "caution",
      distance: "4.5 km",
      highlight: "Isolated mountain ridge; caution advised after sunset",
      crowdDensity: "Low to Moderate",
      safeHours: "10:00 AM – 05:30 PM",
      features: ["Ridge Warnings", "Limited Cell Coverage", "Recommend Daytime Only"]
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
    { id: "ST-8840F9", name: "Ananya Deshmukh", coords: [26.9200, 75.8210], risk: "LOW RISK", score: 88 }
  ]
};

// Store Helper Methods with LocalStorage Cross-Tab Synchronization
const SafeTripStore = {
  getTourist() {
    return SafeTripData.tourist;
  },

  saveState() {
    try {
      localStorage.setItem("safetrip_demo_state", JSON.stringify({
        tourist: SafeTripData.tourist,
        incidents: SafeTripData.incidents,
        metrics: SafeTripData.metrics,
        geofences: SafeTripData.geofences,
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
      } catch (err) {
        console.warn("State restore error:", err);
      }
    }

    // Cross-tab storage event synchronization
    window.addEventListener("storage", (e) => {
      if (e.key === "safetrip_demo_state" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.tourist) Object.assign(SafeTripData.tourist, parsed.tourist);
          if (parsed.incidents && Array.isArray(parsed.incidents)) SafeTripData.incidents = parsed.incidents;
          if (parsed.metrics) Object.assign(SafeTripData.metrics, parsed.metrics);
          if (parsed.geofences && Array.isArray(parsed.geofences)) SafeTripData.geofences = parsed.geofences;

          SafeTripEvents.emit("state:synced", SafeTripData);
          SafeTripEvents.emit("tourist:location_changed", SafeTripData.tourist);
          SafeTripEvents.emit("tourist:risk_updated", SafeTripData.tourist);
          SafeTripEvents.emit("metrics:updated", SafeTripData.metrics);
        } catch (err) {
          console.error("Cross-tab sync error:", err);
        }
      }
    });
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

// Initialize synchronization
SafeTripStore.initSync();

// Export to window for vanilla JS modularity
window.SafeTripData = SafeTripData;
window.SafeTripStore = SafeTripStore;
window.SafeTripEvents = SafeTripEvents;
window.getDestinationFallbackSvg = getDestinationFallbackSvg;
