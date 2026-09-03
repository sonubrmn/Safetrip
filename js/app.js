/**
 * SAFETRIP - Tourist Companion UI Controller
 * Handles interactive elements, AI assistant, check-in, SOS flow, and modals.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Map
  if (typeof initSafetyMap === "function") {
    initSafetyMap();
  }

  // 2. Initialize SafeTrip AI Companion
  if (window.SafeTripAI) {
    SafeTripAI.init();
  }

  // 3. Initialize UI Components
  initSafetyStatusWidget();
  initDestinationCards();
  initRouteSelector();
  initSafetyAIAssistant();
  initDigitalIDModal();
  initCheckInWidget();
  initSOSFlow();
  initSearchInteractions();
  renderMyTripSection();

  // 4. Bind Global Store Events to UI
  bindStoreEvents();
});

/* ==========================================================================
   PERSONAL SAFETY STATUS WIDGET
   ========================================================================== */
function initSafetyStatusWidget() {
  updateStatusCardUI(SafeTripStore.getTourist());
}

function updateStatusCardUI(tourist) {
  const card = document.getElementById("personalStatusCard");
  const locVal = document.getElementById("statusLocationText");
  const riskPill = document.getElementById("statusRiskPill");
  const scoreVal = document.getElementById("statusScoreNum");
  
  if (!card || !locVal || !riskPill || !scoreVal) return;

  locVal.textContent = tourist.currentLocation.name;
  scoreVal.textContent = tourist.safetyScore;
  riskPill.textContent = tourist.riskLevel;

  // Reset classes
  card.className = "status-card";
  riskPill.className = "risk-pill";

  if (tourist.riskLevel === "HIGH RISK" || tourist.riskLevel === "EMERGENCY") {
    card.classList.add("state-emergency");
    riskPill.classList.add("high");
  } else if (tourist.riskLevel === "CAUTION") {
    card.classList.add("state-caution");
    riskPill.classList.add("caution");
  } else {
    card.classList.add("state-safe");
    riskPill.classList.add("safe");
  }
}

/* ==========================================================================
   SEARCH & QUICK SUGGESTIONS
   ========================================================================== */
function initSearchInteractions() {
  const searchInput = document.getElementById("destinationSearchInput");
  const askAiBtn = document.getElementById("btnAskAiSearch");
  const suggestionChips = document.querySelectorAll(".suggestion-chip");

  if (askAiBtn && searchInput) {
    askAiBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        openSafetyAIPanel(query);
      } else {
        openSafetyAIPanel("Is Jaipur safe right now?");
      }
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        askAiBtn.click();
      }
    });
  }

  suggestionChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const text = chip.getAttribute("data-query") || chip.textContent.trim();
      if (searchInput) searchInput.value = text;
      openSafetyAIPanel(text);
    });
  });
}

/* ==========================================================================
   DESTINATION CARDS & DETAILS MODAL
   ========================================================================== */
let currentExploreCategory = "all";

function initDestinationCards() {
  const filterContainer = document.getElementById("exploreCategoryFilter");
  if (filterContainer) {
    const buttons = filterContainer.querySelectorAll(".explore-cat-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentExploreCategory = btn.getAttribute("data-category") || "all";
        renderExploreGrid();
      });
    });
  }

  renderExploreGrid();
}

