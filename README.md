# 🌪️ Cyclone Disaster Operations Command Center (EOC)
### Real-Time Cyclone Tracking, Impact Prediction, Evacuation Planning & Multi-Agency Relief Coordination Platform

> A production-grade **Disaster Operations Command System** built on the **MERN Stack** (MongoDB Atlas, Express.js, React.js + Tailwind CSS, Node.js + Socket.IO) designed for disaster management authorities (NDMA, NDRF, SDMAs, IMD) to monitor cyclones, assess multi-criteria risks, coordinate evacuations, triage life-threatening incidents, optimize relief logistics, and protect affected citizens.

---

## 🔑 All 6 Stakeholder Accounts & Credentials

The system provides 6 pre-seeded role accounts with strictly differentiated, role-based navigation and permissions:

| # | Operational Role | Email Identifier | Password | Access Scope & Allowed Modules |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **EOC Chief Commander (Admin)** | `admin@cycloneops.gov` | `password123` | **Full Platform Access**: Command Center, Cyclone Tracking, Impact Assessment, Evacuation Planning, Shelters, Incidents, Response Teams, Relief & Inventory, Alerts, Analytics, Reports, and Administration (`/dashboard/admin`) with full personnel management & strike team assembly. |
| **2** | **Operations Lead (Officer)** | `officer@cycloneops.gov` | `password123` | **Operational Command Deck**: Command Center, Cyclone Tracking, Impact Assessment, Evacuation Planning, Shelters, Incidents, Response Teams, Relief & Inventory, Emergency Alerts, Analytics, Reports, Citizen SOS. *(Excludes System Administration)* |
| **3** | **NDRF Field Responder (Responder)** | `responder@cycloneops.gov` | `password123` | **Tactical Field Rescue**: Command Center, Incident Triage (dispatch status, rescue assignments), Response Teams (squad roster, vehicle readiness), Shelters Management, Evacuation Planning, Cyclone Tracking, Citizen SOS Alerts. |
| **4** | **Logistics Coordinator (Coordinator)** | `coordinator@cycloneops.gov` | `password123` | **Supply Chain & Depots**: Command Center, Relief & Inventory (stockpile burn rates, depot manifests, supply convoys), Shelters Management (rations & supply levels), Evacuation Corridors, Cyclone Tracking, Operational Reports, Citizen SOS. |
| **5** | **Community Volunteer (Volunteer)** | `volunteer@cycloneops.gov` | `password123` | **Community Assistance**: Citizen SOS Portal (field needs verification, community relief requests), Shelters Management (open facility occupancy & bed availability), Evacuation Planning (safe routes, road status), Cyclone Tracking. |
| **6** | **Public Resident (Citizen)** | `citizen@cycloneops.gov` | `password123` | **Public Safety & SOS**: Citizen SOS Portal (1-touch emergency SOS broadcast with GPS coordinates, emergency helplines), Cyclone Radar Tracking, Safe Evacuation Routes & Roadblock Alerts, Nearest Open Shelter Finder. |

---

## 🛡️ Role-Based Access Control (RBAC) & Navigation Breakdown

Each stakeholder has a dedicated, tailored navigation menu and strict route-level protection:

```
┌─────────────────────────────┬───────────┬─────────────┬───────────────┬─────────────────┬─────────────┬───────────┐
│ Module / Route              │   Admin   │   Officer   │   Responder   │   Coordinator   │  Volunteer  │  Citizen  │
├─────────────────────────────┼───────────┼─────────────┼───────────────┼─────────────────┼─────────────┼───────────┤
│ Command Center (/dashboard) │     ✅    │      ✅     │       ✅      │        ✅       │      ❌     │     ❌    │
│ Cyclone Tracking (/cyclones)│     ✅    │      ✅     │       ✅      │        ✅       │      ✅     │     ✅    │
│ Impact Assessment (/risk)   │     ✅    │      ✅     │       ❌      │        ❌       │      ❌     │     ❌    │
│ Evacuation (/evacuation)    │     ✅    │      ✅     │       ✅      │        ✅       │      ✅     │     ✅    │
│ Shelters (/shelters)        │     ✅    │      ✅     │       ✅      │        ✅       │      ✅     │     ✅    │
│ Incident Triage (/incidents)│     ✅    │      ✅     │       ✅      │        ❌       │      ❌     │     ❌    │
│ Response Teams (/teams)     │     ✅    │      ✅     │       ✅      │        ❌       │      ❌     │     ❌    │
│ Relief Inventory (/relief)  │     ✅    │      ✅     │       ❌      │        ✅       │      ❌     │     ❌    │
│ Citizen SOS Portal (/citizen│     ✅    │      ✅     │       ✅      │        ✅       │      ✅     │     ✅    │
│ Emergency Alerts (/alerts)  │     ✅    │      ✅     │       ❌      │        ❌       │      ❌     │     ❌    │
│ Analytics (/analytics)      │     ✅    │      ✅     │       ❌      │        ❌       │      ❌     │     ❌    │
│ Operational Reports(/report)│     ✅    │      ✅     │       ❌      │        ✅       │      ❌     │     ❌    │
│ Administration (/admin)     │     ✅    │      ❌     │       ❌      │        ❌       │      ❌     │     ❌    │
└─────────────────────────────┴───────────┴─────────────┴───────────────┴─────────────────┴─────────────┴───────────┘
```

> **Automatic Route Protection:** If a citizen or volunteer attempts to manually enter an operational URL (e.g. `/dashboard` or `/dashboard/risk` or `/dashboard/admin`), the `ProtectedRoute` component intercepts the request and automatically redirects them to `/dashboard/citizen`.

