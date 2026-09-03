/**
 * SAFETRIP - Authority & Police Command Center Controller
 * Manages live operational map, incident triage, AI explainability, geofence management, and digital ID verification.
 */

let authorityMap = null;
let authorityTouristMarkers = [];
let authorityGeofenceLayers = {};
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  initAuthorityMap();
  renderKpiMetrics();
  renderIncidentsList();
  renderGeofenceList();
  initIdVerification();
  initRiskExplainability(SafeTripData.incidents[0]);

  // Listen for real-time SOS broadcasts from tourist companion
  SafeTripEvents.on("sos:triggered", (incident) => {
    renderKpiMetrics();
    renderIncidentsList();
    if (authorityMap && incident.coords) {
      addOrUpdateEmergencyMarker(incident);
      authorityMap.setView(incident.coords, 14, { animate: true });
    }
  });

  SafeTripEvents.on("geofence:breach", (incident) => {
    renderKpiMetrics();
    renderIncidentsList();
    if (authorityMap && incident.coords) {
      authorityMap.setView(incident.coords, 14, { animate: true });
    }
  });

  SafeTripEvents.on("metrics:updated", () => {
    renderKpiMetrics();
  });

  SafeTripEvents.on("tourist:location_changed", () => {
    renderAuthorityTouristMarkers();
    renderKpiMetrics();
    renderIncidentsList();
  });

  SafeTripEvents.on("state:synced", () => {
    renderKpiMetrics();
    renderIncidentsList();
    renderAuthorityTouristMarkers();
    renderGeofenceList();
  });
});

/* ==========================================================================
   AUTHORITY LIVE MAP
   ========================================================================== */
function initAuthorityMap() {
  const mapEl = document.getElementById("authorityMap");
  if (!mapEl) return;

  authorityMap = L.map("authorityMap", {
    center: SafeTripData.center,
    zoom: 13,
    attributionControl: false,
    scrollWheelZoom: true,
    touchZoom: true,
    wheelDebounceTime: 40,
    wheelPxPerZoomLevel: 60
  });

  if (authorityMap.scrollWheelZoom) {
    const defaultWheelHandler = authorityMap.scrollWheelZoom._onWheelScroll.bind(authorityMap.scrollWheelZoom);
    authorityMap.scrollWheelZoom._onWheelScroll = function (e) {
      if (e.ctrlKey) {
        defaultWheelHandler(e);
      }
    };
  }

  mapEl.addEventListener("gesturestart", (e) => e.preventDefault());
  mapEl.addEventListener("gesturechange", (e) => e.preventDefault());

  // OpenStreetMap Base Tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(authorityMap);

  // Render Geofence Boundaries
  SafeTripData.geofences.forEach(zone => {
    const polygon = L.polygon(zone.coordinates, {
      color: zone.color,
      fillColor: zone.fillColor,
      fillOpacity: zone.type === "restricted" ? 0.35 : 0.15,
      weight: 2,
      dashArray: zone.type === "restricted" ? "4, 4" : null
    }).addTo(authorityMap);

    polygon.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; color: #0f172a; max-width: 200px;">
        <b style="color: ${zone.color}; font-size: 11px; text-transform: uppercase;">${zone.type} Geofence</b>
        <div style="font-weight: 700; font-size: 13px; margin: 2px 0;">${zone.name}</div>
        <div style="font-size: 11.5px; color: #475569;">${zone.description}</div>
      </div>
    `);

    authorityGeofenceLayers[zone.id] = polygon;
  });

  // Render Emergency POIs
  SafeTripData.emergencyServices.forEach(poi => {
    const isHospital = poi.type === "hospital";
    const marker = L.circleMarker(poi.coords, {
      radius: 7,
      fillColor: isHospital ? "#3b82f6" : "#0f172a",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 1
    }).addTo(authorityMap);

    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; color: #0f172a;">
        <div style="font-size: 10.5px; font-weight: 700; color: #3b82f6; text-transform: uppercase;">${poi.category}</div>
        <b style="font-size: 13px;">${poi.name}</b>
        <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">Hotline: ${poi.phone}</div>
      </div>
    `);
  });

  // Render Live Tourist Markers
  renderAuthorityTouristMarkers();
}

