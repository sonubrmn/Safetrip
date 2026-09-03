/**
 * SAFETRIP - Advanced AI Travel & Safety Companion
 * Multilingual trip planning, cultural experiences, authentic culinary intelligence,
 * budget optimization, accommodation recommendations, translation bridge, and safety explainability.
 */

const SafeTripAI = (function () {
  // Conversational session memory
  let tripSession = {
    destination: "Jaipur",
    days: 3,
    budgetTotal: 10000,
    budgetSpent: 8400,
    travelStyle: "Cultural Explorer",
    companions: "Solo / Duo",
    accessibility: "Standard",
    dietary: "Vegetarian Friendly",
    currentItinerary: null,
    preferredLanguage: "en"
  };

  // Language Dictionary for UI strings and natural prompts
  const langConfig = {
    en: { name: "English", flag: "🇬🇧", greeting: "Namaste Sid! I am your SAFETRIP AI Travel & Safety Companion. How can I assist your journey in Jaipur today?" },
    hi: { name: "हिंदी (Hindi)", flag: "🇮🇳", greeting: "नमस्ते सिड! मैं आपका सेफ़ट्रिप AI साथी हूँ। मैं आपकी जयपुर यात्रा को सुरक्षित, प्रामाणिक और बजट-अनुकूल बनाने में कैसे सहायता कर सकता हूँ?" },
    bn: { name: "বাংলা (Bengali)", flag: "🇮🇳", greeting: "নমস্কার সিড! আমি আপনার সেফট্রিপ AI ভ্রমণ ও সুরক্ষা সঙ্গী। জয়পুর সফরে আপনাকে কীভাবে সাহায্য করতে পারি?" },
    ta: { name: "தமிழ் (Tamil)", flag: "🇮🇳", greeting: "வணக்கம் சித்! நான் உங்கள் சேஃப்ட்ரிப் AI பயண மற்றும் பாதுகாப்பு உதவியாளர். ஜெய்ப்பூர் பயணத்தில் உங்களுக்கு எவ்வாறு உதவ முடியும்?" },
    te: { name: "తెలుగు (Telugu)", flag: "🇮🇳", greeting: "నమస్తే సిడ్! నేను మీ సేఫ్‌ట్రిప్ AI ట్రావెల్ మరియు సేఫ్టీ కంపానియన్. జైపూర్ పర్యటనలో నేను మీకు ఎలా సహాయపడగలను?" },
    mr: { name: "मराठी (Marathi)", flag: "🇮🇳", greeting: "नमस्कार सिड! मी तुमचा सेफट्रिप AI ट्रॅव्हल व सुरक्षितता मार्गदर्शक आहे. जयपूर प्रवासात मी तुम्हाला कशी मदत करू?" },
    gu: { name: "ગુજરાતી (Gujarati)", flag: "🇮🇳", greeting: "નમસ્તે સિડ! હું તમારો સેફટ્રિપ AI ટ્રાવેલ અને સુરક્ષા સાથી છું. જયપુર પ્રવાસમાં તમને કેવી રીતે મદદ કરી શકું?" },
    es: { name: "Español", flag: "🇪🇸", greeting: "¡Hola Sid! Soy tu compañero de viaje y seguridad SafeTrip AI en Jaipur. ¿Cómo puedo ayudarte hoy?" },
    fr: { name: "Français", flag: "🇫🇷", greeting: "Bonjour Sid ! Je suis votre compagnon IA de voyage et de sécurité SafeTrip à Jaipur. Comment puis-je vous aider ?" }
  };

  // Initialize
  function init() {
    // Restore language preference
    const savedLang = SafeTripStore.getAiLanguage();
    if (savedLang && langConfig[savedLang]) {
      tripSession.preferredLanguage = savedLang;
    }
  }

  // Language detection helper
  function detectLanguageFromText(text) {
    // Devanagari script detection (Hindi/Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
      if (/आहे|नाही|कसे|करावे|मला/.test(text)) return "mr";
      return "hi";
    }
    // Bengali script detection
    if (/[\u0980-\u09FF]/.test(text)) return "bn";
    // Tamil script detection
    if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
    // Telugu script detection
    if (/[\u0C00-\u0C7F]/.test(text)) return "te";
    // Gujarati script detection
    if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
    // Spanish words
    if (/\b(hola|seguro|itinerario|hotel|comida|viaje|gracias)\b/i.test(text)) return "es";
    // French words
    if (/\b(bonjour|voyage|itinéraire|nourriture|hôtel|merci|sécurité)\b/i.test(text)) return "fr";
    // Hinglish keywords
    if (/\b(kya|kaise|bhaiya|kitna|sasta|kahan|accha|jaana|batao)\b/i.test(text)) return "hi";
    
    return tripSession.preferredLanguage || "en";
  }

  // Set Language
  function setLanguage(langCode) {
    if (langConfig[langCode]) {
      tripSession.preferredLanguage = langCode;
      SafeTripStore.setAiLanguage(langCode);
      return true;
    }
    return false;
  }

  function getLanguage() {
    return tripSession.preferredLanguage || "en";
  }

  // Main Intent Resolution & Response Composer
  function processMessage(userQuery) {
    const raw = userQuery.trim();
    const detectedLang = detectLanguageFromText(raw);
    const lang = detectedLang || tripSession.preferredLanguage || "en";
    const q = raw.toLowerCase();

    // 1. SAFETY CRITICAL / IMMEDIATE DISTRESS (Top Priority)
    if (q.includes("unsafe") || q.includes("scared") || q.includes("danger") || q.includes("emergency") || q.includes("someone following") || q.includes("असुरक्षित") || q.includes("बचाओ") || q.includes("help me")) {
      return buildSafetyEmergencyResponse(lang);
    }

    // 2. MAKE MY TRIP SAFER
    if (q.includes("make my trip safer") || q.includes("make it safer") || q.includes("safer route") || q.includes("safety advice") || q.includes("सुरक्षित")) {
      return buildMakeSaferResponse(lang);
    }

    // 3. TRANSLATION BRIDGE ("Translate this into Hindi", "how to ask driver")
    if (q.includes("translate") || q.includes("how to say") || q.includes("in hindi") || q.includes("phrase") || q.includes("अनुवाद") || q.includes("ट्रांसलेट") || q.includes("driver") || q.includes("rickshaw")) {
      return buildTranslationBridgeResponse(userQuery, lang);
    }

    // 4. BUDGET OPTIMIZATION ("Make it cheaper", "only 7000 left", "cheaper")
    if (q.includes("cheaper") || q.includes("sasta") || q.includes("make it cheaper") || q.includes("left") || q.includes("budget") && (q.includes("cut") || q.includes("reduce") || q.includes("tight") || q.includes("कम"))) {
      return buildBudgetOptimizationResponse(userQuery, lang);
    }

    // 5. TRIP PLANNER & ITINERARY (e.g. "Plan Jaipur for 3 days under ₹10,000", "2 days plan")
    if (q.includes("plan") || q.includes("itinerary") || q.includes("days") || q.includes("weekend") || q.includes("tour") || q.includes("प्लान") || q.includes("यात्रा")) {
      return buildTripPlannerResponse(userQuery, lang);
    }

    // 6. LOCAL FOOD & DINING DISCOVERY
    if (q.includes("food") || q.includes("eat") || q.includes("dish") || q.includes("kachori") || q.includes("dal baati") || q.includes("ghewar") || q.includes("dinner") || q.includes("lunch") || q.includes("खाना") || q.includes("भोजन") || q.includes("sweet")) {
      return buildLocalFoodResponse(userQuery, lang);
    }

    // 7. AUTHENTIC EXPERIENCES (Distinct from sights: Pottery, block printing, food walks)
    if (q.includes("experience") || q.includes("workshop") || q.includes("pottery") || q.includes("craft") || q.includes("printing") || q.includes("folk") || q.includes("activity") || q.includes("activities") || q.includes("अनुभव") || q.includes("हस्तशिल्प")) {
      return buildExperiencesResponse(userQuery, lang);
    }

    // 8. ACCOMMODATION & STAYS
    if (q.includes("hotel") || q.includes("stay") || q.includes("hostel") || q.includes("resort") || q.includes("room") || q.includes("होटल") || q.includes("रुकने")) {
      return buildAccommodationResponse(userQuery, lang);
    }

    // 9. DESTINATION EXPLAINER ("What is Amber Fort famous for?", "Why visit?")
    for (const d of SafeTripData.destinations) {
      if (q.includes(d.name.toLowerCase()) || q.includes(d.id.replace("-", " "))) {
        return buildDestinationExplanationResponse(d, lang);
      }
    }
    if (q.includes("famous for") || q.includes("what to see") || q.includes("attractions") || q.includes("famous")) {
      return buildDestinationOverviewResponse(lang);
    }

    // 10. WHAT SHOULD I DO RIGHT NOW?
    if (q.includes("right now") || q.includes("tonight") || q.includes("now") || q.includes("evening") || q.includes("currently") || q.includes("अभी क्या करूँ")) {
      return buildWhatToDoNowResponse(lang);
    }

    // 11. ACCESSIBILITY & PACING (Elderly parents, wheelchair, low walking)
    if (q.includes("elderly") || q.includes("parents") || q.includes("wheelchair") || q.includes("walking") || q.includes("kids") || q.includes("बुजुर्ग")) {
      return buildAccessibilityPacingResponse(userQuery, lang);
    }

    // Default Contextual Companion Response
    return buildGeneralCompanionResponse(userQuery, lang);
  }

  /* ==========================================================================
     RESPONSE BUILDERS (STRUCTURED & MULTILINGUAL)
     ========================================================================== */

  // 1. SAFETY CRITICAL
  function buildSafetyEmergencyResponse(lang) {
    const isHi = lang === "hi";
    const headline = isHi ? "🚨 आपातकालीन सुरक्षा मोड सक्रिय" : "🚨 IMMEDIATE SAFETY RESPONSE ACTIVATED";
    const sub = isHi 
      ? "आपकी लोकेशन सुरक्षित राजस्थान टूरिस्ट पुलिस ग्रिड पर ट्रैक हो रही है। घबराएं नहीं।" 
      : "Your location is tracked on Rajasthan Tourism Safety Grid. Follow these immediate protective steps:";

    return `
      <div class="ai-res-card safety-critical">
        <div class="ai-card-badge danger">● HIGH PRIORITY SAFETY DISPATCH</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #b91c1c; margin: 6px 0;">${headline}</h4>
        <p style="font-size: 12.5px; color: #334155; margin-bottom: 12px;">${sub}</p>
        
        <div class="ai-safety-hotspots">
          <div class="hotspot-row">
            <div>
              <b style="font-size: 13px; color: #0f172a;">Rajasthan Tourist Police Thana (Beat 4)</b>
              <div style="font-size: 11.5px; color: #64748b;">Distance: <b>120 meters</b> • High-lux lit corridor</div>
            </div>
            <a href="tel:1363" class="btn-safety-call" style="background:#0284c7; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700;">📞 Dial 1363</a>
          </div>

          <div class="hotspot-row">
            <div>
              <b style="font-size: 13px; color: #0f172a;">Sawai Man Singh (SMS) Hospital Trauma Center</b>
              <div style="font-size: 11.5px; color: #64748b;">Distance: <b>2.4 km</b> • 24/7 Level-1 Emergency</div>
            </div>
            <a href="tel:01412560291" class="btn-safety-call" style="background:#059669; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700;">📞 24/7 Trauma</a>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; gap: 8px;">
          <button class="btn-res-action danger" onclick="openSOSConfirmationModal()">
            🚨 Trigger Emergency SOS (Ticket INC)
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.showSaferRoute()">
            🛡️ Walk to Safe Corridor
          </button>
        </div>
      </div>
    `;
  }

  // 2. MAKE MY TRIP SAFER
  function buildMakeSaferResponse(lang) {
    const isHi = lang === "hi";
    return `
      <div class="ai-res-card">
        <div class="ai-card-badge safe">🛡️ AI SAFETY INTELLIGENCE</div>
        <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 4px 0 8px;">
          ${isHi ? "आपकी यात्रा को सुरक्षित बनाने के AI सुझाव:" : "Actionable Steps to Maximize Your Safety in Jaipur:"}
        </h4>
        
        <ul class="ai-bullet-list">
          <li>
            <b>${isHi ? "सुरक्षित हेरिटेज कॉरिडोर चुनें:" : "Choose the Patrolled Heritage Corridor:"}</b> 
            ${isHi ? "हवा महल से आमेर के लिए कनक वृंदावन मार्ग (96% सीसीटीवी और पुलिस बीट) लें।" : "Use the 22-min Kanak Vrindavan route (96% CCTV & Beat 4 active patrols) instead of the unlit mountain bypass."}
          </li>
          <li>
            <b>${isHi ? "शाम 6:30 बजे से पहले नाहरगढ़ से वापसी:" : "Nahargarh Sunset Cutoff:"}</b>
            ${isHi ? "पहाड़ी मोड़ों पर अंधेरा होने से पहले मुख्य सड़क की ओर आ जाएं।" : "Depart the upper ramparts by 6:30 PM before sharp mountain curves lose visibility."}
          </li>
          <li>
            <b>${isHi ? "डिजिटल आईडी व 30 मिनट चेक-इन:" : "Verify ZK-Digital ID & Check-In:"}</b>
            ${isHi ? "आपका 30-मिनट का सुरक्षा टाइमर सक्रिय है। मिस होने पर अभिभावक को ऑटो-अलर्ट भेजा जाएगा।" : "Your 30-minute safety timer keeps your emergency contact automatically synchronized."}
          </li>
        </ul>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.showSaferRoute()">
            🛡️ Activate Safest Route Layer
          </button>
          <button class="btn-res-action secondary" onclick="openDigitalIdModalView('view')">
            🪪 View Digital Travel ID
          </button>
        </div>
      </div>
    `;
  }

  // 3. TRANSLATION BRIDGE
  function buildTranslationBridgeResponse(query, lang) {
    const q = query.toLowerCase();
    let phrase = SafeTripData.translationPhrases[0]; // default auto fare

    if (q.includes("police") || q.includes("station") || q.includes("help") || q.includes("चौकी")) {
      phrase = SafeTripData.translationPhrases[1];
    } else if (q.includes("spicy") || q.includes("food") || q.includes("water") || q.includes("तीखा")) {
      phrase = SafeTripData.translationPhrases[2];
    } else if (q.includes("price") || q.includes("discount") || q.includes("handicraft") || q.includes("दाम") || q.includes("सस्ता")) {
      phrase = SafeTripData.translationPhrases[3];
    } else if (q.includes("night") || q.includes("safe") || q.includes("walk") || q.includes("पैदल")) {
      phrase = SafeTripData.translationPhrases[4];
    }

    return `
      <div class="ai-res-card translation-card">
        <div class="ai-card-badge info">🌐 LOCAL TRANSLATION BRIDGE</div>
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 4px 0;">
          Category: ${phrase.category}
        </div>

        <div class="translation-devanagari">
          "${phrase.hindi}"
        </div>

        <div class="translation-phonetic">
          🗣️ <i>Phonetic: "${phrase.phonetic}"</i>
        </div>

        <div class="translation-english">
          <b>Meaning:</b> "${phrase.english}"
        </div>

        <div style="font-size: 11.5px; color: #0284c7; margin: 8px 0;">
          💡 <b>Traveler Tip:</b> ${phrase.tip}
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.showLocalPhrase('${phrase.id}')">
            📱 Show Fullscreen Card to Local Driver / Vendor
          </button>
        </div>
      </div>
    `;
  }

  // 4. BUDGET OPTIMIZATION
  function buildBudgetOptimizationResponse(query, lang) {
    // Extract any number mentioned
    const matchNum = query.match(/\d+([,\.]\d+)?/g);
    let newBudget = 7000;
    if (matchNum && matchNum.length) {
      newBudget = parseInt(matchNum[0].replace(",", ""), 10);
      if (newBudget < 2000) newBudget = 5000;
    }

    tripSession.budgetTotal = newBudget;
    const stayCost = Math.round(newBudget * 0.38);
    const foodCost = Math.round(newBudget * 0.26);
    const transitCost = Math.round(newBudget * 0.14);
    const expCost = Math.round(newBudget * 0.12);
    const bufferCost = newBudget - (stayCost + foodCost + transitCost + expCost);

    tripSession.budgetSpent = newBudget - bufferCost;

    const isHi = lang === "hi";

    return `
      <div class="ai-res-card">
        <div class="ai-card-badge safe">💰 DYNAMIC BUDGET OPTIMIZER</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 6px 0;">
          ${isHi ? `जयपुर 3-दिवसीय अनुकूलित बजट: ₹${newBudget.toLocaleString()}` : `Optimized 3-Day Jaipur Plan for ₹${newBudget.toLocaleString()}`}
        </h4>
        <p style="font-size: 12.5px; color: #475569; margin-bottom: 12px;">
          ${isHi 
            ? "हमने आवास, ई-रिक्शा और स्थानीय हेरिटेज वॉक को प्राथमिकता देकर ₹" + bufferCost + " का आपातकालीन बफ़र सुरक्षित रखा है।" 
            : "Switched to high-rated heritage hostel dorms, shared electric rickshaws, and free monument promenades while preserving a safety reserve."}
        </p>

        <div class="budget-breakdown-grid">
          <div class="budget-tile">
            <span class="tile-label">🏨 Stay (2 Nights)</span>
            <b class="tile-val">₹${stayCost.toLocaleString()}</b>
            <span class="tile-sub">Zostel / Arya Niwas</span>
          </div>
          <div class="budget-tile">
            <span class="tile-label">🍲 Food & Sweets</span>
            <b class="tile-val">₹${foodCost.toLocaleString()}</b>
            <span class="tile-sub">Rawat, LMB & Lassiwala</span>
          </div>
          <div class="budget-tile">
            <span class="tile-label">🛺 Local Transit</span>
            <b class="tile-val">₹${transitCost.toLocaleString()}</b>
            <span class="tile-sub">Pre-paid Auto & E-rickshaws</span>
          </div>
          <div class="budget-tile">
            <span class="tile-label">🎨 Craft & Entry</span>
            <b class="tile-val">₹${expCost.toLocaleString()}</b>
            <span class="tile-sub">Bagru print & Composite ticket</span>
          </div>
        </div>

        <div class="budget-buffer-banner">
          <span>🛡️ <b>Safety Reserve Buffer:</b> ₹${bufferCost.toLocaleString()}</span>
          <span style="font-size: 11px; color: #059669; font-weight: 600;">Preserved for Emergencies</span>
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.addBudgetPlanToTrip()">
            📌 Apply to My Trip
          </button>
          <button class="btn-res-action secondary" onclick="handleUserAIMessage('Show me cheap budget stays near Hawa Mahal')">
            🏨 View Budget Stays
          </button>
        </div>
      </div>
    `;
  }

  // 5. TRIP PLANNER & ITINERARY GENERATOR
  function buildTripPlannerResponse(query, lang) {
    // Parse duration
    let days = 3;
    if (query.includes("1 day") || query.includes("one day")) days = 1;
    else if (query.includes("2 day") || query.includes("two day") || query.includes("weekend")) days = 2;
    else if (query.includes("4 day")) days = 4;

    // Parse budget
    let budget = 10000;
    const matchNum = query.match(/\d+([,\.]\d+)?/g);
    if (matchNum && matchNum.length) {
      budget = parseInt(matchNum[0].replace(",", ""), 10);
      if (budget < 3000) budget = 6000;
    }

    tripSession.days = days;
    tripSession.budgetTotal = budget;

    const isHi = lang === "hi";

    return `
      <div class="ai-res-card itinerary-res-card">
        <div class="itinerary-header-bar">
          <div>
            <div class="ai-card-badge safe">🗺️ CURATED SMART ITINERARY</div>
            <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0;">
              ${isHi ? `जयपुर ${days}-दिवसीय यात्रा योजना (बजट: ₹${budget.toLocaleString()})` : `${days}-Day Jaipur Heritage & Safety Itinerary`}
            </h4>
            <div style="font-size: 12px; color: #64748b;">
              Paced for <b>${tripSession.travelStyle}</b> • Est. Spend: <b>₹${Math.round(budget * 0.84).toLocaleString()}</b>
            </div>
          </div>
          <div class="itinerary-score-pill">
            <span style="font-size: 11px; font-weight: 700; color: #059669;">Safety Index</span>
            <span style="font-size: 16px; font-weight: 800; color: #059669;">94/100</span>
          </div>
        </div>

        <!-- Day 1 -->
        <div class="itinerary-day-box">
          <div class="day-title-row">
            <b>Day 1: Amber Fort & Walled City Heritage</b>
            <span class="day-cost-badge">Est. ₹1,450</span>
          </div>
          <div class="day-schedule-items">
            <div class="sched-slot">
              <span class="slot-time">08:30 AM</span>
              <div class="slot-content">
                <b>Amber Fort & Sheesh Mahal</b>
                <p>Arrive early before heat; explore Suraj Pol and mirror palace with registered guide.</p>
                <div class="slot-meta">🛡️ Police Post active • Ramp access available</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">01:00 PM</span>
              <div class="slot-content">
                <b>Authentic Dal Baati Lunch at LMB</b>
                <p>Signature ghee-baked baati and five-lentil panchmel dal in Johari Bazaar.</p>
                <div class="slot-meta">🍲 Veg / Jain • Verified Hygiene Rating</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">06:00 PM</span>
              <div class="slot-content">
                <b>Hawa Mahal & Evening Walled City Walk</b>
                <p>Illuminated 953-window facade view followed by Johari Bazaar jewelry walk.</p>
                <div class="slot-meta">🛡️ High-lux lighting • Sid's live precinct</div>
              </div>
            </div>
          </div>
        </div>

        ${days >= 2 ? `
        <!-- Day 2 -->
        <div class="itinerary-day-box">
          <div class="day-title-row">
            <b>Day 2: Royal Palaces & Artisan Workshops</b>
            <span class="day-cost-badge">Est. ₹1,850</span>
          </div>
          <div class="day-schedule-items">
            <div class="sched-slot">
              <span class="slot-time">09:30 AM</span>
              <div class="slot-content">
                <b>City Palace & Jantar Mantar Observatory</b>
                <p>Pritam Niwas Peacock Gate courtyards and world's largest stone sundial.</p>
                <div class="slot-meta">🛡️ UNESCO Heritage Guarded • Level paved paths</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">02:30 PM</span>
              <div class="slot-content">
                <b>Sanganer Blue Pottery Masterclass</b>
                <p>Hands-on ceramic glazing workshop with verified artisan coop.</p>
                <div class="slot-meta">🎨 Authentic Experience • Certified Rajasthan Guild</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">06:30 PM</span>
              <div class="slot-content">
                <b>Jal Mahal Promenade Sunset</b>
                <p>Walk the lakefront promenade under golden sunset with security patrol.</p>
                <div class="slot-meta">🛡️ Waterfront Barriers • Regular motorcycle patrol</div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        ${days >= 3 ? `
        <!-- Day 3 -->
        <div class="itinerary-day-box">
          <div class="day-title-row">
            <b>Day 3: Photography, Cenotaphs & Folk Evening</b>
            <span class="day-cost-badge">Est. ₹1,650</span>
          </div>
          <div class="day-schedule-items">
            <div class="sched-slot">
              <span class="slot-time">08:00 AM</span>
              <div class="slot-content">
                <b>Patrika Gate Morning Photo Walk</b>
                <p>Capture vibrant pastel frescoes portraying Rajasthani legends without crowds.</p>
                <div class="slot-meta">🌿 Public Park Ring • 24/7 Security Booth</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">03:30 PM</span>
              <div class="slot-content">
                <b>Albert Hall Museum & Ram Niwas Garden</b>
                <p>Indo-Saracenic royal museum with Egyptian mummy and miniature paintings.</p>
                <div class="slot-meta">🏛️ Elevator Equipped • Shaded gardens</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">07:00 PM</span>
              <div class="slot-content">
                <b>Rajasthani Folk Music & Kathputli Evening</b>
                <p>Manganiyar desert ragas and puppet storytelling in heritage haveli.</p>
                <div class="slot-meta">🎭 Family & Elderly Friendly • Private haveli</div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.addGeneratedItineraryToTrip()">
            📌 Save Complete Plan to My Trip
          </button>
          <button class="btn-res-action secondary" onclick="handleUserAIMessage('make it cheaper under ₹7,000')">
            💰 Make It Cheaper
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.viewOnMap([26.9855, 75.8513], 'Amber Fort')">
            🗺️ View Sights on Map
          </button>
        </div>
      </div>
    `;
  }

  // 6. LOCAL FOOD & DINING
  function buildLocalFoodResponse(query, lang) {
    const isHi = lang === "hi";
    const foods = SafeTripData.localFoods;

    return `
      <div class="ai-res-card">
        <div class="ai-card-badge safe">🍲 AUTHENTIC RAJASTHANI FOOD INTEL</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0 8px;">
          ${isHi ? "जयपुर के प्रसिद्ध स्थानीय पकवान और सुरक्षित भोजनालय:" : "Famous Local Food & Verified Safe Eateries:"}
        </h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
          ${isHi ? "उच्च स्वच्छता रेटिंग और ताज़ा तैयार किए जाने वाले सत्यापित स्थान।" : "Selected based on culinary authenticity, verified food safety, and heritage reputation."}
        </p>

        <div class="food-items-grid">
          ${foods.map(f => `
            <div class="food-card-tile">
              <div class="food-head-row">
                <b>${f.name}</b>
                <span class="diet-tag ${f.dietaryClass}">● ${f.dietary}</span>
              </div>
              <div style="font-size: 12px; color: #64748b; margin: 2px 0;">${f.hindiName} • <b>${f.priceEst}</b></div>
              <p style="font-size: 12.5px; color: #334155; margin: 4px 0;">${f.description}</p>
              <div style="font-size: 11.5px; color: #0284c7; margin-top: 4px;">
                📍 <b>Famous At:</b> ${f.famousAt}
              </div>
              <div style="font-size: 11px; color: #059669; margin-top: 2px;">
                🛡️ <b>Safety Intel:</b> ${f.safetyNote}
              </div>
            </div>
          `).join("")}
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="handleUserAIMessage('Find authentic Rajasthani food near Hawa Mahal')">
            📍 What is Near Me Right Now?
          </button>
          <button class="btn-res-action secondary" onclick="handleUserAIMessage('How to ask for less spicy food in Hindi?')">
            🗣️ Translate: Less Spicy
          </button>
        </div>
      </div>
    `;
  }

  // 7. EXPERIENCES (Distinct from Places)
  function buildExperiencesResponse(query, lang) {
    const isHi = lang === "hi";
    const exps = SafeTripData.experiences;

    return `
      <div class="ai-res-card">
        <div class="ai-card-badge info">🎨 AUTHENTIC HANDS-ON EXPERIENCES</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">
          ${isHi ? "जयपुर के वास्तविक सांस्कृतिक अनुभव (Activities to Do):" : "Things to Actively Participate In (Beyond Monuments):"}
        </h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
          ${isHi ? "हस्तशिल्प कार्यशालाएं, पाक-कला भ्रमण और लोक कला संध्या।" : "Workshops and cultural walks with verified artisan cooperatives in safe tourist precincts."}
        </p>

        <div class="exp-cards-list">
          ${exps.map(e => `
            <div class="exp-card-item">
              <div class="exp-img-box" style="background: #0f172a;">
                <img src="${e.image}" alt="${e.title}" style="width: 76px; height: 76px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${e.title}', 'safe');">
              </div>
              <div class="exp-info-box">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <b style="font-size: 13.5px; color: #0f172a;">${e.title}</b>
                  <span style="font-size: 12.5px; font-weight: 700; color: #0284c7;">${e.priceEst}</span>
                </div>
                <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">
                  ⏱️ ${e.duration} • 📍 ${e.location}
                </div>
                <p style="font-size: 12px; color: #334155; margin: 4px 0;">${e.description}</p>
                <div style="font-size: 11px; color: #059669;">
                  🛡️ <b>Why Safe:</b> ${e.whyRecommended}
                </div>
                <div style="margin-top: 6px;">
                  <button class="btn-card-details" onclick="SafeTripAI.addExperienceToTrip('${e.id}')" style="font-size: 11px; padding: 3px 10px;">
                    + Add to My Trip
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // 8. ACCOMMODATION & STAYS
  function buildAccommodationResponse(query, lang) {
    const isHi = lang === "hi";
    const stays = SafeTripData.accommodations;

    return `
      <div class="ai-res-card">
        <div class="ai-card-badge safe">🏨 VERIFIED SAFE ACCOMMODATIONS</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">
          ${isHi ? "जयपुर में सत्यापित सुरक्षित व बजट आवास:" : "Curated Accommodations with Verified Safety Context:"}
        </h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
          ${isHi ? "हेरिटेज कॉरिडोर के पास, 24/7 सुरक्षा डेस्क और निःशुल्क रद्दीकरण (डेमो)।" : "Located inside monitored tourist zones with verified security and emergency access."}
        </p>

        <div class="stays-list">
          ${stays.map(s => `
            <div class="stay-card-item">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <b style="font-size: 14px; color: #0f172a;">${s.name}</b>
                <span style="font-size: 13px; font-weight: 800; color: #0284c7;">${s.priceNight}</span>
              </div>
              <div style="font-size: 12px; color: #64748b; margin: 2px 0;">
                ⭐ ${s.rating} • 📍 ${s.distance} • <span style="color: #059669; font-weight: 600;">Safety Score: ${s.safetyScore}/100</span>
              </div>
              <div style="font-size: 12px; color: #334155; margin: 4px 0;">
                <b>Why AI Recommends:</b> ${s.whyRecommended}
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                <span style="font-size: 10.5px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px;">✓ ${s.cancellation}</span>
                <span style="font-size: 10.5px; background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 4px;">💳 Pay Later (Demo)</span>
              </div>
              <div style="margin-top: 10px;">
                <button class="btn-res-action primary" onclick="SafeTripAI.openDemoReservation('${s.name}')" style="font-size: 12px; padding: 6px 14px;">
                  Reserve Demo (No Payment Required)
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // 9. DESTINATION EXPLAINER
  function buildDestinationExplanationResponse(dest, lang) {
    const isHi = lang === "hi";

    return `
      <div class="ai-res-card">
        <div class="ai-card-badge safe">🏛️ DESTINATION INTELLIGENCE</div>
        <div style="display: flex; gap: 12px; margin-top: 6px;">
          <img src="${dest.image}" alt="${dest.name}" style="width: 90px; height: 90px; border-radius: 10px; object-fit: cover;" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${dest.name}', '${dest.statusClass}');">
          <div>
            <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px;">${dest.name}</h4>
            <div style="font-size: 12px; color: #64748b;">📍 ${dest.location} • ${dest.distance} from you</div>
            <div style="font-size: 12px; font-weight: 700; color: ${dest.statusClass === 'safe' ? '#059669' : '#d97706'}; margin-top: 4px;">
              ● Safety Score: ${dest.safetyScore}/100 (${dest.riskLevel})
            </div>
          </div>
        </div>

        <div style="margin-top: 12px; font-size: 12.5px; color: #1e293b; line-height: 1.45;">
          <b>${isHi ? "यह स्थान क्यों प्रसिद्ध है:" : "What this place is famous for:"}</b>
          <p style="margin: 2px 0 8px;">${dest.famousFor || dest.highlight}</p>
        </div>

        <div class="dest-intel-grid">
          <div>
            <span class="label">Recommended Duration:</span>
            <b>${dest.recommendedTime || "2 Hours"}</b>
          </div>
          <div>
            <span class="label">Best Time to Visit:</span>
            <b>${dest.bestTime || dest.safeHours}</b>
          </div>
          <div>
            <span class="label">Accessibility:</span>
            <b>${dest.accessibility || "Standard"}</b>
          </div>
          <div>
            <span class="label">Entry Estimate:</span>
            <b>${dest.budgetEstimate || "₹50 - ₹200"}</b>
          </div>
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.viewOnMap([${dest.coords ? dest.coords.join(',') : '26.9239,75.8267'}], '${dest.name}')">
            🗺️ View on Safety Map
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.addPlaceToTrip('${dest.id}')">
            📌 Add to My Trip
          </button>
          <button class="btn-res-action secondary" onclick="openDestinationDetails('${dest.id}')">
            Detailed Intel &rarr;
          </button>
        </div>
      </div>
    `;
  }

  // 10. WHAT SHOULD I DO RIGHT NOW?
  function buildWhatToDoNowResponse(lang) {
    const isHi = lang === "hi";
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 17 || currentHour < 5;

    return `
      <div class="ai-res-card">
        <div class="ai-card-badge info">⚡ CONTEXTUAL RECOMMENDATION (RIGHT NOW)</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">
          ${isEvening ? "Evening Recommendations near Hawa Mahal:" : "Daytime Recommendations for Jaipur:"}
        </h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
          Current Time: <b>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b> • Status: <b>LOW RISK (84/100)</b> • Location: <b>Hawa Mahal</b>
        </p>

        <div class="now-options-list">
          ${isEvening ? `
            <div class="now-opt-tile">
              <span class="opt-badge">Top Pick • Evening</span>
              <b>Johari Bazaar Illuminated Food & Sweets Walk</b>
              <p>Stroll the brightly lit heritage corridor for hot Pyaaz Kachori and Malai Ghewar. Stay on the main avenue.</p>
              <div style="font-size: 11px; color: #059669;">🛡️ Tourist police post 120m away • High ambient streetlights</div>
            </div>
            <div class="now-opt-tile">
              <span class="opt-badge">Scenic • Sunset</span>
              <b>Jal Mahal Promenade Walkway</b>
              <p>Catch the illuminated reflection of the submerged palace from the wide pedestrian walkway.</p>
              <div style="font-size: 11px; color: #059669;">🛡️ Open until 9:00 PM • Regular motorcycle patrol</div>
            </div>
          ` : `
            <div class="now-opt-tile">
              <span class="opt-badge">Morning Sights</span>
              <b>Amber Fort Sheesh Mahal Courtyard</b>
              <p>Best viewed during morning light before the midday sun warms the stone ramparts.</p>
              <div style="font-size: 11px; color: #059669;">🛡️ Official TAF security booth active</div>
            </div>
            <div class="now-opt-tile">
              <span class="opt-badge">Afternoon Craft</span>
              <b>Sanganer Blue Pottery Artisan Studio</b>
              <p>Indoor cool workshop learning hand-glazing techniques.</p>
              <div style="font-size: 11px; color: #059669;">🛡️ Verified guild studio</div>
            </div>
          `}
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="handleUserAIMessage('Show authentic food places open now')">
            🍲 Find Food Near Me
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.showSaferRoute()">
            🛡️ Safe Route Back to Hotel
          </button>
        </div>
      </div>
    `;
  }

  // 11. ACCESSIBILITY & PACING
  function buildAccessibilityPacingResponse(query, lang) {
    return `
      <div class="ai-res-card">
        <div class="ai-card-badge safe">♿ INCLUSIVE & LOW-WALKING INTEL</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">
          Senior & Family-Friendly Jaipur Recommendations:
        </h4>
        <p style="font-size: 12px; color: #475569; margin-bottom: 12px;">
          Tailored for travelers with elderly parents, children, or reduced mobility:
        </p>

        <ul class="ai-bullet-list">
          <li>
            <b>City Palace & Jantar Mantar:</b> Level paved paths with golf cart transfers and wheelchair ramps at all main royal courtyards.
          </li>
          <li>
            <b>Patrika Gate:</b> Zero steps, park benches along the circular drive, and direct car drop-off.
          </li>
          <li>
            <b>Avoid:</b> Nahargarh hill ridge trails and steep internal stairwells at Hawa Mahal upper tiers.
          </li>
          <li>
            <b>Stay Recommendation:</b> Hotel Arya Niwas (elevator equipped, pure-veg dining, peaceful ground-floor garden).
          </li>
        </ul>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="handleUserAIMessage('Plan a low-walking 2-day trip for seniors')">
            📌 Generate Low-Walking Itinerary
          </button>
        </div>
      </div>
    `;
  }

  // 12. DESTINATION OVERVIEW
  function buildDestinationOverviewResponse(lang) {
    return `
      <div class="ai-res-card">
        <div class="ai-card-badge info">🏛️ JAIPUR HERITAGE SPOTLIGHT</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">
          What Makes the Pink City Special:
        </h4>
        <p style="font-size: 12.5px; color: #334155; line-height: 1.45;">
          Jaipur is India's premier UNESCO World Heritage planned city, established in 1727 by Maharaja Sawai Jai Singh II. Famous for grid-pattern pink terracotta architecture, royal fortresses (Amber, Nahargarh, Jaigarh), astronomical science (Jantar Mantar), and living master craft guilds.
        </p>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0;">
          <button class="ai-chip" onclick="handleUserAIMessage('What is Amber Fort famous for?')">Amber Fort</button>
          <button class="ai-chip" onclick="handleUserAIMessage('What is Hawa Mahal famous for?')">Hawa Mahal</button>
          <button class="ai-chip" onclick="handleUserAIMessage('What is City Palace famous for?')">City Palace</button>
          <button class="ai-chip" onclick="handleUserAIMessage('Tell me about Jal Mahal')">Jal Mahal</button>
        </div>
      </div>
    `;
  }

  // 13. GENERAL COMPANION FALLBACK
  function buildGeneralCompanionResponse(query, lang) {
    const tourist = SafeTripStore.getTourist();
    return `
      <div class="ai-res-card">
        <div class="ai-card-badge safe">💡 SAFETRIP ASSISTANT</div>
        <p style="font-size: 13px; color: #1e293b; line-height: 1.5; margin: 4px 0 10px;">
          I've analyzed your request with live safety context around <b>${tourist.currentLocation.name}</b> (Safety Score: ${tourist.safetyScore}/100, ${tourist.riskLevel}).
        </p>
        <p style="font-size: 12.5px; color: #475569; line-height: 1.45;">
          You can ask me to:
        </p>
        <ul class="ai-bullet-list" style="margin-bottom: 12px;">
          <li><b>Trip Planning:</b> <i>"Plan Jaipur for 3 days under ₹10,000"</i></li>
          <li><b>Authentic Food:</b> <i>"Find authentic Rajasthani food near me"</i></li>
          <li><b>Hands-on Experiences:</b> <i>"Show me pottery or craft workshops"</i></li>
          <li><b>Stay Recommendations:</b> <i>"Find a safe budget stay near Hawa Mahal"</i></li>
          <li><b>Language Bridge:</b> <i>"Translate 'Where is the police station?' into Hindi"</i></li>
        </ul>
      </div>
    `;
  }

  /* ==========================================================================
     INTERACTIVE ACTION HANDLERS
     ========================================================================== */
  function viewOnMap(coords, name) {
    if (window.mapInstance && coords) {
      window.mapInstance.setView(coords, 15, { animate: true });
      L.popup()
        .setLatLng(coords)
        .setContent(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px;">
            <b style="font-size: 13px; color: #0f172a;">${name}</b>
            <div style="font-size: 11.5px; color: #059669; margin-top: 2px;">● Verified Safe Heritage Location</div>
          </div>
        `)
        .openOn(window.mapInstance);

      // Scroll smoothly to map
      const mapSection = document.getElementById("safety-map");
      if (mapSection) mapSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  function showSaferRoute() {
    const routeSection = document.getElementById("routes");
    if (routeSection) {
      routeSection.scrollIntoView({ behavior: "smooth" });
      if (typeof window.toggleActiveRoute === "function") {
        window.toggleActiveRoute("safest");
      }
    }
  }

  function addPlaceToTrip(destId) {
    const dest = SafeTripData.destinations.find(d => d.id === destId);
    if (!dest) return;
    SafeTripStore.addToMyTrip({
      id: `trip-p-${dest.id}`,
      title: dest.name,
      type: "place",
      day: "Day 1",
      time: dest.safeHours ? dest.safeHours.split("–")[0].trim() : "10:00 AM",
      estCost: dest.budgetEstimate || "₹100",
      safetyScore: dest.safetyScore
    });
    showToastNotification(`✓ Added "${dest.name}" to My Trip!`);
  }

  function addExperienceToTrip(expId) {
    const exp = SafeTripData.experiences.find(e => e.id === expId);
    if (!exp) return;
    SafeTripStore.addToMyTrip({
      id: `trip-e-${exp.id}`,
      title: exp.title,
      type: "experience",
      day: "Day 2",
      time: exp.recommendedTime ? exp.recommendedTime.split("–")[0].trim() : "02:00 PM",
      estCost: exp.priceEst,
      safetyScore: exp.safetyScore
    });
    showToastNotification(`✓ Added "${exp.title}" to My Trip!`);
  }

  function addGeneratedItineraryToTrip() {
    SafeTripStore.addToMyTrip({
      id: `trip-full-${Date.now()}`,
      title: `${tripSession.days}-Day Curated Heritage & Safety Tour`,
      type: "itinerary",
      day: "All Days",
      time: "Full Schedule",
      estCost: `₹${Math.round(tripSession.budgetTotal * 0.84).toLocaleString()}`,
      safetyScore: 94
    });
    showToastNotification(`✓ Saved complete ${tripSession.days}-day itinerary to My Trip!`);
  }

  function addBudgetPlanToTrip() {
    SafeTripStore.addToMyTrip({
      id: `trip-budget-${Date.now()}`,
      title: `Optimized Budget Plan (₹${tripSession.budgetTotal.toLocaleString()})`,
      type: "budget",
      day: "3 Days",
      time: "Multi-day",
      estCost: `₹${tripSession.budgetSpent.toLocaleString()}`,
      safetyScore: 92
    });
    showToastNotification(`✓ Applied budget allocation to My Trip!`);
  }

  function showLocalPhrase(phraseId) {
    const phrase = SafeTripData.translationPhrases.find(p => p.id === phraseId) || SafeTripData.translationPhrases[0];
    const modal = document.getElementById("showLocalModal");
    const modalContent = document.getElementById("showLocalContent");
    if (modal && modalContent) {
      modalContent.innerHTML = `
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #0284c7; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 8px;">
            📱 SHOW SCREEN TO LOCAL DRIVER / VENDOR
          </div>
          <div style="font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 16px 0; padding: 14px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px;">
            "${phrase.hindi}"
          </div>
          <div style="font-size: 14px; color: #475569; font-style: italic; margin-bottom: 12px;">
            "${phrase.phonetic}"
          </div>
          <div style="font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            <b>English:</b> "${phrase.english}"
          </div>
        </div>
      `;
      modal.classList.add("open");
    }
  }

  function openDemoReservation(stayName) {
    alert(`DEMO RESERVATION CONFIRMED (PROTOTYPE):\n\nHotel: ${stayName}\nGuest: Sid (ST-8F42A1)\nPayment Status: Pay Later at Property\nCancellation: Free cancellation active up to 24h prior.\n\n*This is a frontend demonstration. No real financial transaction was conducted.*`);
  }

  function showToastNotification(msg) {
    let toast = document.getElementById("safeTripToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "safeTripToast";
      toast.style.cssText = "position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 9999px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.3); z-index: 3000; transition: opacity 0.3s; opacity: 0; pointer-events: none;";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 2800);
  }

  return {
    init,
    processMessage,
    setLanguage,
    getLanguage,
    langConfig,
    viewOnMap,
    showSaferRoute,
    addPlaceToTrip,
    addExperienceToTrip,
    addGeneratedItineraryToTrip,
    addBudgetPlanToTrip,
    showLocalPhrase,
    openDemoReservation
  };
})();

// Attach to window
window.SafeTripAI = SafeTripAI;