---

## 🚀 Deployment Guide (Vercel & Remote Hosting)

This repository is optimized for quick, production-ready deployment on **Vercel** for the client and any Node.js hosting platform (Render, Railway, Fly.io, or AWS) for the server.

### Option A: Deploying Frontend to Vercel

1. **Push your repository** to GitHub, GitLab, or Bitbucket.
2. In the **[Vercel Dashboard](https://vercel.com/dashboard)**:
   * Click **"Add New Project"** and import this repository.
   * If prompted for **Root Directory**, set it to `client` (or leave as root; both `client/vercel.json` and root `vercel.json` are pre-configured).
   * **Framework Preset**: Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. **Environment Variables on Vercel**:
   * Add the following environment variable pointing to your deployed backend API:
     * `VITE_API_URL`: `https://your-cyclone-backend.onrender.com` (leave blank if deploying backend on the same domain or local reverse proxy).
4. Click **Deploy**. Vercel will build the frontend and serve it globally on a custom `.vercel.app` URL with automatic SPA rewriting (no 404s on page refresh).

### Option B: Deploying Backend to Render / Railway

1. Create a **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Root Directory** to `server`.
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   * `PORT`: `5000`
   * `NODE_ENV`: `production`
   * `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/cyclone_command_eoc?retryWrites=true&w=majority`
   * `JWT_SECRET`: `<your_secure_random_jwt_secret>`
   * `CORS_ORIGIN`: `https://your-frontend.vercel.app`

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Local instance or free MongoDB Atlas URI)
* **npm** (v9.0.0 or higher)

### 2. Environment Variables Configuration
Ensure `server/.env` contains your MongoDB connection string:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cyclone_command_eoc?retryWrites=true&w=majority
JWT_SECRET=emergency_command_secret_key_2026
JWT_EXPIRE=30d
```

### 3. Seed Database with All 6 Roles & Live Meteorological Data
```bash
cd server
npm install
npm run seed
```

### 4. Run Both Servers Locally
* **Terminal 1 (Backend REST API & Socket.IO):**
  ```bash
  cd server
  npm start
  # Running at http://localhost:5000 (Health Check: http://localhost:5000/api/health)
  ```
* **Terminal 2 (Frontend Client):**
  ```bash
  cd client
  npm install
  npm run dev
  # Running at http://localhost:5173
  ```

---

## 🌟 Core Modules & Architecture

### 1. GIS Command Radar & Trajectory Map (`/dashboard/cyclones`)
* **Doppler Radar GIS Stage:** Interactive OpenStreetMap canvas with smooth mouse wheel zooming, eye position centering, and dual light/dark tactical cartography.
* **Real-time Live Meteorological Feeds:** Ingests live severe storms from **NASA EONET**, **GDACS (UN-OCHA / European Commission)**, and **NOAA NHC** without requiring private API keys.
* **72-Hour Numerical Predictions:** Expanding cone of uncertainty (±35 km to ±275 km) derived from atmospheric steering currents and Coriolis parameter models.

### 2. Multi-Criteria Risk Scoring (`/dashboard/risk`)
* Dynamic algorithmic threat calculation combining storm surge height, proximity to landfall, population density, and infrastructure exposure:
  $$\text{Risk Score} = 0.35 \times C_{\text{proximity}} + 0.25 \times P_{\text{density}} + 0.20 \times I_{\text{exposure}} + 0.20 \times T_{\text{surge}}$$

### 3. Evacuation Planning & Bottleneck Mitigation (`/dashboard/evacuation`)
* Dynamic corridor waybills with interactive Leaflet polylines, checkpoint statuses, road blockage warnings (e.g. coastal inundation), and route travel time estimates.

### 4. Shelters Management (`/dashboard/shelters`)
* Real-time capacity and occupancy tracking (+50/-50 manual intake controls for field staff), bed availability indicators, and automated overflow rerouting.

### 5. Threat-to-Life Incident Triage (`/dashboard/incidents`)
* Prioritized emergency queue (P1 Critical, P2 High, P3 Moderate) with automated closest-squad dispatch and live status transitions (`REPORTED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`).

### 6. Strike Response Teams (`/dashboard/teams`)
* Complete readiness tracker for specialized rescue forces (NDRF, Coast Guard, SDRF, Medical Corps) with live GPS locations, amphibious boat assets, and equipment manifests.

### 7. Logistics & Relief Inventory (`/dashboard/relief`)
* Stockpile volume tracking, automated burn rate forecasting (drinking water at $3\text{L/person/day}$, meal rations, hygiene kits, baby formula), and live GPS tracking for emergency relief convoys.

### 8. Common Alerting Protocol (CAP v1.2) Gateway (`/dashboard/alerts`)
* Dual-key broadcast mechanism with multi-channel dispatch (Cell Broadcast, Siren Array, SMS, FM Radio) and multilingual translation previews (English, Tamil, Telugu, Hindi, Bengali, Odia).

### 9. Mobile Citizen SOS Portal (`/dashboard/citizen`)
* 1-touch SOS beacon broadcasting live GPS coordinates directly to the EOC triage desk, accompanied by nearest shelter lookup and emergency helplines.

### 10. Operational Reports & Auditing (`/dashboard/reports` & `/dashboard/admin`)
* Statutory incident documentation templates (NDRF / FEMA Form 201/202), printable official SITREP summaries with verification signatures, CSV exports, and zero-trust audit ledger.