function renderExploreGrid() {
  const grid = document.getElementById("destinationCardsGrid");
  if (!grid) return;

  if (currentExploreCategory === "experiences") {
    grid.innerHTML = SafeTripData.experiences.map(exp => `
      <article class="destination-card" data-id="${exp.id}">
        <div class="card-img-wrapper" style="background: linear-gradient(135deg, #0f172a, #334155);">
          <img class="card-img" src="${exp.image}" alt="${exp.title}" loading="lazy" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${exp.title}', '${exp.statusClass}');">
          <div class="card-score-badge ${exp.statusClass}">
            <span>🎨</span>
            <span class="score-val">${exp.safetyScore}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="card-header-row">
            <h3 class="card-title">${exp.title}</h3>
            <span class="card-distance">${exp.duration}</span>
          </div>
          <p class="card-location">${exp.location}</p>
          <div style="font-size: 13px; font-weight: 700; color: #0284c7; margin: 4px 0;">${exp.priceEst}</div>
          <p style="font-size: 12px; color: #475569; line-height: 1.4; margin-bottom: 8px;">${exp.description}</p>
          <div class="card-footer">
            <span style="font-size: 11.5px; color: #059669; font-weight: 600;">🛡️ Verified Guild</span>
            <button class="btn-card-details" onclick="SafeTripAI.addExperienceToTrip('${exp.id}')">
              + Add to Trip
            </button>
          </div>
        </div>
      </article>
    `).join("");
    return;
  }

  if (currentExploreCategory === "food") {
    grid.innerHTML = SafeTripData.localFoods.map(food => `
      <article class="destination-card" data-id="${food.id}">
        <div class="card-body" style="padding: 20px;">
          <div class="card-header-row">
            <h3 class="card-title">${food.name}</h3>
            <span class="diet-tag ${food.dietaryClass}">● ${food.dietary}</span>
          </div>
          <div style="font-size: 12px; color: #64748b; margin: 2px 0;">${food.hindiName} • <b>${food.priceEst}</b></div>
          <p style="font-size: 12.5px; color: #334155; margin: 8px 0; line-height: 1.45;">${food.description}</p>
          <div style="font-size: 12px; color: #0284c7; margin: 4px 0;">
            📍 <b>Famous At:</b> ${food.famousAt}
          </div>
          <div style="font-size: 11.5px; color: #059669; margin: 4px 0;">
            🛡️ <b>Safety Intel:</b> ${food.safetyNote}
          </div>
          <div class="card-footer" style="margin-top: 14px;">
            <button class="btn-card-details" onclick="openSafetyAIPanel('Tell me where to eat authentic ${food.name}')">
              Ask AI Where to Eat &rarr;
            </button>
          </div>
        </div>
      </article>
    `).join("");
    return;
  }

  if (currentExploreCategory === "stays") {
    grid.innerHTML = SafeTripData.accommodations.map(stay => `
      <article class="destination-card" data-id="${stay.id}">
        <div class="card-body" style="padding: 20px;">
          <div class="card-header-row">
            <h3 class="card-title">${stay.name}</h3>
            <span style="font-weight: 800; color: #0284c7; font-size: 13px;">${stay.priceNight}</span>
          </div>
          <p class="card-location">${stay.distance} • ⭐ ${stay.rating}</p>
          <div class="card-status-badge ${stay.statusClass}">
            ● Safety Score: ${stay.safetyScore}/100
          </div>
          <p style="font-size: 12px; color: #334155; margin: 6px 0;">${stay.whyRecommended}</p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
            <span style="font-size: 11px; background: #ecfdf5; color: #059669; padding: 2px 6px; border-radius: 4px;">✓ ${stay.cancellation}</span>
          </div>
          <div class="card-footer" style="margin-top: 14px;">
            <button class="btn-card-details" onclick="SafeTripAI.openDemoReservation('${stay.name}')">
              Reserve Demo
            </button>
          </div>
        </div>
      </article>
    `).join("");
    return;
  }

  // Default: Places
  grid.innerHTML = SafeTripData.destinations.map(dest => `
    <article class="destination-card" data-id="${dest.id}">
      <div class="card-img-wrapper" style="background: linear-gradient(135deg, #0f172a, #334155);">
        <img class="card-img" src="${dest.image}" alt="${dest.name}" loading="lazy" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${dest.name}', '${dest.statusClass}');">
        <div class="card-score-badge ${dest.statusClass}">
          <span>🛡️</span>
          <span class="score-val">${dest.safetyScore}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-header-row">
          <h3 class="card-title">${dest.name}</h3>
          <span class="card-distance">${dest.distance}</span>
        </div>
        <p class="card-location">${dest.location}</p>
        <div class="card-status-badge ${dest.statusClass}">
          ● ${dest.riskLevel}
        </div>
        <div class="card-footer">
          <span style="font-size: 11.5px; color: #64748b;">${dest.safeHours}</span>
          <button class="btn-card-details" onclick="openDestinationDetails('${dest.id}')">
            View details &rarr;
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function openDestinationDetails(destId) {
  const dest = SafeTripData.destinations.find(d => d.id === destId);
  if (!dest) return;

  const modal = document.getElementById("detailsModal");
  const modalContent = document.getElementById("detailsModalContent");
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div style="margin-bottom: 16px;">
      <img src="${dest.image}" alt="${dest.name}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${dest.name}', '${dest.statusClass}');" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; margin-bottom: 14px; background: linear-gradient(135deg, #0f172a, #334155);">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <h3 style="font-size: 20px; font-weight: 700; color: #0f172a;">${dest.name}</h3>
        <span style="font-size: 15px; font-weight: 700; color: ${dest.statusClass === 'safe' ? '#10b981' : '#f59e0b'};">
          Safety Score: ${dest.safetyScore}/100
        </span>
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 4px;">${dest.location} • Distance from you: ${dest.distance}</p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Safety Intelligence</div>
      <p style="font-size: 13px; color: #1e293b; line-height: 1.45;">${dest.highlight}</p>
      <div style="font-size: 12.5px; color: #64748b; margin-top: 8px;">
        Recommended Visiting Hours: <b>${dest.safeHours}</b>
      </div>
    </div>

    <div>
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Security Assets Present</div>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
        ${dest.features.map(f => `
          <li style="font-size: 12.5px; color: #334155; display: flex; align-items: center; gap: 8px;">
            <span style="color: #10b981; font-weight: bold;">✓</span> ${f}
          </li>
        `).join("")}
      </ul>
      <button class="btn-res-action primary" onclick="closeAllModals(); openSafetyAIPanel('What is ${dest.name} famous for?');" style="width: 100%; padding: 10px 16px; font-size: 13px; font-weight: 600;">
        ✨ Ask AI Travel Companion About ${dest.name}
      </button>
    </div>
  `;

  modal.classList.add("open");
}

/* ==========================================================================
   SAFEST ROUTE SWITCHER
   ========================================================================== */
function initRouteSelector() {
  const btnSafest = document.getElementById("btnSelectSafestRoute");
  const btnFastest = document.getElementById("btnSelectFastestRoute");
  const cardSafest = document.getElementById("routeCardSafest");
  const cardFastest = document.getElementById("routeCardFastest");

  if (btnSafest && btnFastest) {
    btnSafest.addEventListener("click", () => {
      cardSafest.classList.add("is-recommended");
      cardFastest.classList.remove("is-recommended");
      btnSafest.textContent = "Current Active Route";
      btnFastest.textContent = "Switch to Fastest";
      if (typeof toggleActiveRoute === "function") toggleActiveRoute("safest");
    });

    btnFastest.addEventListener("click", () => {
      cardFastest.classList.add("is-recommended");
      cardSafest.classList.remove("is-recommended");
      btnFastest.textContent = "Current Active Route";
      btnSafest.textContent = "Switch to Safest (Recommended)";
      if (typeof toggleActiveRoute === "function") toggleActiveRoute("fastest");
    });
  }
}

/* ==========================================================================
   SAFETY AI ASSISTANT PANEL
   ========================================================================== */
function initSafetyAIAssistant() {
  const fab = document.getElementById("aiFabBtn");
  const panel = document.getElementById("aiPanel");
  const closeBtn = document.getElementById("btnCloseAiPanel");
  const form = document.getElementById("aiInputForm");
  const input = document.getElementById("aiTextInput");
  const langSelect = document.getElementById("aiLanguageSelect");

  if (fab && panel) {
    fab.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
  }

  if (closeBtn && panel) {
    closeBtn.addEventListener("click", () => {
      panel.classList.remove("open");
    });
  }

  if (langSelect && window.SafeTripAI) {
    langSelect.value = SafeTripAI.getLanguage();
    langSelect.addEventListener("change", (e) => {
      const selected = e.target.value;
      SafeTripAI.setLanguage(selected);
      const conf = SafeTripAI.langConfig[selected] || SafeTripAI.langConfig.auto;
      const chatBody = document.getElementById("aiChatBody");
      if (chatBody) {
        const bubble = document.createElement("div");
        bubble.className = "chat-bubble assistant";
        bubble.innerHTML = `<b>${conf.flag} ${conf.name}:</b> ${conf.greeting}`;
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    });
  }

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        handleUserAIMessage(text);
        input.value = "";
      }
    });
  }

  // Suggestion chips
  document.querySelectorAll(".ai-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const query = chip.getAttribute("data-query") || chip.textContent.trim();
      handleUserAIMessage(query);
    });
  });
}