function renderAuthorityTouristMarkers() {
  if (!authorityMap) return;

  // Clear existing
  authorityTouristMarkers.forEach(m => authorityMap.removeLayer(m));
  authorityTouristMarkers = [];

  const tourists = SafeTripData.liveTourists;

  tourists.forEach(t => {
    if (currentFilter !== "all") {
      if (currentFilter === "low" && t.risk !== "LOW RISK") return;
      if (currentFilter === "medium" && t.risk !== "CAUTION") return;
      if (currentFilter === "high" && t.risk !== "HIGH RISK" && t.risk !== "EMERGENCY") return;
      if (currentFilter === "sos" && t.risk !== "HIGH RISK" && t.risk !== "EMERGENCY") return;
    }

    const isEmergency = t.risk === "EMERGENCY" || t.risk === "HIGH RISK";
    const isCaution = t.risk === "CAUTION";
    const color = isEmergency ? "#ef4444" : (isCaution ? "#f59e0b" : "#10b981");

    const marker = L.circleMarker(t.coords, {
      radius: isEmergency ? 9 : 6,
      fillColor: color,
      color: "#ffffff",
      weight: 2,
      fillOpacity: 0.95
    }).addTo(authorityMap);

    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 2px;">
        <b style="font-size: 13px;">${t.name}</b>
        <div style="font-size: 11.5px; color: #64748b; font-family: monospace;">${t.id}</div>
        <div style="font-size: 11.5px; font-weight: 700; color: ${color}; margin-top: 4px;">
          Risk: ${t.risk} (${t.score}/100)
        </div>
      </div>
    `);

    authorityTouristMarkers.push(marker);
  });
}

function addOrUpdateEmergencyMarker(incident) {
  if (!authorityMap) return;

  const marker = L.circleMarker(incident.coords, {
    radius: 12,
    fillColor: "#ef4444",
    color: "#ffffff",
    weight: 3,
    fillOpacity: 1
  }).addTo(authorityMap);

  marker.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; color: #0f172a;">
      <div style="font-size: 11px; font-weight: 800; color: #ef4444;">🚨 ${incident.priority}</div>
      <b style="font-size: 13px;">${incident.touristName} (${incident.touristId})</b>
      <div style="font-size: 12px; color: #475569; margin-top: 2px;">${incident.trigger}</div>
      <div style="font-size: 11.5px; color: #64748b; margin-top: 4px;">${incident.locationName}</div>
    </div>
  `).openPopup();
}

function filterMapTourists(filterType) {
  currentFilter = filterType;
  document.querySelectorAll(".btn-filter-map").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-filter") === filterType);
  });
  renderAuthorityTouristMarkers();
}

/* ==========================================================================
   KPI SUMMARY METRICS
   ========================================================================== */
function renderKpiMetrics() {
  const m = SafeTripData.metrics;
  const elTourists = document.getElementById("kpiActiveTourists");
  const elHighRisk = document.getElementById("kpiHighRisk");
  const elSos = document.getElementById("kpiSosAlerts");
  const elGeofence = document.getElementById("kpiGeofenceAlerts");

  if (elTourists) elTourists.textContent = m.activeTourists.toLocaleString();
  if (elHighRisk) elHighRisk.textContent = m.highRiskCount;
  if (elSos) elSos.textContent = m.sosAlertsCount;
  if (elGeofence) elGeofence.textContent = m.geofenceBreachesCount;
}

/* ==========================================================================
   ACTIVE INCIDENTS PANEL
   ========================================================================== */
