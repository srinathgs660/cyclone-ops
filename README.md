# 🌪️ Cyclone Disaster Operations Command Center (EOC)
### Real-Time Cyclone Tracking, Impact Prediction, Evacuation Planning & Relief Coordination Platform

> A production-grade **Disaster Operations Command System** built on the **MERN Stack** (MongoDB Atlas, Express.js, React.js + Tailwind CSS, Node.js + Socket.IO) designed for disaster management authorities (NDMA, NDRF, SDMAs, IMD) to monitor cyclones, assess multi-criteria risks, coordinate evacuations, triage life-threatening incidents, optimize relief logistics, and protect affected citizens.

---

## 📌 Quick Access & Direct URLs

| Platform Interface | Direct URL | Description & Access Mode |
| :--- | :--- | :--- |
| **Public Landing & Overview Page** | **[http://localhost:5173/](http://localhost:5173/)** | Animated overview, hero metrics, capability showcase & role sandbox |
| **Tactical Command Center** | **[http://localhost:5173/dashboard](http://localhost:5173/dashboard)** | Real-time operations cockpit, interactive GIS map & telemetry |
| **Mobile Citizen SOS Portal** | **[http://localhost:5173/dashboard/citizen](http://localhost:5173/dashboard/citizen)** | 1-touch SOS beacon, nearest shelter GPS finder & helplines |
| **Sign In & Role Evaluation** | **[http://localhost:5173/login](http://localhost:5173/login)** | 1-click role switcher with instant pre-configured credentials |
| **Backend REST API** | **[http://localhost:5000](http://localhost:5000)** | Express.js + Socket.IO real-time server |
| **System Health Endpoint** | **[http://localhost:5000/api/health](http://localhost:5000/api/health)** | `{"status": "OPERATIONAL", "liveDataConnected": true}` |

---

## ✨ Latest Updates & Newly Added Features (Changelog)

### 1. 🌍 Real-Time Worldwide Cyclone Tracking (NASA EONET & GDACS)
* **Authoritative Live Feeds:** Direct, real-time ingestion from **NASA EONET** (`severeStorms`), **GDACS (UN-OCHA / European Commission)**, **JTWC**, and **NOAA NHC** without requiring external private API keys.
* **Global Ocean Basin Coverage:** Full monitoring across all major meteorological basins:
  - 🇮🇳 **North Indian Ocean** (Bay of Bengal & Arabian Sea)
  - 🇯🇵 **Western North Pacific** (Typhoons - Asia Pacific)
  - 🇲🇽 / 🇺🇸 **Eastern Pacific & North Atlantic** (Hurricanes)
  - 🇲🇬 / 🇦🇺 **South-West Indian Ocean & South Pacific**
* **Dynamic Recenter & Worldwide View:** The GIS map seamlessly flies to any coordinate on Earth with a dedicated **"🌍 World View"** toggle.
* **On-Demand & Background Polling:** Automated 15-minute background sync plus a one-touch **"⚡ Refresh Live Satellite Feeds"** button with instant Socket.IO broadcasts across all connected command terminals.
* **72-Hour Numerical Predictions & Uncertainty Cones:** Expanding corridors (±35km to ±275km) based on atmospheric steering currents and Coriolis parameter models.

### 2. 🚀 Root Landing Page (`http://localhost:5173/`)
* Visiting the root URL (`/`) now directly displays the **Platform Overview Landing Page** instead of bouncing straight to the sign-in form.
* Features an animated hero banner, live cyclone stats, interactive capabilities grid, and an instant 1-click evaluation sandbox.

### 2. 🎨 Ergonomic Dual Theme (Light & Dark Mode)
* **One-Click Theme Switcher:** Integrated directly in the top navigation bar (Sun ☀️ / Moon 🌙 toggle).
* **Calibrated Soft-Light Palette:** Eliminated harsh pure-white glare. Optimized card backgrounds (`#FFFFFF`), borders (`#CBD5E1`), and body canvas (`#E2E8F0`) with high-contrast, perfectly legible dark text.
* **Smart Map Inversion:** Map tiles automatically adapt in both dark tactical and clean natural daytime styles with zero watermarks.

### 3. 🎛️ Redesigned Tactical Role Switcher
* Redesigned the sidebar footer into a sleek **2x3 Segmented Card Grid** with custom role icons:
  - `👑 Admin`, `🎖️ Officer`, `🚑 NDRF`, `📦 Logistics`, `🤝 Volunteer`, `👤 Citizen`.
* Features active role glowing borders, crisp contrast, and instant 1-click identity switching.

### 4. 🛡️ Role-Based Access Control (RBAC) & Citizen Protections
* **Incident Triage (`/incidents`):**
  - Only authorized operational staff (`admin`, `officer`, `responder`, `coordinator`) have access to **"Assign Team"**, **"Set In-Progress"**, and **"Mark Resolved"**.
  - Citizens and volunteers have **Read-Only** visibility with clean status indicator tags.
* **Response Teams (`/teams`):**
  - The **"Dispatch Unit"** / **"Mark Available"** action is restricted to operational commanders.
  - Citizens see a protective **"Deployment Control: Authorized Ops Only"** badge with full team gear and readiness visibility.

---

## 🔑 Demo User Accounts & Roles

You can sign in instantly using the **One-Click Switcher** on the login page, landing page, or within the sidebar:

| Role | Demo Email | Password | Operational Scope |
| :--- | :--- | :--- | :--- |
| **Emergency Commander (Admin)** | `admin@cycloneops.gov` | `password123` | Full governance, agency authorization, platform configs & audit logs |
| **Operations Officer** | `officer@cycloneops.gov` | `password123` | Tactical GIS Map, evacuation planning, risk matrix & storm cones |
| **Field Rescue Responder** | `responder@cycloneops.gov` | `password123` | Incident triage, team dispatch & field rescue status |
| **Relief Logistics Coordinator** | `coordinator@cycloneops.gov` | `password123` | Shelter capacity grid, warehouse inventories & supply convoys |
| **Community Volunteer** | `volunteer@cycloneops.gov` | `password123` | Shelter check-ins, assistance request triage (Read-Only triage) |
| **Vulnerable Citizen** | `citizen@cycloneops.gov` | `password123` | 1-touch SOS beacon, nearby shelter locator & local risk radar |

---

## 🌟 Key Architecture & Capabilities

### 1. Leaflet GIS Tactical Command Map
* **Clean Tiles (Zero Watermarks):** Integrated OpenStreetMap tiles with high-tech tactical dark CSS inversion filter and crisp light mode compatibility.
* **Animated Cyclone Core:** Pulsing Doppler radar sweep eye marker 🌀, rotating outer wind bands, and category styling.
* **Intensity Wind Radii:** Interactive circles for Gale ($160\text{ km}$), Storm ($75\text{ km}$), and Hurricane-force winds ($35\text{ km}$).
* **Predictive Forecast Cone of Uncertainty:** Trajectory predictions at $24\text{h}$, $48\text{h}$, and $72\text{h}$ intervals.
* **Geospatial Overlays:** High-risk polygon zones, emergency shelters with live occupancy status, triage incidents, and active evacuation convoy routes.

### 2. Algorithmic Intelligence Engines (`server/services/`)
* **Multi-Criteria Risk Scoring (`riskService.js`):**
  $$\text{Risk Score} = 0.35 \times C_{\text{proximity}} + 0.25 \times P_{\text{density}} + 0.20 \times I_{\text{exposure}} + 0.20 \times T_{\text{surge}}$$
  Dynamically recalculates risk zones as the cyclone advances.
* **Dynamic Evacuation Priority Matrix (`evacuationService.js`):**
  Ranks vulnerable zones by dynamic priority score considering inundation probability, special-needs demographics, and road bottleneck constraints.
* **Automated Shelter Capacity Routing (`shelterService.js`):**
  Real-time occupancy tracking with automatic divert-and-reroute when a coastal shelter reaches $100\%$ capacity.
* **Threat-to-Life Incident Triage & Auto-Dispatch (`incidentService.js`):**
  Dispatches closest available specialized rescue squad (NDRF, Coast Guard, SDRF) using geospatial coordinates.
* **Relief Demand Optimizer (`reliefOptimizerService.js`):**
  Calculates burn rates for drinking water ($3\text{L/person/day}$), food rations, and medical kits, triggering automated logistics resupply convoys.

### 3. Mobile-First Citizen Emergency Portal (`/dashboard/citizen`)
* **🚨 Emergency SOS Trigger:** 1-tap emergency request broadcasting GPS coordinates to the EOC.
* **📍 Find Nearest Shelter:** Instantly resolves user coordinates to the closest open facility with capacity and distance.
* **🗺️ Local Risk Radar:** Real-time distance to eye of cyclone with immediate action advice (Shelter-in-Place vs. Evacuate).
* **☎️ Emergency Helplines:** Quick-dial buttons for NDRF (`1078`), Coast Guard (`1554`), and State EOC (`1070`).

### 4. 5-Scenario Interactive Simulation Controller
Directly accessible from the top toolbar in the Command Center:
1. **Scenario 1: Cyclone Approaching & Intensification:** Wind speed $+25\text{ km/h}$, eye advances $35\text{ km}$ coastward, emergency warning broadcast.
2. **Scenario 2: Evacuation Surge:** $+28,000$ citizens evacuated, shelter occupancy spikes to near capacity.
3. **Scenario 3: Shelter Overcapacity:** Coastal shelter reaches $100\%$, system reroutes convoys to backup inland facilities.
4. **Scenario 4: Citizen Emergency SOS:** $14$ civilians trapped in tidal surge; system creates a critical incident and dispatches the nearest rescue boat squad.
5. **Scenario 5: Relief Shortage & Supply Convoy:** Bottled water reserves fall below critical levels; automated emergency convoy departs Central Warehouse.

---

## 🏗️ Project Structure

```text
cyclone-disaster-management/
├── server/
│   ├── config/
│   │   ├── db.js                 # Mongoose connection with TLS & fail-fast retry
│   │   ├── mockData.js           # High-availability in-memory disaster fallback
│   │   └── constants.js          # Roles, categories, priorities, statuses
│   ├── models/                   # 14 Mongoose Data Schemas
│   ├── routes/                   # 13 REST API Routers
│   ├── services/                 # Algorithmic & Simulation Engines
│   ├── sockets/
│   │   └── socketManager.js      # Socket.IO bi-directional gateway
│   ├── scripts/
│   │   └── seed.js               # Production-grade seed data for Atlas
│   └── server.js                 # Express + HTTP + Socket.IO server entry
│
├── client/
│   ├── src/
│   │   ├── components/           # KpiCard, SimulationBar, CycloneInfoPanel, etc.
│   │   ├── context/              # Auth, Socket, Simulation, and Theme Contexts
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # EOC Sidebar, Header, Theme Toggle, Role Switcher
│   │   ├── maps/
│   │   │   └── CommandMap.jsx    # Leaflet Tactical Command Map
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Root Animated Overview Page (/)
│   │   │   ├── CommandCenter.jsx      # Main EOC Tactical Cockpit
│   │   │   ├── CycloneTracker.jsx     # Storm track, radii, satellite info
│   │   │   ├── ImpactAssessment.jsx   # Risk zones, population exposure
│   │   │   ├── EvacuationPlanning.jsx # Evacuation routes & bottleneck matrix
│   │   │   ├── SheltersManagement.jsx # Shelter capacity & rerouting
│   │   │   ├── IncidentBoard.jsx      # Threat-to-life incident triage
│   │   │   ├── ResponseTeamsPage.jsx  # Rescue squad tracking & deployment
│   │   │   ├── ReliefCoordination.jsx # Supply chains & convoy dispatch
│   │   │   ├── CitizenPortal.jsx      # Mobile Citizen SOS & Helpline
│   │   │   ├── AlertCenter.jsx        # Broadcast alerts & siren triggers
│   │   │   ├── AnalyticsForecast.jsx  # Performance KPIs & historical charts
│   │   │   ├── ReportsPage.jsx        # Situation reports & PDF export
│   │   │   ├── AdminPage.jsx          # Agency governance & audit logs
│   │   │   └── LoginPage.jsx          # 1-click role authentication
│   │   ├── App.jsx               # Routes & Auth Guards
│   │   └── index.css             # Tailwind styling, dark/light themes & radar animations
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🚀 Setup & Execution Guide

### 1. Backend Setup
```bash
cd cyclone-disaster-management/server
npm install
node server.js
```
*Listens on port `5000`.*

### 2. Frontend Setup
```bash
cd cyclone-disaster-management/client
npm install
npm run dev -- --host
```
*Accessible on `http://localhost:5173/`.*
