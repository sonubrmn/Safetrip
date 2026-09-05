# SAFETRIP — Smart Tourist Safety Monitoring & Incident Response System

> **"Travel freely. Stay protected."**  
> A prototype built for the **Smart India Hackathon** problem statement:  
> *"Smart Tourist Safety Monitoring & Incident Response System using AI, Geo-Fencing and Blockchain-Based Digital Identity."*

---

## 🌟 Overview

**SAFETRIP** combines the visual refinement, generous whitespace, and simplicity of modern travel products with a safety-first intelligence architecture (**DETECT → WARN → VERIFY → RESPOND → RESOLVE**).

The project features two seamlessly connected, synchronized experiences:
1. **Tourist Safety Companion Portal (`index.html`)**: Real-time safety scores, interactive Leaflet geo-fencing, contextual Safety AI Assistant, proactive 30-minute safety check-ins, safest route comparisons, blockchain-verified digital identity pass, and emergency SOS incident trigger.
2. **Authority & Police Command Center (`authority.html`)**: High-density operational dashboard featuring live telemetry maps, real-time incident triage queue, AI risk explainability engine, geo-fence management, and digital ID verification.

---

## 🚀 Key Features

### 1. Tourist Companion (`index.html`)
- **Real-Time Safety Status**: Dynamic safety score meter (84/100), risk status indicator (LOW RISK / CAUTION / HIGH RISK / EMERGENCY), and verified connection indicators.
- **Interactive Leaflet Safety Map**:
  - OpenStreetMap cartography centered on Jaipur heritage precinct.
  - Safe Zones (Green), Caution Zones (Amber), and Restricted/Hazard Zones (Red).
  - Ray-casting point-in-polygon algorithm for instant boundary detection.
  - One-click simulations: *"Simulate Entering Restricted Zone"* and *"Return to Safe Corridor"*.
- **Safest Route ("Choose the safer way")**: Side-by-side route comparison (Fastest 18 min vs. Safest 22 min with 96% high-lux illumination and active police patrols).
- **Safety AI Assistant**: Slide-up contextual assistant with safety advice, nearest trauma centers (SMS Hospital), and emergency helplines (112, 1363).
- **Digital Travel ID**: Decentralized traveler pass for **Sid** (`ST-8F42A1`) with verifiable QR code and Polygon PoS ZK-proof status.
- **Proactive Safety Check-In**: 30-minute countdown cadence with automated escalation alerts on missed check-ins.
- **Safe Demo Emergency SOS**: Generates simulated priority incidents in the Command Center without external calls or SMS.

### 2. Authority Command Center (`authority.html`)
- **System KPIs**: Active Tourists (`12,483`), High Risk (`27`), Active SOS Alerts (`4`), Geo-Fence Alerts (`19`).
- **Live Operations Map**: Risk-colored tourist pins with filter tabs (*All*, *Low Risk*, *Medium*, *High Risk*, *SOS*).
- **Incident Triage Queue**: Real-time incident cards with action triggers (*View Location*, *Contact Tourist*, *Dispatch Response*, *Mark Resolved*).
- **AI Risk Explainability Engine**: Transparent itemized breakdown of why a tourist is flagged (*SOS Activation +50, Restricted Zone +30, Deviation +11*).
- **Geo-Fence Management**: In-app interface to deploy, inspect, and delete monitored spatial zones.
- **Digital ID Verification Console**: Cryptographic token verification query for on-chain identity records.

---

## 📁 Project Structure

```
/
├── index.html              # Tourist Companion Homepage
├── authority.html          # Authority & Police Command Center Dashboard
├── README.md               # Project documentation
├── .gitignore              # Git ignore configuration
├── css/
│   ├── style.css           # Design tokens, tourist UI components, modals
│   └── authority.css       # Command Center dark operations theme
├── js/
│   ├── data.js             # State store, Jaipur geofences, POIs, cross-tab sync
│   ├── map.js              # Leaflet mapping, geofence checks, safe routes
│   ├── app.js              # Tourist UI binding, AI assistant, check-in, SOS
│   └── authority.js        # Authority dashboard controller, triage, metrics
├── sih.css                 # Forwarding stylesheet
└── sih.js                  # Modular script pointer
```

---

## 💻 How to Run Locally

No build tools or heavy dependencies required. Run using Python's built-in HTTP server:

```bash
# Clone the repository
git clone https://github.com/sonubrmn/Safetrip
cd SIH

# Start a local web server (Python 3)
python3 -m http.server 3000
```

Open your browser:
- **Tourist Companion**: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Authority Command Center**: [http://localhost:3000/authority.html](http://localhost:3000/authority.html)

> 💡 **Hackathon Tip**: Open both pages in side-by-side browser windows to observe live cross-tab state synchronization when triggering SOS or entering a restricted zone!

---

## 🛠️ Technology Stack

- **Core**: Vanilla HTML5, Vanilla CSS3 (Custom Design System), Modular ES6 JavaScript
- **Cartography**: [Leaflet.js](https://leafletjs.com/) with OpenStreetMap tiles
- **Typography**: [Google Fonts — Inter](https://fonts.google.com/specimen/Inter)
- **State Synchronization**: Event-driven `localStorage` synchronization (ready for Python FastAPI backend integration)