function openSafetyAIPanel(initialQuery = null) {
  const panel = document.getElementById("aiPanel");
  if (!panel) return;
  panel.classList.add("open");
  if (initialQuery) {
    handleUserAIMessage(initialQuery);
  }
}

function handleUserAIMessage(userText) {
  const chatBody = document.getElementById("aiChatBody");
  if (!chatBody) return;

  // Append user bubble
  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = userText;
  chatBody.appendChild(userBubble);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Simulated thinking delay with sleek loading state
  const typingBubble = document.createElement("div");
  typingBubble.className = "chat-bubble assistant";
  typingBubble.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #0284c7;">
      <span class="pulse-dot" style="background: #0284c7;"></span>
      <span>SafeTrip AI reasoning with Jaipur intelligence & safety grid...</span>
    </div>
  `;
  chatBody.appendChild(typingBubble);
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    if (window.SafeTripAI) {
      const replyHtml = SafeTripAI.processMessage(userText);
      typingBubble.innerHTML = replyHtml;
    } else {
      typingBubble.textContent = "SafeTrip AI companion ready.";
    }
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 650);
}

function generateContextualSafetyReply(query) {
  const q = query.toLowerCase();
  const tourist = SafeTripStore.getTourist();

  if (q.includes("jaipur safe") || q.includes("safe tonight") || q.includes("this area safe")) {
    return `You are currently in ${tourist.currentLocation.name}. Real-time intelligence indicates a ${tourist.riskLevel} (Safety Score: ${tourist.safetyScore}/100). The heritage corridor is well-illuminated and patrolled by Rajasthan Tourist Police until 11:00 PM. Stay along the main illuminated road if walking after 9:00 PM.`;
  }
  if (q.includes("hospital") || q.includes("doctor") || q.includes("medical")) {
    return `Nearest emergency medical care: Sawai Man Singh (SMS) Hospital Trauma Center is 2.4 km away (Phone: 0141-2560291). Santokba Durlabhji Memorial Hospital is 3.8 km away. Both have 24/7 emergency care active.`;
  }
  if (q.includes("route") || q.includes("safer route") || q.includes("path")) {
    return `We recommend the Safest Route via Kanak Vrindavan Heritage Highway (22 min, Safety Score 94). It avoids isolated mountain curves and maintains 96% smart CCTV and active police patrol coverage.`;
  }
  if (q.includes("unsafe") || q.includes("scared") || q.includes("emergency") || q.includes("help")) {
    return `If you feel in immediate distress, press the red SOS button at the top of your screen to broadcast your GPS to the Rajasthan Police Command Center. You can also dial Tourist Helpline 1363 or national emergency 112 directly.`;
  }
  return `Safety Intel confirms your status is ${tourist.riskLevel} around ${tourist.currentLocation.name}. Emergency services are verified within 800 meters. Let me know if you need safe routing or hospital directions!`;
}

/* ==========================================================================
   DIGITAL TOURIST ID MODAL & VERIFICATION
   ========================================================================== */
function initDigitalIDModal() {
  const btnShowId = document.getElementById("btnShowDigitalId");
  const btnVerifyId = document.getElementById("btnVerifyDigitalId");
  const modal = document.getElementById("digitalIdModal");
  const modalBody = document.getElementById("digitalIdModalContent");

  if (btnShowId && modal) {
    btnShowId.addEventListener("click", () => {
      openDigitalIdModalView("view");
    });
  }

  if (btnVerifyId && modal) {
    btnVerifyId.addEventListener("click", () => {
      openDigitalIdModalView("verify");
    });
  }
}

function openDigitalIdModalView(mode = "view") {
  const modal = document.getElementById("digitalIdModal");
  const modalBody = document.getElementById("digitalIdModalContent");
  const tourist = SafeTripData.tourist;
  if (!modal || !modalBody) return;

  if (mode === "verify") {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 12px 0;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background-color: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px;">
          ✓
        </div>
        <h3 style="font-size: 19px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Cryptographically Verified</h3>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Zero-Knowledge proof verified on-chain. No private credentials exposed.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: left; font-size: 12.5px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Tourist ID:</span>
            <span style="font-weight: 700; color: #0f172a;">${tourist.id}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Issuing Network:</span>
            <span style="font-weight: 600; color: #0f172a;">${tourist.verificationNetwork}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Block Height:</span>
            <span style="font-weight: 600; color: #0f172a;">#${tourist.blockNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between; word-break: break-all;">
            <span style="color: #64748b;">State Proof Hash:</span>
            <span style="font-family: monospace; font-size: 11px; color: #0284c7;">${tourist.blockchainHash}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase;">
          Republic of India • Tourist Safety Network
        </div>
        <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 2px;">${tourist.name}</h3>
        <div style="font-size: 13px; font-family: monospace; color: #475569; margin-bottom: 16px;">
          Tourist Token: ${tourist.id}
        </div>

        <div style="width: 140px; height: 140px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Mock QR Code SVG -->
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
            <rect x="0" y="0" width="30" height="30" fill="#0f172a"/>
            <rect x="5" y="5" width="20" height="20" fill="#ffffff"/>
            <rect x="9" y="9" width="12" height="12" fill="#0f172a"/>
            <rect x="70" y="0" width="30" height="30" fill="#0f172a"/>
            <rect x="75" y="5" width="20" height="20" fill="#ffffff"/>
            <rect x="79" y="9" width="12" height="12" fill="#0f172a"/>
            <rect x="0" y="70" width="30" height="30" fill="#0f172a"/>
            <rect x="5" y="75" width="20" height="20" fill="#ffffff"/>
            <rect x="9" y="79" width="12" height="12" fill="#0f172a"/>
            <rect x="36" y="8" width="10" height="10" fill="#0f172a"/>
            <rect x="42" y="24" width="12" height="12" fill="#0f172a"/>
            <rect x="22" y="40" width="14" height="14" fill="#0f172a"/>
            <rect x="48" y="44" width="14" height="14" fill="#0f172a"/>
            <rect x="68" y="40" width="16" height="16" fill="#0f172a"/>
            <rect x="38" y="68" width="14" height="14" fill="#0f172a"/>
            <rect x="66" y="72" width="20" height="14" fill="#0f172a"/>
          </svg>
        </div>

        <div style="font-size: 12.5px; color: #475569; margin-bottom: 8px;">
          Emergency Contact: <b>${tourist.emergencyContact.name} (${tourist.emergencyContact.phone})</b>
        </div>
        <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: #047857; background: #ecfdf5; padding: 4px 10px; border-radius: 9999px;">
          ✓ Verified Identity • Polygon PoS Chain
        </div>
      </div>
    `;
  }

  modal.classList.add("open");
}

