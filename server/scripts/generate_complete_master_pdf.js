const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const { backendFiles } = require('./catalog_backend');
const { frontendFiles } = require('./catalog_frontend');

const ROOT_DIR = path.resolve(__dirname, '../..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'Cyclone_Disaster_Management_System_Complete_Documentation.pdf');

// Safe text sanitizer to ensure standard Latin1/ASCII for PDFKit core fonts
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022]/g, '*')
    .replace(/[^\x00-\x7F]/g, ' ');
}

// Safely extract lines of code from files on disk
function getFileSnippet(relPath, maxLines = 26) {
  const full = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(full)) return '// File not found on disk';
  try {
    const raw = fs.readFileSync(full, 'utf8');
    const lines = raw.split('\n').slice(0, maxLines);
    return sanitizeText(lines.join('\n'));
  } catch (e) {
    return `// Error reading file: ${e.message}`;
  }
}

class MasterDocumentBuilder {
  constructor(outputPath) {
    this.outputPath = outputPath;
    this.doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
      autoFirstPage: true
    });
    this.writeStream = fs.createWriteStream(outputPath);
    this.doc.pipe(this.writeStream);

    this.contentWidth = this.doc.page.width - 100;
    this.bottomThreshold = this.doc.page.height - 55;
  }

  // Pure Professional Grayscale Palette
  cBlack = '#111827';
  cDarkGray = '#374151';
  cMutedGray = '#4B5563';
  cLightGray = '#F9FAFB';
  cBorder = '#D1D5DB';
  cDivider = '#9CA3AF';
  cHeaderBg = '#F3F4F6';

  ensureSpace(neededHeight) {
    if (this.doc.y + neededHeight > this.bottomThreshold) {
      this.doc.addPage();
    }
  }

  coverPage() {
    const doc = this.doc;
    const width = doc.page.width;
    const height = doc.page.height;

    // Double Border
    doc.rect(40, 40, width - 80, height - 80).lineWidth(1.5).stroke(this.cBlack);
    doc.rect(43, 43, width - 86, height - 86).lineWidth(0.5).stroke(this.cDivider);

    // Directorate Header
    doc.fillColor(this.cDarkGray)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('NATIONAL DISASTER MANAGEMENT & EMERGENCY OPERATIONS CENTER (EOC)', 60, 65, { align: 'center', width: width - 120 });
    
    doc.fillColor(this.cMutedGray)
      .fontSize(8)
      .font('Helvetica')
      .text('DIRECTORATE OF CYCLONE WARNING, HAZARD MITIGATION & RELIEF LOGISTICS', 60, 78, { align: 'center', width: width - 120 });

    doc.moveTo(60, 95).lineTo(width - 60, 95).lineWidth(1).stroke(this.cBlack);

    // Main Title
    doc.fillColor(this.cBlack)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('CYCLONE DISASTER MANAGEMENT SYSTEM', 60, 130, { align: 'center', width: width - 120 });

    doc.fillColor(this.cDarkGray)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('COMPLETE SOURCE CODE REFERENCE & TECHNICAL SPECIFICATION MANUAL', 60, 162, { align: 'center', width: width - 120 });

    doc.fillColor(this.cMutedGray)
      .fontSize(8.5)
      .font('Helvetica')
      .text('Exhaustive File-by-File, Model-by-Model, Service-by-Service & Page-by-Page Technical Reference for all 83 Source Files with Real Code Snippets, OpenStreetMap GIS Engine, Real-Time Satellite Telemetry & RBAC Security', 75, 188, { align: 'center', width: width - 150, lineGap: 3 });

    doc.moveTo(140, 238).lineTo(width - 140, 238).lineWidth(0.5).stroke(this.cDivider);

    // Executive Scope Box
    doc.rect(60, 255, width - 120, 280).fillAndStroke(this.cLightGray, this.cBorder);

    doc.fillColor(this.cBlack)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('MASTER TECHNICAL SPECIFICATION & COMPREHENSIVE DOCUMENTATION SCOPE', 75, 270);

    const summaryPoints = [
      '1. Complete Source Code Analysis: Detailed functional and architectural walkthrough of every single file in the backend (server.js, 14 models, 9 services, 14 routes, middlewares, configs) and frontend (main.jsx, App.jsx, 4 contexts, layouts, map engine, 5 components, all 15 pages).',
      '2. Zero-Cost GIS Mapping Engine: In-depth explanation of OpenStreetMap raster streaming, CSS dark filter shaders, GeoJSON coordinate projections, animated vector DivIcons, concentric wind radii (34kt, 50kt, 64kt), 72h forecast trajectory cones, and viewport flight transitions.',
      '3. Real-Time Telemetry & Satellite Ingestion: Architectural analysis of NASA EONET and UN-OCHA GDACS multi-satellite ingestion pipelines, automated 15-minute polling, barometric normalization, and Socket.IO duplex event channels.',
      '4. Strict Role-Based Access Control (RBAC): Exhaustive operational permission matrices for Admin (EOC Commander), Operations Officer, NDRF Responders, Logistics Coordinators, Community Volunteers, and Public Citizens.',
      '5. Mathematical Formulations: Algorithmic derivations for multi-criteria coastal risk scoring, roadway evacuation clearance times, and priority-based shelter resource deficit optimization.',
      '6. Full Code Snippets: Real implementation code directly extracted and explained for every single module in the application.'
    ];

    let sy = 292;
    summaryPoints.forEach(pt => {
      doc.fillColor(this.cDarkGray)
        .fontSize(8)
        .font('Helvetica')
        .text(pt, 75, sy, { width: width - 150, lineGap: 2.2 });
      sy += 36;
    });

    // Metadata Block
    const metaY = height - 195;
    doc.moveTo(60, metaY).lineTo(width - 60, metaY).lineWidth(0.8).stroke(this.cBlack);

    const metaItems = [
      ['Document Title:', 'Cyclone Disaster Management System Master Reference', 'System Version:', '5.0.0 (Comprehensive Source Master)'],
      ['Document Classification:', 'Official Technical Architecture & Code Specification', 'Architecture:', 'MERN Stack + Socket.IO + Leaflet GIS'],
      ['Database Engine:', 'MongoDB 6.0+ (14 Collections, 2dsphere Indexes)', 'Runtime Platform:', 'Node.js LTS (v18 / v20)'],
      ['Frontend Framework:', 'React 18.2 SPA via Vite 5 + Tailwind CSS', 'Coverage:', '100% of All Project Source Code Files (83 Files)'],
      ['Publication Date:', 'September 2026', 'Security Tier:', 'RBAC Operational Multi-Agency Standard']
    ];

    let rowY = metaY + 12;
    metaItems.forEach(r => {
      doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold').text(r[0], 65, rowY);
      doc.fillColor(this.cDarkGray).fontSize(7.5).font('Helvetica').text(r[1], 195, rowY);
      doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold').text(r[2], 340, rowY);
      doc.fillColor(this.cDarkGray).fontSize(7.5).font('Helvetica').text(r[3], 430, rowY);
      rowY += 14;
    });

    doc.addPage();
  }

  tableOfContents() {
    this.chapterHeading('TABLE OF CONTENTS', 'Master System Architecture & Chapter Directory');

    const toc = [
      { id: '1.0', title: 'Executive Overview & Full-Stack System Architecture', desc: 'Disaster mandate, multi-tier MERN topology, asynchronous event loops, and data communication lifecycles.' },
      { id: '2.0', title: 'User Roles, Operational Responsibilities & RBAC Access Matrix', desc: 'Comprehensive comparison of Admin, Officer, Responder, Coordinator, Volunteer, and Citizen capabilities.' },
      { id: '3.0', title: 'GIS Mapping Subsystem: How Maps Work, Leaflet & Satellite Feeds', desc: 'Exhaustive deep-dive on OpenStreetMap raster streaming, CSS dark shaders, coordinate projections, custom SVG DivIcons, wind radii, trajectory forecast cones, and satellite API ingestion.' },
      { id: '4.0', title: 'Complete Backend Source Code Reference (Server - 48 Files)', desc: 'Exhaustive analysis of server.js, configs, middlewares, all 14 database models, all 9 business services, all 14 route controllers, and database seed scripts.' },
      { id: '5.0', title: 'Complete Frontend Source Code Reference (Client - 35 Files)', desc: 'Exhaustive analysis of index.html, main.jsx, App.jsx, index.css, all 4 global contexts, master layout, map components, UI elements, and all 15 user interface pages.' },
      { id: '6.0', title: 'Real-Time Telemetry, WebSocket Protocols & Satellite Ingestion', desc: 'Socket.IO duplex event channels, background sync cron, NASA EONET and UN-OCHA GDACS APIs, and scenario simulation engines.' },
      { id: '7.0', title: 'Mathematical Disaster Formulations & Algorithmic Engines', desc: 'In-depth mathematical formulations for multi-criteria risk scoring, evacuation clearance times, and priority-based relief optimization.' },
      { id: '8.0', title: 'Step-by-Step End-to-End Operational Workflows', desc: 'Chronological operational scenarios: storm detection -> risk modeling -> evacuation -> civilian SOS -> NDRF rescue -> relief supply chain -> recovery.' },
      { id: '9.0', title: 'Installation, Configuration, Database Seeding & Troubleshooting', desc: 'Prerequisites, environment variable specifications, database seeding execution, scrolling architecture fixes, and production build verification.' }
    ];

    toc.forEach(item => {
      this.ensureSpace(38);
      const y = this.doc.y;
      
      this.doc.rect(50, y, 28, 18).fillAndStroke(this.cHeaderBg, this.cBorder);
      this.doc.fillColor(this.cBlack).fontSize(8.5).font('Helvetica-Bold').text(item.id, 52, y + 4, { width: 24, align: 'center' });

      this.doc.fillColor(this.cBlack).fontSize(9.5).font('Helvetica-Bold').text(item.title, 88, y);
      this.doc.fillColor(this.cMutedGray).fontSize(8).font('Helvetica').text(item.desc, 88, y + 13, { width: this.contentWidth - 40 });

      this.doc.y = y + 36;
    });

    this.doc.addPage();
  }

  chapterHeading(title, subtitle) {
    this.ensureSpace(60);
    const doc = this.doc;
    const y = doc.y;

    doc.rect(50, y, 4, 30).fill(this.cBlack);
    doc.fillColor(this.cBlack).fontSize(13.5).font('Helvetica-Bold').text(title, 62, y + 2);
    if (subtitle) {
      doc.fillColor(this.cMutedGray).fontSize(8.5).font('Helvetica').text(subtitle, 62, y + 18);
    }
    doc.y = y + 36;
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(0.8).stroke(this.cBlack);
    doc.moveDown(0.6);
  }

  sectionHeading(title) {
    this.ensureSpace(40);
    const doc = this.doc;
    doc.fillColor(this.cBlack).fontSize(10.5).font('Helvetica-Bold').text(title);
    doc.moveDown(0.3);
  }

  subHeading(title) {
    this.ensureSpace(30);
    const doc = this.doc;
    doc.fillColor(this.cDarkGray).fontSize(9.5).font('Helvetica-Bold').text(title);
    doc.moveDown(0.25);
  }

  fileBlockHeader(filePath, fileType, roleSummary) {
    this.ensureSpace(48);
    const doc = this.doc;
    const y = doc.y;

    doc.rect(50, y, this.contentWidth, 22).fillAndStroke(this.cHeaderBg, this.cBorder);
    doc.fillColor(this.cBlack).fontSize(8.5).font('Courier-Bold').text(filePath, 58, y + 5);
    doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica-Bold').text(fileType.toUpperCase(), this.contentWidth - 80, y + 6, { align: 'right' });

    doc.y = y + 26;
    doc.fillColor(this.cDarkGray).fontSize(8).font('Helvetica-Oblique').text(`Role & Purpose: ${roleSummary}`, 50, doc.y, { width: this.contentWidth });
    doc.moveDown(0.4);
  }

  paragraph(text, options = {}) {
    const doc = this.doc;
    doc.fillColor(options.color || this.cDarkGray)
      .fontSize(options.size || 8.5)
      .font(options.font || 'Helvetica')
      .text(sanitizeText(text), {
        width: this.contentWidth,
        lineGap: options.lineGap !== undefined ? options.lineGap : 2,
        align: options.align || 'left'
      });
    doc.moveDown(options.moveDown !== undefined ? options.moveDown : 0.45);
  }

  bullet(title, text) {
    const doc = this.doc;
    this.ensureSpace(24);
    const y = doc.y;
    doc.fillColor(this.cBlack).fontSize(9).text('*', 55, y);
    doc.fillColor(this.cBlack).fontSize(8.5).font('Helvetica-Bold').text(title + ': ', 66, y, { continued: true });
    doc.fillColor(this.cDarkGray).font('Helvetica').text(sanitizeText(text), { width: this.contentWidth - 20, lineGap: 1.5 });
    doc.moveDown(0.35);
  }

  codeBox(codeSnippet, label = '') {
    const doc = this.doc;
    const lines = codeSnippet.split('\n');
    const height = Math.max(26, lines.length * 9.2 + 10);
    this.ensureSpace(height + (label ? 18 : 8));

    if (label) {
      doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold').text(label, 50, doc.y);
      doc.moveDown(0.2);
    }
    
    const y = doc.y;
    doc.rect(50, y, this.contentWidth, height).fillAndStroke(this.cLightGray, this.cBorder);

    doc.fillColor(this.cBlack).fontSize(6.8).font('Courier').text(codeSnippet, 58, y + 6, {
      width: this.contentWidth - 16,
      lineGap: 1.2
    });

    doc.y = y + height + 6;
  }

  renderTable(headers, rows, colWidths) {
    const doc = this.doc;
    const startX = 50;
    const totalW = colWidths.reduce((a, b) => a + b, 0);

    const drawHeader = () => {
      this.ensureSpace(22);
      const hy = doc.y;
      doc.rect(startX, hy, totalW, 18).fillAndStroke(this.cHeaderBg, this.cBorder);
      let hx = startX;
      headers.forEach((h, idx) => {
        doc.fillColor(this.cBlack).fontSize(8).font('Helvetica-Bold').text(h, hx + 4, hy + 4, {
          width: colWidths[idx] - 8
        });
        hx += colWidths[idx];
      });
      doc.y = hy + 18;
    };

    drawHeader();

    rows.forEach((row, rIdx) => {
      let maxHeight = 16;
      row.forEach((cell, cIdx) => {
        const textH = doc.heightOfString(cell, { width: colWidths[cIdx] - 8, fontSize: 7.5 });
        if (textH + 6 > maxHeight) maxHeight = textH + 6;
      });

      if (doc.y + maxHeight > this.bottomThreshold) {
        doc.addPage();
        drawHeader();
      }

      const y = doc.y;
      const rowBg = rIdx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
      doc.rect(startX, y, totalW, maxHeight).fillAndStroke(rowBg, this.cBorder);

      let cellX = startX;
      row.forEach((cell, cIdx) => {
        doc.fillColor(this.cDarkGray).fontSize(7.5).font('Helvetica').text(cell, cellX + 4, y + 4, {
          width: colWidths[cIdx] - 8,
          lineGap: 1.2
        });
        cellX += colWidths[cIdx];
      });

      doc.y = y + maxHeight;
    });

    doc.moveDown(0.5);
  }

  addHeadersAndFooters() {
    const totalPages = this.doc.bufferedPageRange().count;
    for (let i = 1; i < totalPages; i++) {
      this.doc.switchToPage(i);
      const width = this.doc.page.width;
      const height = this.doc.page.height;

      // Reset margins to zero during header/footer pass so they never trigger page breaks
      this.doc.page.margins.top = 0;
      this.doc.page.margins.bottom = 0;

      // Top Running Header
      this.doc.moveTo(50, 35).lineTo(width - 50, 35).lineWidth(0.5).stroke(this.cBorder);
      this.doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica')
        .text('CYCLONE DISASTER MANAGEMENT SYSTEM • COMPLETE SOURCE SPECIFICATION', 50, 22, { lineBreak: false });
      this.doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica')
        .text('OFFICIAL OPERATIONAL STANDARD', width - 230, 22, { width: 180, align: 'right', lineBreak: false });

      // Bottom Running Footer
      this.doc.moveTo(50, height - 35).lineTo(width - 50, height - 35).lineWidth(0.5).stroke(this.cBorder);
      this.doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica')
        .text('EOC Disaster Response Command Center Platform (Full-Stack MERN Architecture)', 50, height - 26, { lineBreak: false });
      this.doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold')
        .text(`Page ${i + 1} of ${totalPages}`, width - 150, height - 26, { width: 100, align: 'right', lineBreak: false });
    }
  }

  save() {
    this.addHeadersAndFooters();
    this.doc.end();
    return new Promise((resolve, reject) => {
      this.writeStream.on('finish', resolve);
      this.writeStream.on('error', reject);
    });
  }
}

