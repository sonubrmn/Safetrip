/**
 * SAFETRIP - Advanced Multilingual AI Travel & Safety Companion (Gemini Flash 3.8 Architecture)
 * 
 * CORE ARCHITECTURAL RULE:
 * "Always answer in the user's requested language. If no language is explicitly requested,
 * detect the language of the latest user message and respond in that language.
 * Do not default to English solely because the application interface is in English.
 * When the user changes language, follow the new language. Generate the answer directly
 * in the target language rather than generating English first and translating it afterward."
 */

const GEMINI_FLASH_SYSTEM_INSTRUCTION = `
You are the SafeTrip AI Travel & Safety Companion for Jaipur, Rajasthan.
Core Rules:
1. Always answer in the user's requested language. If no language is explicitly requested, detect the language of the latest user message and respond directly in that language. Do not default to English solely because the application interface is in English.
2. When the user changes language, follow the new language immediately and naturally.
3. Generate the answer directly in the target language as a culturally fluent local expert.
4. Preserve proper nouns, monument names, prices, numbers, safety terminology, and important travel identifiers accurately (e.g. "Hawa Mahal", "Amber Fort", "City Palace", "₹10,000", "SafeTrip", Tourist ID "ST-8F42A1").
5. If the user expresses safety distress (e.g. "আমি নিরাপদ বোধ করছি না", "I feel unsafe", "help"), immediately prioritize the safety protocol in the user's language: nearest police chowki (Rajasthan Tourist Police Thana Beat 4, 120m), SMS Hospital (2.4 km), and emergency SOS.
6. If the user asks for a translation (e.g. "Translate this to Hindi: ...", "Translate into Bengali: ..."), recognize the translation intent directly and return the exact translation with pronunciation/phonetics and tip.
7. Factuality: Use verified Jaipur travel data. Do not hallucinate fake bookings or claim real-world police have been contacted.
`;

