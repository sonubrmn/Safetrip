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
/* ==========================================================================
   EDITORIAL DISCOVERY & CATEGORY EXPLORATION SYSTEM
   ========================================================================== */
let currentExploreCategory = "destinations";

function initDestinationCards() {
  initExploreSystem();
}

function initExploreSystem() {
  // Bind category tabs in #exploreNavBar
  const navBar = document.getElementById("exploreNavBar");
  if (navBar) {
    const tabs = navBar.querySelectorAll(".explore-nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const cat = tab.getAttribute("data-category") || "destinations";
        selectExploreCategory(cat);
      });
    });
  }

  // Click outside to close explore dropdown
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("exploreDropdownMenu");
    const btn = document.getElementById("navExploreBtn");
    if (!menu || !btn) return;
    if (menu.style.display !== "none" && !menu.contains(e.target) && !btn.contains(e.target)) {
      closeExploreDropdown();
    }
  });

  // Escape key closes explore dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeExploreDropdown();
    }
  });

  // Hash navigation listener
  window.addEventListener("hashchange", handleExploreHashChange);

  // Check initial hash on load
  handleExploreHashChange();
}

function toggleExploreDropdown(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const menu = document.getElementById("exploreDropdownMenu");
  const btn = document.getElementById("navExploreBtn");
  if (!menu || !btn) return;

  const isOpen = menu.style.display !== "none";
  if (isOpen) {
    closeExploreDropdown();
  } else {
    openExploreDropdown();
  }
}

function openExploreDropdown() {
  const menu = document.getElementById("exploreDropdownMenu");
  const btn = document.getElementById("navExploreBtn");
  if (!menu || !btn) return;

  menu.style.display = "block";
  btn.classList.add("open");
  btn.setAttribute("aria-expanded", "true");
}

function closeExploreDropdown() {
  const menu = document.getElementById("exploreDropdownMenu");
  const btn = document.getElementById("navExploreBtn");
  if (!menu || !btn) return;

  menu.style.display = "none";
  btn.classList.remove("open");
  btn.setAttribute("aria-expanded", "false");
}