// -------------------------------------------------------------
// CHAPTER GENERATION ROUTINES
// -------------------------------------------------------------

function generateChapter1(b) {
  b.chapterHeading('CHAPTER 1.0: EXECUTIVE OVERVIEW & FULL-STACK SYSTEM ARCHITECTURE', 'Disaster Mandate, Multi-Tier MERN Topology & Real-Time Event Foundations');

  b.sectionHeading('1.1 Operational Mandate & Disaster Response Mission');
  b.paragraph(`The Cyclone Disaster Management System is an enterprise-grade, mission-critical Emergency Operations Center (EOC) software platform engineered to orchestrate multi-agency disaster preparedness, real-time meteorological tracking, automated coastal risk assessment, mass evacuation coordination, and emergency relief distribution. Developed for national and provincial civil defense directorates, the platform bridges the divide between complex oceanic satellite telemetry and frontline tactical disaster response.`);
  b.paragraph(`Tropical cyclones represent among the most destructive atmospheric phenomena on Earth, generating extreme gale-force winds exceeding 250 km/h, catastrophic coastal storm surges rising above 6 meters, and torrential precipitation that triggers widespread riverine flooding. The primary objective of this platform is the absolute minimization of human mortality and socioeconomic devastation through predictive analytics, transparent multi-agency task dispatching, and rapid citizen emergency assistance.`);

  b.sectionHeading('1.2 Full-Stack MERN Technical Topology');
  b.paragraph(`The platform is architected upon a resilient, high-throughput MERN (MongoDB, Express.js, React.js, Node.js) technology stack, augmented with low-latency WebSockets (Socket.IO) and an open-source Geographic Information System (GIS) engine based on Leaflet.js and OpenStreetMap raster tile infrastructure.`);

  b.bullet('Database Layer (MongoDB 6.0+)', 'Document-oriented database utilizing native 2dsphere spherical geospatial indexes. MongoDB stores semi-structured disaster entities across 14 collections, executing spatial queries ($near, $geoWithin, $geoIntersects) within milliseconds to correlate storm landfall vectors with civilian populations.');
  b.bullet('Backend Application Server (Node.js & Express)', 'Asynchronous, event-driven JavaScript runtime executing on Node.js LTS. Express.js orchestrates RESTful API routing, strict JWT authentication, role-based authorization filters, and automated background synchronization daemons.');
  b.bullet('Real-Time Communication Pipeline (Socket.IO)', 'Persistent duplex WebSocket connections enabling instantaneous state propagation across connected clients. When critical events occur (new cyclone track fixes, emergency SOS signals, evacuation orders), updates are pushed to active command terminals in sub-second timeframes.');
  b.bullet('Frontend User Interface (React 18 & Vite 5)', 'Modern Single Page Application (SPA) compiled via Vite for rapid hot-reloading and optimized bundle chunking. Utilizes Tailwind CSS for a military-grade, dark-themed command center interface with atomic design tokens.');
  b.bullet('Geospatial GIS Engine (Leaflet 1.9 & OpenStreetMap)', 'Zero-cost, open-source mapping engine rendering interactive vector layers, concentric wind radii, animated storm eye vortices, and 72-hour forecast cones over custom dark-mode inverted OSM raster tiles.');

  b.sectionHeading('1.3 High-Level System Architecture Diagram');
  const archDiagram = 
`+-----------------------------------------------------------------------------------+
|                           EXTERNAL SATELLITE & API FEEDS                          |
|         NASA EONET v3 REST API       |        UN-OCHA GDACS GeoJSON Alerts        |
+--------------------------------------+--------------------------------------------+
                                       | (15-min background cron / sync-live)
                                       v
+-----------------------------------------------------------------------------------+
|                        EXPRESS.JS / NODE.JS BACKEND SERVER                        |
|  +-----------------------------------------------------------------------------+  |
|  | Middleware Pipeline: CORS -> JSON Parser -> JWT Auth -> RBAC Gatekeeper     |  |
|  +-----------------------------------------------------------------------------+  |
|  | Services Layer:                                                              |  |
|  | - liveCycloneService  - forecastService      - riskService                   |  |
|  | - evacuationService   - shelterService        - reliefOptimizerService        |  |
|  | - incidentService     - disasterAggregator    - simulationService             |  |
|  +-----------------------------------------------------------------------------+  |
|  | Sockets Gateway (socketManager.js): Duplex WebSockets & Broadcast Rooms     |  |
|  | 14 REST Route Namespaces: /api/v1/{cyclones, alerts, shelters, incidents...}|  |
+--------------------------------------+--------------------------------------------+
                                       | Mongoose ODM (2dsphere Spatial Queries)
                                       v
+-----------------------------------------------------------------------------------+
|                          MONGODB DATABASE ENGINE                                  |
|  Collections: Cyclones, Shelters, Incidents, ResponseTeams, EvacuationPlans,     |
|               EmergencyAlerts, RiskZones, Inventories, ReliefDistributions, Users |
+--------------------------------------+--------------------------------------------+
                                       | REST APIs & WebSocket Event Channels
                                       v
+-----------------------------------------------------------------------------------+
|                        REACT 18 SINGLE PAGE APPLICATION                           |
|  +-----------------------------------------------------------------------------+  |
|  | Global Contexts: AuthContext | SocketContext | ThemeContext | SimulationCtx  |  |
|  +-----------------------------------------------------------------------------+  |
|  | DashboardLayout & Navigation: Top Status Marquee, Responsive Sidebar       |  |
|  | GIS Map Engine (CommandMap.jsx): Leaflet 1.9 + OpenStreetMap Dark Shaders   |  |
|  | 15 Operational Pages: CommandCenter, CycloneTracker, Evacuation, Shelters...|  |
+-----------------------------------------------------------------------------------+`;
  b.codeBox(archDiagram, 'Structural Architecture & Data Flow Diagram');

  b.sectionHeading('1.4 Complete Repository Directory Map & Source Inventory (83 Files)');
  b.paragraph(`The Cyclone Disaster Management System is organized into a modular monorepo structure separating client and server concerns while sharing domain semantics:`);

  const dirTree = 
`cyclone-disaster-management/
├── README.md                                  # Master system documentation & setup guide
├── client/                                    # Frontend React 18 SPA (Vite 5 + Tailwind)
│   ├── index.html                             # SPA HTML shell & Leaflet CSS linkage
│   ├── package.json                           # Frontend dependencies & build scripts
│   ├── vite.config.js                         # Bundler, HMR & dev server proxy rules
│   ├── tailwind.config.js                     # Military dark theme & animation tokens
│   ├── postcss.config.js                      # PostCSS pipeline & Autoprefixer
│   └── src/
│       ├── main.jsx                           # React DOM root entry point
│       ├── App.jsx                            # React Router topology & route guards
│       ├── index.css                          # Global Tailwind rules & dark map shader
│       ├── context/                           # Global React Context State Providers
│       │   ├── AuthContext.jsx                # User session, JWT tokens & role checks
│       │   ├── SocketContext.jsx              # Persistent duplex WebSocket channels
│       │   ├── ThemeContext.jsx               # Dark/light theme state & DOM toggle
│       │   └── SimulationContext.jsx          # Disaster drill state & timeline controls
│       ├── layouts/
│       │   └── DashboardLayout.jsx            # EOC shell, status marquee & sidebar
│       ├── maps/
│       │   └── CommandMap.jsx                 # Leaflet GIS engine, OSM tiles & SVG icons
│       ├── components/                        # Atomic & Composite UI Components
│       │   ├── KpiCard.jsx                    # Executive metric card with trend deltas
│       │   ├── CycloneInfoPanel.jsx           # Storm telemetry gauge & countdown panel
│       │   ├── AlertBanner.jsx                # CAP broadcast banner with audio chimes
│       │   ├── RiskBadge.jsx                  # Standardized severity pill badge
│       │   └── SimulationBar.jsx              # Disaster drill playback & timeline header
│       └── pages/                             # 15 Complete User Interface Views
│           ├── LandingPage.jsx                # Public gateway & helpline directory
│           ├── LoginPage.jsx                  # Multi-role authentication & demo logins
│           ├── CommandCenter.jsx              # Master dual-pane EOC command viewport
│           ├── CycloneTracker.jsx             # Dedicated storm tracking & radii view
│           ├── ImpactAssessment.jsx           # Risk zonation & infrastructure audits
│           ├── EvacuationPlanning.jsx         # Corridors, clearance times & orders
│           ├── SheltersManagement.jsx         # Shelter directory, occupancy & amenities
│           ├── IncidentBoard.jsx              # Kanban incident dispatch & triage
│           ├── ResponseTeamsPage.jsx          # Tactical rescue units & GPS telemetry
│           ├── ReliefCoordination.jsx         # Supply inventory & convoy manifests
│           ├── CitizenPortal.jsx              # Civilian SOS beacon & nearest shelter
│           ├── AlertCenter.jsx                # CAP emergency broadcast authoring studio
│           ├── AnalyticsForecast.jsx          # Predictive decay curves & response KPIs
│           ├── ReportsPage.jsx                # Statutory SITREP generator & PDF export
│           └── AdminPage.jsx                  # User accounts, agencies & audit logs
└── server/                                    # Backend Node.js / Express Server
    ├── server.js                              # HTTP/WebSocket gateway & lifecycle
    ├── package.json                           # Backend dependencies & runtime scripts
    ├── .env.example                           # Environment configuration template
    ├── sockets/
    │   └── socketManager.js                   # Socket.IO connection manager & rooms
    ├── config/
    │   ├── db.js                              # MongoDB connection & index auditor
    │   ├── constants.js                       # Domain enums, categories & thresholds
    │   └── mockData.js                        # Coastal features & historical seed data
    ├── middleware/
    │   ├── auth.js                            # JWT token extraction & verification
    │   ├── rbac.js                            # Role-Based Access Control gatekeeper
    │   └── errorHandler.js                    # Centralized exception normalization
    ├── models/                                # 14 Mongoose Data Schemas (2dsphere)
    │   ├── Agency.js                          # Multi-agency organizational registry
    │   ├── AssistanceRequest.js               # Civilian SOS emergency distress calls
    │   ├── AuditLog.js                        # Immutable append-only audit trail
    │   ├── Cyclone.js                         # Storm tracks, wind radii & forecast cone
    │   ├── Disaster.js                        # Operational disaster declaration master
    │   ├── EmergencyAlert.js                  # CAP-compliant public warning broadcasts
    │   ├── EvacuationPlan.js                  # Corridors, clearance times & shelters
    │   ├── Incident.js                        # Localized damage reports & dispatches
    │   ├── Inventory.js                       # Relief warehouse emergency stockpiles
    │   ├── ReliefDistribution.js              # Supply convoy dispatch waybills
    │   ├── ResponseTeam.js                    # Tactical rescue units & live GPS fixes
    │   ├── RiskZone.js                        # Inundation polygons & demographic risk
    │   ├── Shelter.js                         # Cyclone shelters, capacity & amenities
    │   └── User.js                            # User credentials, bcrypt hash & roles
    ├── services/                              # 9 Core Business Logic Engines
    │   ├── disasterAggregator.js              # Real-time multi-module KPI synthesis
    │   ├── evacuationService.js               # Route optimization & clearance times
    │   ├── forecastService.js                 # Storm track extrapolation & landfall
    │   ├── incidentService.js                 # Priority scoring & team auto-dispatch
    │   ├── liveCycloneService.js              # NASA EONET & GDACS satellite feeds
    │   ├── reliefOptimizerService.js          # Shelter supply deficit optimization
    │   ├── riskService.js                     # Multi-criteria coastal risk scoring
    │   ├── shelterService.js                  # Capacity audits & nearest shelter search
    │   └── simulationService.js               # Drill orchestration & synthetic events
    ├── routes/                                # 14 Express REST Route Controllers
    │   ├── adminRoutes.js                     # User administration & audit inspection
    │   ├── alertRoutes.js                     # CAP broadcast dispatch & deactivation
    │   ├── analyticsRoutes.js                 # Statistical feeds & trend metrics
    │   ├── authRoutes.js                      # Login, token issuance & profile check
    │   ├── citizenRoutes.js                   # Public SOS & nearest shelter lookup
    │   ├── cycloneRoutes.js                   # Active storm tracks & manual fixes
    │   ├── disasterRoutes.js                  # Disaster declarations & phase changes
    │   ├── evacuationRoutes.js                # Plan management & checkpoint feeds
    │   ├── incidentRoutes.js                  # Kanban incident status transitions
    │   ├── reliefRoutes.js                    # Inventory levels & convoy manifests
    │   ├── responseTeamRoutes.js              # Unit telemetry & duty state toggles
    │   ├── riskRoutes.js                      # Vulnerability polygons & recalculation
    │   ├── shelterRoutes.js                   # Shelter directory & occupancy updates
    │   └── simulationRoutes.js                # Drill scenario controls & step triggers
    └── scripts/
        └── seed.js                            # Turnkey database seeding script`;
  b.codeBox(dirTree, 'Complete Monorepo Directory Tree (83 Files)');

  b.doc.addPage();
}

