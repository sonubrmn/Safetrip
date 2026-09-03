/**
 * SAFETRIP - Leaflet Map Implementation
 * Interactive spatial intelligence, geofencing, POIs, and route comparison.
 */

let mapInstance = null;
let touristMarker = null;
let zoneLayers = {};
let poiLayers = [];
let routeLayers = {
  safest: null,
  fastest: null
};

// Custom SVG Markers
function createTouristMarkerIcon(riskLevel = "safe") {
  const color = riskLevel === "emergency" || riskLevel === "restricted" 
    ? "#ef4444" 
    : (riskLevel === "caution" ? "#f59e0b" : "#0284c7");
    
  return L.divIcon({
    className: "tourist-leaflet-marker",
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 18px; height: 18px; border-radius: 50%; background: ${color}; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
      <style>
        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

function createPoiIcon(type = "hospital") {
  const isHospital = type === "hospital";
  const bg = isHospital ? "#3b82f6" : "#0f172a";
  const icon = isHospital ? "+" : "★";
  
  return L.divIcon({
    className: "poi-leaflet-marker",
    html: `
      <div style="width: 26px; height: 26px; border-radius: 50%; background: ${bg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
        ${icon}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

// Point in polygon detection (Ray-Casting Algorithm)
function isPointInPolygon(point, polygon) {
  const x = point[0];
  const y = point[1];
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function initSafetyMap() {
  const mapElement = document.getElementById("safetyMap");
  if (!mapElement) return;

  const centerCoords = SafeTripData.center;
  mapInstance = L.map("safetyMap", {
    center: centerCoords,
    zoom: 13,
    zoomControl: true,
    attributionControl: false
  });

  // OpenStreetMap Tile Layer with clean visual tuning
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);

  // Add Geofences
  renderGeofences();

  // Add Emergency Services POIs
  renderEmergencyServices();

  // Add Tourist Position Marker
  const tourist = SafeTripData.tourist;
  touristMarker = L.marker(tourist.currentLocation.coords, {
    icon: createTouristMarkerIcon("safe"),
    draggable: true
  }).addTo(mapInstance);

  touristMarker.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; padding: 4px;">
      <b style="font-size: 13px; color: #0f172a;">${tourist.name}</b>
      <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">ID: ${tourist.id}</div>
      <div style="font-size: 11.5px; font-weight: 600; color: #10b981; margin-top: 4px;">● Status: ${tourist.riskLevel}</div>
    </div>
  `);

  // Dragging event triggers spatial analysis
  touristMarker.on("dragend", function (e) {
    const newPos = e.target.getLatLng();
    checkTouristGeofence([newPos.lat, newPos.lng]);
  });

  // Setup Routes
  setupRoutePolylines();

  // Listen to Global Store Events
  SafeTripEvents.on("tourist:location_changed", (data) => {
    if (touristMarker) {
      touristMarker.setLatLng(data.coords);
      const isDangerous = data.riskLevel === "HIGH RISK" || data.riskLevel === "EMERGENCY";
      const isCaution = data.riskLevel === "CAUTION";
      touristMarker.setIcon(createTouristMarkerIcon(isDangerous ? "restricted" : (isCaution ? "caution" : "safe")));
      mapInstance.panTo(data.coords, { animate: true, duration: 1 });
    }
  });

  SafeTripEvents.on("sos:triggered", (incident) => {
    if (touristMarker) {
      touristMarker.setIcon(createTouristMarkerIcon("emergency"));
      touristMarker.openPopup();
    }
  });
}

function renderGeofences() {
  SafeTripData.geofences.forEach(zone => {
    const polygon = L.polygon(zone.coordinates, {
      color: zone.color,
      fillColor: zone.fillColor,
      fillOpacity: zone.type === "restricted" ? 0.35 : 0.18,
      weight: 2,
      dashArray: zone.type === "restricted" ? "5, 5" : null
    }).addTo(mapInstance);

    polygon.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; max-width: 220px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${zone.color};">
          ${zone.type.toUpperCase()} ZONE
        </div>
        <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-top: 2px;">
          ${zone.name}
        </div>
        <div style="font-size: 12px; color: #475569; margin: 6px 0;">
          ${zone.description}
        </div>
        <div style="font-size: 11.5px; font-weight: 600; color: #0f172a;">
          Safety Index: <b>${zone.riskScore} / 100</b>
        </div>
      </div>
    `);

    zoneLayers[zone.id] = polygon;
  });
}

function renderEmergencyServices() {
  SafeTripData.emergencyServices.forEach(poi => {
    const marker = L.marker(poi.coords, {
      icon: createPoiIcon(poi.type)
    }).addTo(mapInstance);

    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; max-width: 220px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #3b82f6;">
          ${poi.category}
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">
          ${poi.name}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
          Distance: <b>${poi.distance}</b> • ${poi.openHours}
        </div>
        <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 4px;">
          Emergency Line: <a href="tel:${poi.phone}" style="color: #0284c7;">${poi.phone}</a>
        </div>
      </div>
    `);

    poiLayers.push(marker);
  });
}

function setupRoutePolylines() {
  const routes = SafeTripData.routes;

  routeLayers.fastest = L.polyline(routes.fastest.coordinates, {
    color: routes.fastest.color,
    weight: 4,
    opacity: 0.7,
    dashArray: routes.fastest.dashArray
  });

  routeLayers.safest = L.polyline(routes.safest.coordinates, {
    color: routes.safest.color,
    weight: 5,
    opacity: 0.95
  });

  // Safest route active by default
  routeLayers.safest.addTo(mapInstance);
}

function toggleActiveRoute(routeType) {
  if (!mapInstance) return;

  if (routeType === "safest") {
    if (mapInstance.hasLayer(routeLayers.fastest)) {
      mapInstance.removeLayer(routeLayers.fastest);
    }
    routeLayers.safest.addTo(mapInstance);
    mapInstance.fitBounds(routeLayers.safest.getBounds(), { padding: [40, 40] });
  } else {
    if (mapInstance.hasLayer(routeLayers.safest)) {
      mapInstance.removeLayer(routeLayers.safest);
    }
    routeLayers.fastest.addTo(mapInstance);
    mapInstance.fitBounds(routeLayers.fastest.getBounds(), { padding: [40, 40] });
  }
}

// Spatial Geofence Verification
function checkTouristGeofence(coords) {
  let detectedZone = null;

  for (const zone of SafeTripData.geofences) {
    if (isPointInPolygon(coords, zone.coordinates)) {
      detectedZone = zone;
      break;
    }
  }

  if (detectedZone) {
    if (detectedZone.type === "restricted") {
      SafeTripStore.updateTouristLocation(
        coords,
        detectedZone.name,
        "HIGH RISK",
        24,
        `⚠️ You've entered a restricted area: ${detectedZone.name}`
      );
      showMapAlert("⚠️ You've entered a restricted area.", detectedZone.description, true);
    } else if (detectedZone.type === "caution") {
      SafeTripStore.updateTouristLocation(
        coords,
        detectedZone.name,
        "CAUTION",
        62,
        `Caution: Entered low-visibility or unpatrolled area: ${detectedZone.name}`
      );
      showMapAlert("Caution: Low-visibility zone.", detectedZone.description, false);
    } else {
      SafeTripStore.updateTouristLocation(
        coords,
        detectedZone.name,
        "LOW RISK",
        90
      );
      hideMapAlert();
    }
  } else {
    SafeTripStore.updateTouristLocation(
      coords,
      "Jaipur Urban District",
      "LOW RISK",
      84
    );
    hideMapAlert();
  }
}

// Interactive Simulation Triggers
function simulateRestrictedWalk() {
  // Coords inside Nahargarh Cliff Edge
  SafeTripStore.triggerRestrictedBreach();
  showMapAlert("⚠️ You've entered a restricted area.", "Steep drop-off with structural hazard. Risk elevated to HIGH.", true);
}

function simulateSafeWalk() {
  // Coords inside City Palace Heritage Corridor
  SafeTripStore.returnToSafeCorridor();
  hideMapAlert();
}

function showMapAlert(title, message, showReroute = true) {
  let banner = document.getElementById("mapAlertBanner");
  if (!banner) return;

  const titleEl = banner.querySelector(".alert-title");
  const descEl = banner.querySelector(".alert-desc");
  const rerouteBtn = banner.querySelector(".btn-safer-route");

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = message;
  if (rerouteBtn) rerouteBtn.style.display = showReroute ? "inline-block" : "none";

  banner.style.display = "flex";
}

function hideMapAlert() {
  const banner = document.getElementById("mapAlertBanner");
  if (banner) {
    banner.style.display = "none";
  }
}

// Attach to window
window.initSafetyMap = initSafetyMap;
window.simulateRestrictedWalk = simulateRestrictedWalk;
window.simulateSafeWalk = simulateSafeWalk;
window.toggleActiveRoute = toggleActiveRoute;
window.hideMapAlert = hideMapAlert;