const SafeTripAI = (function () {
  // Conversational session state
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
    preferredLanguage: "auto", // "auto" is default and recommended
    activeConversationLanguage: "en"
  };

  // Language Dictionary & Native Greetings
  const langConfig = {
    auto: { 
      name: "Auto-detect", 
      flag: "🌐", 
      greeting: "Namaste Sid! I am your SAFETRIP AI Travel & Safety Companion. You can ask me in any language (বাংলা, हिंदी, English, Français, etc.) and I will respond directly in your language!" 
    },
    en: { 
      name: "English", 
      flag: "🇬🇧", 
      greeting: "Namaste Sid! I am your SAFETRIP AI Travel & Safety Companion. How can I assist your journey in Jaipur today?" 
    },
    hi: { 
      name: "हिंदी (Hindi)", 
      flag: "🇮🇳", 
      greeting: "नमस्ते सिड! मैं आपका सेफ़ट्रिप AI साथी हूँ। मैं आपकी जयपुर यात्रा को सुरक्षित, प्रामाणिक और बजट-अनुकूल बनाने में कैसे सहायता कर सकता हूँ?" 
    },
    bn: { 
      name: "বাংলা (Bengali)", 
      flag: "🇮🇳", 
      greeting: "নমস্কার সিড! আমি আপনার সেফট্রিপ AI ভ্রমণ ও সুরক্ষা সঙ্গী। জয়পুর সফরে আপনাকে কীভাবে সাহায্য করতে পারি? (যেকোনো প্রশ্ন বাংলায় করতে পারেন)" 
    },
    ta: { 
      name: "தமிழ் (Tamil)", 
      flag: "🇮🇳", 
      greeting: "வணக்கம் சித்! நான் உங்கள் சேஃப்ட்ரிப் AI பயண மற்றும் பாதுகாப்பு உதவியாளர். ஜெய்ப்பூர் பயணத்தில் உங்களுக்கு எவ்வாறு உதவ முடியும்?" 
    },
    te: { 
      name: "తెలుగు (Telugu)", 
      flag: "🇮🇳", 
      greeting: "నమస్తే సిడ్! నేను మీ సేఫ్‌ట్రిప్ AI ట్రావెల్ మరియు సేఫ్టీ కంపానియన్. జైపూర్ పర్యటనలో నేను మీకు ఎలా సహాయపడగలను?" 
    },
    mr: { 
      name: "मराठी (Marathi)", 
      flag: "🇮🇳", 
      greeting: "नमस्कार सिड! मी तुमचा सेफट्रिप AI ट्रॅव्हल व सुरक्षितता मार्गदर्शक आहे. जयपूर प्रवासात मी तुम्हाला कशी मदत करू?" 
    },
    gu: { 
      name: "ગુજરાતી (Gujarati)", 
      flag: "🇮🇳", 
      greeting: "નમસ્તે સિડ! હું તમારો સેફટ્રિપ AI ટ્રાવેલ અને સુરક્ષા સાથી છું. જયપુર પ્રવાસમાં તમને કેવી રીતે મદદ કરી શકું?" 
    },
    pa: { 
      name: "ਪੰਜਾਬੀ (Punjabi)", 
      flag: "🇮🇳", 
      greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਸਿਡ! ਮੈਂ ਤੁਹਾਡਾ ਸੇਫ਼ਟ੍ਰਿਪ AI ਯਾਤਰਾ ਅਤੇ ਸੁਰੱਖਿਆ ਸਾਥੀ ਹਾਂ। ਜੈਪੁਰ ਦੌਰੇ ਦੌਰਾਨ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦদ ਕਰ ਸਕਦਾ ਹਾਂ?" 
    },
    ur: { 
      name: "اردو (Urdu)", 
      flag: "🇵🇰", 
      greeting: "سلام سڈ! میں آپ کا سیف ٹرپ اے آئی ٹریول اور سیفٹی ساتھی ہوں۔ جے پور کے سفر میں آپ کی کیا مدد کر سکتا ہوں؟" 
    },
    fr: { 
      name: "Français (French)", 
      flag: "🇫🇷", 
      greeting: "Bonjour Sid ! Je suis votre compagnon IA de voyage et de sécurité SafeTrip à Jaipur. Comment puis-je vous aider ?" 
    },
    es: { 
      name: "Español (Spanish)", 
      flag: "🇪🇸", 
      greeting: "¡Hola Sid! Soy tu compañero de viaje y seguridad SafeTrip AI en Jaipur. ¿Cómo puedo ayudarte hoy?" 
    },
    de: { 
      name: "Deutsch (German)", 
      flag: "🇩🇪", 
      greeting: "Hallo Sid! Ich bin dein SafeTrip KI-Reise- und Sicherheitsbegleiter in Jaipur. Wie kann ich dir helfen?" 
    },
    ja: { 
      name: "日本語 (Japanese)", 
      flag: "🇯🇵", 
      greeting: "こんにちはシド！私はSafeTrip AIトラベル＆セーフティコンパニオンです。ジャイプール旅行をどのようにサポートしましょうか？" 
    },
    ko: { 
      name: "한국어 (Korean)", 
      flag: "🇰🇷", 
      greeting: "안녕하세요 시드! 저는 세이프트립 AI 여행 및 안전 동반자입니다. 자이푸르 여행에서 무엇을 도와드릴까요?" 
    },
    zh: { 
      name: "中文 (Chinese)", 
      flag: "🇨🇳", 
      greeting: "你好 Sid！我是你的 SafeTrip AI 智能旅行与安全向导。请问在斋浦尔有什么可以帮您的？" 
    }
  };

  // Initialize
  function init() {
    const savedLang = SafeTripStore.getAiLanguage();
    if (savedLang && (savedLang === "auto" || langConfig[savedLang])) {
      tripSession.preferredLanguage = savedLang;
    } else {
      tripSession.preferredLanguage = "auto";
    }
  }

  // Helper: Normalize Bengali, Devanagari, and Arabic numerals to ASCII digits
  function normalizeNumerals(str) {
    if (!str) return "";
    const bengaliDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const devanagariDigits = ['०','१','२','३','४','५','६','७','८','९'];
    let res = str;
    for (let i = 0; i < 10; i++) {
      res = res.replaceAll(bengaliDigits[i], i.toString());
      res = res.replaceAll(devanagariDigits[i], i.toString());
    }
    return res;
  }

  /**
   * Robust Language Detection from Message Content
   * Handles Unicode scripts, mixed-language tourist messages (Banglish, Hinglish), and Latin loan words.
   */
  function detectLanguageFromText(text) {
    if (!text || typeof text !== "string") return "en";
    const raw = text.trim();
    const lower = raw.toLowerCase();

    // 1. Bengali script detection (Highest certainty: U+0980 to U+09FF)
    if (/[\u0980-\u09FF]/.test(raw)) {
      return "bn";
    }

    // 2. Devanagari script detection (Hindi vs Marathi)
    if (/[\u0900-\u097F]/.test(raw)) {
      if (/\b(आहे|नाही|कसे|करावे|मला|माहिती|जयपूर|सांगा|करायचे)\b/.test(raw)) return "mr";
      return "hi";
    }

    // 3. Gurmukhi (Punjabi) script (U+0A00 to U+0A7F)
    if (/[\u0A00-\u0A7F]/.test(raw)) return "pa";

    // 4. Gujarati script (U+0A80 to U+0AFF)
    if (/[\u0A80-\u0AFF]/.test(raw)) return "gu";

    // 5. Tamil script (U+0B80 to U+0BFF)
    if (/[\u0B80-\u0BFF]/.test(raw)) return "ta";

    // 6. Telugu script (U+0C00 to U+0C7F)
    if (/[\u0C00-\u0C7F]/.test(raw)) return "te";

    // 7. Urdu / Arabic script (U+0600 to U+06FF)
    if (/[\u0600-\u06FF]/.test(raw)) return "ur";

    // 8. Japanese (Hiragana / Katakana)
    if (/[\u3040-\u30FF\u31F0-\u31FF\uFF65-\uFF9F]/.test(raw)) return "ja";

    // 9. Korean (Hangul)
    if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(raw)) return "ko";

    // 10. Chinese (Hanzi without kana)
    if (/[\u4E00-\u9FFF]/.test(raw)) return "zh";

    // 11. Romanized Bengali / Banglish detection
    if (/\b(amake|kore dao|bhalo|khabar|kothay|shundor|amar|taka|bhabe|jaabo|korbo)\b/i.test(lower)) {
      return "bn";
    }

    // 12. Romanized Hindi / Hinglish detection
    if (/\b(bana do|kya hai|kaise|kahan|sasta|chahiye|batao|kripya|mera budget|hoga|raasta|safarnama)\b/i.test(lower)) {
      return "hi";
    }

    // 13. French keywords
    if (/\b(bonjour|s'il vous plaît|merci|voyage|itinéraire|nourriture|hôtel|sécurité|je veux|visiter|recommande|combien|pourquoi)\b/i.test(lower)) {
      return "fr";
    }

    // 14. Spanish keywords
    if (/\b(hola|por favor|gracias|itinerario|hotel|comida|viaje|seguridad|quiero|recomienda|peligro|cuánto|dónde)\b/i.test(lower)) {
      return "es";
    }

    // 15. German keywords
    if (/\b(hallo|bitte|danke|reise|reiseroute|essen|sicherheit|hotel|sehenswürdigkeiten|empfehlen|wieviel|warum)\b/i.test(lower)) {
      return "de";
    }

    return "en";
  }

  /**
   * Clear 5-Tier Language Priority Resolution:
   * 1. Explicit user request in prompt ("বাংলায় উত্তর দাও", "answer in Hindi", "réponds en français")
   * 2. Manual UI selector override (if user selected a specific language other than "auto")
   * 3. Detected language of current message
   * 4. Ongoing conversation continuity
   * 5. English default
   */
  function resolveResponseLanguage(userQuery) {
    const raw = userQuery.trim();

    // --- Priority 1: Explicit Language Request in the User Message ---
    if (/বাংলায়|in bengali|to bengali|into bengali|bengali mein/i.test(raw)) return "bn";
    if (/हिंदी में|हिन्दी में|in hindi|to hindi|into hindi|hindi mein/i.test(raw)) return "hi";
    if (/தமிழில்|in tamil|to tamil|into tamil/i.test(raw)) return "ta";
    if (/తెలుగులో|in telugu|to telugu|into telugu/i.test(raw)) return "te";
    if (/मराठीत|in marathi|to marathi|into marathi/i.test(raw)) return "mr";
    if (/ગુજરાતીમાં|in gujarati|to gujarati|into gujarati/i.test(raw)) return "gu";
    if (/ਪੰਜਾਬੀ ਵਿੱਚ|in punjabi|to punjabi|into punjabi/i.test(raw)) return "pa";
    if (/اردو میں|in urdu|to urdu|into urdu/i.test(raw)) return "ur";
    if (/en français|en francais|in french|to french|réponds en français/i.test(raw)) return "fr";
    if (/en español|en espanol|in spanish|to spanish|responde en español/i.test(raw)) return "es";
    if (/auf deutsch|in german|to german/i.test(raw)) return "de";
    if (/日本語で|in japanese|to japanese/i.test(raw)) return "ja";
    if (/한국어로|in korean|to korean/i.test(raw)) return "ko";
    if (/用中文|in chinese|to chinese/i.test(raw)) return "zh";
    if (/in english|to english|answer in english|from now on answer in english/i.test(raw)) return "en";

    // --- Priority 2: Manual UI Language Selector (if user intentionally picked a specific language) ---
    if (tripSession.preferredLanguage && tripSession.preferredLanguage !== "auto") {
      return tripSession.preferredLanguage;
    }

    // --- Priority 3: Automatic Detection from the Current User Message ---
    const detected = detectLanguageFromText(raw);
    if (detected && detected !== "en") {
      tripSession.activeConversationLanguage = detected;
      return detected;
    }

    // If English text detected explicitly
    if (detected === "en" && /^[a-zA-Z0-9\s\.\,\?\!\'\-\₹\$\€]+$/.test(raw)) {
      tripSession.activeConversationLanguage = "en";
      return "en";
    }

    // --- Priority 4: Ongoing Conversation Language Continuity ---
    if (tripSession.activeConversationLanguage && tripSession.activeConversationLanguage !== "auto") {
      return tripSession.activeConversationLanguage;
    }

    // --- Priority 5: Fallback to English ---
    return "en";
  }

  // Set Language manually via selector
  function setLanguage(langCode) {
    if (langCode === "auto" || langConfig[langCode]) {
      tripSession.preferredLanguage = langCode;
      SafeTripStore.setAiLanguage(langCode);
      if (langCode !== "auto") {
        tripSession.activeConversationLanguage = langCode;
      }
      return true;
    }
    return false;
  }

  function getLanguage() {
    return tripSession.preferredLanguage || "auto";
  }

  /* ==========================================================================
     MAIN MESSAGE PROCESSOR (GEMINI INTEL LAYER)
     ========================================================================== */
  function processMessage(userQuery) {
    const raw = userQuery.trim();
    const normalized = normalizeNumerals(raw);
    const lang = resolveResponseLanguage(raw);
    const qLower = normalized.toLowerCase();

    // 1. SAFETY CRITICAL / IMMEDIATE DISTRESS (Top Priority across all languages)
    if (
      qLower.includes("unsafe") || qLower.includes("scared") || qLower.includes("danger") || 
      qLower.includes("emergency") || qLower.includes("someone following") || qLower.includes("help me") ||
      qLower.includes("নিরাপদ বোধ করছি না") || qLower.includes("বিপদে") || qLower.includes("বাঁচাও") ||
      qLower.includes("असुरक्षित") || qLower.includes("बचाओ") || qLower.includes("मदद") ||
      qLower.includes("pas en sécurité") || qLower.includes("danger") || qLower.includes("peligro") || qLower.includes("ayuda")
    ) {
      return buildSafetyEmergencyResponse(lang);
    }

    // 2. MAKE MY TRIP SAFER
    if (
      qLower.includes("make my trip safer") || qLower.includes("make it safer") || 
      qLower.includes("safer route") || qLower.includes("safety advice") || 
      qLower.includes("সুরক্ষিত") || qLower.includes("নিরাপদ") || qLower.includes("सुरक्षित")
    ) {
      return buildMakeSaferResponse(lang);
    }

    // 3. SPECIAL TRANSLATION INTENT (Explicit translation request)
    if (
      /translate|translation|হিন্দিতে translate|বাংলায় translate|translat|अनुवाद|কিভাবে বলব|how do i say|how to ask/i.test(raw)
    ) {
      return buildTranslationBridgeResponse(raw, lang);
    }

    // 4. BUDGET OPTIMIZATION ("Make it cheaper", "only 7000 left", "সস্তা", "কম বাজেট")
    if (
      qLower.includes("cheaper") || qLower.includes("sasta") || qLower.includes("make it cheaper") || 
      qLower.includes("left") || qLower.includes("কম খরচ") || qLower.includes("সস্তা") ||
      (qLower.includes("budget") && (qLower.includes("cut") || qLower.includes("reduce") || qLower.includes("tight") || qLower.includes("কম")))
    ) {
      return buildBudgetOptimizationResponse(normalized, lang);
    }

    // 5. TRIP PLANNER & ITINERARY (e.g. "Plan Jaipur for 3 days under ₹10,000", "৩ দিনের ট্রিপ", "budget trip bana do")
    if (
      qLower.includes("plan") || qLower.includes("trip") || qLower.includes("itinerary") || 
      qLower.includes("days") || qLower.includes("din") || qLower.includes("weekend") || 
      qLower.includes("tour") || qLower.includes("bana do") || qLower.includes("kore dao") ||
      qLower.includes("প্ল্যান") || qLower.includes("ট্রিপ") || qLower.includes("ভ্রমণ") ||
      qLower.includes("दिन") || qLower.includes("यात्रा") || qLower.includes("itinerario") || qLower.includes("itinéraire")
    ) {
      return buildTripPlannerResponse(normalized, lang);
    }

    // 6. LOCAL FOOD & DINING DISCOVERY ("authentic food", "খাবার", "भोजन", "dal baati", "kachori")
    if (
      qLower.includes("food") || qLower.includes("eat") || qLower.includes("dish") || 
      qLower.includes("kachori") || qLower.includes("dal baati") || qLower.includes("ghewar") || 
      qLower.includes("dinner") || qLower.includes("lunch") || 
      qLower.includes("খাবার") || qLower.includes("খাওয়া") || qLower.includes("ভোজন") ||
      qLower.includes("खाना") || qLower.includes("भोजन") || qLower.includes("nourriture") || qLower.includes("comida")
    ) {
      return buildLocalFoodResponse(normalized, lang);
    }

    // 7. AUTHENTIC EXPERIENCES (Pottery, block printing, food walks, crafts, কর্মশালা)
    if (
      qLower.includes("experience") || qLower.includes("workshop") || qLower.includes("pottery") || 
      qLower.includes("craft") || qLower.includes("printing") || qLower.includes("folk") || 
      qLower.includes("activity") || qLower.includes("activities") || 
      qLower.includes("অভিজ্ঞতা") || qLower.includes("কর্মশালা") || qLower.includes("হস্তশিল্প") ||
      qLower.includes("अनुभव") || qLower.includes("हस्तशिल्प") || qLower.includes("activité") || qLower.includes("experiencia")
    ) {
      return buildExperiencesResponse(normalized, lang);
    }

    // 8. ACCOMMODATION & STAYS ("hotel", "stay", "হোটেল", "থাকব", "होटल")
    if (
      qLower.includes("hotel") || qLower.includes("stay") || qLower.includes("hostel") || 
      qLower.includes("resort") || qLower.includes("room") || 
      qLower.includes("হোটেল") || qLower.includes("থাকার") ||
      qLower.includes("होटल") || qLower.includes("रुकने") || qLower.includes("hébergement") || qLower.includes("alojamiento")
    ) {
      return buildAccommodationResponse(normalized, lang);
    }

    // 9. DESTINATION EXPLAINER ("What is Amber Fort famous for?", "Jaipur কেন বিখ্যাত?")
    for (const d of SafeTripData.destinations) {
      if (qLower.includes(d.name.toLowerCase()) || qLower.includes(d.id.replace("-", " "))) {
        return buildDestinationExplanationResponse(d, lang);
      }
    }
    if (
      qLower.includes("famous for") || qLower.includes("what to see") || qLower.includes("attractions") || 
      qLower.includes("famous") || qLower.includes("কেন বিখ্যাত") || qLower.includes("কী দেখব") || 
      qLower.includes("क्यों प्रसिद्ध") || qLower.includes("por qué es famoso") || qLower.includes("pourquoi est-ce célèbre")
    ) {
      return buildDestinationOverviewResponse(lang);
    }

    // 10. WHAT SHOULD I DO RIGHT NOW? ("right now", "tonight", "এখন কি করব", "अभी क्या करूँ")
    if (
      qLower.includes("right now") || qLower.includes("tonight") || qLower.includes("now") || 
      qLower.includes("evening") || qLower.includes("currently") || 
      qLower.includes("এখন কি") || qLower.includes("আজ রাতে") ||
      qLower.includes("अभी क्या") || qLower.includes("आज शाम") || qLower.includes("que faire maintenant")
    ) {
      return buildWhatToDoNowResponse(lang);
    }

    // 11. ACCESSIBILITY & PACING (Elderly parents, wheelchair, low walking, প্রবীণ)
    if (
      qLower.includes("elderly") || qLower.includes("parents") || qLower.includes("wheelchair") || 
      qLower.includes("walking") || qLower.includes("kids") || 
      qLower.includes("বাবা-মা") || qLower.includes("বয়স্ক") || qLower.includes("প্রবীণ") ||
      qLower.includes("बुजुर्ग") || qLower.includes("माता-पिता")
    ) {
      return buildAccessibilityPacingResponse(normalized, lang);
    }

    // Fallback Contextual Assistant Response in Target Language
    return buildGeneralCompanionResponse(normalized, lang);
  }

  // Subtle visual pill communicating active response language
  function renderLanguageIndicator(lang) {
    if (lang === "en") return "";
    const conf = langConfig[lang] || { name: lang, flag: "🌐" };
    return `<div class="ai-detected-lang-pill"><span>${conf.flag}</span> Responding in ${conf.name}</div>`;
  }

  /* ==========================================================================
     MULTILINGUAL RESPONSE BUILDERS
     ========================================================================== */

  // 1. IMMEDIATE SAFETY EMERGENCY
  function buildSafetyEmergencyResponse(lang) {
    let headline, sub, callPolice, callHosp, sosBtn, safeCorridorBtn;

    if (lang === "bn") {
      headline = "🚨 জরুরি নিরাপত্তা মোড সক্রিয় (HIGH PRIORITY)";
      sub = "আপনার লাইভ লোকেশন রাজস্থান ট্যুরিস্ট সুরক্ষা গ্রিডে ট্র্যাক করা হচ্ছে। আতঙ্কিত হবেন না, নিচের পদক্ষেপগুলি অনুসরণ করুন:";
      callPolice = "📞 কল করুন: 1363";
      callHosp = "📞 ২৪/৭ ট্রমা: 01412560291";
      sosBtn = "🚨 ডেমো SOS ট্রিগার করুন (INC টিকিট)";
      safeCorridorBtn = "🛡️ নিরাপদ করিডোরে যান";
    } else if (lang === "hi") {
      headline = "🚨 तत्काल सुरक्षा सहायता सक्रिय (HIGH PRIORITY)";
      sub = "आपकी लाइव लोकेशन राजस्थान पुलिस सुरक्षा ग्रिड पर ट्रैक हो रही है। कृपया घबराएं नहीं और तुरंत यह कदम उठाएं:";
      callPolice = "📞 डायल करें: 1363";
      callHosp = "📞 24/7 ट्रॉमा: 01412560291";
      sosBtn = "🚨 डेमो SOS अलर्ट भेजें";
      safeCorridorBtn = "🛡️ सुरक्षित कॉरिडोर में जाएं";
    } else if (lang === "fr") {
      headline = "🚨 ALERTE DE SÉCURITÉ IMMÉDIATE ACTIVÉE";
      sub = "Votre position est suivie sur la grille de sécurité touristique du Rajasthan. Suivez ces étapes d'urgence :";
      callPolice = "📞 Appeler 1363";
      callHosp = "📞 Urgences 24/7";
      sosBtn = "🚨 Déclencher SOS Démo";
      safeCorridorBtn = "🛡️ Rejoindre le Couloir Sécurisé";
    } else if (lang === "es") {
      headline = "🚨 RESPUESTA DE SEGURIDAD INMEDIATA ACTIVADA";
      sub = "Tu ubicación está siendo rastreada en la red de seguridad turística de Rajastán. Sigue estos pasos:";
      callPolice = "📞 Llamar 1363";
      callHosp = "📞 Urgencias 24/7";
      sosBtn = "🚨 Activar SOS Demo";
      safeCorridorBtn = "🛡️ Ir a Corredor Seguro";
    } else {
      headline = "🚨 IMMEDIATE SAFETY RESPONSE ACTIVATED";
      sub = "Your location is actively tracked on the Rajasthan Tourism Safety Grid. Follow these immediate protective steps:";
      callPolice = "📞 Dial 1363";
      callHosp = "📞 24/7 Trauma: 01412560291";
      sosBtn = "🚨 Trigger Emergency SOS (Demo INC)";
      safeCorridorBtn = "🛡️ Walk to Safe Corridor";
    }

    return `
      <div class="ai-res-card safety-critical">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge danger">● HIGH PRIORITY SAFETY DISPATCH</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #b91c1c; margin: 6px 0;">${headline}</h4>
        <p style="font-size: 12.5px; color: #334155; margin-bottom: 12px;">${sub}</p>
        
        <div class="ai-safety-hotspots">
          <div class="hotspot-row">
            <div>
              <b style="font-size: 13px; color: #0f172a;">Rajasthan Tourist Police Thana (Beat 4)</b>
              <div style="font-size: 11.5px; color: #64748b;">Distance: <b>120 meters</b> • High-lux lit corridor</div>
            </div>
            <a href="tel:1363" class="btn-safety-call" style="background:#0284c7; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700;">${callPolice}</a>
          </div>

          <div class="hotspot-row">
            <div>
              <b style="font-size: 13px; color: #0f172a;">Sawai Man Singh (SMS) Hospital Trauma Center</b>
              <div style="font-size: 11.5px; color: #64748b;">Distance: <b>2.4 km</b> • 24/7 Level-1 Emergency</div>
            </div>
            <a href="tel:01412560291" class="btn-safety-call" style="background:#059669; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:700;">${callHosp}</a>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; gap: 8px;">
          <button class="btn-res-action danger" onclick="openSOSConfirmationModal()">
            ${sosBtn}
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.showSaferRoute()">
            ${safeCorridorBtn}
          </button>
        </div>
      </div>
    `;
  }

  // 2. MAKE MY TRIP SAFER
  function buildMakeSaferResponse(lang) {
    let title, point1, point2, point3, btnRoute, btnId;

    if (lang === "bn") {
      title = "আপনার ভ্রমণকে সুরক্ষিত করার AI পরামর্শ:";
      point1 = "<b>নিরাপদ হেরিটেজ করিডোর বেছে নিন:</b> হাওয়া মহল থেকে আম্বারের জন্য কনক বৃন্দাবন পথ (৯৬% সিসিটিভি ও বিট ৪ পুলিশ টহল) ব্যবহার করুন।";
      point2 = "<b>সন্ধ্যা ৬:৩০-এর মধ্যে নাহারগড় থেকে প্রস্থান:</b> পাহাড়ি বাঁকে অন্ধকার নামার আগেই প্রধান আলোকিত সড়কে ফিরে আসুন।";
      point3 = "<b>ডিজিটাল ট্রাভেল আইডি ও ৩০ মিনিটের চেক-ইন:</b> আপনার ৩০ মিনিটের নিরাপত্তা টাইমার চালু রাখুন যাতে অভিভাবকের কাছে তাৎক্ষণিক সতর্কতা যায়।";
      btnRoute = "🛡️ নিরাপদ রুট লেয়ার সক্রিয় করুন";
      btnId = "🪪 ডিজিটাল ট্রাভেল আইডি দেখুন";
    } else if (lang === "hi") {
      title = "आपकी यात्रा को सुरक्षित बनाने के AI सुझाव:";
      point1 = "<b>सुरक्षित हेरिटेज कॉरिडोर चुनें:</b> हवा महल से आमेर के लिए कनक वृंदावन मार्ग (96% सीसीटीवी और पुलिस बीट) लें।";
      point2 = "<b>शाम 6:30 बजे से पहले नाहरगढ़ से वापसी:</b> पहाड़ी मोड़ों पर अंधेरा होने से पहले मुख्य सड़क की ओर आ जाएं।";
      point3 = "<b>डिजिटल आईडी व 30 मिनट चेक-इन:</b> आपका 30-मिनट का सुरक्षा टाइमर सक्रिय है। मिस होने पर अभिभावक को ऑटो-अलर्ट भेजा जाएगा।";
      btnRoute = "🛡️ सुरक्षित मार्ग सक्रिय करें";
      btnId = "🪪 डिजिटल आईडी देखें";
    } else {
      title = "Actionable Steps to Maximize Your Safety in Jaipur:";
      point1 = "<b>Choose the Patrolled Heritage Corridor:</b> Use the 22-min Kanak Vrindavan highway (96% CCTV & Beat 4 active patrols) instead of the unlit mountain bypass.";
      point2 = "<b>Nahargarh Sunset Cutoff:</b> Depart the upper ramparts by 6:30 PM before sharp mountain curves lose visibility.";
      point3 = "<b>Verify ZK-Digital ID & Check-In:</b> Your 30-minute safety timer keeps your emergency contact automatically synchronized.";
      btnRoute = "🛡️ Activate Safest Route Layer";
      btnId = "🪪 View Digital Travel ID";
    }

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge safe">🛡️ AI SAFETY INTELLIGENCE</div>
        <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 4px 0 8px;">${title}</h4>
        
        <ul class="ai-bullet-list">
          <li>${point1}</li>
          <li>${point2}</li>
          <li>${point3}</li>
        </ul>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.showSaferRoute()">
            ${btnRoute}
          </button>
          <button class="btn-res-action secondary" onclick="openDigitalIdModalView('view')">
            ${btnId}
          </button>
        </div>
      </div>
    `;
  }

  // 3. TRANSLATION BRIDGE (Special Translation Intent)
  function buildTranslationBridgeResponse(query, lang) {
    const rawLower = query.toLowerCase();
    let targetLang = "hi";

    if (/into bengali|to bengali|বাংলায়|bengali mein/i.test(query)) targetLang = "bn";
    else if (/into hindi|to hindi|हिंदी में|हिन्दी में|hindi mein/i.test(query)) targetLang = "hi";
    else if (/into french|to french|en français/i.test(query)) targetLang = "fr";
    else if (/into spanish|to spanish|en español/i.test(query)) targetLang = "es";
    else if (lang && lang !== "en" && lang !== "auto") targetLang = lang;

    let phraseData = null;

    // Test Case 7: "Where is the nearest police station?"
    if (rawLower.includes("police") || rawLower.includes("station") || rawLower.includes("चौकी") || rawLower.includes("থানা")) {
      if (targetLang === "bn") {
        phraseData = {
          category: "Emergency & Police",
          native: "সবচেয়ে কাছের পুলিশ সহায়তা স্টেশন বা বুথটি কোথায়?",
          phonetic: "Sobcheye kacher police sahayata station ba booth-ti kothay?",
          english: "Where is the nearest police station / assistance booth?",
          tip: "Use if lost or needing immediate police guidance."
        };
      } else {
        phraseData = {
          category: "Emergency & Police",
          native: "यहाँ सबसे नज़दीकी पुलिस सहायता चौकी / स्टेशन कहाँ है?",
          phonetic: "Yahan sabse nazdeeki police sahayata chowki / station kahan hai?",
          english: "Where is the nearest police assistance post / station?",
          tip: "Show this to a local or traffic officer for instant directions."
        };
      }
    } 
    // Test Case 8: "I need help"
    else if (rawLower.includes("help") || rawLower.includes("সাহায্য") || rawLower.includes("मदद") || rawLower.includes("distress")) {
      if (targetLang === "bn") {
        phraseData = {
          category: "Emergency & Safety",
          native: "আমার জরুরি সাহায্য প্রয়োজন। দয়া করে আমাকে সহায়তা করুন।",
          phonetic: "Amar joruri sahajjo proyojon. Doya kore amake sohayota korun.",
          english: "I need urgent help. Please assist me.",
          tip: "Show this to any nearby shopkeeper, authority guard, or driver."
        };
      } else {
        phraseData = {
          category: "Emergency & Safety",
          native: "मुझे तत्काल सहायता की आवश्यकता है। कृपया मेरी मदद करें।",
          phonetic: "Mujhe tatkal sahayata ki avashyakta hai. Kripya meri madad karein.",
          english: "I need urgent assistance. Please help me.",
          tip: "Show this immediately if in distress or needing medical/police help."
        };
      }
    }
    // Auto Fare / Driver questions
    else if (rawLower.includes("fare") || rawLower.includes("auto") || rawLower.includes("rickshaw") || rawLower.includes("driver") || rawLower.includes("ভাড়া") || rawLower.includes("किराया")) {
      if (targetLang === "bn") {
        phraseData = {
          category: "Auto / Taxi Transit",
          native: "ভাইয়া, হাওয়া মহলে যাওয়ার মিটার ভাড়া কত হবে?",
          phonetic: "Bhaiya, Hawa Mahal-e jaowar meter bhara koto hobe?",
          english: "Brother, how much is the meter fare to Hawa Mahal?",
          tip: "Show to the auto driver before boarding."
        };
      } else {
        phraseData = {
          category: "Auto / Taxi Transit",
          native: "भैया, हवा महल जाने का मीटर से कितना किराया होगा?",
          phonetic: "Bhaiya, Hawa Mahal jaane ka meter se kitna kiraya hoga?",
          english: "Brother, how much will you charge to go to Hawa Mahal by meter?",
          tip: "Show to the auto driver before boarding to ensure fair pricing."
        };
      }
    }
    // Spicy food
    else if (rawLower.includes("spicy") || rawLower.includes("chilli") || rawLower.includes("ঝাল") || rawLower.includes("तीखा")) {
      if (targetLang === "bn") {
        phraseData = {
          category: "Food & Dining",
          native: "দয়া করে খাবার কম ঝাল করবেন, লঙ্কা কম দেবেন এবং পরিষ্কার জল দেবেন।",
          phonetic: "Doya kore khabar kom jhal korben, lonka kom deben ebong porishkar jol deben.",
          english: "Please make the food less spicy with mild chilli and clean water.",
          tip: "Helpful at local dhabas and heritage sweet stalls."
        };
      } else {
        phraseData = {
          category: "Food & Dining",
          native: "कृपया खाना कम तीखा बनाइए, मिर्ची कम डालना और साफ़ पानी देना।",
          phonetic: "Kripya khana kam teekha banaiye, mirchi kam daalna aur saaf paani dena.",
          english: "Please make the food less spicy with very little chilli and clean drinking water.",
          tip: "Handy at traditional sweet shops and dhabas."
        };
      }
    }
    // Default fallback phrase
    else {
      if (targetLang === "bn") {
        phraseData = {
          category: "General Tourist Query",
          native: "দয়া করে আমাকে সাহায্য করবেন? আমি একজন পর্যটক।",
          phonetic: "Doya kore amake sahajjo korben? Ami ekjon porjotok.",
          english: "Could you please help me? I am a tourist.",
          tip: "Polite phrase to begin conversation with any local."
        };
      } else {
        phraseData = SafeTripData.translationPhrases[0];
        phraseData.native = phraseData.hindi;
      }
    }

    return `
      <div class="ai-res-card translation-card">
        ${renderLanguageIndicator(targetLang)}
        <div class="ai-card-badge info">🌐 LOCAL TRANSLATION BRIDGE</div>
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin: 4px 0;">
          Category: ${phraseData.category}
        </div>

        <div class="translation-devanagari" style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 8px 0;">
          "${phraseData.native}"
        </div>

        <div class="translation-phonetic" style="font-size: 13px; color: #0284c7; font-weight: 600;">
          🗣️ <i>Phonetic: "${phraseData.phonetic}"</i>
        </div>

        <div class="translation-english" style="font-size: 12.5px; color: #475569; margin: 6px 0;">
          <b>Meaning:</b> "${phraseData.english}"
        </div>

        <div style="font-size: 11.5px; color: #059669; margin: 8px 0;">
          💡 <b>Traveler Tip:</b> ${phraseData.tip}
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.showCustomLocalPhrase('${phraseData.native.replace(/'/g, "\\'")}', '${phraseData.phonetic.replace(/'/g, "\\'")}', '${phraseData.english.replace(/'/g, "\\'")}')">
            📱 Show Fullscreen Card to Local Driver / Vendor
          </button>
        </div>
      </div>
    `;
  }

  // 4. BUDGET OPTIMIZATION
  function buildBudgetOptimizationResponse(query, lang) {
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

    let headline, desc, lblStay, lblFood, lblTransit, lblExp, lblBuffer, btnApply, btnStays;

    if (lang === "bn") {
      headline = `জয়পুর ৩ দিনের অপটিমাইজড বাজেট: ₹${newBudget.toLocaleString()}`;
      desc = `আমরা সাশ্রয়ী হেরিটেজ হোস্টেল ডর্ম, শেয়ার্ড ই-রিকশা এবং বিনামূল্যের স্মৃতিস্তম্ভ প্রমেনেডকে অগ্রাধিকার দিয়ে ₹${bufferCost.toLocaleString()} টাকার ইমার্জেন্সি সেফটি বাফার সুরক্ষিত রেখেছি।`;
      lblStay = "🏨 থাকা (২ রাত)";
      lblFood = "🍲 খাবার ও মিষ্টি";
      lblTransit = "🛺 স্থানীয় যাতায়াত";
      lblExp = "🎨 কারুশিল্প ও টিকিট";
      lblBuffer = "🛡️ ইমার্জেন্সি সেফটি বাফার:";
      btnApply = "📌 My Trip-এ প্রয়োগ করুন";
      btnStays = "🏨 বাজেট হোটেল দেখুন";
    } else if (lang === "hi") {
      headline = `जयपुर 3-दिवसीय अनुकूलित बजट: ₹${newBudget.toLocaleString()}`;
      desc = `हमने हेरिटेज हॉस्टल डॉर्म, ई-रिक्शा और प्रसिद्ध वॉक को प्राथमिकता देकर ₹${bufferCost.toLocaleString()} का आपातकालीन बफ़र सुरक्षित रखा है।`;
      lblStay = "🏨 आवास (2 रातें)";
      lblFood = "🍲 भोजन व मिष्ठान";
      lblTransit = "🛺 स्थानीय परिवहन";
      lblExp = "🎨 शिल्प व प्रवेश";
      lblBuffer = "🛡️ इमरजेंसी सेफ्टी बफ़र:";
      btnApply = "📌 My Trip में लागू करें";
      btnStays = "🏨 बजट स्टे देखें";
    } else {
      headline = `Optimized 3-Day Jaipur Plan for ₹${newBudget.toLocaleString()}`;
      desc = `Switched to high-rated heritage hostel dorms, shared electric rickshaws, and free monument promenades while preserving an emergency safety reserve.`;
      lblStay = "🏨 Stay (2 Nights)";
      lblFood = "🍲 Food & Sweets";
      lblTransit = "🛺 Local Transit";
      lblExp = "🎨 Craft & Entry";
      lblBuffer = "🛡️ Safety Reserve Buffer:";
      btnApply = "📌 Apply to My Trip";
      btnStays = "🏨 View Budget Stays";
    }

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge safe">💰 DYNAMIC BUDGET OPTIMIZER</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 6px 0;">${headline}</h4>
        <p style="font-size: 12.5px; color: #475569; margin-bottom: 12px;">${desc}</p>

        <div class="budget-breakdown-grid">
          <div class="budget-tile">
            <span class="tile-label">${lblStay}</span>
            <b class="tile-val">₹${stayCost.toLocaleString()}</b>
            <span class="tile-sub">Zostel / Arya Niwas</span>
          </div>
          <div class="budget-tile">
            <span class="tile-label">${lblFood}</span>
            <b class="tile-val">₹${foodCost.toLocaleString()}</b>
            <span class="tile-sub">Rawat, LMB & Lassiwala</span>
          </div>
          <div class="budget-tile">
            <span class="tile-label">${lblTransit}</span>
            <b class="tile-val">₹${transitCost.toLocaleString()}</b>
            <span class="tile-sub">E-rickshaws & Auto</span>
          </div>
          <div class="budget-tile">
            <span class="tile-label">${lblExp}</span>
            <b class="tile-val">₹${expCost.toLocaleString()}</b>
            <span class="tile-sub">Bagru print & passes</span>
          </div>
        </div>

        <div class="budget-buffer-banner">
          <span>${lblBuffer} <b>₹${bufferCost.toLocaleString()}</b></span>
          <span style="font-size: 11px; color: #059669; font-weight: 600;">Preserved for Emergencies</span>
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.addBudgetPlanToTrip()">
            ${btnApply}
          </button>
          <button class="btn-res-action secondary" onclick="handleUserAIMessage('Show me cheap budget stays near Hawa Mahal')">
            ${btnStays}
          </button>
        </div>
      </div>
    `;
  }

  // 5. TRIP PLANNER & ITINERARY GENERATOR
  function buildTripPlannerResponse(query, lang) {
    let days = 3;
    const daysMatch = query.match(/(\d+)\s*(?:day|days|din|দিন|दिन|tage|jours|días)/i);
    if (daysMatch) {
      days = parseInt(daysMatch[1], 10);
    } else if (query.includes("1 day") || query.includes("1 দিন") || query.includes("এক দিন") || query.includes("1 दिन")) days = 1;
    else if (query.includes("2 day") || query.includes("2 দিন") || query.includes("দুই দিন") || query.includes("weekend")) days = 2;
    else if (query.includes("4 day") || query.includes("4 দিন")) days = 4;

    let budget = 10000;
    const allNums = query.match(/\d[\d,]*/g);
    if (allNums) {
      const nums = allNums.map(n => parseInt(n.replace(/,/g, ""), 10));
      const budgetCand = nums.find(val => val >= 1000);
      if (budgetCand) {
        budget = budgetCand;
      }
    }

    tripSession.days = days;
    tripSession.budgetTotal = budget;

    let headerTitle, headerSub, safetyIndexLabel, btnSave, btnCheaper, btnMap;
    let day1Title, day1Slot1, day1Slot2, day1Slot3;
    let day2Title, day2Slot1, day2Slot2, day2Slot3;
    let day3Title, day3Slot1, day3Slot2, day3Slot3;

    if (lang === "bn") {
      headerTitle = `জয়পুর ${days} দিনের হেরিটেজ ও সেফটি ভ্রমণ পরিকল্পনা (বাজেট: ₹${budget.toLocaleString()})`;
      headerSub = `সাংস্কৃতিক পর্যটকদের জন্য উপযোগী • আনুমানিক খরচ: <b>₹${Math.round(budget * 0.84).toLocaleString()}</b>`;
      safetyIndexLabel = "সেফটি সূচক";
      btnSave = "📌 সম্পূর্ণ প্ল্যান My Trip-এ সেভ করুন";
      btnCheaper = "💰 বাজেট আরো কমান";
      btnMap = "🗺️ ম্যাপে স্থানগুলি দেখুন";

      day1Title = "Day 1: Amber Fort ও প্রাচীন প্রাচীরঘেরা শহরের ঐতিহ্য";
      day1Slot1 = {
        time: "০৮:৩০ AM",
        title: "Amber Fort ও Sheesh Mahal দর্শন",
        desc: "প্রখর রোদের আগেই পৌঁছান; সুরজ পোল, দেওয়ান-ই-আম এবং আয়নার তৈরি শীশ মহল ঘুরে দেখুন।",
        meta: "🛡️ পুলিশ প্রহরা সক্রিয় • র‍্যাম্প সুবিধা উপলব্ধ"
      };
      day1Slot2 = {
        time: "০১:০০ PM",
        title: "LMB-তে খাঁটি ডাল বাটি চুরমা লাঞ্চ",
        desc: "জোহারী বাজারের শতবর্ষী ঐতিহ্যের খাঁটি ঘিয়ের ডাল বাটি ও পঞ্চমেল ডাল।",
        meta: "🍲 নিরামিষ / জৈন • হাইজিন রেটিং যাচাইকৃত"
      };
      day1Slot3 = {
        time: "০৬:০০ PM",
        title: "Hawa Mahal ও সান্ধ্যকালীন প্রাচীন বাজার পদযাত্রা",
        desc: "৯৫৩টি ঝরোখার আলোকময় রাতের দৃশ্য ও সুরক্ষিত আলোকিত করিডোরে সান্ধ্য হাঁটা।",
        meta: "🛡️ উচ্চ আলোকসজ্জা করিডোর • সিডের বর্তমান অবস্থান"
      };

      day2Title = "Day 2: রাজপ্রাসাদ ও হস্তশিল্পের ঐতিহ্যবাহী কর্মশালা";
      day2Slot1 = {
        time: "০৯:৩০ AM",
        title: "City Palace ও Jantar Mantar মানমন্দির",
        desc: "চন্দ্র মহল, ময়ূর তোরণ এবং বিশ্বের বৃহত্তম পাথরের সূর্যঘড়ি দর্শন।",
        meta: "🛡️ ইউনেস্কো হেরিটেজ গার্ড • সমতল হাঁটার পথ"
      };
      day2Slot2 = {
        time: "০২:৩০ PM",
        title: "সাঙ্গানের ব্লু পটারি আর্ট মাস্টারক্লাস",
        desc: "অভিজ্ঞ কারিগরের সাথে কোবাল্ট সিরামিক ঢালাই ও রঙের সরাসরি প্রশিক্ষণ।",
        meta: "🎨 খাঁটি হস্তশিল্প • সার্টিফায়েড কারিগর গিল্ড"
      };
      day2Slot3 = {
        time: "০৬:৩০ PM",
        title: "Jal Mahal লেকের ধারে সূর্যাস্ত ও হাঁটা",
        desc: "মনসাগর লেকফ্রন্টে মোটরসাইকেল পুলিশ টহলবেষ্টিত সান্ধ্য promenade।",
        meta: "🛡️ ওয়াটারফ্রন্ট ব্যারিয়ার • সার্বক্ষণিক নিরাপত্তা"
      };

      day3Title = "Day 3: ঐতিহ্যবাহী স্থাপত্য, ফটোগ্রাফি ও লোকশিল্প সন্ধ্যা";
      day3Slot1 = {
        time: "০৮:০০ AM",
        title: "Patrika Gate প্রাতঃকালীন ফটো ওয়াক",
        desc: "ভিড় জমার আগেই রঙিন রাজস্থানি দেয়ালচিত্র ও তোরণের ছবি তুলুন।",
        meta: "🌿 উন্মুক্ত পাবলিক পার্ক • ২৪/৭ সিকিউরিটি বুথ"
      };
      day3Slot2 = {
        time: "০৩:৩০ PM",
        title: "Albert Hall Museum ও রামনিবাস গার্ডেন",
        desc: "ইন্দো-সারাসেনিক স্থাপত্যের রাজকীয় যাদুঘর ও প্রাচীন মিশরীয় মমি।",
        meta: "🏛️ লিফট সুবিধা • ছায়াঘেরা বাগান"
      };
      day3Slot3 = {
        time: "০৭:০০ PM",
        title: "রাজস্থানি লোকসঙ্গীত ও পুতুলনাচ (কাঠপুতলি) সন্ধ্যা",
        desc: "প্রাচীন হাভেলির উঠোনে মাঙ্গানিয়ার সঙ্গীত ও লোকগাঁথা।",
        meta: "🎭 পরিবার ও প্রবীণদের উপযোগী • নিরাপদ পরিবেশ"
      };
    } else if (lang === "hi") {
      headerTitle = `जयपुर ${days}-दिवसीय हेरिटेज व सुरक्षा यात्रा योजना (बजट: ₹${budget.toLocaleString()})`;
      headerSub = `सांस्कृतिक अन्वेषण • अनुमानित खर्च: <b>₹${Math.round(budget * 0.84).toLocaleString()}</b>`;
      safetyIndexLabel = "सेफ्टी इंडेक्स";
      btnSave = "📌 पूरा प्लान My Trip में सेव करें";
      btnCheaper = "💰 इसे और सस्ता बनाएं";
      btnMap = "🗺️ मैप पर स्थल देखें";

      day1Title = "Day 1: आमेर किला व चारदीवारी शहर की विरासत";
      day1Slot1 = {
        time: "08:30 AM",
        title: "Amber Fort व शीश महल दर्शन",
        desc: "धूप से पहले सूरज पोल, गणेश पोल और दर्पणों से सजे शीश महल का दीदार करें।",
        meta: "🛡️ पुलिस पोस्ट सक्रिय • रैंप सुविधा उपलब्ध"
      };
      day1Slot2 = {
        time: "01:00 PM",
        title: "LMB जौहरी बाजार में दाल बाटी चूरमा लंच",
        desc: "पारंपरिक पंचमेल दाल, शुद्ध देसी घी बाटी व चूरमा का प्रामाणिक स्वाद।",
        meta: "🍲 शुद्ध शाकाहारी / जैन • स्वच्छता प्रमाणित"
      };
      day1Slot3 = {
        time: "06:00 PM",
        title: "Hawa Mahal व शाम की परकोटा हेरिटेज वॉक",
        desc: "953 झरोखों वाले हवा महल की रोशन छटा और जौहरी बाजार में सुरक्षित सैर।",
        meta: "🛡️ हाई-लक्स लाइट कॉरिडोर • सिड का वर्तमान क्षेत्र"
      };

      day2Title = "Day 2: राजमहल व हस्तशिल्प मास्टरक्लास";
      day2Slot1 = {
        time: "09:30 AM",
        title: "City Palace व जंतर मंतर वेधशाला",
        desc: "प्रीतम निवास चौक के मयूर द्वार व विश्व की सबसे बड़ी पत्थर की धूपघड़ी।",
        meta: "🛡️ यूनेस्को हेरिटेज गार्ड • समतल रास्ते"
      };
      day2Slot2 = {
        time: "02:30 PM",
        title: "सांगानेर ब्लू पॉटरी हस्तशिल्प कार्यशाला",
        desc: "पुश्तैनी कारीगरों से सीखें कोबाल्ट ग्लेज मिट्टी के बर्तन बनाने की कला।",
        meta: "🎨 प्रमाणित कारीगर संघ • सुरक्षित स्टूडियो"
      };
      day2Slot3 = {
        time: "06:30 PM",
        title: "Jal Mahal लेकफ्रंट सनसेट वॉक",
        desc: "मान सागर झील के किनारे पानी में तैरते महल के सूर्यास्त का आनंद लें।",
        meta: "🛡️ जल सुरक्षा बैरियर • नियमित पुलिस गश्त"
      };

      day3Title = "Day 3: वास्तुकला, फोटोग्राफी व सांस्कृतिक संध्या";
      day3Slot1 = {
        time: "08:00 AM",
        title: "Patrika Gate सुबह की फोटो वॉक",
        desc: "जवाहर सर्किल पर राजस्थान के इतिहास को दर्शाते भित्तिचित्रों के खूबसूरत फोटो।",
        meta: "🌿 खुला पार्क • 24/7 सुरक्षा बूथ"
      };
      day3Slot2 = {
        time: "03:30 PM",
        title: "Albert Hall Museum व राम निवास बाग",
        desc: "राजस्थान का सबसे पुराना संग्रहालय और दुर्लभ मिस्र की ममी।",
        meta: "🏛️ लिफ्ट उपलब्ध • छायादार उद्यान"
      };
      day3Slot3 = {
        time: "07:00 PM",
        title: "राजस्थानी लोक संगीत व कठपुतली संध्या",
        desc: "हेरिटेज हवेली में मांगणियार गायकी और पारंपरिक कठपुतली का मनमोहक शो।",
        meta: "🎭 वरिष्ठ नागरिकों के अनुकूल • पारिवारिक वातावरण"
      };
    } else {
      // Default: English
      headerTitle = `${days}-Day Jaipur Heritage & Safety Itinerary`;
      headerSub = `Paced for <b>${tripSession.travelStyle}</b> • Est. Spend: <b>₹${Math.round(budget * 0.84).toLocaleString()}</b>`;
      safetyIndexLabel = "Safety Index";
      btnSave = "📌 Save Complete Plan to My Trip";
      btnCheaper = "💰 Make It Cheaper";
      btnMap = "🗺️ View Sights on Map";

      day1Title = "Day 1: Amber Fort & Walled City Heritage";
      day1Slot1 = {
        time: "08:30 AM",
        title: "Amber Fort & Sheesh Mahal",
        desc: "Arrive early before heat; explore Suraj Pol and mirror palace with registered guide.",
        meta: "🛡️ Police Post active • Ramp access available"
      };
      day1Slot2 = {
        time: "01:00 PM",
        title: "Authentic Dal Baati Lunch at LMB",
        desc: "Signature ghee-baked baati and five-lentil panchmel dal in Johari Bazaar.",
        meta: "🍲 Veg / Jain • Verified Hygiene Rating"
      };
      day1Slot3 = {
        time: "06:00 PM",
        title: "Hawa Mahal & Evening Walled City Walk",
        desc: "Illuminated 953-window facade view followed by Johari Bazaar jewelry walk.",
        meta: "🛡️ High-lux lighting • Sid's live precinct"
      };

      day2Title = "Day 2: Royal Palaces & Artisan Workshops";
      day2Slot1 = {
        time: "09:30 AM",
        title: "City Palace & Jantar Mantar Observatory",
        desc: "Pritam Niwas Peacock Gate courtyards and world's largest stone sundial.",
        meta: "🛡️ UNESCO Heritage Guarded • Level paved paths"
      };
      day2Slot2 = {
        time: "02:30 PM",
        title: "Sanganer Blue Pottery Masterclass",
        desc: "Hands-on ceramic glazing workshop with verified artisan coop.",
        meta: "🎨 Authentic Experience • Certified Rajasthan Guild"
      };
      day2Slot3 = {
        time: "06:30 PM",
        title: "Jal Mahal Promenade Sunset",
        desc: "Walk the lakefront promenade under golden sunset with security patrol.",
        meta: "🛡️ Waterfront Barriers • Regular motorcycle patrol"
      };

      day3Title = "Day 3: Photography, Cenotaphs & Folk Evening";
      day3Slot1 = {
        time: "08:00 AM",
        title: "Patrika Gate Morning Photo Walk",
        desc: "Capture vibrant pastel frescoes portraying Rajasthani legends without crowds.",
        meta: "🌿 Public Park Ring • 24/7 Security Booth"
      };
      day3Slot2 = {
        time: "03:30 PM",
        title: "Albert Hall Museum & Ram Niwas Garden",
        desc: "Indo-Saracenic royal museum with Egyptian mummy and miniature paintings.",
        meta: "🏛️ Elevator Equipped • Shaded gardens"
      };
      day3Slot3 = {
        time: "07:00 PM",
        title: "Rajasthani Folk Music & Kathputli Evening",
        desc: "Manganiyar desert ragas and puppet storytelling in heritage haveli.",
        meta: "🎭 Family & Elderly Friendly • Private haveli"
      };
    }

    return `
      <div class="ai-res-card itinerary-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="itinerary-header-bar">
          <div>
            <div class="ai-card-badge safe">🗺️ CURATED SMART ITINERARY</div>
            <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0;">
              ${headerTitle}
            </h4>
            <div style="font-size: 12px; color: #64748b;">
              ${headerSub}
            </div>
          </div>
          <div class="itinerary-score-pill">
            <span style="font-size: 11px; font-weight: 700; color: #059669;">${safetyIndexLabel}</span>
            <span style="font-size: 16px; font-weight: 800; color: #059669;">94/100</span>
          </div>
        </div>

        <!-- Day 1 -->
        <div class="itinerary-day-box">
          <div class="day-title-row">
            <b>${day1Title}</b>
            <span class="day-cost-badge">Est. ₹1,450</span>
          </div>
          <div class="day-schedule-items">
            <div class="sched-slot">
              <span class="slot-time">${day1Slot1.time}</span>
              <div class="slot-content">
                <b>${day1Slot1.title}</b>
                <p>${day1Slot1.desc}</p>
                <div class="slot-meta">${day1Slot1.meta}</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">${day1Slot2.time}</span>
              <div class="slot-content">
                <b>${day1Slot2.title}</b>
                <p>${day1Slot2.desc}</p>
                <div class="slot-meta">${day1Slot2.meta}</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">${day1Slot3.time}</span>
              <div class="slot-content">
                <b>${day1Slot3.title}</b>
                <p>${day1Slot3.desc}</p>
                <div class="slot-meta">${day1Slot3.meta}</div>
              </div>
            </div>
          </div>
        </div>

        ${days >= 2 ? `
        <!-- Day 2 -->
        <div class="itinerary-day-box">
          <div class="day-title-row">
            <b>${day2Title}</b>
            <span class="day-cost-badge">Est. ₹1,850</span>
          </div>
          <div class="day-schedule-items">
            <div class="sched-slot">
              <span class="slot-time">${day2Slot1.time}</span>
              <div class="slot-content">
                <b>${day2Slot1.title}</b>
                <p>${day2Slot1.desc}</p>
                <div class="slot-meta">${day2Slot1.meta}</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">${day2Slot2.time}</span>
              <div class="slot-content">
                <b>${day2Slot2.title}</b>
                <p>${day2Slot2.desc}</p>
                <div class="slot-meta">${day2Slot2.meta}</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">${day2Slot3.time}</span>
              <div class="slot-content">
                <b>${day2Slot3.title}</b>
                <p>${day2Slot3.desc}</p>
                <div class="slot-meta">${day2Slot3.meta}</div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        ${days >= 3 ? `
        <!-- Day 3 -->
        <div class="itinerary-day-box">
          <div class="day-title-row">
            <b>${day3Title}</b>
            <span class="day-cost-badge">Est. ₹1,650</span>
          </div>
          <div class="day-schedule-items">
            <div class="sched-slot">
              <span class="slot-time">${day3Slot1.time}</span>
              <div class="slot-content">
                <b>${day3Slot1.title}</b>
                <p>${day3Slot1.desc}</p>
                <div class="slot-meta">${day3Slot1.meta}</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">${day3Slot2.time}</span>
              <div class="slot-content">
                <b>${day3Slot2.title}</b>
                <p>${day3Slot2.desc}</p>
                <div class="slot-meta">${day3Slot2.meta}</div>
              </div>
            </div>
            <div class="sched-slot">
              <span class="slot-time">${day3Slot3.time}</span>
              <div class="slot-content">
                <b>${day3Slot3.title}</b>
                <p>${day3Slot3.desc}</p>
                <div class="slot-meta">${day3Slot3.meta}</div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="SafeTripAI.addGeneratedItineraryToTrip()">
            ${btnSave}
          </button>
          <button class="btn-res-action secondary" onclick="handleUserAIMessage('make it cheaper under ₹7,000')">
            ${btnCheaper}
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.viewOnMap([26.9855, 75.8513], 'Amber Fort')">
            ${btnMap}
          </button>
        </div>
      </div>
    `;
  }

  // 6. LOCAL FOOD & CULINARY INTELLIGENCE
  function buildLocalFoodResponse(query, lang) {
    let title, sub, btnNearMe, btnLessSpicy;

    if (lang === "bn") {
      title = "জয়পুরের বিখ্যাত স্থানীয় খাবার ও নিরাপদ ভোজনশালা:";
      sub = "খাদ্যের বিশুদ্ধতা, উচ্চ স্বাস্থ্যবিধি রেটিং এবং তাজা রন্ধনের ভিত্তিতে নির্বাচিত:";
      btnNearMe = "📍 আমার কাছে কী খাবার আছে?";
      btnLessSpicy = "🗣️ অনুবাদ: কম ঝাল খাবার";
    } else if (lang === "hi") {
      title = "जयपुर के प्रसिद्ध स्थानीय पकवान और सुरक्षित भोजनालय:";
      sub = "उच्च स्वच्छता रेटिंग और ताज़ा तैयार किए जाने वाले प्रामाणिक स्थान:";
      btnNearMe = "📍 मेरे पास क्या उपलब्ध है?";
      btnLessSpicy = "🗣️ अनुवाद: कम तीखा खाना";
    } else {
      title = "Famous Local Food & Verified Safe Eateries:";
      sub = "Selected based on culinary authenticity, verified food safety, and heritage reputation:";
      btnNearMe = "📍 What is Near Me Right Now?";
      btnLessSpicy = "🗣️ Translate: Less Spicy";
    }

    const foods = SafeTripData.localFoods;

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge safe">🍲 AUTHENTIC RAJASTHANI FOOD INTEL</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0 8px;">
          ${title}
        </h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
          ${sub}
        </p>

        <div class="food-items-grid">
          ${foods.map(f => {
            const dietLabel = lang === "bn" 
              ? (f.dietaryClass === "veg" ? "নিরামিষ / জৈন" : "আমিষ")
              : (lang === "hi" ? (f.dietaryClass === "veg" ? "शाकाहारी / जैन" : "मांसाहारी") : f.dietary);

            return `
              <div class="food-card-tile">
                <div class="food-head-row">
                  <b>${f.name}</b>
                  <span class="diet-tag ${f.dietaryClass}">● ${dietLabel}</span>
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
            `;
          }).join("")}
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="handleUserAIMessage('Find authentic Rajasthani food near Hawa Mahal')">
            ${btnNearMe}
          </button>
          <button class="btn-res-action secondary" onclick="handleUserAIMessage('How to ask for less spicy food in Hindi?')">
            ${btnLessSpicy}
          </button>
        </div>
      </div>
    `;
  }

  // 7. EXPERIENCES (Distinct from Places)
  function buildExperiencesResponse(query, lang) {
    let title, sub, addBtn;

    if (lang === "bn") {
      title = "জয়পুরের বাস্তব সাংস্কৃতিক অভিজ্ঞতা ও কর্মশালা:";
      sub = "স্মৃতিস্তম্ভের বাইরে সক্রিয় অংশগ্রহণমূলক হস্তশিল্প ও লোকশিল্পের কাজ:";
      addBtn = "+ My Trip-এ যোগ করুন";
    } else if (lang === "hi") {
      title = "जयपुर के वास्तविक सांस्कृतिक अनुभव (Activities to Do):";
      sub = "हस्तशिल्प कार्यशालाएं, पाक-कला भ्रमण और लोक कला संध्या:";
      addBtn = "+ My Trip में जोड़ें";
    } else {
      title = "Things to Actively Participate In (Beyond Monuments):";
      sub = "Workshops and cultural walks with verified artisan cooperatives in safe tourist precincts:";
      addBtn = "+ Add to My Trip";
    }

    const exps = SafeTripData.experiences;

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge info">🎨 AUTHENTIC HANDS-ON EXPERIENCES</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">${title}</h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">${sub}</p>

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
                    ${addBtn}
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
    let title, sub, reserveBtn;

    if (lang === "bn") {
      title = "জয়পুরে যাচাইকৃত নিরাপদ ও বাজেট থাকার জায়গা:";
      sub = "পর্যটন হেরিটেজ করিডোর ও সার্বক্ষণিক নিরাপত্তা বুথের সান্নিধ্যে:";
      reserveBtn = "ডেমো বুকিং (পেমেন্ট প্রয়োজন নেই)";
    } else if (lang === "hi") {
      title = "जयपुर में सत्यापित सुरक्षित व बजट आवास:";
      sub = "हेरिटेज कॉरिडोर के पास, 24/7 सुरक्षा डेस्क और निःशुल्क रद्दीकरण (डेमो):";
      reserveBtn = "डेमो बुकिंग (कोई भुगतान नहीं)";
    } else {
      title = "Curated Accommodations with Verified Safety Context:";
      sub = "Located inside monitored tourist zones with verified security and emergency access:";
      reserveBtn = "Reserve Demo (No Payment Required)";
    }

    const stays = SafeTripData.accommodations;

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge safe">🏨 VERIFIED SAFE ACCOMMODATIONS</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">${title}</h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">${sub}</p>

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
                  ${reserveBtn}
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
    let whyFamousLabel = "What this place is famous for:";
    let btnMap = "🗺️ View on Safety Map";
    let btnTrip = "📌 Add to My Trip";

    if (lang === "bn") {
      whyFamousLabel = "এই স্থানটি কেন বিখ্যাত:";
      btnMap = "🗺️ সেফটি ম্যাপে দেখুন";
      btnTrip = "📌 My Trip-এ যোগ করুন";
    } else if (lang === "hi") {
      whyFamousLabel = "यह स्थान क्यों प्रसिद्ध है:";
      btnMap = "🗺️ सेफ्टी मैप पर देखें";
      btnTrip = "📌 My Trip में जोड़ें";
    }

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
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
          <b>${whyFamousLabel}</b>
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
            ${btnMap}
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.addPlaceToTrip('${dest.id}')">
            ${btnTrip}
          </button>
        </div>
      </div>
    `;
  }

  // 10. DESTINATION OVERVIEW ("Jaipur কেন বিখ্যাত?", "What makes Jaipur famous?")
  function buildDestinationOverviewResponse(lang) {
    let title, text, chips;

    if (lang === "bn") {
      title = "গোলাপি শহর জয়পুরের ঐতিহ্য ও বিশ্বখ্যাতি:";
      text = "জয়পুর হলো ভারতের প্রথম পরিকল্পিত ইউনেস্কো ওয়ার্ল্ড হেরিটেজ শহর, যা ১৭২৭ সালে মহারাজা সোয়াই জয় সিং দ্বিতীয় প্রতিষ্ঠা করেছিলেন। এটি এর সুবিন্যস্ত গ্রিড-প্যাটার্নের গোলাপি পোড়ামাটির স্থাপত্যশৈলী, রাজকীয় গিরিদুর্গ (Amber Fort, Nahargarh Fort, Jaigarh), প্রাচীন জ্যোতির্বিজ্ঞান মানমন্দির (Jantar Mantar) এবং শতাব্দী প্রাচীন কারিগরী ঐতিহ্যের (নীল মৃৎশিল্প, ব্লক প্রিন্টিং, রত্নশিল্প) জন্য বিশ্বজুড়ে সুপ্রসিদ্ধ।";
      chips = ["Amber Fort", "Hawa Mahal", "City Palace", "Jal Mahal"];
    } else if (lang === "hi") {
      title = "गुलाबी नगरी जयपुर की ऐतिहासिक विरासत व प्रसिद्धि:";
      text = "जयपुर भारत का पहला सुनियोजित यूनेस्को विश्व धरोहर शहर है, जिसकी स्थापना 1727 में महाराजा सवाई जय सिंह द्वितीय ने की थी। यह अपने ग्रिड-पैटर्न वाले गुलाबी टेराकोटा वास्तुशिल्प, राजपूती किलों (आमेर, नाहरगढ़, जयगढ़), ऐतिहासिक वेधशाला (जंतर मंतर) और जीवित हस्तशिल्प परंपराओं (ब्लू पॉटरी, सांगानेरी ब्लॉक प्रिंटिंग) के लिए दुनिया भर में जाना जाता है।";
      chips = ["आमेर किला", "हवा महल", "सिटी पैलेस", "जल महल"];
    } else {
      title = "What Makes the Pink City Special:";
      text = "Jaipur is India's premier UNESCO World Heritage planned city, established in 1727 by Maharaja Sawai Jai Singh II. Famous for grid-pattern pink terracotta architecture, royal hill fortresses (Amber, Nahargarh, Jaigarh), astronomical science (Jantar Mantar), and vibrant living artisan guilds.";
      chips = ["Amber Fort", "Hawa Mahal", "City Palace", "Jal Mahal"];
    }

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge info">🏛️ JAIPUR HERITAGE SPOTLIGHT</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">${title}</h4>
        <p style="font-size: 12.5px; color: #334155; line-height: 1.45;">${text}</p>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0;">
          ${chips.map(c => `
            <button class="ai-chip" onclick="handleUserAIMessage('Tell me about ${c}')">${c}</button>
          `).join("")}
        </div>
      </div>
    `;
  }

  // 11. WHAT TO DO RIGHT NOW?
  function buildWhatToDoNowResponse(lang) {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 17 || currentHour < 5;

    let title, opt1Title, opt1Desc, opt2Title, opt2Desc, btnFood, btnRoute;

    if (lang === "bn") {
      title = isEvening ? "সন্ধ্যায় হাওয়া মহলের কাছে সেরা সুপারিশ:" : "দিনের বেলায় জয়পুরের সেরা সুপারিশ:";
      opt1Title = isEvening ? "জোহারী বাজার আলোকিত খাদ্য ও মিষ্টি ওয়াক" : "Amber Fort ও শীশ মহল প্রাতঃকালীন দর্শন";
      opt1Desc = isEvening ? "উচ্চ আলোকসজ্জিত হেরিটেজ করিডোরে গরম গরম পেঁয়াজ কচুরি ও মালাই ঘেবর উপভোগ করুন।" : "প্রখর রোদের আগে পাহাড়ি দুর্গের কাচের আয়নার কারুকাজ ঘুরে দেখুন।";
      opt2Title = isEvening ? "Jal Mahal লেকফ্রন্ট সান্ধ্য পদযাত্রা" : "সাঙ্গানের ব্লু পটারি আর্ট স্টুডিও";
      opt2Desc = isEvening ? "মনসাগর লেকের ওপর আলোকিত জলমহলের দৃশ্য দেখতে দেখতে নিরাপদ ওয়াকওয়েতে হাঁটুন।" : "শীতল ইনডোর স্টুডিওতে সরাসরি সিরামিক গ্লেজিংয়ের কাজ শিখুন।";
      btnFood = "🍲 খাবারের সন্ধান";
      btnRoute = "🛡️ হোটেলে ফেরার নিরাপদ পথ";
    } else if (lang === "hi") {
      title = isEvening ? "हवा महल के पास शाम के खास सुझाव:" : "दिन के समय जयपुर में करने योग्य बातें:";
      opt1Title = isEvening ? "जौहरी बाजार स्वादिष्ट खान-पान वॉक" : "आमेर किला व शीश महल की सुबह";
      opt1Desc = isEvening ? "रोशन हेरिटेज गलियारे में ताज़ा प्याज़ कचौरी व मलाई घेवर का स्वाद लें।" : "दोपहर की धूप से पहले राजपूती वास्तुकला की भव्यता देखें।";
      opt2Title = isEvening ? "जल महल लेकफ्रंट सनसेट वॉक" : "सांगानेर ब्लू पॉटरी कार्यशाला";
      opt2Desc = isEvening ? "झील में तैरते महल के सूर्यास्त की रोशनी और ठंडी हवा का आनंद लें।" : "कारीगरों के स्टूडियो में मिट्टी के बर्तन बनाने का अनुभव लें।";
      btnFood = "🍲 भोजन स्थल देखें";
      btnRoute = "🛡️ होटल का सुरक्षित मार्ग";
    } else {
      title = isEvening ? "Evening Recommendations near Hawa Mahal:" : "Daytime Recommendations for Jaipur:";
      opt1Title = isEvening ? "Johari Bazaar Illuminated Food & Sweets Walk" : "Amber Fort Sheesh Mahal Courtyard";
      opt1Desc = isEvening ? "Stroll the brightly lit heritage corridor for hot Pyaaz Kachori and Malai Ghewar. Stay on the main avenue." : "Best viewed during morning light before the midday sun warms the stone ramparts.";
      opt2Title = isEvening ? "Jal Mahal Promenade Walkway" : "Sanganer Blue Pottery Artisan Studio";
      opt2Desc = isEvening ? "Catch the illuminated reflection of the submerged palace from the wide pedestrian walkway." : "Indoor cool workshop learning hand-glazing techniques.";
      btnFood = "🍲 Find Food Near Me";
      btnRoute = "🛡️ Safe Route Back to Hotel";
    }

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge info">⚡ CONTEXTUAL RECOMMENDATION (RIGHT NOW)</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">${title}</h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
          Status: <b>LOW RISK (84/100)</b> • Location: <b>Hawa Mahal Precinct</b>
        </p>

        <div class="now-options-list">
          <div class="now-opt-tile">
            <span class="opt-badge">Top Pick</span>
            <b>${opt1Title}</b>
            <p>${opt1Desc}</p>
            <div style="font-size: 11px; color: #059669;">🛡️ Tourist police beat active • High ambient illumination</div>
          </div>
          <div class="now-opt-tile">
            <span class="opt-badge">Scenic</span>
            <b>${opt2Title}</b>
            <p>${opt2Desc}</p>
            <div style="font-size: 11px; color: #059669;">🛡️ Open until 9:00 PM • Verified safe perimeter</div>
          </div>
        </div>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="handleUserAIMessage('Show authentic food places open now')">
            ${btnFood}
          </button>
          <button class="btn-res-action secondary" onclick="SafeTripAI.showSaferRoute()">
            ${btnRoute}
          </button>
        </div>
      </div>
    `;
  }

  // 12. ACCESSIBILITY & PACING
  function buildAccessibilityPacingResponse(query, lang) {
    let title, desc, p1, p2, p3, p4, btnPlan;

    if (lang === "bn") {
      title = "প্রবীণ ও পারিবারিক পর্যটকদের জন্য উপযোগী জয়পুর গাইড:";
      desc = "বয়স্ক পিতা-মাতা, শিশু বা সীমিত হাঁটার সক্ষমতা সম্পন্ন পর্যটকদের জন্য বিশেষ সুবিধা:";
      p1 = "<b>City Palace ও Jantar Mantar:</b> সমতল বাঁধানো পথ, গল্ফ কার্ট ট্রান্সফার এবং হুইলচেয়ার র‍্যাম্প উপলব্ধ।";
      p2 = "<b>Patrika Gate:</b> কোনো সিঁড়ি নেই, চারিপাশে পার্কের বেঞ্চ এবং সরাসরি গাড়ি নামানোর সুবিধা রয়েছে।";
      p3 = "<b>পরিহার করুন:</b> নাহারগড় পাহাড়ের দুর্গম খাঁদ এবং হাওয়া মহলের সংকীর্ণ খাড়া সিঁড়ি।";
      p4 = "<b>আবাসনের সুপারিশ:</b> Hotel Arya Niwas (লিফট সুবিধা, বিশুদ্ধ নিরামিষ ভোজন, শান্ত বাগান)।";
      btnPlan = "📌 স্বল্প-হাঁটার ভ্রমণ পরিকল্পনা তৈরি করুন";
    } else if (lang === "hi") {
      title = "वरिष्ठ नागरिकों व परिवारों के लिए सुगम जयपुर गाइड:";
      desc = "बुजुर्ग माता-पिता और बच्चों के साथ आरामदायक और आसान भ्रमण हेतु सुझाव:";
      p1 = "<b>सिटी पैलेस व जंतर मंतर:</b> सपाट रास्ते, गोल्फ कार्ट और मुख्य आंगनों में व्हीलचेयर रैंप की पूरी सुविधा।";
      p2 = "<b>पत्रिका गेट:</b> बिना सीढ़ियों वाला समतल प्रवेश, बैठने के लिए बेंच और सीधी कार ड्रॉप सुविधा।";
      p3 = "<b>परहेज करें:</b> नाहरगढ़ के खड़े ढलान वाले रास्ते और हवा महल की संकरी खड़ी सीढ़ियां।";
      p4 = "<b>अनुशंसित आवास:</b> होटल आर्य निवास (लिफ्ट युक्त, शुद्ध शाकाहारी रसोई, शांत बगीचा)।";
      btnPlan = "📌 आसान वॉक वाला ट्रिप प्लान करें";
    } else {
      title = "Senior & Family-Friendly Jaipur Recommendations:";
      desc = "Tailored for travelers with elderly parents, children, or reduced mobility:";
      p1 = "<b>City Palace & Jantar Mantar:</b> Level paved paths with golf cart transfers and wheelchair ramps at all main courtyards.";
      p2 = "<b>Patrika Gate:</b> Zero steps, park benches along the circular drive, and direct car drop-off.";
      p3 = "<b>Avoid:</b> Nahargarh hill ridge trails and steep internal stairwells at Hawa Mahal upper tiers.";
      p4 = "<b>Stay Recommendation:</b> Hotel Arya Niwas (elevator equipped, pure-veg dining, peaceful ground-floor garden).";
      btnPlan = "📌 Generate Low-Walking Itinerary";
    }

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge safe">♿ INCLUSIVE & LOW-WALKING INTEL</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0;">${title}</h4>
        <p style="font-size: 12px; color: #475569; margin-bottom: 12px;">${desc}</p>

        <ul class="ai-bullet-list">
          <li>${p1}</li>
          <li>${p2}</li>
          <li>${p3}</li>
          <li>${p4}</li>
        </ul>

        <div class="ai-card-actions">
          <button class="btn-res-action primary" onclick="handleUserAIMessage('Plan a low-walking 2-day trip for seniors')">
            ${btnPlan}
          </button>
        </div>
      </div>
    `;
  }

  // 13. GENERAL COMPANION FALLBACK
  function buildGeneralCompanionResponse(query, lang) {
    const tourist = SafeTripStore.getTourist();

    let intro, sub, optPlan, optFood, optExp, optStay, optTrans;

    if (lang === "bn") {
      intro = `আমি আপনার প্রশ্নটি বিশ্লেষণ করেছি। আপনার বর্তমান অবস্থান <b>${tourist.currentLocation.name}</b> (সেফটি স্কোর: ${tourist.safetyScore}/100, ${tourist.riskLevel})।`;
      sub = "আপনি বাংলায় আমাকে যেকোনো প্রশ্ন করতে পারেন:";
      optPlan = "<b>ভ্রমণ পরিকল্পনা:</b> <i>'আমাকে জয়পুরের জন্য ৩ দিনের ট্রিপ প্ল্যান করে দাও'</i>";
      optFood = "<b>স্থানীয় খাবার:</b> <i>'খাঁটি রাজস্থানি খাবার কোথায় পাব?'</i>";
      optExp = "<b>হস্তশিল্প অভিজ্ঞতা:</b> <i>'ব্লু পটারি বা ব্লক প্রিন্টিং কর্মশালা দেখাও'</i>";
      optStay = "<b>নিরাপদ হোটেল:</b> <i>'হাওয়া মহলের কাছে ভালো বাজেট হোটেল বলো'</i>";
      optTrans = "<b>স্থানীয় অনুবাদ:</b> <i>'পুলিশ স্টেশন কোথায় এটা হিন্দিতে অনুবাদ করো'</i>";
    } else if (lang === "hi") {
      intro = `मैंने आपकी क्वेरी का विश्लेषण किया है। आपकी वर्तमान स्थिति: <b>${tourist.currentLocation.name}</b> (सुरक्षा स्कोर: ${tourist.safetyScore}/100, ${tourist.riskLevel})।`;
      sub = "आप मुझसे किसी भी विषय पर पूछ सकते हैं:";
      optPlan = "<b>ट्रिप प्लानिंग:</b> <i>'जयपुर में 3 दिन का ट्रिप प्लान करो'</i>";
      optFood = "<b>प्रामाणिक भोजन:</b> <i>'दाल बाटी चूरमा कहाँ मिलेगा?'</i>";
      optExp = "<b>सांस्कृतिक अनुभव:</b> <i>'ब्लू पॉटरी या कठपुतली वर्कशॉप दिखाओ'</i>";
      optStay = "<b>सुरक्षित आवास:</b> <i>'हवा महल के पास बजट होटल बताओ'</i>";
      optTrans = "<b>भाषा सेतु:</b> <i>'ऑटो वाले से किराया कैसे पूछें?'</i>";
    } else {
      intro = `I've analyzed your request with live safety context around <b>${tourist.currentLocation.name}</b> (Safety Score: ${tourist.safetyScore}/100, ${tourist.riskLevel}).`;
      sub = "You can ask me to:";
      optPlan = "<b>Trip Planning:</b> <i>'Plan Jaipur for 3 days under ₹10,000'</i>";
      optFood = "<b>Authentic Food:</b> <i>'Find authentic Rajasthani food near me'</i>";
      optExp = "<b>Hands-on Experiences:</b> <i>'Show me pottery or craft workshops'</i>";
      optStay = "<b>Stay Recommendations:</b> <i>'Find a safe budget stay near Hawa Mahal'</i>";
      optTrans = "<b>Language Bridge:</b> <i>'Translate: Where is the police station?'</i>";
    }

    return `
      <div class="ai-res-card">
        ${renderLanguageIndicator(lang)}
        <div class="ai-card-badge safe">💡 SAFETRIP ASSISTANT</div>
        <p style="font-size: 13px; color: #1e293b; line-height: 1.5; margin: 4px 0 10px;">${intro}</p>
        <p style="font-size: 12.5px; color: #475569; line-height: 1.45;">${sub}</p>
        <ul class="ai-bullet-list" style="margin-bottom: 12px;">
          <li>${optPlan}</li>
          <li>${optFood}</li>
          <li>${optExp}</li>
          <li>${optStay}</li>
          <li>${optTrans}</li>
        </ul>
      </div>
    `;
  }

  /* ==========================================================================
     INTERACTIVE MAP & ACTION HANDLERS
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

  function showCustomLocalPhrase(nativeText, phoneticText, englishText) {
    const modal = document.getElementById("showLocalModal");
    const modalContent = document.getElementById("showLocalContent");
    if (modal && modalContent) {
      modalContent.innerHTML = `
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #0284c7; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 8px;">
            📱 SHOW SCREEN TO LOCAL DRIVER / VENDOR
          </div>
          <div style="font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 16px 0; padding: 14px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px;">
            "${nativeText}"
          </div>
          <div style="font-size: 14px; color: #475569; font-style: italic; margin-bottom: 12px;">
            "${phoneticText}"
          </div>
          <div style="font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            <b>Meaning:</b> "${englishText}"
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
    resolveResponseLanguage,
    detectLanguageFromText,
    langConfig,
    viewOnMap,
    showSaferRoute,
    addPlaceToTrip,
    addExperienceToTrip,
    addGeneratedItineraryToTrip,
    addBudgetPlanToTrip,
    showCustomLocalPhrase,
    openDemoReservation
  };
})();

// Attach to window
window.SafeTripAI = SafeTripAI;