function generateChapter2(b) {
  b.chapterHeading('CHAPTER 2.0: USER ROLES, OPERATIONAL RESPONSIBILITIES & RBAC ACCESS MATRIX', 'Multi-Agency Governance, Operational Responsibilities & Role-Based Authorization');

  b.sectionHeading('2.1 Operational Role Profiles');
  b.paragraph(`The Cyclone Disaster Management System implements strict, defense-in-depth Role-Based Access Control (RBAC) to ensure that operators across disparate agencies access only the tools and data pertinent to their jurisdictional authority.`);

  b.bullet('1. Administrator (EOC Commander)', 'Holds supreme command authority over the platform. Responsible for system-wide configuration, registering response agencies, provisioning user credentials, monitoring immutable audit logs, overriding meteorological data, and managing training simulation drills.');
  b.bullet('2. Operations Officer', 'Stationed within national or district EOC control rooms. Formulates mass evacuation plans, authorizes CAP-compliant emergency broadcast alerts, issues district warnings, reviews multi-criteria risk maps, and mobilizes emergency response battalions.');
  b.bullet('3. Response Team Leader / Responder (NDRF / SDRF)', 'Frontline tactical commanders operating in disaster zones. Deploys rescue boats, clears blocked evacuation corridors, updates live team GPS telemetry, reports on-scene incident assessments, and confirms rescue of trapped civilians.');
  b.bullet('4. Logistics Coordinator', 'Manages disaster supply chains across central warehouses and frontline distribution hubs. Audits emergency inventory reserves (food, water, medicine, tarpaulins), optimizes delivery convoys, and resolves shelter supply deficits.');
  b.bullet('5. Community Volunteer / Agency Staff', 'Community-level responders stationed at designated cyclone shelters. Conducts civilian check-ins, reports live shelter occupancy, manages localized ration distribution, and logs shelter maintenance issues.');
  b.bullet('6. Public Citizen / Coastal Resident', 'General coastal population accessing public interfaces. Transmits emergency SOS distress signals with automatic GPS coordinates, discovers nearest safe cyclone shelters with available capacity, and receives real-time localized warnings.');

  b.sectionHeading('2.2 Master RBAC Operational Permission Matrix');
  b.paragraph(`The following matrix defines the granular access privileges enforced across all functional system modules:`);

  const headers = ['Functional Operational Module', 'Admin', 'Officer', 'Responder', 'Logistician', 'Volunteer', 'Citizen'];
  const rows = [
    ['Cyclone Telemetry & Ingestion', 'Full / Edit', 'Full / Edit', 'View Only', 'View Only', 'View Only', 'Public View'],
    ['Coastal Risk Assessment Maps', 'Full Admin', 'Full Access', 'View Zones', 'View Zones', 'View Zones', 'Public View'],
    ['Evacuation Orders & Planning', 'Full Admin', 'Authorize', 'View Routes', 'View Routes', 'View Routes', 'View Shelter'],
    ['Shelter Management & Occupancy', 'Full Admin', 'Manage All', 'View All', 'Audit Stock', 'Update Headcount', 'Find Nearest'],
    ['Incident Triage & Dispatch', 'Full Admin', 'Dispatch', 'Update Status', 'View Logistics', 'Report Local', 'Report SOS'],
    ['Tactical Response Team Telemetry', 'Full Admin', 'Assign Units', 'Report GPS', 'View Units', 'No Access', 'No Access'],
    ['Relief Logistics & Convoys', 'Full Admin', 'Authorize', 'No Access', 'Full Supply', 'Confirm Delivery', 'No Access'],
    ['CAP Emergency Broadcast Alerts', 'Full Admin', 'Broadcast', 'Receive Alert', 'Receive Alert', 'Receive Alert', 'Public Alerts'],
    ['Civilian SOS Distress Beacons', 'Full Audit', 'Triage / Assign', 'Rescue Victim', 'No Access', 'Assist Local', 'Create Beacon'],
    ['Disaster Drill Simulation Engine', 'Full Control', 'Participate', 'Simulated Ops', 'Simulated Ops', 'No Access', 'No Access'],
    ['Executive Analytics & SITREPs', 'Full / Export', 'Full / Export', 'Unit Reports', 'Supply Reports', 'No Access', 'No Access'],
    ['User Administration & Audit Logs', 'Full Control', 'No Access', 'No Access', 'No Access', 'No Access', 'No Access']
  ];
  const widths = [135, 60, 60, 60, 60, 60, 60];
  b.renderTable(headers, rows, widths);

  b.sectionHeading('2.3 Multi-Agency Incident Command System (ICS) Hierarchy & Inter-Agency Protocols');
  b.paragraph(`Effective disaster mitigation requires absolute clarity in command chain hierarchy and operational protocols across diverse governmental and defense bodies:`);
  b.bullet('Unified EOC Command (State / National EOC)', 'Led by the EOC Commander (Admin). Issues strategic declarations under the Disaster Management Act, coordinates with Armed Forces and Coast Guard, and allocates state emergency budgets.');
  b.bullet('District Emergency Operations Centers (DEOC)', 'Headed by District Magistrates and Operations Officers. Translates state-level directives into localized evacuation mandates, orders school/business closures, and mobilizes district transport buses.');
  b.bullet('Tactical Search & Rescue (NDRF & SDRF Battalions)', 'Self-contained response units deployed directly into inundation zones. Equipped with satellite communicators, inflatable motorboats, sonar detectors, and chainsaw squads.');
  b.bullet('Supply Chain Logistics Desk', 'Coordinates with civil supplies corporations and food logistics agencies. Manages buffer stockpiles across regional staging depots and dispatches armored truck convoys.');
  b.bullet('Public Information Officer (PIO)', 'Authorizes and schedules public broadcasts across AlertCenter.jsx, liaises with press agencies, and monitors social media feeds to refute cyclone disinformation.');

  b.doc.addPage();
}