/* ==========================================================================
   SAFETY CHECK-IN TIMER & ESCALATION
   ========================================================================= */
let checkInInterval = null;

function initCheckInWidget() {
  const btnCheckIn = document.getElementById("btnCheckInNow");
  const btnSimMissed = document.getElementById("btnSimulateMissedCheckIn");
  const timerDisplay = document.getElementById("checkInTimerDisplay");
  const alertBox = document.getElementById("missedCheckInAlert");

  // Timer Countdown
  startCheckInCountdown();

  if (btnCheckIn) {
    btnCheckIn.addEventListener("click", () => {
      SafeTripStore.performCheckIn();
      if (alertBox) alertBox.style.display = "none";
      btnCheckIn.innerHTML = "<span>✓</span> Checked In Safely";
      setTimeout(() => {
        btnCheckIn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          I am Safe • Check In Now
        `;
      }, 2500);
    });
  }

  if (btnSimMissed) {
    btnSimMissed.addEventListener("click", () => {
      SafeTripStore.triggerMissedCheckIn();
    });
  }
}

function startCheckInCountdown() {
  const timerDisplay = document.getElementById("checkInTimerDisplay");
  if (!timerDisplay) return;

  if (checkInInterval) clearInterval(checkInInterval);

  checkInInterval = setInterval(() => {
    let t = SafeTripData.tourist.checkInTimeRemainingSeconds;
    if (t > 0) {
      t--;
      SafeTripData.tourist.checkInTimeRemainingSeconds = t;
      const mins = Math.floor(t / 60);
      const secs = t % 60;
      timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      SafeTripStore.triggerMissedCheckIn();
    }
  }, 1000);
}

/* ==========================================================================
   EMERGENCY SOS FLOW
   ========================================================================== */
function initSOSFlow() {
  const sosTriggerButtons = document.querySelectorAll(".btn-trigger-sos");
  const sosModal = document.getElementById("sosModal");
  const btnCancel = document.getElementById("btnCancelSos");
  const btnConfirm = document.getElementById("btnConfirmSos");

  sosTriggerButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      openSOSConfirmationModal();
    });
  });

  if (btnCancel && sosModal) {
    btnCancel.addEventListener("click", () => {
      sosModal.classList.remove("open");
    });
  }

  if (btnConfirm && sosModal) {
    btnConfirm.addEventListener("click", () => {
      // Trigger SOS dispatch
      const incident = SafeTripStore.triggerEmergencySOS();
      showSOSSuccessState(incident);
    });
  }
}

function openSOSConfirmationModal() {
  const modal = document.getElementById("sosModal");
  const tourist = SafeTripData.tourist;
  if (!modal) return;

  const locEl = document.getElementById("sosLocationVal");
  const idEl = document.getElementById("sosTouristIdVal");
  const timeEl = document.getElementById("sosTimestampVal");
  const riskEl = document.getElementById("sosRiskVal");

  if (locEl) locEl.textContent = tourist.currentLocation.name;
  if (idEl) idEl.textContent = tourist.id;
  if (timeEl) timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (riskEl) riskEl.textContent = "EMERGENCY PRIORITY";

  modal.classList.add("open");
}

function showSOSSuccessState(incident) {
  const modalBody = document.querySelector("#sosModal .modal-body");
  const modalFooter = document.querySelector("#sosModal .modal-footer");
  if (!modalBody || !modalFooter) return;

  modalBody.innerHTML = `
    <div style="text-align: center; padding: 12px 0;">
      <div style="width: 64px; height: 64px; border-radius: 50%; background-color: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 14px;">
        ✓
      </div>
      <div style="display: inline-block; font-size: 11px; font-weight: 700; color: #b91c1c; background: #fee2e2; border: 1px solid #fca5a5; padding: 3px 12px; border-radius: 9999px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.04em;">
        DEMO ALERT — No Real Emergency Services Contacted
      </div>
      <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Demo SOS Incident Created</h3>
      <p style="font-size: 13.5px; color: #475569; margin-bottom: 18px;">
        Simulated telemetry for <b>${incident.touristName} (${incident.touristId})</b> has been recorded and synced to the <b>SAFETRIP Authority Command Center</b>.
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; text-align: left; font-size: 13px; margin-bottom: 16px;">
        <div>Incident Ticket: <b>${incident.id}</b></div>
        <div style="color: #64748b; margin-top: 4px;">Trigger Reason: <b>${incident.trigger}</b></div>
        <div style="color: #64748b; margin-top: 4px;">Simulated Responder Unit: <b>Rajasthan Tourist Police Thana (Beat 4)</b></div>
        <div style="color: #059669; font-weight: 600; margin-top: 4px;">● Authority Command Center updated in real time</div>
      </div>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn-cancel-modal" onclick="closeAllModals()" style="background: #0f172a; color: #ffffff; padding: 10px 20px;">
      Dismiss & Keep Active
    </button>
  `;
}

function closeAllModals() {
  document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
}

/* ==========================================================================
   GLOBAL STORE EVENT LISTENERS
   ========================================================================== */
function bindStoreEvents() {
  SafeTripEvents.on("tourist:location_changed", (data) => {
    updateStatusCardUI(SafeTripStore.getTourist());
  });

  SafeTripEvents.on("tourist:risk_updated", () => {
    updateStatusCardUI(SafeTripStore.getTourist());
  });

  SafeTripEvents.on("checkin:missed", (data) => {
    const alertBox = document.getElementById("missedCheckInAlert");
    if (alertBox) {
      alertBox.style.display = "block";
    }
    updateStatusCardUI(SafeTripStore.getTourist());
  });

  SafeTripEvents.on("checkin:completed", () => {
    updateStatusCardUI(SafeTripStore.getTourist());
  });

  SafeTripEvents.on("state:synced", () => {
    updateStatusCardUI(SafeTripStore.getTourist());
    renderMyTripSection();
  });

  SafeTripEvents.on("mytrip:updated", () => {
    renderMyTripSection();
  });
}

function renderMyTripSection() {
  const container = document.getElementById("myTripItemsList");
  if (!container) return;

  const items = SafeTripStore.getMyTrip();
  if (!items.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #64748b; font-size: 13px;">
        No planned items in your trip yet. Ask SafeTrip AI: <i>"Plan Jaipur for 3 days"</i> or click <b>"+ Add to Trip"</b> on any experience card above!
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="mytrip-item-row" data-id="${item.id}">
      <div class="mytrip-item-left">
        <span class="mytrip-type-icon">${item.type === 'experience' ? '🎨' : (item.type === 'food' ? '🍲' : (item.type === 'budget' ? '💰' : (item.type === 'itinerary' ? '🗺️' : '🏛️')))}</span>
        <div>
          <b style="font-size: 13.5px; color: #0f172a;">${item.title}</b>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">
            ${item.day} • ${item.time} • Est. <b>${item.estCost}</b>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 9999px;">
          Score: ${item.safetyScore}/100
        </span>
        <button class="btn-del-zone" onclick="SafeTripStore.removeFromMyTrip('${item.id}')" title="Remove from Trip" style="font-size: 11px; padding: 3px 8px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; border-radius: 6px;">
          ✕ Remove
        </button>
      </div>
    </div>
  `).join("");
}

// Modal helper to close via backdrop click
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("open");
  }
});

// Attach helpers to window
window.openDestinationDetails = openDestinationDetails;
window.closeAllModals = closeAllModals;
window.openSafetyAIPanel = openSafetyAIPanel;
window.renderMyTripSection = renderMyTripSection;