function handleExploreMenuSelect(catId) {
  closeExploreDropdown();
  selectExploreCategory(catId, true);

  const section = document.getElementById("explore");
  if (section && typeof section.scrollIntoView === "function") {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function selectExploreCategory(catId, updateHash = true) {
  currentExploreCategory = catId || "destinations";

  // Update tabs
  const navBar = document.getElementById("exploreNavBar");
  if (navBar) {
    const tabs = navBar.querySelectorAll(".explore-nav-tab");
    tabs.forEach(tab => {
      if (tab.getAttribute("data-category") === currentExploreCategory) {
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      }
    });
  }

  // Ensure category discovery view is visible, detail view hidden
  const catView = document.getElementById("exploreCategoryView");
  const detailView = document.getElementById("exploreDetailView");
  if (catView) catView.style.display = "block";
  if (detailView) detailView.style.display = "none";

  // Render content
  renderExploreCategoryView(currentExploreCategory);

  if (updateHash && window.location.hash !== `#explore/${currentExploreCategory}`) {
    history.pushState(null, "", `#explore/${currentExploreCategory}`);
  }
}

function handleExploreHashChange() {
  const hash = window.location.hash;
  if (!hash || hash === "#explore") {
    selectExploreCategory("destinations", false);
    return;
  }

  if (hash.startsWith("#explore/detail/")) {
    const id = hash.replace("#explore/detail/", "").trim();
    if (id) {
      openDestinationDetailView(id, false);
    }
  } else if (hash.startsWith("#explore/")) {
    const cat = hash.replace("#explore/", "").trim();
    if (cat) {
      selectExploreCategory(cat, false);
    }
  }
}

// ---------------------------------------------------------------------------
// RENDER CATEGORY DISCOVERY VIEW
// ---------------------------------------------------------------------------
function renderExploreCategoryView(catId) {
  const container = document.getElementById("exploreCategoryView");
  if (!container) return;

  if (catId === "experiences") {
    renderExperiencesCategoryView(container);
  } else if (catId === "stays") {
    renderStaysCategoryView(container);
  } else if (catId === "food") {
    renderFoodCategoryView(container);
  } else if (catId === "hidden-gems") {
    renderHiddenGemsCategoryView(container);
  } else {
    // Default: destinations
    renderDestinationsCategoryView(container);
  }
}

// 1. DESTINATIONS CATEGORY VIEW
function renderDestinationsCategoryView(container) {
  const destinations = (window.SafeTripExplore && SafeTripExplore.destinations) || SafeTripData.destinations || [];
  const heroDest = destinations[0]; // Jaipur
  const listDest = destinations.slice(1);

  let html = `
    <!-- Featured Hero Spotlight -->
    <article class="editorial-hero-spotlight">
      <img class="hero-spotlight-bg" src="${heroDest.heroImage}" alt="${heroDest.title}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${heroDest.name}', 'safe');">
      <div class="hero-spotlight-gradient"></div>
      <div class="hero-spotlight-content">
        <div class="hero-spotlight-badge-row">
          <span class="hero-spotlight-badge">FEATURED DESTINATION</span>
          <span class="hero-safety-pill">🛡️ Safety Score: ${heroDest.safetyScore}/100 • ${heroDest.riskLevel}</span>
        </div>
        <h2 class="hero-spotlight-title">${heroDest.title}</h2>
        <p class="hero-spotlight-tagline">${heroDest.tagline}</p>
        <p class="hero-spotlight-desc">${heroDest.description}</p>
        <div class="hero-spotlight-actions">
          <button class="btn-hero-primary" onclick="openDestinationDetailView('${heroDest.id}')">
            Explore Jaipur Stories &rarr;
          </button>
          <button class="btn-hero-secondary" onclick="openSafetyAIPanel('Plan a 3-day trip to Jaipur for under ₹10,000')">
            ✨ Plan with SafeTrip AI
          </button>
          <button class="btn-hero-secondary" onclick="addExploreDestinationToTrip('${heroDest.id}')">
            + Add to My Trip
          </button>
        </div>
      </div>
    </article>

    <!-- Editorial Discovery Stack -->
    <div class="editorial-discovery-section">
      <div class="editorial-section-head">
        <div>
          <h3 class="editorial-section-title">Royal Heritage Cities & Citadels</h3>
          <p class="editorial-section-desc">Curated Rajasthan destinations offering living culture, iconic architecture, and verified tourist safety corridors.</p>
        </div>
      </div>

      <div class="editorial-cards-stack">
        ${listDest.map((dest, idx) => `
          <article class="editorial-feature-card ${idx % 2 === 1 ? 'reverse' : ''}">
            <div class="feature-img-wrapper">
              <img class="feature-img" src="${dest.heroImage}" alt="${dest.title}" loading="lazy" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${dest.name}', '${dest.statusClass}');">
              <span class="feature-floating-badge">${dest.region}</span>
              <span class="feature-safety-badge ${dest.statusClass}">🛡️ Safety: ${dest.safetyScore}/100</span>
            </div>
            <div class="feature-content">
              <div>
                <span class="feature-tagline-eyebrow">${dest.state} • ${dest.idealDuration}</span>
                <h3 class="feature-title">${dest.title}</h3>
                <p class="feature-desc">${dest.description}</p>

                <!-- What this place is famous for -->
                <div class="feature-highlights-box">
                  <div class="feature-highlights-title">
                    <span>✨</span> What ${dest.name} Is Famous For:
                  </div>
                  <div class="famous-for-chips">
                    ${dest.famousFor.slice(0, 3).map(f => `
                      <span class="famous-chip">${f}</span>
                    `).join("")}
                  </div>
                </div>

                <!-- Don't Miss Highlight -->
                ${dest.dontMiss && dest.dontMiss[0] ? `
                  <div class="dont-miss-preview-pill">
                    <b>DON'T MISS:</b> ${dest.dontMiss[0].title} (${dest.dontMiss[0].duration})
                  </div>
                ` : ""}
              </div>

              <div class="feature-action-bar">
                <button class="btn-card-explore-main" onclick="openDestinationDetailView('${dest.id}')">
                  View Full Details &rarr;
                </button>
                <button class="btn-card-plan-ai" onclick="openSafetyAIPanel('Plan a trip to ${dest.name} for 2 days')">
                  ✨ Plan with AI
                </button>
                <button class="btn-card-add-trip" onclick="addExploreDestinationToTrip('${dest.id}')">
                  + Add to Trip
                </button>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// 2. EXPERIENCES CATEGORY VIEW
function renderExperiencesCategoryView(container) {
  const experiences = (window.SafeTripExplore && SafeTripExplore.experiences) || SafeTripData.experiences || [];
  const heroExp = experiences[0];
  const listExp = experiences.slice(1);

  let html = `
    <!-- Hero Spotlight -->
    <article class="editorial-hero-spotlight">
      <img class="hero-spotlight-bg" src="${heroExp.image}" alt="${heroExp.title}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${heroExp.title}', 'safe');">
      <div class="hero-spotlight-gradient"></div>
      <div class="hero-spotlight-content">
        <div class="hero-spotlight-badge-row">
          <span class="hero-spotlight-badge">${heroExp.category}</span>
          <span class="hero-safety-pill">🛡️ Safety Score: ${heroExp.safetyScore}/100 • Verified Guild</span>
        </div>
        <h2 class="hero-spotlight-title">${heroExp.title}</h2>
        <p class="hero-spotlight-tagline">${heroExp.location} • ${heroExp.duration} • ${heroExp.priceEst}</p>
        <p class="hero-spotlight-desc">${heroExp.description}</p>
        <div class="hero-spotlight-actions">
          <button class="btn-hero-primary" onclick="addExploreExperienceToTrip('${heroExp.id}')">
            + Add to My Trip
          </button>
          <button class="btn-hero-secondary" onclick="openSafetyAIPanel('Tell me more about the ${heroExp.title} in Jaipur')">
            ✨ Ask AI About This Masterclass
          </button>
        </div>
      </div>
    </article>

    <!-- Editorial Cards Stack -->
    <div class="editorial-discovery-section">
      <div class="editorial-section-head">
        <div>
          <h3 class="editorial-section-title">Hands-On Workshops & Living Traditions</h3>
          <p class="editorial-section-desc">Experience authentic Rajasthani craftsmanship, folk arts, and culinary walks directly with 4th-generation masters.</p>
        </div>
      </div>

      <div class="editorial-cards-stack">
        ${listExp.map((exp, idx) => `
          <article class="editorial-feature-card ${idx % 2 === 1 ? 'reverse' : ''}">
            <div class="feature-img-wrapper">
              <img class="feature-img" src="${exp.image}" alt="${exp.title}" loading="lazy" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${exp.title}', '${exp.statusClass}');">
              <span class="feature-floating-badge">${exp.category}</span>
              <span class="feature-safety-badge ${exp.statusClass}">🛡️ Safety: ${exp.safetyScore}/100</span>
            </div>
            <div class="feature-content">
              <div>
                <span class="feature-tagline-eyebrow">${exp.location} • ${exp.duration}</span>
                <h3 class="feature-title">${exp.title}</h3>
                <p class="feature-desc">${exp.description}</p>

                <div class="feature-highlights-box">
                  <div class="feature-highlights-title">
                    <span>🛡️</span> Why Recommended by SafeTrip:
                  </div>
                  <p style="font-size: 12.5px; color: #334155; margin: 0; line-height: 1.5;">${exp.whyRecommended}</p>
                </div>

                <div class="famous-for-chips" style="margin-bottom: 16px;">
                  ${exp.tags.map(t => `<span class="famous-chip">● ${t}</span>`).join("")}
                  ${exp.suitableFor ? `<span class="famous-chip" style="background: #f0fdf4; color: #166534; border-color: #bbf7d0;">👤 ${exp.suitableFor}</span>` : ""}
                </div>
              </div>

              <div class="feature-action-bar">
                <span style="font-size: 15px; font-weight: 800; color: #0284c7;">${exp.priceEst}</span>
                <div style="display: flex; gap: 8px; margin-left: auto;">
                  <button class="btn-card-plan-ai" onclick="openSafetyAIPanel('How can I book or participate in ${exp.title}?')">
                    ✨ Ask AI
                  </button>
                  <button class="btn-card-explore-main" onclick="addExploreExperienceToTrip('${exp.id}')">
                    + Add to Trip
                  </button>
                </div>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// 3. STAYS CATEGORY VIEW
function renderStaysCategoryView(container) {
  const stays = (window.SafeTripExplore && SafeTripExplore.stays) || SafeTripData.accommodations || [];
  const heroStay = stays[0];
  const listStays = stays.slice(1);

  let html = `
    <!-- Hero Spotlight -->
    <article class="editorial-hero-spotlight">
      <img class="hero-spotlight-bg" src="${heroStay.image}" alt="${heroStay.name}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${heroStay.name}', 'safe');">
      <div class="hero-spotlight-gradient"></div>
      <div class="hero-spotlight-content">
        <div class="hero-spotlight-badge-row">
          <span class="hero-spotlight-badge">${heroStay.type}</span>
          <span class="hero-safety-pill">🛡️ Safety Score: ${heroStay.safetyScore}/100 • Verified Safe Precinct</span>
        </div>
        <h2 class="hero-spotlight-title">${heroStay.name}</h2>
        <p class="hero-spotlight-tagline">${heroStay.location} • ${heroStay.rating} • <b>${heroStay.priceNight}</b></p>
        <p class="hero-spotlight-desc">${heroStay.description}</p>
        <div class="hero-spotlight-actions">
          <button class="btn-hero-primary" onclick="SafeTripAI.openDemoReservation('${heroStay.name}')">
            Reserve Demo Stay
          </button>
          <button class="btn-hero-secondary" onclick="openSafetyAIPanel('Is ${heroStay.name} in a safe location for solo travelers?')">
            ✨ Ask AI About Safety
          </button>
        </div>
      </div>
    </article>

    <!-- Editorial Cards Stack -->
    <div class="editorial-discovery-section">
      <div class="editorial-section-head">
        <div>
          <h3 class="editorial-section-title">Verified Safe Havelis, Stays & Hostels</h3>
          <p class="editorial-section-desc">Accommodations audited for continuous illumination, verified staff backgrounds, female safety, and proximity to tourist police beats.</p>
        </div>
      </div>

      <div class="editorial-cards-stack">
        ${listStays.map((stay, idx) => `
          <article class="editorial-feature-card ${idx % 2 === 1 ? 'reverse' : ''}">
            <div class="feature-img-wrapper">
              <img class="feature-img" src="${stay.image}" alt="${stay.name}" loading="lazy" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${stay.name}', '${stay.statusClass}');">
              <span class="feature-floating-badge">${stay.type}</span>
              <span class="feature-safety-badge ${stay.statusClass}">🛡️ Safety: ${stay.safetyScore}/100</span>
            </div>
            <div class="feature-content">
              <div>
                <span class="feature-tagline-eyebrow">${stay.location} • ⭐ ${stay.rating}</span>
                <h3 class="feature-title">${stay.name}</h3>
                <p class="feature-desc">${stay.description}</p>

                <div class="feature-highlights-box">
                  <div class="feature-highlights-title">
                    <span>🛡️</span> Safety Intelligence & Verification:
                  </div>
                  <p style="font-size: 12.5px; color: #334155; margin: 0; line-height: 1.5;">${stay.whyRecommended}</p>
                </div>

                <div class="famous-for-chips" style="margin-bottom: 16px;">
                  ${stay.features ? stay.features.map(f => `<span class="famous-chip">✓ ${f}</span>`).join("") : ""}
                  ${stay.cancellation ? `<span class="famous-chip" style="background: #ecfdf5; color: #065f46; border-color: #a7f3d0;">${stay.cancellation}</span>` : ""}
                </div>
              </div>

              <div class="feature-action-bar">
                <span style="font-size: 15px; font-weight: 800; color: #0284c7;">${stay.priceNight}</span>
                <div style="display: flex; gap: 8px; margin-left: auto;">
                  <button class="btn-card-plan-ai" onclick="openSafetyAIPanel('Find nearby safe restaurants around ${stay.name}')">
                    ✨ Ask AI
                  </button>
                  <button class="btn-card-explore-main" onclick="SafeTripAI.openDemoReservation('${stay.name}')">
                    Reserve Demo
                  </button>
                </div>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// 4. FOOD & CULTURE CATEGORY VIEW
function renderFoodCategoryView(container) {
  const foods = SafeTripData.localFoods || [];
  const heroFood = foods[0]; // Dal Baati
  const listFoods = foods.slice(1);

  let html = `
    <!-- Hero Spotlight -->
    <article class="editorial-hero-spotlight">
      <img class="hero-spotlight-bg" src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&auto=format&fit=crop&q=85" alt="${heroFood.name}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${heroFood.name}', 'safe');">
      <div class="hero-spotlight-gradient"></div>
      <div class="hero-spotlight-content">
        <div class="hero-spotlight-badge-row">
          <span class="hero-spotlight-badge">ROYAL SIGNATURE DISH</span>
          <span class="hero-safety-pill">🍲 High Turnover Hygienic Kitchens</span>
        </div>
        <h2 class="hero-spotlight-title">${heroFood.name} (${heroFood.hindiName})</h2>
        <p class="hero-spotlight-tagline">${heroFood.category} • ${heroFood.dietary} • <b>${heroFood.priceEst}</b></p>
        <p class="hero-spotlight-desc">${heroFood.description}</p>
        <div class="hero-spotlight-actions">
          <button class="btn-hero-primary" onclick="openSafetyAIPanel('Where can I get the best authentic Dal Baati Churma in Jaipur?')">
            ✨ Ask AI Where to Eat
          </button>
          <button class="btn-hero-secondary" onclick="openSafetyAIPanel('What is the story behind Dal Baati Churma in Rajput history?')">
            📖 Cultural History
          </button>
        </div>
      </div>
    </article>

    <!-- Editorial Cards Stack -->
    <div class="editorial-discovery-section">
      <div class="editorial-section-head">
        <div>
          <h3 class="editorial-section-title">Century-Old Cauldron Recipes & Sweet Houses</h3>
          <p class="editorial-section-desc">Authentic street food, saffron desserts, and royal curries with verified food hygiene and safety advice.</p>
        </div>
      </div>

      <div class="editorial-cards-stack">
        ${listFoods.map((food, idx) => `
          <article class="editorial-feature-card ${idx % 2 === 1 ? 'reverse' : ''}">
            <div class="feature-img-wrapper" style="min-height: 260px;">
              <img class="feature-img" src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&auto=format&fit=crop&q=80" alt="${food.name}" loading="lazy" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${food.name}', 'safe');">
              <span class="feature-floating-badge">${food.category}</span>
              <span class="feature-safety-badge safe">🍲 ${food.dietary}</span>
            </div>
            <div class="feature-content">
              <div>
                <span class="feature-tagline-eyebrow">${food.hindiName} • ${food.priceEst}</span>
                <h3 class="feature-title">${food.name}</h3>
                <p class="feature-desc">${food.description}</p>

                <div class="feature-highlights-box">
                  <div class="feature-highlights-title">
                    <span>📍</span> Famous Heritage Outlets:
                  </div>
                  <p style="font-size: 13px; font-weight: 700; color: #0284c7; margin: 0 0 6px;">${food.famousAt}</p>
                  <p style="font-size: 12px; color: #059669; margin: 0;">🛡️ <b>Safety Intel:</b> ${food.safetyNote}</p>
                </div>
              </div>

              <div class="feature-action-bar">
                <button class="btn-card-plan-ai" onclick="openSafetyAIPanel('Tell me the best time and route to eat ${food.name} safely')">
                  ✨ Ask AI Where to Eat &rarr;
                </button>
                <button class="btn-card-add-trip" onclick="SafeTripStore.addToMyTrip({ id: 'trip-food-${food.id}', title: 'Taste ${food.name} at ${food.famousAt.split('&')[0].trim()}', type: 'food', day: 'Day 1', time: 'Evening', estCost: '${food.priceEst}', safetyScore: 95 }); showToastNotification('✓ Added ${food.name} to My Trip!');">
                  + Add to Trip
                </button>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// 5. HIDDEN GEMS CATEGORY VIEW
function renderHiddenGemsCategoryView(container) {
  const gems = (window.SafeTripExplore && SafeTripExplore.hiddenGems) || [];
  const heroGem = gems[0]; // Panna Meena Ka Kund
  const listGems = gems.slice(1);

  let html = `
    <!-- Hero Spotlight -->
    <article class="editorial-hero-spotlight">
      <img class="hero-spotlight-bg" src="${heroGem.image}" alt="${heroGem.name}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${heroGem.name}', 'safe');">
      <div class="hero-spotlight-gradient"></div>
      <div class="hero-spotlight-content">
        <div class="hero-spotlight-badge-row">
          <span class="hero-spotlight-badge">${heroGem.category}</span>
          <span class="hero-safety-pill">🛡️ Safety Score: ${heroGem.safetyScore}/100 • Secluded Escape</span>
        </div>
        <h2 class="hero-spotlight-title">${heroGem.name}</h2>
        <p class="hero-spotlight-tagline">${heroGem.tagline} • ${heroGem.location}</p>
        <p class="hero-spotlight-desc">${heroGem.description}</p>
        <div class="hero-spotlight-actions">
          <button class="btn-hero-primary" onclick="openDestinationDetailView('${heroGem.id}')">
            Explore Stepwell Secrets &rarr;
          </button>
          <button class="btn-hero-secondary" onclick="openSafetyAIPanel('How do I visit Panna Meena Ka Kund stepwell safely from Amer Fort?')">
            ✨ Ask AI Route & Timing
          </button>
        </div>
      </div>
    </article>

    <!-- Editorial Cards Stack -->
    <div class="editorial-discovery-section">
      <div class="editorial-section-head">
        <div>
          <h3 class="editorial-section-title">Beyond The Regular Tourist Trails</h3>
          <p class="editorial-section-desc">Ancient geometric stepwells, sacred mountain springs, and quiet royal water pavilions away from coach crowds.</p>
        </div>
      </div>

      <div class="editorial-cards-stack">
        ${listGems.map((gem, idx) => `
          <article class="editorial-feature-card ${idx % 2 === 1 ? 'reverse' : ''}">
            <div class="feature-img-wrapper">
              <img class="feature-img" src="${gem.image}" alt="${gem.name}" loading="lazy" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${gem.name}', '${gem.statusClass}');">
              <span class="feature-floating-badge">${gem.category}</span>
              <span class="feature-safety-badge ${gem.statusClass}">🛡️ Safety: ${gem.safetyScore}/100</span>
            </div>
            <div class="feature-content">
              <div>
                <span class="feature-tagline-eyebrow">${gem.location}</span>
                <h3 class="feature-title">${gem.name}</h3>
                <p class="feature-desc">${gem.description}</p>

                <div class="feature-highlights-box">
                  <div class="feature-highlights-title">
                    <span>💎</span> Why This Spot Is Special:
                  </div>
                  <p style="font-size: 13px; color: #334155; margin: 0 0 6px; line-height: 1.5;">${gem.whySpecial}</p>
                  <p style="font-size: 12px; color: #0284c7; margin: 0;">💡 <b>Insider Tip:</b> ${gem.practicalTip}</p>
                </div>
              </div>

              <div class="feature-action-bar">
                <button class="btn-card-explore-main" onclick="openDestinationDetailView('${gem.id}')">
                  View Full Details &rarr;
                </button>
                <button class="btn-card-plan-ai" onclick="openSafetyAIPanel('Give me safety advice and photography tips for visiting ${gem.name}')">
                  ✨ Ask AI
                </button>
                <button class="btn-card-add-trip" onclick="SafeTripStore.addToMyTrip({ id: 'trip-gem-${gem.id}', title: 'Visit ${gem.name}', type: 'hidden-gem', day: 'Day 2', time: 'Morning', estCost: 'Free', safetyScore: ${gem.safetyScore} }); showToastNotification('✓ Added ${gem.name} to My Trip!');">
                  + Add to Trip
                </button>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ---------------------------------------------------------------------------
// DESTINATION & EXPERIENCE FULL DETAIL VIEW
// ---------------------------------------------------------------------------
function openDestinationDetailView(id, updateHash = true) {
  // Find destination from SafeTripExplore or SafeTripData
  let item = null;
  if (window.SafeTripExplore) {
    item = SafeTripExplore.getDestinationById(id) ||
           SafeTripExplore.getExperienceById(id) ||
           SafeTripExplore.getGemById(id);
  }
  if (!item && SafeTripData.destinations) {
    item = SafeTripData.destinations.find(d => d.id === id);
  }
  if (!item) return;

  const catView = document.getElementById("exploreCategoryView");
  const detailView = document.getElementById("exploreDetailView");
  if (!catView || !detailView) return;

  catView.style.display = "none";
  detailView.style.display = "block";

  // Build complete editorial detail view
  const heroImage = item.heroImage || item.image || "https://images.unsplash.com/photo-1609948549021-95be246dbece?w=1600&auto=format&fit=crop&q=85";
  const title = item.title || item.name;
  const tagline = item.tagline || item.location || "Historic Heritage Landmark";
  const safetyScore = item.safetyScore || 92;
  const riskLevel = item.riskLevel || (safetyScore >= 80 ? "LOW RISK" : "CAUTION");
  const famousForList = item.famousFor || [
    "Iconic royal architecture and intricate sandstone craftsmanship",
    "UNESCO World Heritage preservation precinct",
    "High security perimeter with continuous beat police coverage",
    "Vibrant living artisan bazaars and Rajasthani hospitality"
  ];

  const dontMissList = item.dontMiss || [
    {
      title: "Guided Heritage Walk at Early Morning",
      category: "Heritage Wonder",
      duration: "2 Hours",
      budget: "₹100 – ₹300",
      description: "Experience the site in golden morning light before tourist crowds arrive. Notice the precision masonry and intricate carved stone lattices.",
      insiderTip: "Carry drinking water and wear comfortable walking footwear."
    },
    {
      title: "Local Culinary Tasting",
      category: "Food & Senses",
      duration: "1 Hour",
      budget: "₹150 – ₹350",
      description: "Taste traditional Rajasthani snacks and sweets at verified hygienic outlets in the adjacent heritage bazaar.",
      insiderTip: "Ask for freshly made hot items served straight from the cauldron."
    }
  ];

  detailView.innerHTML = `
    <div class="detail-back-bar">
      <button class="btn-back-explore" onclick="backToExploreCategories()">
        <span>&larr;</span> Back to Explore ${currentExploreCategory.toUpperCase()}
      </button>
      <span style="font-size: 13px; color: #64748b;">SafeTrip Smart Tourism Discovery</span>
    </div>

    <!-- Full-Bleed Hero Banner -->
    <div class="detail-hero-banner">
      <img src="${heroImage}" alt="${title}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${title}', 'safe');">
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-text">
        <span class="hero-spotlight-badge" style="margin-bottom: 8px; display: inline-block;">DESTINATION INTELLIGENCE</span>
        <h1 class="detail-hero-title">${title}</h1>
        <p class="detail-hero-tagline">${tagline}</p>
      </div>
    </div>

    <!-- Action Toolbar -->
    <div class="detail-actions-bar">
      <div class="detail-actions-left">
        <button class="btn-action-primary" onclick="openSafetyAIPanel('Plan a curated visit to ${title} under budget with safe routes')">
          ✨ Plan with SafeTrip AI
        </button>
        <button class="btn-action-secondary" onclick="addExploreDestinationToTrip('${item.id}')">
          + Add to My Trip
        </button>
      </div>
      <div class="detail-actions-right">
        <a href="#safety-map" class="btn-action-secondary" onclick="focusOnMapCoords(${item.coords ? item.coords[0] : 26.9239}, ${item.coords ? item.coords[1] : 75.8267}, '${item.name || title}')">
          🗺️ View on Safety Map
        </a>
        <a href="#routes" class="btn-action-secondary">
          🛡️ Safe Route
        </a>
      </div>
    </div>

    <!-- 2-Column Content Grid -->
    <div class="detail-content-grid">
      <!-- Main Content Column -->
      <div class="detail-main-col">
        
        <!-- Section: What this place is famous for -->
        <div class="detail-block">
          <h3 class="detail-block-title">
            <span>🏛️</span> What Is ${item.name || title} Famous For?
            <span class="detail-block-title-sub">Verified Heritage Facts</span>
          </h3>
          <div class="famous-for-grid">
            ${famousForList.map(f => `
              <div class="famous-for-item">
                <span class="famous-for-check">✓</span>
                <p class="famous-for-text">${f}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Section: DON'T MISS Storytelling -->
        <div class="detail-block">
          <h3 class="detail-block-title">
            <span>⭐</span> DON'T MISS — Curated Storytelling
            <span class="detail-block-title-sub">Things You Genuinely Shouldn't Miss</span>
          </h3>
          <div class="dont-miss-cards-list">
            ${dontMissList.map(dm => `
              <div class="dont-miss-card">
                <div class="dont-miss-header">
                  <span class="dont-miss-category">${dm.category}</span>
                  <span class="dont-miss-meta">⏱️ ${dm.duration} • 💰 ${dm.budget}</span>
                </div>
                <h4 class="dont-miss-title">${dm.title}</h4>
                <p class="dont-miss-desc">${dm.description}</p>
                <div class="dont-miss-tip">
                  💡 <b>Insider Advice:</b> ${dm.insiderTip}
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Section: Recommended Connected Experiences -->
        <div class="detail-block">
          <h3 class="detail-block-title">
            <span>🎨</span> Recommended Experiences in ${item.name || title}
            <span class="detail-block-title-sub">Hands-On Living Traditions</span>
          </h3>
          <div class="connected-experiences-grid">
            ${((window.SafeTripExplore && SafeTripExplore.experiences) || []).slice(0, 4).map(e => `
              <div class="connected-exp-card">
                <img class="connected-exp-img" src="${e.image}" alt="${e.title}" onerror="this.onerror=null; this.src=getDestinationFallbackSvg('${e.title}', 'safe');">
                <div class="connected-exp-body">
                  <div>
                    <h5 class="connected-exp-title">${e.title}</h5>
                    <div class="connected-exp-meta">${e.duration} • <b>${e.priceEst}</b></div>
                  </div>
                  <button class="connected-exp-btn" onclick="addExploreExperienceToTrip('${e.id}')">
                    + Add to Trip
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

      </div>

      <!-- Sidebar Practical Intelligence Column -->
      <div class="detail-sidebar-col">
        
        <!-- Practical Info Card -->
        <div class="practical-info-card">
          <h4 class="practical-info-title">Tourist Safety & Practical Intel</h4>
          
          <div class="practical-row">
            <span class="practical-label">Safety Score</span>
            <span class="practical-val" style="color: ${safetyScore >= 80 ? '#059669' : '#d97706'};">
              🛡️ ${safetyScore}/100 (${riskLevel})
            </span>
          </div>

          <div class="practical-row">
            <span class="practical-label">Safe Visiting Hours</span>
            <span class="practical-val">${item.safeHours || '08:00 AM – 07:00 PM'}</span>
          </div>

          <div class="practical-row">
            <span class="practical-label">Nearest Police Post</span>
            <span class="practical-val">${item.policePost || 'Tourist Police Beat 4 (120m)'}</span>
          </div>

          <div class="practical-row">
            <span class="practical-label">Ideal Duration</span>
            <span class="practical-val">${item.idealDuration || item.duration || '2 – 3 Hours'}</span>
          </div>

          <div class="practical-row">
            <span class="practical-label">Estimated Budget</span>
            <span class="practical-val">${item.estimatedBudget || item.priceEst || '₹250 – ₹500'}</span>
          </div>

          <div class="practical-row">
            <span class="practical-label">Best Season / Time</span>
            <span class="practical-val">${item.bestTime || 'Morning 8:30 AM – 11:00 AM'}</span>
          </div>

          <div class="practical-row" style="border-bottom: none;">
            <span class="practical-label">Accessibility</span>
            <span class="practical-val">${item.accessibility || 'Paved paths, level access'}</span>
          </div>
        </div>

        <!-- Signature Local Food -->
        <div class="practical-info-card">
          <h4 class="practical-info-title">Signature Local Food to Try</h4>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
            ${(item.foodHighlights || ["Dal Baati Churma", "Pyaaz Kachori", "Malai Ghewar", "Special Kulhad Lassi"]).map(f => `
              <li style="font-size: 13px; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                <span style="color: #0284c7;">🍲</span> <b>${f}</b>
              </li>
            `).join("")}
          </ul>
          <button class="btn-res-action primary" onclick="openSafetyAIPanel('Recommend authentic places to eat near ${title}')" style="width: 100%; margin-top: 14px; font-size: 12px; padding: 8px;">
            Ask AI For Food Recommendations &rarr;
          </button>
        </div>

        <!-- AI Travel Assistant Card -->
        <div class="detail-ai-callout">
          <div style="font-size: 22px; margin-bottom: 6px;">🤖</div>
          <h4 class="detail-ai-title">Have questions about ${item.name || title}?</h4>
          <p class="detail-ai-desc">SafeTrip AI knows history, tickets, crowd density, safe walking paths, and transport costs.</p>
          <button class="btn-sidebar-ai" onclick="openSafetyAIPanel('Tell me everything a tourist should know before visiting ${title}')">
            Chat with Safety AI &rarr;
          </button>
        </div>

      </div>
    </div>
  `;

  if (updateHash && window.location.hash !== `#explore/detail/${id}`) {
    history.pushState(null, "", `#explore/detail/${id}`);
  }

  const section = document.getElementById("explore");
  if (section && typeof section.scrollIntoView === "function") {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function backToExploreCategories() {
  const catView = document.getElementById("exploreCategoryView");
  const detailView = document.getElementById("exploreDetailView");
  if (catView) catView.style.display = "block";
  if (detailView) detailView.style.display = "none";

  renderExploreCategoryView(currentExploreCategory);

  if (window.location.hash !== `#explore/${currentExploreCategory}`) {
    history.pushState(null, "", `#explore/${currentExploreCategory}`);
  }

  const section = document.getElementById("explore");
  if (section && typeof section.scrollIntoView === "function") {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function addExploreDestinationToTrip(destId) {
  let dest = null;
  if (window.SafeTripExplore) {
    dest = SafeTripExplore.getDestinationById(destId);
  }
  if (!dest && SafeTripData.destinations) {
    dest = SafeTripData.destinations.find(d => d.id === destId);
  }
  if (!dest) return;

  SafeTripStore.addToMyTrip({
    id: `trip-d-${dest.id}-${Date.now()}`,
    title: dest.title || dest.name,
    type: "destination",
    day: "Day 1",
    time: "Morning",
    estCost: dest.estimatedBudget || "₹300",
    safetyScore: dest.safetyScore || 92
  });

  if (typeof showToastNotification === "function") {
    showToastNotification(`✓ Added "${dest.name || dest.title}" to My Trip!`);
  }
}

function addExploreExperienceToTrip(expId) {
  let exp = null;
  if (window.SafeTripExplore) {
    exp = SafeTripExplore.getExperienceById(expId);
  }
  if (!exp && SafeTripData.experiences) {
    exp = SafeTripData.experiences.find(e => e.id === expId);
  }
  if (!exp) return;

  SafeTripStore.addToMyTrip({
    id: `trip-e-${exp.id}-${Date.now()}`,
    title: exp.title,
    type: "experience",
    day: "Day 2",
    time: exp.recommendedTime ? exp.recommendedTime.split("–")[0].trim() : "02:00 PM",
    estCost: exp.priceEst || "₹600",
    safetyScore: exp.safetyScore || 92
  });

  if (typeof showToastNotification === "function") {
    showToastNotification(`✓ Added "${exp.title}" to My Trip!`);
  }
}

function focusOnMapCoords(lat, lng, name) {
  if (window.safetyMap && typeof window.safetyMap.flyTo === "function") {
    window.safetyMap.flyTo([lat, lng], 16, { duration: 1.2 });
  }
}

// Backward compatibility helper
function openDestinationDetails(destId) {
  openDestinationDetailView(destId);
}

// Global Exports
window.toggleExploreDropdown = toggleExploreDropdown;
window.openExploreDropdown = openExploreDropdown;
window.closeExploreDropdown = closeExploreDropdown;
window.handleExploreMenuSelect = handleExploreMenuSelect;
window.selectExploreCategory = selectExploreCategory;
window.openDestinationDetailView = openDestinationDetailView;
window.backToExploreCategories = backToExploreCategories;
window.addExploreDestinationToTrip = addExploreDestinationToTrip;
window.addExploreExperienceToTrip = addExploreExperienceToTrip;
window.focusOnMapCoords = focusOnMapCoords;
window.openDestinationDetails = openDestinationDetails;

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
        startPlaceholderRotation();
      }
    });

    // Multilingual Placeholder Cycling (4.2s calm moderate rotation)
    const placeholderExamples = [
      "Plan Jaipur for 3 days under ₹10,000",
      "₹10,000 में 3 दिन का जयपुर ट्रिप प्लान करो",
      "₹১০,০০০-এর মধ্যে ৩ দিনের জয়পুর ট্রিপ প্ল্যান করো",
      "₹10,000 ਦੇ ਅੰਦਰ ਜੈਪੁਰ ਲਈ 3 ਦਿਨਾਂ ਦੀ ਟ੍ਰਿਪ ਪਲਾਨ ਕਰੋ",
      "Planifica un viaje de 3 días a Jaipur por menos de ₹10.000",
      "Planifie un voyage de 3 jours à Jaipur pour moins de ₹10 000",
      "Plane eine 3-tägige Jaipur-Reise für unter ₹10.000",
      "₹10,000க்குள் ஜெய்ப்பூருக்கு 3 நாள் பயணத்தைத் திட்டமிடு",
      "₹10,000లోపు జైపూర్ 3 రోజుల ట్రిప్ ప్లాన్ చేయండి",
      "₹10,000માં જયપુરની 3 દિવસની ટ્રિપ પ્લાન કરો",
      "₹10,000 کے اندر جے پور کے لیے 3 دن کا سفر پلان کریں"
    ];
    let phIdx = 0;
    let phTimer = null;

    function startPlaceholderRotation() {
      if (phTimer) clearInterval(phTimer);
      phTimer = setInterval(() => {
        if (!input.value.trim()) {
          phIdx = (phIdx + 1) % placeholderExamples.length;
          input.setAttribute("placeholder", placeholderExamples[phIdx]);
        }
      }, 4200);
    }

    function stopPlaceholderRotation() {
      if (phTimer) {
        clearInterval(phTimer);
        phTimer = null;
      }
    }

    input.addEventListener("focus", () => stopPlaceholderRotation());
    input.addEventListener("input", () => {
      if (input.value.length > 0) stopPlaceholderRotation();
      else startPlaceholderRotation();
    });
    input.addEventListener("blur", () => {
      if (!input.value.trim()) startPlaceholderRotation();
    });

    startPlaceholderRotation();
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

  setTimeout(async () => {
    if (window.SafeTripAI) {
      const replyHtml = window.SafeTripAI.processMessageAsync 
        ? await window.SafeTripAI.processMessageAsync(userText)
        : window.SafeTripAI.processMessage(userText);
      typingBubble.innerHTML = replyHtml;
    } else {
      typingBubble.textContent = "SafeTrip AI companion ready.";
    }
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 450);
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