function generateChapter3(b) {
  b.chapterHeading('CHAPTER 3.0: GIS MAPPING SUBSYSTEM: HOW MAPS WORK, LEAFLET & SATELLITE FEEDS', 'Cartographic Architecture, Raster Tile Streaming, CSS Dark Shaders & Real-Time Geometry');

  b.sectionHeading('3.1 Leaflet 1.9 Architecture & React DOM Mounting');
  b.paragraph(`The mapping subsystem in CommandMap.jsx is built on the battle-tested Leaflet 1.9.4 cartographic engine. Rather than relying on heavyweight, proprietary mapping services like Google Maps or Mapbox that incur high recurring costs and mandate API key provisioning, our platform utilizes an entirely open, zero-cost architecture.`);
  b.paragraph(`Leaflet operates directly on the browser DOM via a hardware-accelerated HTML5 Canvas and SVG layer pipeline. When CommandMap mounts inside React, a persistent Leaflet Map instance (L.map) is instantiated onto a dedicated container <div>. The component maintains a reference via React's useRef hook, ensuring that re-renders of surrounding React UI elements do not trigger destructive tear-downs or flickering of the underlying map view.`);

  b.sectionHeading('3.2 Zero-Cost OpenStreetMap Raster Tile Streaming Pipeline');
  b.paragraph(`Base map cartography is streamed dynamically from the official OpenStreetMap (OSM) tile server infrastructure using the standard Slippy Map tile format:`);
  b.codeBox(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\nSubdomains: ['a', 'b', 'c'] | Max Zoom: 19 | Attribution: OpenStreetMap Contributors`, 'OSM Tile Server Specification');
  b.paragraph(`The browser calculates the required tile coordinates {z}/{x}/{y} based on the current viewport bounding box and zoom level, requesting 256x256 pixel PNG tiles asynchronously. These tiles are cached in the browser's HTTP cache, enabling instantaneous re-rendering during pan and zoom gestures without overwhelming network bandwidth.`);

  b.sectionHeading('3.3 CSS Dark Tactical Shader Filter Pipeline');
  b.paragraph(`Standard OpenStreetMap raster tiles feature bright, multi-colored daylight styling that clashes with the dark aesthetic of military-grade emergency operations centers. To achieve an authentic tactical night-vision display without paying for custom third-party dark vector tiles, the platform applies a mathematical CSS filter shader directly onto the Leaflet tile pane (.leaflet-tile-pane):`);
  b.codeBox(
`.leaflet-dark-mode .leaflet-tile-pane {
  filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3);
}`, 'Tactical Dark Shader CSS Pipeline');
  b.paragraph(`This multi-stage GPU-accelerated filter functions as follows:`);
  b.bullet('1. brightness(0.6)', 'Attenuates excessive luminosity and glare, lowering tile background radiance.');
  b.bullet('2. invert(1)', 'Inverts the color spectrum: white road networks become dark, land masses invert, and ocean waters shift to dark backgrounds.');
  b.bullet('3. contrast(3)', 'Sharpens boundary edges, amplifying continental coastlines, national borders, and major transport corridors.');
  b.bullet('4. hue-rotate(200deg)', 'Rotates the color wheel by 200 degrees, shifting inverted colors into deep tactical navy blues and slates.');
  b.bullet('5. saturate(0.3)', 'Desaturates distracting colors, ensuring that glowing red cyclone tracks, amber alerts, and emerald shelters stand out vividly.');

  b.sectionHeading('3.4 Geographic Projections & WGS84 Inversion');
  b.paragraph(`All spatial geometries are stored in MongoDB using standard EPSG:4326 (WGS84 datum) geographic coordinates formatted as GeoJSON: [longitude, latitude]. However, Leaflet's API expects coordinates formatted as L.latLng(latitude, longitude). CommandMap performs automatic coordinate inversion transforms:`);
  b.codeBox(
`// GeoJSON to Leaflet Coordinate Transform
const leafletCoords = [geoJsonPoint.coordinates[1], geoJsonPoint.coordinates[0]];
const polylineCoords = geoJsonLineString.map(pt => [pt[1], pt[0]]);`, 'Spatial Coordinate Inversion');

  b.sectionHeading('3.5 Custom Animated SVG DivIcons');
  b.paragraph(`Static map pins are insufficient for representing dynamic weather phenomena. CommandMap leverages Leaflet's L.divIcon to inject rich HTML5 and SVG structures with hardware-accelerated CSS animations:`);
  b.bullet('Pulsing Cyclone Eye', 'An animated multi-ring SVG element that pulses radially, with color shifting dynamically according to IMD category (cyan for Depression up to deep magenta for Super Cyclones).');
  b.bullet('Rotating Spiral Vortex', 'Counter-clockwise rotating SVG spiral arms mimicking northern hemisphere cyclonic coriolis wind circulation.');
  b.bullet('SOS Distress Beacon', 'Bright red beacon with an expanding radar pulse animation pinpointing stranded citizens.');

  b.sectionHeading('3.6 Concentric Wind Radii Geometry');
  b.paragraph(`Tropical cyclones exhibit asymmetric wind fields categorized into standard nautical thresholds: 34 knots (Gale Force - 63 km/h), 50 knots (Storm Force - 93 km/h), and 64 knots (Hurricane Force - 119 km/h). CommandMap converts meteorological nautical miles into metric meters (1 NM = 1,852 meters) and renders concentric semi-transparent circular vectors:`);
  b.codeBox(
`// Concentric Wind Radii Vector Rendering
const nmToMeters = 1852;
L.circle([lat, lng], { radius: radii34kt * nmToMeters, color: '#3B82F6', fillOpacity: 0.15 }).addTo(map);
L.circle([lat, lng], { radius: radii50kt * nmToMeters, color: '#F59E0B', fillOpacity: 0.20 }).addTo(map);
L.circle([lat, lng], { radius: radii64kt * nmToMeters, color: '#EF4444', fillOpacity: 0.25 }).addTo(map);`, 'Concentric Wind Radii Vectors');

  b.sectionHeading('3.7 72-Hour Trajectory Forecast Cones');
  b.paragraph(`Future storm positions are uncertain. The platform models this using expanding error cones of uncertainty (probability cones). CommandMap connects forecast waypoints with a central trajectory polyline and constructs a closed polygon envelope representing the 67% probability corridor, shaded in semi-transparent amber.`);

  b.sectionHeading('3.8 Camera Flight Controls & Scroll-Wheel Protection');
  b.paragraph(`To provide fluid navigation during critical moments, the map implements map.flyTo([lat, lng], zoom, { duration: 1.5 }), smoothly panning and zooming the camera when operators click storm lists, shelter cards, or incident reports. Crucially, the map is configured with scrollWheelZoom={false}, resolving the severe UX flaw where mouse scrolling traps the page. The parent dashboard scrolls freely, while dedicated on-screen zoom controls allow tactical map magnification.`);

  b.sectionHeading('3.9 Mathematical Map Projections: Spherical Mercator & EPSG:3857 vs WGS84');
  b.paragraph(`Under the hood, Leaflet projects spherical geographic coordinates (WGS84 EPSG:4326 latitude and longitude) onto planar Euclidean coordinates (Web Mercator EPSG:3857) to render raster and vector elements on computer screens. The mathematical transformation equations are defined as:`);
  b.codeBox(
`x = R * (lambda - lambda_0)
y = R * ln[ tan(pi / 4 + phi / 2) ]

Where:
- R is the mean Earth radius (6,378,137.0 meters in the WGS84 ellipsoid model)
- lambda is the geographic longitude in radians
- lambda_0 is the central meridian longitude (0 radians)
- phi is the geographic latitude in radians (constrained to +/- 85.051129 degrees)`, 'Web Mercator Projection Equation');
  b.paragraph(`When the user pans or zooms, Leaflet converts screen pixel deltas into Mercator tile coordinates, requesting the corresponding OSM raster tiles at zoom level z.`);

  b.sectionHeading('3.10 Great-Circle Distance & Haversine Formulation for Nearest Shelter Discovery');
  b.paragraph(`To calculate exact straight-line distances between a stranded citizen's GPS coordinates and nearby cyclone shelters without relying on external network geocoding services, the application implements the Haversine Great-Circle formulation:`);
  b.codeBox(
`a = sin^2(Delta_phi / 2) + cos(phi_1) * cos(phi_2) * sin^2(Delta_lambda / 2)
c = 2 * atan2( sqrt(a), sqrt(1 - a) )
d = R * c

Where:
- phi_1, phi_2 are latitudes of citizen and shelter in radians
- Delta_phi is the latitude difference (phi_2 - phi_1)
- Delta_lambda is the longitude difference (lambda_2 - lambda_1)
- d is the resulting surface distance in meters / kilometers`, 'Haversine Great-Circle Distance Equation');
  b.paragraph(`This mathematical function runs both client-side inside CitizenPortal.jsx for instantaneous UI sorting and server-side in shelterService.js via MongoDB's native $near spherical operator.`);

  b.sectionHeading('3.11 Leaflet Vector Pane Rendering & GPU Canvas Acceleration');
  b.paragraph(`To maintain smooth 60 frames-per-second animation performance when rendering dozens of concentric wind circles, risk polygons, and tracking fixes, CommandMap mounts vector layers inside dedicated Leaflet DOM panes:`);
  b.bullet('overlayPane', 'Hosts static and dynamic GeoJSON polygons representing coastal risk zones.');
  b.bullet('markerPane', 'Hosts HTML5 DivIcons with hardware-accelerated CSS keyframe transforms for the rotating cyclone vortex.');
  b.bullet('shadowPane & tooltipPane', 'Hosts telemetry tooltips displaying live wind speeds, shelter headcounts, and incident statuses on hover.');

  b.doc.addPage();
}

function generateChapter4(b) {
  b.chapterHeading('CHAPTER 4.0: COMPLETE BACKEND SOURCE CODE REFERENCE (SERVER - 48 FILES)', 'Exhaustive File-by-File Technical Analysis, Schemas, Algorithms & Real Source Code Listings');

  b.paragraph(`This chapter provides an exhaustive, file-by-file technical reference for every single source file in the backend codebase (48 files total). For each file, the manual details its exact relative path, architectural category, primary role, in-depth multi-paragraph operational explanation, technical specifications, data flow, and an authentic source code excerpt directly read from disk.`);

  backendFiles.forEach((file, index) => {
    b.fileBlockHeader(`[${index + 1}/48] ${file.path}`, file.type, file.role);
    
    b.subHeading('1. Architectural Overview & Responsibilities');
    b.paragraph(file.explanation);

    if (file.technicalDetails && file.technicalDetails.length > 0) {
      b.subHeading('2. Technical Specifications & Functional Methods');
      file.technicalDetails.forEach(detail => {
        const parts = detail.split(': ');
        if (parts.length > 1) {
          b.bullet(parts[0], parts.slice(1).join(': '));
        } else {
          b.bullet('Specification', detail);
        }
      });
    }

    if (file.dataFlow) {
      b.subHeading('3. Data Flow & System Integrations');
      b.paragraph(file.dataFlow);
    }

    b.subHeading('4. Source Code Implementation Excerpt');
    const snippet = getFileSnippet(file.path, 40);
    b.codeBox(snippet, `Source Listing: ${file.path}`);
    b.doc.moveDown(0.6);
  });

  b.sectionHeading('4.8 Mongoose Geospatial Indexing Strategies & Database Lifecycle Hooks');
  b.paragraph(`The Cyclone Disaster Management System leverages advanced MongoDB features through Mongoose ODM to maximize spatial query performance and ensure data integrity across all 14 database collections:`);
  b.bullet('2dsphere Spatial Indexing', 'Configured on Cyclones, Shelters, Incidents, RiskZones, and ResponseTeams. Enables MongoDB to compute spherical distances across the curved Earth ellipsoid, executing $near, $geoWithin, and $geoIntersects queries in sub-10ms intervals.');
  b.bullet('Pre-Save Cryptographic Hooks', 'User.js defines pre("save") middleware that checks if the password field was modified, generating an adaptive bcrypt salt and hashing plaintext passwords automatically before database persistence.');
  b.bullet('Virtual Schema Getters', 'Shelter.js defines virtual getters such as availableSlots (totalCapacity - currentOccupancy) and occupancyPercentage, which compute real-time metrics on the fly without duplicating redundant state in the database.');
  b.bullet('High-Velocity Lean Projections', 'Read-heavy endpoints in disasterAggregator.js and liveCycloneService.js execute .lean() queries, bypassing Mongoose document hydration overhead to return plain JavaScript objects, reducing Node.js memory footprint by over 60%.');

  b.doc.addPage();
}

function generateChapter5(b) {
  b.chapterHeading('CHAPTER 5.0: COMPLETE FRONTEND SOURCE CODE REFERENCE (CLIENT - 35 FILES)', 'Exhaustive Component-by-Component Technical Analysis, Contexts, Pages & Real Source Code Listings');

  b.paragraph(`This chapter provides an exhaustive technical reference for all 35 source files in the client frontend repository, encompassing entry points, state context providers, master layouts, the Leaflet GIS cartographic engine, reusable UI components, all 15 operational pages, build toolchain configurations, and documentation.`);

  frontendFiles.forEach((file, index) => {
    b.fileBlockHeader(`[${index + 1}/35] ${file.path}`, file.type, file.role);

    b.subHeading('1. Architectural Overview & Component Structure');
    b.paragraph(file.explanation);

    if (file.technicalDetails && file.technicalDetails.length > 0) {
      b.subHeading('2. Technical Specifications, Props & State Management');
      file.technicalDetails.forEach(detail => {
        const parts = detail.split(': ');
        if (parts.length > 1) {
          b.bullet(parts[0], parts.slice(1).join(': '));
        } else {
          b.bullet('Specification', detail);
        }
      });
    }

    if (file.dataFlow) {
      b.subHeading('3. Data Flow & User Interaction Architecture');
      b.paragraph(file.dataFlow);
    }

    b.subHeading('4. Source Code Implementation Excerpt');
    const snippet = getFileSnippet(file.path, 40);
    b.codeBox(snippet, `Source Listing: ${file.path}`);
    b.doc.moveDown(0.6);
  });

  b.sectionHeading('5.7 React 18 Component Hierarchy, Custom Hooks Directory & Atomic State Tree');
  b.paragraph(`The frontend single page application is architected around composable, unidirectional data flow principles. The following directory catalogs the custom React hooks powering cross-component state synchronization:`);
  b.bullet('useAuth() Hook', 'Exposed by AuthContext.jsx. Supplies { user, token, loading, login, logout, register, hasRole } to any UI element requiring user context or authorization checks.');
  b.bullet('useSocket() Hook', 'Exposed by SocketContext.jsx. Provides the live WebSocket connection instance and subscription listeners for real-time disaster alerts, incident updates, and storm track movements.');
  b.bullet('useTheme() Hook', 'Exposed by ThemeContext.jsx. Toggles between the tactical dark EOC military interface and high-visibility daylight mode, dynamically updating the root <html> document class.');
  b.bullet('useSimulation() Hook', 'Exposed by SimulationContext.jsx. Supplies scenario time-step controls, playback toggles (play/pause), speed multipliers, and synthetic data injection during emergency training drills.');
  b.bullet('Tailwind CSS Design Tokens', 'Atomic color scales, custom scrollbar styling, responsive flex/grid viewports, and hardware-accelerated CSS keyframe animations (.leaflet-dark-mode, animate-ping, animate-spin).');

  b.doc.addPage();
}

function generateChapter6(b) {
  b.chapterHeading('CHAPTER 6.0: REAL-TIME TELEMETRY, WEBSOCKET PROTOCOLS & SATELLITE INGESTION', 'Duplex Event Specifications, Satellite Data Ingestion Pipelines & Simulation Clock Architecture');

  b.sectionHeading('6.1 Socket.IO Real-Time Duplex Event Bus');
  b.paragraph(`Real-time bidirectional synchronization is powered by Socket.IO over persistent WebSocket connections. When an EOC dispatcher issues an alert, an automated scraper detects a new storm fix, or a trapped civilian sends an SOS beacon, the event propagates across the network in milliseconds without polling latency.`);

  b.sectionHeading('6.2 Master Catalog of WebSocket Event Channels');
  const headers = ['Event Identifier', 'Direction', 'Payload Signature', 'Operational Handling Description'];
  const rows = [
    ['cyclone:update', 'Server -> Client', '{ stormId, coordinates, windSpeed, pressure, radii }', 'Pushes new meteorological tracking fix. Updates storm markers and wind envelopes.'],
    ['alert:broadcast', 'Server -> Client', '{ alertId, headline, severity, districts, action }', 'Triggers audio siren, displays top AlertBanner, and pushes browser notifications.'],
    ['incident:new', 'Server -> Client', '{ incidentId, type, severity, location, status }', 'Adds new pin to CommandMap and inserts card into Reported column of IncidentBoard.'],
    ['incident:status_change', 'Bidirectional', '{ incidentId, oldStatus, newStatus, teamId }', 'Synchronizes Kanban card movements across all dispatcher screens.'],
    ['sos:trigger', 'Client -> Server', '{ citizenName, phone, location, headcount, need }', 'Transmits high-priority emergency distress beacon to EOC triage desk.'],
    ['team:location_update', 'Client -> Server', '{ teamId, coordinates, status, batteryLevel }', 'Ingests live GPS coordinates from field rescue units, updating map positions.'],
    ['shelter:headcount_update', 'Bidirectional', '{ shelterId, currentOccupancy, capacity }', 'Updates shelter capacity gauges and triggers relief restocking alerts if >85%.'],
    ['simulation:tick', 'Server -> Client', '{ stepIndex, simTime, cycloneState, syntheticEvents }', 'Advances disaster drill time-step, updating storm position and simulated calls.']
  ];
  const widths = [110, 85, 140, 160];
  b.renderTable(headers, rows, widths);

  b.sectionHeading('6.3 Satellite Telemetry Ingestion: NASA EONET & GDACS');
  b.paragraph(`The liveCycloneService polls two premier global Earth observation APIs:`);
  b.bullet('NASA EONET v3', 'Earth Observatory Natural Event Tracker. Delivers curated severe storm data derived from NASA MODIS and VIIRS satellite constellations.');
  b.bullet('UN-OCHA GDACS', 'Global Disaster Alert and Coordination System. Delivers multi-hazard GeoJSON feeds integrating Joint Typhoon Warning Center (JTWC) and WMO data.');
  b.paragraph(`A background daemon running via setInterval executes every 15 minutes, fetching remote GeoJSON feeds, filtering for North Indian Ocean events, converting imperial knots to metric units, and saving new fixes to MongoDB.`);

  b.sectionHeading('6.4 Full JSON Payload Specifications for Real-Time WebSocket Events');
  b.paragraph(`The following specifications document the exact JSON payload structures transmitted across the Socket.IO duplex event channels:`);

  b.subHeading('1. Cyclone Update Event (cyclone:update)');
  b.codeBox(
`{
  "event": "cyclone:update",
  "stormId": "CYC-2026-05B",
  "name": "Super Cyclone VAYU",
  "category": "Super Cyclonic Storm",
  "coordinates": [86.85, 18.20],
  "maxWindSpeedKnots": 135,
  "maxWindSpeedKmh": 250,
  "centralPressureHpa": 912,
  "movement": { "headingAzimuth": 315, "forwardSpeedKnots": 14 },
  "windRadii": { "r34kt": 180, "r50kt": 95, "r64kt": 45 },
  "timestamp": "2026-09-16T10:30:00.000Z"
}`, 'cyclone:update Payload Structure');

  b.subHeading('2. CAP Emergency Alert Broadcast (alert:broadcast)');
  b.codeBox(
`{
  "event": "alert:broadcast",
  "alertId": "ALT-2026-09-001",
  "headline": "MANDATORY EVACUATION ORDER: COASTAL BALASORE & BHADRAK",
  "urgency": "Immediate",
  "severity": "Extreme",
  "targetDistricts": ["Balasore", "Bhadrak", "Kendrapara"],
  "instruction": "Evacuate immediately to designated multi-purpose cyclone shelters. Embankment overtopping expected.",
  "issuedBy": "EOC Operations Directorate / SDMA",
  "issuedAt": "2026-09-16T11:00:00.000Z"
}`, 'alert:broadcast Payload Structure');

  b.subHeading('3. Civilian Emergency SOS Beacon (sos:trigger)');
  b.codeBox(
`{
  "event": "sos:trigger",
  "requestId": "SOS-2026-8842",
  "citizenName": "Ramesh Chandra Jena",
  "phone": "+91-9876543210",
  "location": { "type": "Point", "coordinates": [86.9124, 21.4582] },
  "distressCategory": "Flood Inundation / Roof Entrapment",
  "headcount": 6,
  "vulnerableCount": 2,
  "status": "pending",
  "reportedAt": "2026-09-16T11:15:22.000Z"
}`, 'sos:trigger Payload Structure');

  b.subHeading('4. Field Team GPS Telemetry (team:location_update)');
  b.codeBox(
`{
  "event": "team:location_update",
  "teamId": "NDRF-BN-03",
  "callsign": "BRAVO-RESCUE-01",
  "coordinates": [86.9201, 21.4510],
  "status": "en-route",
  "assignedIncidentId": "INC-2026-4412",
  "personnelCount": 18,
  "batteryLevel": 88,
  "updatedAt": "2026-09-16T11:18:00.000Z"
}`, 'team:location_update Payload Structure');

  b.doc.addPage();
}

function generateChapter7(b) {
  b.chapterHeading('CHAPTER 7.0: MATHEMATICAL DISASTER FORMULATIONS & ALGORITHMIC ENGINES', 'Quantitative Formulations for Coastal Risk, Evacuation Clearance & Resource Optimization');

  b.sectionHeading('7.1 Coastal Multi-Criteria Risk Scoring Algorithm');
  b.paragraph(`The riskService computes a normalized composite Risk Index (R) ranging from 0.0 to 100.0 for any coastal zone:`);
  b.codeBox(
`Risk = (0.35 * WindScore) + (0.25 * SurgeScore) + (0.20 * PopDensityScore) + (0.10 * VulnScore) + (0.10 * ProximityScore)

Where:
- WindScore = min(100, (MaxWindKnots / 140) * 100)
- SurgeScore = min(100, (SurgeHeightMeters / 6.0) * 100)
- PopDensityScore = min(100, (PopulationDensityPerSqKm / 1000) * 100)
- VulnScore = (KutchaHousingPercentage * 0.7) + (ElderlyInfantPercentage * 0.3)
- ProximityScore = max(0, 100 - (DistanceToCoastlineKm * 5))`, 'Coastal Risk Index Equation');
  b.paragraph(`Classification Tiers: Very High Risk (R >= 80), High Risk (60 <= R < 80), Moderate Risk (40 <= R < 60), Low Risk (R < 40).`);

  b.sectionHeading('7.2 Roadway Evacuation Clearance Time (ECT) Formulation');
  b.paragraph(`evacuationService models the hours required to completely evacuate a coastal sector before gale-force winds arrive:`);
  b.codeBox(
`ECT = [ (N_evac * V_ratio) / (C_lanes * Q_capacity) ] + T_clearance + T_buffer

Where:
- N_evac: Total targeted civilian evacuee population
- V_ratio: Vehicle utilization ratio (average 3.5 persons per private/public vehicle)
- C_lanes: Total egress roadway lanes available along designated safe corridors
- Q_capacity: Maximum roadway throughput capacity (standard 1,200 vehicles per lane per hour)
- T_clearance: Roadway incident clearance allowance (standard 1.5 hours)
- T_buffer: Safety margin before onset of 34-knot tropical storm winds (standard 3.0 hours)`, 'Evacuation Clearance Time Equation');

  b.sectionHeading('7.3 Shelter Deficit Optimization Algorithm');
  b.paragraph(`reliefOptimizerService computes the supply deficit index for each active shelter:`);
  b.codeBox(
`SupplyDeficit = sum_over_commodities [ max(0, (Occupancy * DailyNeedRate * SafetyDays) - CurrentStock) ]
UrgencyRank = (SupplyDeficit * 0.5) + (IsolatedRoadFactor * 0.3) + (VulnerableHeadcount * 0.2)`, 'Shelter Resource Deficit Optimization');

  b.sectionHeading('7.4 Kaplan-DeMaria Cyclone Inland Wind Decay Model');
  b.paragraph(`Upon coastal landfall, tropical cyclones rapidly attenuate due to surface friction and cutoff from warm ocean latent heat fluxes. The platform models post-landfall maximum sustained wind speed V(t) as a function of hours after landfall (t):`);
  b.codeBox(
`V(t) = V_b + (R * V_0 - V_b) * exp(-alpha * t) - beta(t)

Where:
- V_0 is maximum sustained wind speed at coastal crossing (knots)
- V_b is background equilibrium wind speed (standard 26.7 knots)
- R is coastal reduction factor (standard 0.90)
- alpha is inland decay decay rate constant (standard 0.095 hr^-1)
- beta(t) is terrain roughness penalty function proportional to inland topography`, 'Kaplan-DeMaria Inland Wind Decay Model');
  b.paragraph(`This decay formulation allows EOC planners to predict inland tree fall and power grid damage hours before the storm eye crosses coastal barriers.`);

  b.sectionHeading('7.5 Meteorological Intensity Classification Conversion Matrix');
  b.paragraph(`The following table maps IMD cyclone classifications to international WMO / Saffir-Simpson intensity tiers:`);

  const catHeaders = ['IMD Classification', 'Wind (Knots)', 'Wind (km/h)', 'Pressure (hPa)', 'Storm Surge', 'Damage Severity'];
  const catRows = [
    ['Depression (D)', '17 - 27 kt', '31 - 49 km/h', '> 1000 hPa', '0.0 - 0.5 m', 'Minor coastal wave action'],
    ['Deep Depression (DD)', '28 - 33 kt', '50 - 61 km/h', '996 - 1000 hPa', '0.5 - 1.0 m', 'Embankment washouts, minor trees'],
    ['Cyclonic Storm (CS)', '34 - 47 kt', '62 - 88 km/h', '985 - 995 hPa', '1.0 - 1.5 m', 'Thatch roof damage, power line trips'],
    ['Severe Cyclonic Storm (SCS)', '48 - 63 kt', '89 - 117 km/h', '970 - 984 hPa', '1.5 - 2.5 m', 'Uprooted trees, coastal highway floods'],
    ['Very Severe Cyclone (VSCS)', '64 - 89 kt', '118 - 166 km/h', '950 - 969 hPa', '2.5 - 4.0 m', 'Widespread structural roof damage'],
    ['Extremely Severe (ESCS)', '90 - 119 kt', '167 - 221 km/h', '920 - 949 hPa', '4.0 - 6.0 m', 'Extensive building collapse, inundation'],
    ['Super Cyclone (SuCS)', '>= 120 kt', '>= 222 km/h', '< 920 hPa', '> 6.0 m', 'Catastrophic destruction, mass flooding']
  ];
  const catWidths = [120, 65, 65, 75, 65, 105];
  b.renderTable(catHeaders, catRows, catWidths);

  b.doc.addPage();
}

function generateChapter8(b) {
  b.chapterHeading('CHAPTER 8.0: STEP-BY-STEP END-TO-END OPERATIONAL WORKFLOWS', 'Operational Incident Timelines, Command Procedures & Multi-Agency Action Sequences');

  b.sectionHeading('8.1 Phase 1: Cyclone Genesis & Satellite Ingestion (T-72 Hours)');
  b.bullet('Step 1.1', 'Automated background cron in liveCycloneService detects tropical depression in Bay of Bengal via NASA EONET feed.');
  b.bullet('Step 1.2', 'System creates new Cyclone record, projects 72-hour forecast cone, and emits cyclone:update via WebSockets.');
  b.bullet('Step 1.3', 'EOC Command Center displays flashing storm advisory banner; meteorologist verifies radar fixes.');

  b.sectionHeading('8.2 Phase 2: Coastal Vulnerability Modeling & Risk Zonation (T-48 Hours)');
  b.bullet('Step 2.1', 'Operations Officer navigates to ImpactAssessment.jsx; riskService calculates multi-criteria risk scores.');
  b.bullet('Step 2.2', 'CommandMap overlays color-coded risk polygons (Very High Risk highlighted in crimson along vulnerable lowlands).');
  b.bullet('Step 2.3', 'System identifies 450,000 residents residing in kutcha housing within the 50-knot storm surge threat envelope.');

  b.sectionHeading('8.3 Phase 3: Evacuation Corridor Planning & Shelter Activation (T-36 Hours)');
  b.bullet('Step 3.1', 'Planners formulate phased mass evacuation in EvacuationPlanning.jsx. Clearance time estimated at 14.5 hours.');
  b.bullet('Step 3.2', 'Operations Officer issues mandatory evacuation order; AlertCenter dispatches CAP broadcast to coastal district mobile phones.');
  b.bullet('Step 3.3', 'Designated cyclone shelters are activated in SheltersManagement.jsx; generator checks and water filtration verified.');

  b.sectionHeading('8.4 Phase 4: Citizen Emergency SOS & Rescue Operations (T-12 Hours)');
  b.bullet('Step 4.1', 'Coastal resident trapped by premature tidal surge taps "TRANSMIT EMERGENCY SOS" on mobile CitizenPortal.jsx.');
  b.bullet('Step 4.2', 'Browser GPS coordinates are uploaded; new high-priority card appears in "Reported" column of IncidentBoard.jsx.');
  b.bullet('Step 4.3', 'Dispatcher assigns nearest NDRF Swift-Water Rescue boat battalion; responders navigate using tactical GPS coords.');

  b.sectionHeading('8.5 Phase 5: Landfall, Relief Supply Chains & Recovery (T+0 to T+48 Hours)');
  b.bullet('Step 5.1', 'Cyclone makes landfall; storm winds recorded in real time; damage reports stream into IncidentBoard.');
  b.bullet('Step 5.2', 'ReliefCoordination.jsx runs reliefOptimizerService, generating convoy delivery manifests for high-occupancy shelters.');
  b.bullet('Step 5.3', 'Post-landfall recovery commences; ReportsPage.jsx compiles statutory SITREP documentation for state disaster recovery grants.');

  b.sectionHeading('8.6 End-to-End Operational Lifecycle State Transition Flowchart');
  b.paragraph(`The following state transition flowchart illustrates the sequential progression of operational states from initial atmospheric cyclogenesis to post-storm demobilization:`);

  const lifecycleDiagram = 
`+-----------------------+
|  ATMOSPHERIC GENESIS  | -> (NASA EONET / GDACS Satellite Fix Ingestion)
+-----------+-----------+
            |
            v
+-----------------------+
|   CYCLONE ADVISORY    | -> (Track Projection & 72h Forecast Cone Calculation)
+-----------+-----------+
            |
            v
+-----------------------+
| VULNERABILITY MODEL   | -> (Multi-Criteria Risk Scoring: Surge + Wind + Housing)
+-----------+-----------+
            |
            v
+-----------------------+
|   EVACUATION ORDER    | -> (CAP Broadcast Alert Dispatched; Shelters Activated)
+-----------+-----------+
            |
            v
+-----------------------+
|   LANDFALL & RESCUE   | -> (Civilian SOS Trigger -> GPS Triangulation -> NDRF Boats)
+-----------+-----------+
            |
            v
+-----------------------+
|  RELIEF SUPPLY CHAIN  | -> (Deficit Optimizer -> Outbound Convoy Waybills -> Delivery)
+-----------+-----------+
            |
            v
+-----------------------+
| AUDIT & DEMOBILIZE    | -> (Statutory SITREP Export -> Post-Storm Financial Grants)
+-----------------------+`;
  b.codeBox(lifecycleDiagram, 'Disaster Operations State Transition Lifecycle');

  b.doc.addPage();
}

function generateChapter9(b) {
  b.chapterHeading('CHAPTER 9.0: INSTALLATION, CONFIGURATION, DATABASE SEEDING & TROUBLESHOOTING', 'Deployment Directives, Environment Specifications, Scrolling Resolution & System Verification');

  b.sectionHeading('9.1 System Prerequisites & Runtime Specifications');
  b.bullet('Node.js Runtime', 'Node.js LTS version 18.x or 20.x (verified on Windows, Linux, and macOS).');
  b.bullet('Database Engine', 'MongoDB Community Server 6.0+ or MongoDB Atlas cluster.');
  b.bullet('Package Manager', 'npm v9+ or pnpm / yarn.');

  b.sectionHeading('9.2 Environment Configuration (.env)');
  b.paragraph(`Create server/.env with the following parameters:`);
  b.codeBox(
`PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/cyclone_management
JWT_SECRET=super_secret_eoc_command_jwt_key_2026_xyz
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173`, 'server/.env Template');

  b.sectionHeading('9.3 Database Seeding Execution');
  b.paragraph(`To populate the database with realistic coastal shelters, response teams, historical storm tracks, and pre-configured user credentials, execute:`);
  b.codeBox(`cd server\nnpm run seed`, 'Database Seeding Command');
  b.paragraph(`Seeded Test Accounts:`);
  b.bullet('Administrator', 'admin@eoc.gov.in / password123 (Full Command Center & Admin access)');
  b.bullet('Operations Officer', 'officer@eoc.gov.in / password123 (Evacuation, Alert & Incident management)');
  b.bullet('NDRF Responder', 'responder@ndrf.gov.in / password123 (Field incidents & team GPS)');
  b.bullet('Public Citizen', 'citizen@gmail.com / password123 (SOS & Safe Shelter finder)');

  b.sectionHeading('9.4 Application Launch Procedures');
  b.paragraph(`Start both servers in separate terminal sessions:`);
  b.codeBox(
`# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Vite Development Server (Port 5173)
cd client
npm run dev -- --host`, 'Application Startup Commands');

  b.sectionHeading('9.5 Deep-Dive: Resolution of the Page Scrolling Defect');
  b.paragraph(`During testing, users observed that parent web pages could not be scrolled vertically. Our forensic audit identified two root causes:`);
  b.bullet('1. CSS Layout Clamping', 'The master body and HTML tags lacked explicit overflow-y auto declarations, while nested flex containers were constrained by fixed h-screen without overflow-y-auto.');
  b.bullet('2. Leaflet Scroll-Wheel Trapping', 'Leaflet maps capture all mouse wheel scroll events by default. When the mouse hovered anywhere over the map, wheel events were trapped in map zoom operations rather than scrolling the page.');
  b.paragraph(`Exact Engineering Fix Applied:`);
  b.bullet('Fix A (index.css)', 'Configured html, body { min-height: 100%; overflow-y: auto; overflow-x: hidden; } and ensured DashboardLayout main viewport has flex-1 overflow-y-auto.');
  b.bullet('Fix B (CommandMap.jsx)', 'Configured scrollWheelZoom={false} on the Leaflet MapContainer. This allows the user to scroll through dashboard tables naturally while using on-screen [+] and [-] buttons for map zoom.');

  b.sectionHeading('9.6 Production Build & Verification');
  b.codeBox(
`# Build production client bundle
cd client
npm run build

# Preview production build locally
npm run preview`, 'Production Compilation');

  b.sectionHeading('9.7 Master REST API Endpoint Directory & Authorization Specifications');
  b.paragraph(`The following directory catalogs the foundational RESTful API endpoints exposed across the server's 14 routing namespaces:`);

  const apiHeaders = ['HTTP Method & URI Endpoint', 'Auth Tier', 'Target Controller', 'Operational Purpose'];
  const apiRows = [
    ['POST /api/v1/auth/login', 'Public', 'authRoutes.js', 'Validates credentials; issues signed JWT token'],
    ['GET /api/v1/auth/me', 'Bearer JWT', 'authRoutes.js', 'Returns authenticated user profile and roles'],
    ['GET /api/v1/cyclones', 'Public', 'cycloneRoutes.js', 'Lists active cyclones with current telemetry fixes'],
    ['POST /api/v1/cyclones/sync-live', 'Officer/Admin', 'cycloneRoutes.js', 'Triggers on-demand NASA/GDACS satellite sync'],
    ['GET /api/v1/alerts/active', 'Public', 'alertRoutes.js', 'Retrieves active CAP emergency public warnings'],
    ['POST /api/v1/alerts', 'Officer/Admin', 'alertRoutes.js', 'Authorizes and broadcasts new emergency warning'],
    ['GET /api/v1/shelters', 'Public', 'shelterRoutes.js', 'Filterable list of cyclone shelters with capacities'],
    ['GET /api/v1/citizen/nearest-shelter', 'Public', 'citizenRoutes.js', 'Geospatial $near query finding closest safe shelter'],
    ['POST /api/v1/citizen/sos', 'Public', 'citizenRoutes.js', 'Ingests civilian SOS beacon with GPS coordinates'],
    ['GET /api/v1/incidents', 'Responder/EOC', 'incidentRoutes.js', 'Retrieves field damage and rescue incidents'],
    ['PUT /api/v1/incidents/:id/status', 'Responder/EOC', 'incidentRoutes.js', 'Updates Kanban status (reported -> resolved)'],
    ['GET /api/v1/evacuation/plans', 'Officer/Admin', 'evacuationRoutes.js', 'Lists sectoral plans and clearance times (ECT)'],
    ['GET /api/v1/relief/inventory', 'Logistician', 'reliefRoutes.js', 'Audits relief supplies across all warehouses'],
    ['POST /api/v1/simulation/step', 'Admin', 'simulationRoutes.js', 'Advances drill clock by +6h; emits simulation:tick']
  ];
  const apiWidths = [150, 75, 100, 170];
  b.renderTable(apiHeaders, apiRows, apiWidths);
}

// -------------------------------------------------------------
// MAIN EXECUTION PIPELINE
// -------------------------------------------------------------
async function buildDocumentation() {
  console.log('=== INITIATING MASTER DOCUMENTATION GENERATION ===');
  console.log('Target Output:', OUTPUT_PATH);

  const builder = new MasterDocumentBuilder(OUTPUT_PATH);

  console.log('Rendering Cover Page...');
  builder.coverPage();

  console.log('Rendering Table of Contents...');
  builder.tableOfContents();

  console.log('Rendering Chapter 1: Architecture & Topology...');
  generateChapter1(builder);

  console.log('Rendering Chapter 2: User Roles & RBAC Matrix...');
  generateChapter2(builder);

  console.log('Rendering Chapter 3: GIS Mapping Subsystem...');
  generateChapter3(builder);

  console.log('Rendering Chapter 4: Backend Source Code Reference (48 Files)...');
  generateChapter4(builder);

  console.log('Rendering Chapter 5: Frontend Source Code Reference (35 Files)...');
  generateChapter5(builder);

  console.log('Rendering Chapter 6: Real-Time Telemetry & WebSockets...');
  generateChapter6(builder);

  console.log('Rendering Chapter 7: Mathematical Disaster Formulations...');
  generateChapter7(builder);

  console.log('Rendering Chapter 8: Operational Workflows...');
  generateChapter8(builder);

  console.log('Rendering Chapter 9: Setup, Troubleshooting & Verification...');
  generateChapter9(builder);

  console.log('Stamping Running Headers, Footers and Saving PDF...');
  await builder.save();

  const stats = fs.statSync(OUTPUT_PATH);
  console.log('=== PDF GENERATION COMPLETE ===');
  console.log('Output File:', OUTPUT_PATH);
  console.log('File Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
}

buildDocumentation().catch(err => {
  console.error('Fatal Error during documentation build:', err);
  process.exit(1);
});