function renderIncidentsList() {
  const container = document.getElementById("incidentsContainer");
  if (!container) return;

  const incidents = SafeTripData.incidents;

  container.innerHTML = incidents.map(inc => {
    const isResolved = inc.status === "RESOLVED";
    const isDispatched = inc.status === "DISPATCHED";

    return `
      <div class="incident-card p-${inc.priorityClass}" data-id="${inc.id}">
        <div class="inc-top-row">
          <span class="inc-id">${inc.id}</span>
          <span class="inc-badge ${inc.priorityClass}">${inc.priority}</span>
        </div>

        <div class="inc-tourist-row">
          <span>${inc.touristName} (${inc.touristId})</span>
          <span style="font-size: 12px; color: #94a3b8; font-weight: normal;">${inc.timeAgo}</span>
        </div>

        <div class="inc-loc">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>${inc.locationName}</span>
        </div>

        <div class="inc-trigger">
          ⚠️ <b>Trigger:</b> ${inc.trigger} (AI Risk: <b>${inc.aiRiskScore}/100</b>)
        </div>

        ${isDispatched ? `
          <div style="font-size: 11.5px; color: #38bdf8; margin-bottom: 8px;">
            ● Dispatched: <b>${inc.dispatchedUnit}</b>
          </div>
        ` : ''}

        ${isResolved ? `
          <div style="font-size: 11.5px; color: #34d399; margin-bottom: 8px;">
            ✓ Incident Resolved & Logged
          </div>
        ` : ''}

        <div class="inc-actions-row">
          <button class="btn-inc-action" onclick="focusIncidentOnMap('${inc.id}')">
            View Location
          </button>
          <button class="btn-inc-action" onclick="contactIncidentTourist('${inc.id}')">
            Contact Tourist
          </button>
          ${!isDispatched && !isResolved ? `
            <button class="btn-inc-action" onclick="dispatchUnit('${inc.id}')">
              Dispatch Response
            </button>
          ` : ''}
          ${!isResolved ? `
            <button class="btn-inc-action resolve" onclick="resolveIncidentAction('${inc.id}')">
              Mark Resolved
            </button>
          ` : ''}
          <button class="btn-inc-action" onclick="selectIncidentForExplain('${inc.id}')" title="Explain AI Risk decomposition">
            AI Explain
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function focusIncidentOnMap(incId) {
  const inc = SafeTripData.incidents.find(i => i.id === incId);
  if (inc && authorityMap) {
    authorityMap.setView(inc.coords, 15, { animate: true });
    L.popup()
      .setLatLng(inc.coords)
      .setContent(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 4px;">
          <b style="color: #ef4444; font-size: 12px;">${inc.priority}</b>
          <div style="font-size: 13px; font-weight: bold; margin-top: 2px;">${inc.touristName} (${inc.touristId})</div>
          <div style="font-size: 12px; color: #475569; margin: 4px 0;">${inc.locationName}</div>
          <div style="font-size: 11.5px; color: #64748b;">AI Risk Score: <b>${inc.aiRiskScore}/100</b></div>
        </div>
      `)
      .openOn(authorityMap);
  }
}

