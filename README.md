# 🌪️ Centralized Cyclone Disaster Operations Command Center (EOC)

### Real-Time Cyclone Telemetry Tracking, Multi-Criteria Risk Assessment, Evacuation Routing, Multi-Agency Strike Triage & Citizen SOS Platform

> A production-grade, full-stack **Disaster Operations Command & Emergency Management System** built on the **MERN Stack** (MongoDB Atlas, Express.js, React.js + Tailwind CSS, Node.js + Socket.IO) designed for emergency management authorities (NDMA, NDRF, SDMAs, District Disaster Management Authorities, and Meteorological Agencies) to monitor cyclonic storms, calculate spatial vulnerability, coordinate evacuations, triage life-threatening incidents, dispatch specialized strike forces, manage relief stockpiles, and empower affected citizens.

---

## 🏗️ System Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER                                     │
│  React 18  •  Tailwind CSS  •  Lucide Icons  •  Leaflet GIS & RainViewer Doppler Radar │
│  PWA Service Worker (Offline Cache)  •  Multilingual Audio Alert Engine (Acoustic Siren)│
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / REST & WebSockets (Socket.IO)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             APPLICATION & INTEGRATION LAYER                            │
│  Node.js & Express.js  •  Socket.IO Gateway  •  JWT Auth Middleware (HMAC-SHA256)      │
│  External Feeds: NOAA NHC  •  NASA EONET  •  UN GDACS  •  Cloudinary Photo Proofs      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Mongoose ODM & Geospatial Queries
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                                   PERSISTENCE LAYER                                    │
│  MongoDB Atlas: 2dsphere GeoJSON Indexes (Shelters, Incidents, Convoys, Zones)         │
│  Bcrypt Salted Credentials  •  Audit Logs  •  Statutory PDF Generation (PDFKit)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Comprehensive Feature Catalog (From First to Last)

### 1. 🌐 Multilingual Regional Localization & Acoustic Warning Siren
* **Multi-Language Selector:** Instantaneous in-browser switching across **English**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **Bengali (বাংলা)** across all public and operational screens.
* **Emergency Acoustic Siren:** Built-in web audio synthesis engine generating real-time disaster warning siren tones directly from the browser to alert coastal residents and control room personnel.

### 2. 🚨 Public Landing Page & Citizen Information Gateway
* **Interactive Mission Portal:** High-impact landing page presenting real-time operational status, active storm advisories, emergency helplines, and quick navigation into stakeholder portals.
* **Emergency Ticker:** Live ticker summarizing real-time storm bulletins and active regional warning signals (Signal No. 1 through 11).

### 3. 🔐 Secure Authentication & Role-Based Access Control (RBAC)
* **Cryptographic Identity Protection:** Passwords secured with salted `bcryptjs` hashing (10 work factor rounds).
* **Stateless Token Governance:** Secure JSON Web Tokens (JWT) signed with HMAC-SHA256 containing user ID, role, and operational jurisdiction.
* **Interactive Role Sandbox:** Demo mode shortcut controls allowing evaluation of all 6 operational role tiers without manual form entry.
* **Guarded Routing:** Client-side `ProtectedRoute` intercepts unauthorized URL navigation and redirects users to their designated operational deck.

### 4. 🎛️ EOC Command Center Overview (`/dashboard`)
* **Real-time KPI Telemetry Cards:** High-level metrics tracking active severe cyclones, critical life-threat incidents, open shelter occupancies, deployed rescue squads, and active evacuations.
* **Active Storm Summary:** Instant overview of nearest approaching storms, Saffir-Simpson intensity categories, sustained wind speeds, central pressure, and estimated time to landfall.
* **Live System Health Indicator:** Real-time Socket.IO connection status displaying gateway connectivity and last synchronized meteorological timestamp.

### 5. 🗺️ Live GIS Doppler Radar & Cyclone Tracking (`/dashboard/cyclones`)
* **Doppler Radar Canvas:** Full-screen Leaflet GIS map with smooth mouse-wheel zooming, eye-position centering, and dual light/dark tactical cartography.
* **Live Global Weather Ingestion:** Direct integration with global meteorological feeds (**NOAA National Hurricane Center**, **NASA EONET**, and **UN GDACS**) without requiring private API keys.
* **72-Hour Numerical Predictions:** Dynamic cone of uncertainty ($\pm 35\text{ km}$ to $\pm 275\text{ km}$) calculated from atmospheric steering currents and Coriolis parameter models.
* **On-Demand Satellite Synchronization:** One-click manual refresh button polling global satellite endpoints with live visual sync progress feedback.

### 6. 📊 Algorithmic Multi-Criteria Risk Scoring (`/dashboard/risk`)
* **Quantitative Vulnerability Index:** Automated multi-criteria threat calculation combining storm surge height, proximity to landfall, population density, and infrastructure exposure:
  $$\text{Risk Score} = 0.35 \times C_{\text{proximity}} + 0.25 \times P_{\text{density}} + 0.20 \times I_{\text{exposure}} + 0.20 \times T_{\text{surge}}$$