function contactIncidentTourist(incId) {
  const inc = SafeTripData.incidents.find(i => i.id === incId);
  if (!inc) return;

  const modal = document.getElementById("cmdContactModal");
  const details = document.getElementById("cmdContactDetails");
  if (modal && details) {
    details.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #94a3b8;">Subject Tourist:</span>
        <span style="font-weight: 700; color: #ffffff;">${inc.touristName} (${inc.touristId})</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #94a3b8;">Target Contact:</span>
        <span style="font-weight: 600; color: #38bdf8;">${inc.contact || '+91 98765 43210'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #94a3b8;">Current Location:</span>
        <span style="font-weight: 600; color: #ffffff;">${inc.locationName}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">Telemetry Status:</span>
        <span style="font-weight: 700; color: #34d399;">● Live Signal Active</span>
      </div>
    `;
    modal.style.display = "flex";
  }
}

function closeCmdContactModal() {
  const modal = document.getElementById("cmdContactModal");
  if (modal) modal.style.display = "none";
}

function dispatchUnit(incId) {
  SafeTripStore.dispatchIncident(incId, "Rajasthan Police Beat 4 Quick Response Vehicle");
  renderIncidentsList();
}

function resolveIncidentAction(incId) {
  SafeTripStore.resolveIncident(incId);
  renderIncidentsList();
}

/* ==========================================================================
   AI RISK ENGINE VISUALIZATION (EXPLAINABILITY)
   ========================================================================== */
function selectIncidentForExplain(incId) {
  const inc = SafeTripData.incidents.find(i => i.id === incId);
  if (inc) {
    initRiskExplainability(inc);
  }
}

function initRiskExplainability(incident) {
  if (!incident) return;

  const nameEl = document.getElementById("explainTouristName");
  const idEl = document.getElementById("explainTouristId");
  const totalEl = document.getElementById("explainTotalRisk");
  const listEl = document.getElementById("explainFactorsList");

  if (nameEl) nameEl.textContent = incident.touristName;
  if (idEl) idEl.textContent = incident.touristId;
  if (totalEl) totalEl.textContent = `${incident.aiRiskScore} / 100`;

  if (listEl && incident.breakdown) {
    listEl.innerHTML = incident.breakdown.map(item => {
      const numVal = parseInt(item.score.replace("+", ""), 10) || 20;
      return `
        <div>
          <div class="factor-row">
            <span>${item.label}</span>
            <span style="font-weight: 700; color: #f87171;">${item.score}</span>
          </div>
          <div class="factor-bar-wrap">
            <div class="factor-bar-fill" style="width: ${Math.min(numVal * 1.6, 100)}%;"></div>
          </div>
        </div>
      `;
    }).join("");
  }
}

/* ==========================================================================
   GEOFENCE MANAGEMENT
   ========================================================================== */
function renderGeofenceList() {
  const listEl = document.getElementById("geofenceItemsList");
  if (!listEl) return;

  listEl.innerHTML = SafeTripData.geofences.map(zone => `
    <div class="geofence-item" data-id="${zone.id}">
      <div class="geofence-info">
        <span class="geofence-dot ${zone.type}"></span>
        <div>
          <div class="geofence-name">${zone.name}</div>
          <div class="geofence-sub">${zone.type.toUpperCase()} • Safety Index: ${zone.riskScore}/100</div>
        </div>
      </div>
      <button class="btn-del-zone" onclick="deleteZoneDemo('${zone.id}')" title="Delete Zone">
        ✕
      </button>
    </div>
  `).join("");
}

function addGeofenceDemo() {
  const modal = document.getElementById("cmdAddGeofenceModal");
  if (modal) modal.style.display = "flex";
}

function closeAddGeofenceModal() {
  const modal = document.getElementById("cmdAddGeofenceModal");
  if (modal) modal.style.display = "none";
}

function submitNewGeofence(e) {
  e.preventDefault();
  const name = document.getElementById("newZoneName").value.trim();
  const type = document.getElementById("newZoneType").value;
  const score = parseInt(document.getElementById("newZoneScore").value, 10) || 65;

  const colors = {
    safe: "#10b981",
    caution: "#f59e0b",
    restricted: "#ef4444"
  };

  const newZone = {
    id: `custom-zone-${Date.now()}`,
    name: name,
    type: type,
    color: colors[type] || "#f59e0b",
    fillColor: colors[type] || "#f59e0b",
    riskScore: score,
    description: `Monitored ${type} zone configured via Command Center.`,
    coordinates: [
      [26.9600, 75.8400],
      [26.9630, 75.8450],
      [26.9580, 75.8480],
      [26.9550, 75.8420]
    ]
  };

  SafeTripStore.addGeofence(newZone);
  renderGeofenceList();

  if (authorityMap) {
    const polygon = L.polygon(newZone.coordinates, {
      color: newZone.color,
      fillColor: newZone.fillColor,
      fillOpacity: 0.2,
      weight: 2
    }).addTo(authorityMap);
    polygon.bindPopup(`<b>${newZone.name}</b><br>${newZone.description}`);
    authorityGeofenceLayers[newZone.id] = polygon;
    authorityMap.setView([26.9600, 75.8430], 14);
  }

  closeAddGeofenceModal();
}

function deleteZoneDemo(zoneId) {
  if (confirm("Are you sure you want to deactivate this geofence boundary?")) {
    SafeTripStore.deleteGeofence(zoneId);
    if (authorityGeofenceLayers[zoneId] && authorityMap) {
      authorityMap.removeLayer(authorityGeofenceLayers[zoneId]);
      delete authorityGeofenceLayers[zoneId];
    }
    renderGeofenceList();
  }
}

/* ==========================================================================
   DIGITAL ID VERIFICATION CONSOLE
   ========================================================================== */
function initIdVerification() {
  const btn = document.getElementById("btnVerifyTouristId");
  const input = document.getElementById("verifyIdInput");

  if (btn && input) {
    btn.addEventListener("click", () => {
      const idVal = input.value.trim().toUpperCase();
      performIdVerificationQuery(idVal);
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        btn.click();
      }
    });
  }
}

function performIdVerificationQuery(touristId) {
  const resBox = document.getElementById("verificationResultBox");
  if (!resBox) return;

  resBox.style.display = "flex";
  resBox.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #38bdf8;">
      <span>⏳</span> Querying Polygon PoS zero-knowledge identity state...
    </div>
  `;

  setTimeout(() => {
    const isMatched = touristId === "ST-8F42A1" || touristId === SafeTripData.tourist.id;

    if (isMatched) {
      const t = SafeTripData.tourist;
      resBox.innerHTML = `
        <div class="verify-status-head">
          <span>✓</span> Verified on Blockchain Ledger (DEMO)
        </div>
        <div class="verify-row">
          <span class="label">Tourist ID:</span>
          <span class="val">${t.id}</span>
        </div>
        <div class="verify-row">
          <span class="label">Name:</span>
          <span class="val">${t.name} (${t.nationality})</span>
        </div>
        <div class="verify-row">
          <span class="label">Identity Status:</span>
          <span class="val" style="color: #34d399;">Active • ZK-Proof Verified</span>
        </div>
        <div class="verify-row">
          <span class="label">Emergency Contact:</span>
          <span class="val">${t.emergencyContact.name} (${t.emergencyContact.phone})</span>
        </div>
        <div class="verify-row">
          <span class="label">Blockchain Hash:</span>
          <span class="val" style="font-family: monospace; font-size: 11px; color: #38bdf8;">${t.blockchainHash.slice(0, 16)}...</span>
        </div>
      `;
    } else {
      resBox.innerHTML = `
        <div class="verify-status-head" style="color: #f87171;">
          <span>✕</span> Token Not Found or Invalid
        </div>
        <div style="font-size: 12px; color: #cbd5e1;">
          No active verified identity token exists for "${touristId}". Please ensure the tourist is enrolled through the official SAFETRIP portal.
        </div>
      `;
    }
  }, 450);
}

// Window Attachments
window.filterMapTourists = filterMapTourists;
window.focusIncidentOnMap = focusIncidentOnMap;
window.contactIncidentTourist = contactIncidentTourist;
window.closeCmdContactModal = closeCmdContactModal;
window.dispatchUnit = dispatchUnit;
window.resolveIncidentAction = resolveIncidentAction;
window.selectIncidentForExplain = selectIncidentForExplain;
window.addGeofenceDemo = addGeofenceDemo;
window.closeAddGeofenceModal = closeAddGeofenceModal;
window.submitNewGeofence = submitNewGeofence;
window.deleteZoneDemo = deleteZoneDemo;