* **Coastal Sector Vulnerability Matrix:** Dynamic categorization of coastal districts into **Severe (Red)**, **High (Orange)**, **Moderate (Yellow)**, and **Low (Green)** threat sectors.
* **Population Impact Estimation:** Automated calculation of exposed human populations within forecasted inundation contours.

### 7. 🛣️ Dynamic Evacuation Route Planning (`/dashboard/evacuation`)
* **Corridor Waybills & Geometry:** Interactive Leaflet polylines delineating designated green evacuation corridors from coastal lowlands to elevated inland facilities.
* **Roadblock & Inundation Warnings:** Live incident flags indicating flooded bridges, downed power lines, tree falls, and high-tide road closures.
* **Travel Time & Bottleneck Estimation:** Predictive transit duration metrics considering real-time congestion and storm proximity.

### 8. 🏢 Multi-Agency Cyclone Shelter Network (`/dashboard/shelters`)
* **Live Capacity & Bed Availability:** Real-time occupancy tracking across multi-purpose cyclone shelters, schools, and community centers.
* **Rapid Field Intake Controls:** Instant increment/decrement adjustments (`+50` / `-50`) allowing on-site camp managers to update headcounts in real-time.
* **Relief Supply Reserves:** Monitor on-site stores of potable water, dry rations, medical kits, and backup power generators.
* **One-Click Turn-by-Turn Directions:** Direct deep-links to Google Maps navigation for each shelter with precise GPS coordinates.

### 9. 🆘 Threat-to-Life Incident Triage Desk (`/dashboard/incidents`)
* **Priority-Ranked Emergency Queue:** Prioritized triage system classifying field requests into **P1 Critical (Life Threat)**, **P2 High (Property/Injury)**, and **P3 Moderate (Assistance)**.
* **Lifecycle Workflow:** Transparent status state machine: `REPORTED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`.
* **Strike Team Dispatch:** One-click dispatch modal linking nearby NDRF, SDRF, or Fire Service teams to incoming emergency calls.

### 10. 🚤 Specialized Strike Response Teams (`/dashboard/teams`)
* **Inter-Agency Force Readiness:** Status roster tracking National Disaster Response Force (NDRF), Indian Coast Guard, State Disaster Response Forces (SDRF), and Medical Corps.
* **Equipment & Asset Manifests:** Operational tracking of specialized assets including inflatable motorized rescue boats (IRBs), tree-cutting chainsaws, de-watering pumps, and high-clearance ambulances.
* **Live Responder GPS Locations:** Visual mapping of squad locations, designated team commanders, and communication radio channels.

### 11. 📦 Emergency Relief Logistics & Inventory (`/dashboard/relief`)
* **Warehouse Stockpile Depots:** Monitor state and district emergency relief storehouses.
* **Automated Burn-Rate Forecasting:** Dynamic calculations forecasting daily depletion rates for drinking water ($3\text{ L/person/day}$ standard), food rations, and infant formula.
* **Relief Convoy Dispatch:** Manifest generator and en-route tracker for emergency truck convoys carrying supplies to isolated relief camps.

### 12. 📱 Citizen Emergency SOS Portal (`/dashboard/citizen`)
* **1-Touch Emergency SOS Broadcast:** Single-tap emergency button that queries the browser Geolocation API (`navigator.geolocation`) and pushes a priority distress signal with exact GPS coordinates to the EOC command desk.
* **Nearest Safe Shelter Locator:** Spatial calculation sorting all operational shelters by straight-line geodesic distance from the citizen's current position.
* **Disaster Helplines Directory:** Direct tap-to-call links for Police, Fire, Ambulance, Coast Guard, Childline, and State Disaster Helplines (1070 / 1077).
* **Survival Guidelines:** Offline emergency checklists for pre-cyclone home preparation, emergency go-bag packing, and post-landfall precautions.

### 13. 🤝 Community Volunteer Coordination & Photo Proofs (`/dashboard/volunteer-tasks`)
* **Crowdsourced Tasking:** Task allocation board for registered community volunteers (clearing tree branches, distributing food packets, welfare checks on elderly citizens).
* **Cloudinary Photo Verification:** Volunteers can snap and upload photographic proof directly from mobile cameras upon task completion.
* **In-App Lightbox Viewer:** Control room officers can click to inspect high-resolution photo proofs in a lightbox modal before marking tasks verified.

### 14. 🛰️ High-Frequency Multi-Entity GPS Live Tracking (`/dashboard/live-tracking`)
* **Unified GIS Tactical Stage:** Simultaneous live map plotting active Citizen SOS distress beacons, NDRF response teams, and relief supply convoys.
* **Socket.IO Real-Time Pings:** Low-latency WebSockets telemetry relay (`tracking:live_ping`) streaming coordinate updates without page refreshes.
* **Layer Toggles:** Switch between OpenStreetMap street views and ESRI World Imagery satellite tiles.

### 15. 📢 Common Alerting Protocol (CAP v1.2) Broadcast Desk (`/dashboard/alerts`)
* **Dual-Key Public Warning Desk:** Authorized broadcast panel for issuing urgent disaster warnings.
* **Multi-Channel Distribution:** Simulate and format alerts across SMS, Emergency Siren Arrays, Cell Broadcast, and Local FM Radio channels.
* **Multilingual Message Previews:** Auto-generates warning bulletins in English, Tamil, Telugu, Hindi, and Bengali.

### 16. 📈 Executive Disaster Analytics & Trends (`/dashboard/analytics`)
* **Visual Telemetry Charts:** Interactive charts depicting shelter capacity distribution, incident resolution times, response team deployment percentages, and zone threat levels.
* **Operational Readiness Index:** High-level executive score rating the overall preparedness and supply safety margin across all sectors.

### 17. 📄 Statutory Situation Report (SITREP) & Official PDF Generator (`/dashboard/reports`)
* **Government-Standard Reporting:** Formatted to NDRF / State Disaster Management Authority statutory standards.
* **Server-Side PDF Compilation:** Generates structured vector PDF documents on-demand using `pdfkit` complete with official headers, verification stamps, incident statistics, and digital signature lines.
* **CSV Data Export:** One-click tabular exports of incident logs, shelter registries, and relief manifests for audit compliance.

### 18. 🛡️ Central Administration & User Governance (`/dashboard/admin`)
* **User Identity Directory:** Comprehensive personnel table displaying all registered users, assigned agencies, contact numbers, and operational roles.
* **Role Elevation & Account Controls:** EOC Commanders can promote field volunteers to responders, update agency affiliations, or deactivate compromised credentials.
* **Strike Team Assembly:** Direct creation and roster assignment of new emergency response teams.

### 19. 📲 Progressive Web App (PWA) Offline Architecture
* **Service Worker (`sw.js`):** Production service worker caching static assets, stylesheets, scripts, and fonts for resilient offline execution during network brownouts.
* **Web App Manifest:** Configured `manifest.json` enabling the platform to be installed as a standalone application on Android, iOS, Windows, and macOS devices.

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

The system provides 6 distinct operational roles with route-level security:

| Module / Route | Chief Commander (Admin) | Operations Lead (Officer) | NDRF Responder (Responder) | Logistics Coordinator | Community Volunteer | Public Citizen |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Command Center Overview** (`/dashboard`) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **GIS Cyclone Radar** (`/dashboard/cyclones`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Risk Scoring** (`/dashboard/risk`) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Evacuation Routes** (`/dashboard/evacuation`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Shelters Network** (`/dashboard/shelters`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Incident Triage** (`/dashboard/incidents`) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Response Teams** (`/dashboard/teams`) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Relief & Inventory** (`/dashboard/relief`) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Citizen SOS Portal** (`/dashboard/citizen`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Volunteer Tasks & Proofs** (`/dashboard/volunteer-tasks`) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Live GPS Tracking** (`/dashboard/live-tracking`) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Alerts Broadcast** (`/dashboard/alerts`) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Executive Analytics** (`/dashboard/analytics`) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **SITREP & PDF Reports** (`/dashboard/reports`) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **System Administration** (`/dashboard/admin`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Local instance or MongoDB Atlas cluster)
* **npm** (v9.0.0 or higher)

### 2. Configure Environment Variables
Create a file named `.env` in the `server/` directory (refer to `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/cyclone_command_eoc?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Media Storage (Optional, for volunteer photo proofs)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Install Dependencies & Seed Demonstration Data
```bash
# Seed initial agencies, strike teams, shelters, and sample operational records
cd server
npm install
npm run seed
```

### 4. Run Both Servers Locally
* **Terminal 1 — Backend API & WebSockets Server:**
  ```bash
  cd server
  npm start
  # Server runs at http://localhost:5000
  # Health check endpoint: http://localhost:5000/api/health
  ```
* **Terminal 2 — Frontend Application:**
  ```bash
  cd client
  npm install
  npm run dev
  # Application opens at http://localhost:5173
  ```

---

## 🚀 Deployment Instructions

### Frontend (Static SPA Hosting)
1. Set build command to `npm run build` and publish directory to `dist`.
2. Configure your environment variable:
   * `VITE_API_URL`: Your backend API gateway URL (e.g., `https://api.yourdomain.com`).
3. Single Page App rewrites are configured in `vercel.json` (`/(.*) -> /index.html`) to ensure clean routing on page refresh.

### Backend (Node.js Web Service)
1. Deploy from the `server/` root directory.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set required production environment variables:
   * `PORT`: `5000`
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: `<your_production_mongodb_connection_string>`
   * `JWT_SECRET`: `<your_high_entropy_jwt_secret>`
   * `CLIENT_URL`: `<your_frontend_domain_url>`
   * `CLOUDINARY_*`: `<your_cloudinary_credentials>`

---

## 📄 License

This project is licensed under the terms of the [LICENSE](LICENSE.md) file included in this repository.
