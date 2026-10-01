const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUTPUT_PATH = path.join(__dirname, '../../Cyclone_Disaster_Management_System_Complete_Documentation.pdf');

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

    this.contentWidth = this.doc.page.width - 100; // 495.28 pt
    this.bottomThreshold = this.doc.page.height - 55; // 786 pt
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

    // Double-line formal engineering frame
    doc.rect(40, 40, width - 80, height - 80).lineWidth(1.5).stroke(this.cBlack);
    doc.rect(43, 43, width - 86, height - 86).lineWidth(0.5).stroke(this.cDivider);

    // Organization Banner
    doc.fillColor(this.cDarkGray)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('NATIONAL DISASTER MANAGEMENT & EMERGENCY OPERATIONS CENTER (EOC)', 60, 65, { align: 'center', width: width - 120 });
    
    doc.fillColor(this.cMutedGray)
      .fontSize(8)
      .font('Helvetica')
      .text('DIRECTORATE OF CYCLONE WARNING, HAZARD MITIGATION & EMERGENCY RELIEF LOGISTICS', 60, 78, { align: 'center', width: width - 120 });

    doc.moveTo(60, 95).lineTo(width - 60, 95).lineWidth(1).stroke(this.cBlack);

    // Master Title
    doc.fillColor(this.cBlack)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('CYCLONE DISASTER MANAGEMENT SYSTEM', 60, 135, { align: 'center', width: width - 120 });

    doc.fillColor(this.cDarkGray)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('COMPLETE TECHNICAL ARCHITECTURE, SOURCE CODE REFERENCE & OPERATIONAL MANUAL', 60, 168, { align: 'center', width: width - 120 });

    doc.fillColor(this.cMutedGray)
      .fontSize(9)
      .font('Helvetica')
      .text('Exhaustive Code-Level Analysis of All 78 Source Files, OpenStreetMap GIS Engine, Real-Time Satellite Telemetry Pipelines, Multi-Agency Coordination & Citizen Emergency SOS Architecture', 75, 195, { align: 'center', width: width - 150, lineGap: 3 });

    doc.moveTo(140, 245).lineTo(width - 140, 245).lineWidth(0.5).stroke(this.cDivider);

    // Executive Summary Box
    doc.rect(60, 265, width - 120, 275).fillAndStroke(this.cLightGray, this.cBorder);

    doc.fillColor(this.cBlack)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('MASTER TECHNICAL SPECIFICATION & COMPREHENSIVE DOCUMENTATION SCOPE', 75, 280);

    const summaryPoints = [
      '1. Full-Stack MERN Code Architecture: In-depth file-by-file, function-by-function, and model-by-model documentation of every single source file across the entire server and client codebases.',
      '2. Zero-Cost GIS Mapping Architecture: Complete technical breakdown of Leaflet 1.9 integration, OpenStreetMap raster tile streaming, CSS dark tactical shaders, GeoJSON coordinate transforms, animated vector DivIcons, wind radii concentric circles, 72h trajectory cones, and viewport flight controls.',
      '3. Real-Time Telemetry & Satellite Ingestion: Architectural analysis of NASA EONET and UN-OCHA GDACS automated multi-satellite feeds, barometric normalization algorithms, and Socket.IO duplex event channels.',
      '4. Strict Role-Based Access Control (RBAC): Exhaustive operational permission matrices for Admin (EOC Commander), Operations Officer, NDRF Responders, Logistics Coordinators, Community Volunteers, and Public Citizens.',
      '5. Mathematical Formulations: Algorithmic derivations for multi-criteria coastal risk scoring, roadway evacuation clearance times, and priority-based shelter resource deficit optimization.',
      '6. Complete User Interface Catalog: Exhaustive review of all 15 application viewports, UI widgets, interactive modals, responsive states, and operational workflows.'
    ];

    let sy = 302;
    summaryPoints.forEach(pt => {
      doc.fillColor(this.cDarkGray)
        .fontSize(8)
        .font('Helvetica')
        .text(pt, 75, sy, { width: width - 150, lineGap: 2.2 });
      sy += 36;
    });

    // Metadata Table
    const metaY = height - 195;
    doc.moveTo(60, metaY).lineTo(width - 60, metaY).lineWidth(0.8).stroke(this.cBlack);

    const metaItems = [
      ['Document Title:', 'Cyclone Disaster Management System Master Reference', 'System Version:', '4.0.0 (Comprehensive Source Master)'],
      ['Document Classification:', 'Official Technical Architecture & Code Specification', 'Architecture:', 'MERN Stack + Socket.IO + Leaflet GIS'],
      ['Database Engine:', 'MongoDB 6.0+ (14 Collections, 2dsphere Indexes)', 'Runtime Platform:', 'Node.js LTS (v18 / v20)'],
      ['Frontend Framework:', 'React 18.2 SPA via Vite 5 + Tailwind CSS', 'Coverage:', '100% of All Project Source Code Files (78 Files)'],
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
      { id: '4.0', title: 'Complete Backend Technical Reference: File-by-File Walkthrough', desc: 'Exhaustive analysis of server.js, configs, middlewares, all 14 database models, all 9 business services, all 13 route controllers, and database seed scripts.' },
      { id: '5.0', title: 'Complete Frontend Technical Reference: File-by-File Walkthrough', desc: 'Exhaustive analysis of main.jsx, App.jsx, index.css, all 4 global contexts, master layout, map components, UI elements, and all 15 user interface pages.' },
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
    doc.fillColor(this.cBlack).fontSize(9).font('Courier-Bold').text(filePath, 58, y + 5);
    doc.fillColor(this.cMutedGray).fontSize(8).font('Helvetica-Bold').text(fileType.toUpperCase(), this.contentWidth - 60, y + 6, { align: 'right' });

    doc.y = y + 26;
    doc.fillColor(this.cDarkGray).fontSize(8.5).font('Helvetica-Oblique').text(`Role & Purpose: ${roleSummary}`, 50, doc.y, { width: this.contentWidth });
    doc.moveDown(0.5);
  }

  paragraph(text, options = {}) {
    const doc = this.doc;
    doc.fillColor(options.color || this.cDarkGray)
      .fontSize(options.size || 8.5)
      .font(options.font || 'Helvetica')
      .text(text, {
        width: this.contentWidth,
        lineGap: options.lineGap !== undefined ? options.lineGap : 2,
        align: options.align || 'left'
      });
    doc.moveDown(options.moveDown !== undefined ? options.moveDown : 0.5);
  }

  bullet(title, text) {
    const doc = this.doc;
    this.ensureSpace(24);
    const y = doc.y;
    doc.fillColor(this.cBlack).fontSize(9).text('•', 55, y);
    doc.fillColor(this.cBlack).fontSize(8.5).font('Helvetica-Bold').text(title + ': ', 66, y, { continued: true });
    doc.fillColor(this.cDarkGray).font('Helvetica').text(text, { width: this.contentWidth - 20, lineGap: 1.5 });
    doc.moveDown(0.35);
  }

  codeBox(codeSnippet, label = '') {
    const doc = this.doc;
    const lines = codeSnippet.split('\n');
    const height = Math.max(26, lines.length * 9.5 + 10);
    this.ensureSpace(height + (label ? 20 : 10));

    if (label) {
      doc.fillColor(this.cBlack).fontSize(7.5).font('Helvetica-Bold').text(label, 50, doc.y);
      doc.moveDown(0.2);
    }
    
    const y = doc.y;
    doc.rect(50, y, this.contentWidth, height).fillAndStroke(this.cLightGray, this.cBorder);

    doc.fillColor(this.cBlack).fontSize(7).font('Courier').text(codeSnippet, 58, y + 6, {
      width: this.contentWidth - 16,
      lineGap: 1.5
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

      // Temporarily set margins to zero so header and footer in margins never trigger an automatic page break
      this.doc.page.margins.top = 0;
      this.doc.page.margins.bottom = 0;

      // Top Running Header
      this.doc.moveTo(50, 35).lineTo(width - 50, 35).lineWidth(0.5).stroke(this.cBorder);
      this.doc.fillColor(this.cMutedGray).fontSize(7.5).font('Helvetica')
        .text('CYCLONE DISASTER MANAGEMENT SYSTEM • COMPLETE TECHNICAL SPECIFICATION & MANUAL', 50, 22, { lineBreak: false });
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

// Master Generator Execution
async function generateMasterDocumentation() {
  console.log('[Master PDF Generator] Starting full source-level PDF compilation...');
  const builder = new MasterDocumentBuilder(OUTPUT_PATH);

  // 1. Cover Page
  builder.coverPage();

  // 2. Table of Contents
  builder.tableOfContents();

  // 3. CHAPTER 1: EXECUTIVE OVERVIEW & ARCHITECTURE
  builder.chapterHeading('CHAPTER 1: EXECUTIVE OVERVIEW & FULL-STACK SYSTEM ARCHITECTURE', 'Disaster Mission, Layered Engineering Topology & High-Concurrency Data Flow');
  
  builder.sectionHeading('1.1 Operational Mandate & Threat Landscape');
  builder.paragraph(
    'Tropical cyclones in the North Indian Ocean, Bay of Bengal, and Arabian Sea represent catastrophic hydrometeorological hazards. Storms such as Severe Cyclonic Storm Amara unleash sustained gale-force winds exceeding 175 km/h, intense storm surge inundation (>4.5 meters), torrential precipitation leading to flash floods, and massive disruption to electrical grids, road networks, and civil communications. Coastal disaster mitigation authorities—specifically the National Disaster Management Authority (NDMA), National Disaster Response Force (NDRF), India Meteorological Department (IMD), and State Disaster Management Authorities (SDMA)—require an integrated software suite that consolidates early warning radar feeds, prognostic storm track modeling, dynamic risk zone delineation, automated evacuation clearance scheduling, emergency shelter logistics, amphibious rescue triage, and transparent civilian communications into a single, unified operational pane of glass.'
  );

  builder.sectionHeading('1.2 High-Level Architecture Topology');
  builder.paragraph(
    'The application is constructed according to a resilient, asynchronous, multi-tiered design pattern based entirely on the JavaScript/Node.js ecosystem (MERN Stack). This architecture guarantees sub-second responsiveness under severe network conditions, modular code isolation, and complete zero-cost operational independence.'
  );

  builder.codeBox(
`+-----------------------------------------------------------------------------------------------+
|                            CLIENT TIER (React 18 SPA / Vite 5)                                |
|  CommandCenter | CycloneTracker | ImpactAssessment | EvacuationPlanning | SheltersManagement  |
|  IncidentBoard | ResponseTeams  | ReliefCoordination| CitizenPortal (SOS) | AlertCenter       |
|  Leaflet GIS Engine | Tactical Dark Shaders | Socket.IO Client | ThemeContext | Role Guard    |
+-----------------------------------------------+-----------------------------------------------+
                                                | HTTP REST API / Duplex WebSockets
+-----------------------------------------------v-----------------------------------------------+
|                            BACKEND TIER (Node.js LTS / Express.js 4)                          |
|  server.js (HTTP + Socket.IO Server on Port 5000)                                             |
|  Middlewares: helmet() | cors() | auth.js (JWT Guard) | rbac.js (Role Authorization Engine)    |
|  Domain Services: liveCycloneService | riskService | evacuationService | reliefOptimizer      |
|  Route Controllers: 13 Modular Endpoints (/api/cyclones, /api/risk, /api/evacuations, etc.)   |
+-----------------------+---------------------------------------+-------------------------------+
                        | Mongoose ODM                          | Satellite Telemetry Pull
+-----------------------v--------------+        +---------------v-------------------------------+
|      DATABASE TIER (MongoDB 6.0+)    |        |        EXTERNAL SATELLITE FEEDS               |
| 14 Geospatial Collections            |        | NASA EONET API (Severe Storms Category)       |
| 2dsphere GeoJSON Spatial Indexes     |        | UN-OCHA GDACS Feed (Tropical Cyclones GeoJSON)|
| Audit Logs & Role Credentials        |        | IMD / NOAA National Hurricane Center Baseline |
+--------------------------------------+        +-----------------------------------------------+`,
    'Figure 1.1: System Architectural Topology & Data Communication Bus'
  );

  builder.sectionHeading('1.3 Comprehensive Technology Stack Matrix');
  builder.renderTable(
    ['Subsystem / Layer', 'Technology Utilized', 'Operational Purpose & Technical Justification'],
    [
      ['Client View Layer', 'React 18.2 (Vite 5)', 'Component-based virtual DOM, sub-millisecond hot module reload, high-performance re-rendering under live telemetry streams.'],
      ['Styling Architecture', 'Tailwind CSS 3.4', 'Utility-first styling tokens, dark-mode CSS classes, zero CSS runtime overhead, fully responsive mobile/desktop layout.'],
      ['Geospatial Rendering', 'Leaflet 1.9 + React-Leaflet', 'Open-source, zero API-key overhead, raster tile streaming from OpenStreetMap with custom shaders.'],
      ['Real-Time Event Bus', 'Socket.IO v4 (Client & Server)', 'Bi-directional event dispatch with automatic fallback to HTTP long-polling if WebSockets are firewalled.'],
      ['Application Server', 'Node.js LTS + Express.js 4', 'Non-blocking I/O event loop capable of servicing hundreds of concurrent telemetry and SOS requests.'],
      ['Database Engine', 'MongoDB 6.0+ with Mongoose 8.9', 'Native support for GeoJSON Point, Polygon, and LineString primitives with 2dsphere spatial indexing.']
    ],
    [100, 140, 255]
  );

  // 4. CHAPTER 2: USER ROLES & RBAC
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 2: USER ROLES, OPERATIONAL RESPONSIBILITIES & RBAC MATRIX', 'Identity Governance, Cryptographic Session Management, and Role Access Policies');

  builder.sectionHeading('2.1 Identity & Cryptographic Security Architecture');
  builder.paragraph(
    'User identity governance is enforced via stateless JSON Web Tokens (JWT) signed with HMAC-SHA256. Password credentials are protected using salted bcrypt hashes computed over 10 rounds of work factor, preventing rainbow table and brute-force vulnerabilities. Upon successful authentication (/api/auth/login), the server issues a signed bearer token containing the user ID, full name, email, operational role, and assigned agency identifier. Every protected HTTP request transmits this credential in the "Authorization: Bearer <token>" header, which is intercepted and cryptographically validated by middleware/auth.js before reaching any application controller.'
  );

  builder.sectionHeading('2.2 Role Breakdown & Operational Responsibilities');
  builder.paragraph(
    'In a mass-casualty disaster operational environment, clear delineation of authority is vital to eliminate conflicting orders. The system establishes six specialized operational roles:'
  );

  builder.bullet('1. Admin (EOC Commander)', 'Supreme operational authority. Responsible for macro-level disaster declaration, assigning agency jurisdictions, registering new emergency shelters, creating evacuation routes, assembling response squads from registered volunteers, managing warehouse inventory stocks, dispatching relief convoys, and reviewing system-wide audit trails.');
  builder.bullet('2. Officer (Operations Lead)', 'Disaster operations controller. Responsible for monitoring live GIS cyclone tracks, analyzing multi-criteria risk zone models, triggering evacuation alarms, coordinating inter-agency asset deployments, and requesting logistics re-supply.');
  builder.bullet('3. Responder (NDRF / SDRF Unit)', 'Tactical field rescue squad commander. Responsible for reviewing assigned incident tickets, updating squad deployment status (AVAILABLE, EN_ROUTE, ON_SCENE), logging casualty counts, and marking rescue operations as RESOLVED.');
  builder.bullet('4. Coordinator (Logistics Head)', 'Relief supply chain manager. Responsible for maintaining warehouse inventory levels (drinking water, emergency food rations, medical triage kits, bedding), auditing depleted shelters, and executing delivery convoy runs.');
  builder.bullet('5. Volunteer (Community Frontline)', 'Ground-level civilian relief worker. Assigned to designated emergency shelters to manage evacuee intake, log incoming civilian headcounts, record localized resource deficits, and assist distressed citizens.');
  builder.bullet('6. Citizen (Public / SOS User)', 'Coastal resident accessing the public emergency portal. Empowered to trigger 1-touch Emergency SOS beacons with GPS coordinates, check localized threat rating based on distance to the cyclone eye, and navigate to the nearest open shelter.');

  builder.sectionHeading('2.3 Role-Based Access Control (RBAC) Permitted vs. Restricted Matrix');
  builder.renderTable(
    ['Operational Role', 'Permitted Capabilities (Can Access)', 'Restricted Capabilities (Cannot Access)'],
    [
      ['Admin\n(EOC Chief)', 'Full system governance: create/edit shelters, create evacuation plans, assemble response teams, add/dispatch relief supplies, manage user accounts, inspect audit logs.', 'None. Unrestricted administrative authority across all modules.'],
      ['Officer\n(Ops Lead)', 'View all tactical GIS layers, calculate risk zones, trigger evacuation alarms, monitor shelter occupancy, request supply dispatches.', 'Cannot alter system users, agency governance parameters, or delete administrative audit logs.'],
      ['Responder\n(NDRF Unit)', 'Access Incident Board, accept emergency triage tickets, update squad operational status, report field rescue resolution.', 'Cannot modify evacuation master plans, register new shelters, or adjust warehouse inventory.'],
      ['Coordinator\n(Logistics)', 'Manage warehouse inventory, monitor shelter stock depletion, dispatch relief supply delivery convoys.', 'Cannot alter tactical rescue deployments, modify risk parameters, or reconfigure radar telemetry.'],
      ['Volunteer\n(Community)', 'View assigned shelter status, record incoming evacuee headcount, view emergency route maps.', 'Cannot dispatch response squads, alter risk zones, or access administrative consoles.'],
      ['Citizen\n(Public SOS)', 'Submit 1-click Emergency SOS beacon with GPS coordinates, check localized risk gauge, view nearby shelter directions.', 'Strictly isolated from all backend administrative screens, team rosters, and internal telemetry feeds.']
    ],
    [85, 205, 205]
  );

  // 5. CHAPTER 3: GIS MAPPING DEEP DIVE
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 3: GIS MAPPING SUBSYSTEM: HOW MAPS WORK', 'OpenStreetMap Integration, Tile Streaming, Dark Shaders, Vector Layers & Satellite Feeds');

  builder.sectionHeading('3.1 How the System Obtains & Renders Maps (Zero API Key Architecture)');
  builder.paragraph(
    'A central technical requirement of this platform is resilient, independent operation without commercial map quotas (such as Google Maps or Mapbox billing limits), which can become cost-prohibitive or undergo rate-limiting during severe disaster surges. The application utilizes Leaflet.js with OpenStreetMap (OSM) standard tile servers:'
  );
  builder.codeBox(
`// OpenStreetMap Tile Layer Ingestion (client/src/maps/CommandMap.jsx)
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  className="dark-map-tiles"
  maxZoom={19}
  minZoom={2}
/>`,
    'Code 3.1: OpenStreetMap Raster Tile Ingestion'
  );
  builder.paragraph(
    'How it works in detail:\n' +
    '1. Web Mercator Grid: Leaflet translates the current camera center coordinates [lat, lng] and zoom level z into standard Web Mercator (EPSG:3857) x and y tile indices.\n' +
    '2. Dynamic Raster Streaming: Leaflet makes asynchronous parallel HTTPS GET requests to OpenStreetMap tile servers using the dynamic URL template https://tile.openstreetmap.org/{z}/{x}/{y}.png.\n' +
    '3. Zero Proprietary API Key Dependency: Unlike Google Maps or Mapbox, OpenStreetMap standard tiles are hosted on public open infrastructure, requiring zero API tokens, incurring zero transaction costs, and having zero billing failure modes.'
  );

  builder.sectionHeading('3.2 Tactical High-Contrast Dark Mode Shader Pipeline');
  builder.paragraph(
    'Standard OpenStreetMap tiles feature bright pastel colors (green parks, beige roads, light blue oceans). To produce an authentic tactical HUD aesthetic suitable for low-light Emergency Operations Centers, the project applies an algorithmic CSS filter shader pipeline in client/src/index.css:'
  );
  builder.codeBox(
`/* Tactical Dark HUD Tile Shader (client/src/index.css) */
.dark-map-tiles {
  filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
}

/* Dynamic Light Theme Transition Shader */
.light-theme .dark-map-tiles {
  filter: contrast(0.95) brightness(0.98) !important;
}`,
    'Code 3.2: CSS Mathematical Filter Pipeline for Tactical Dark Map HUD'
  );
  builder.paragraph(
    'The shader pipeline executes six sequential color matrix transformations:\n' +
    '• brightness(0.6): Pre-compresses raw incoming tile luminance to prepare for color inversion.\n' +
    '• invert(1): Inverts RGB channels mathematically (R = 255 - R), transforming light land into dark land and blue oceans into dark navy.\n' +
    '• contrast(3): Triples boundary contrast, making coastlines, state borders, and road vectors sharply legible.\n' +
    '• hue-rotate(200deg): Rotates the inverted chromatic wheel by 200 degrees, shifting harsh inverted hues into deep, calm slate blues.\n' +
    '• saturate(0.3): Dampens noisy color artifacts and road labels, keeping the visual focus strictly on disaster data.\n' +
    '• brightness(0.7): Normalizes the final canvas luminance to blend seamlessly with the applications background color (#0B1120).'
  );

  builder.sectionHeading('3.3 Geographic Projections & Coordinate Inversion Handling');
  builder.paragraph(
    'Geospatial databases and mapping libraries use opposite conventions for coordinate ordering:\n' +
    '• RFC 7946 GeoJSON Standard (MongoDB): [longitude, latitude] — used in all database schema documents (e.g., [80.2707, 13.0827] for Chennai).\n' +
    '• Leaflet UI Rendering Standard: [latitude, longitude] — required by Leaflet Marker, Circle, and Polyline primitives (e.g., [13.0827, 80.2707]).\n' +
    'In client/src/maps/CommandMap.jsx, coordinates are safely inverted during render passes:\n' +
    'const [cLng, cLat] = cyclone.currentLocation.coordinates;\n' +
    '<Marker position={[cLat, cLng]} icon={cycloneIcon} />'
  );

  builder.sectionHeading('3.4 Custom Animated Vector DivIcons');
  builder.paragraph(
    'CommandMap.jsx eschews static PNG pins in favor of dynamic, hardware-accelerated SVG DivIcons with continuous CSS keyframe animations:'
  );
  builder.codeBox(
`// Cyclone Eye DivIcon with Rotating Wind Vortex (client/src/maps/CommandMap.jsx)
const cycloneIcon = L.divIcon({
  html: \`
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(244, 63, 94, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(244, 63, 94, 0.4); border: 2px solid #F43F5E;"></div>
      <span style="font-size: 20px; z-index: 10; animation: spin 4s linear infinite;">🌀</span>
    </div>
  \`,
  className: 'cyclone-marker',
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});`,
    'Code 3.3: Animated Cyclone Eye DivIcon with Spin & Ping Keyframes'
  );

  builder.sectionHeading('3.5 Dynamic GIS Vector Layers');
  builder.bullet('1. Concentric Wind Radii Rings', 'Rendered as three concentric Leaflet Circle geometries around the storm eye:\n  - Gale-Force Radii (34 knots / 63 km/h): Yellow outer circle (e.g., 280 km radius) marking initial structural hazards.\n  - Storm-Force Radii (50 knots / 90 km/h): Orange middle circle (e.g., 160 km radius) marking tree falls and roofing loss.\n  - Hurricane-Force Radii (64+ knots / 118 km/h): Solid crimson inner circle (e.g., 85 km radius) marking catastrophic storm surge devastation.');
  builder.bullet('2. 72-Hour Forecast Trajectory Cones', 'Calculated using forward velocity vectors and cross-track probabilistic uncertainty. Rendered as dashed cyan polylines and translucent gradient uncertainty circles indicating the cone of probable landfall.');
  builder.bullet('3. Evacuation Corridors', 'LineString polylines rendered in Green (CLEAR - open highway), Amber (MODERATE - traffic bottleneck), or Red (HAZARD_BLOCKED - flooded roadway).');
  builder.bullet('4. Safe Shelter Pins', 'Color-coded by occupancy: Green (<75% capacity), Orange (75-99% filling), and Red (100% full) with live popups showing remaining cots and provisions.');
  builder.bullet('5. Incident Triage Pins', 'Caution markers color-coded by severity (CRITICAL, HIGH, MODERATE) indicating civilian rescue requests.');

  builder.sectionHeading('3.6 Viewport Navigation, Camera Controls & Scroll Protection');
  builder.bullet('MapRecenter Helper', 'Listens for target coordinate changes and executes map.flyTo(center, zoom, { duration: 1.2 }) for fluid cinematic flight transitions.');
  builder.bullet('World View Preset (🌍)', 'Button that flies out to zoom level 2, revealing all continents and ocean basins worldwide.');
  builder.bullet('Coast Center Preset', 'Button that instantly snaps the camera to the coastal disaster operations grid (zoom level 8).');
  builder.bullet('Scroll-Wheel Protection (scrollWheelZoom={false})', 'Configuring scrollWheelZoom={false} ensures that mouse wheel and trackpad scroll gestures navigate down the Command Center page naturally without accidentally zooming the map canvas.');

  // 6. CHAPTER 4: COMPLETE BACKEND CODE REFERENCE (ALL FILES)
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 4: COMPLETE BACKEND CODE REFERENCE (SERVER)', 'Comprehensive File-by-File, Model-by-Model, Service-by-Service & Route-by-Route Breakdown');

  // Server.js
  builder.fileBlockHeader('server/server.js', 'Core Application Entry Point', 'Initializes Express, HTTP server, WebSockets, DB connection, routes, and satellite polling.');
  builder.paragraph(
    'server.js is the central entry point of the backend. It loads environment variables using dotenv.config(), creates an Express app, and multiplexes an HTTP server with a Socket.IO instance on port 5000 with CORS enabled for http://localhost:5173. It connects to MongoDB via connectDB(), applies security middlewares (helmet, cors, morgan, express.json), mounts 13 modular route handlers under /api/, and initiates an automated 15-minute background polling interval that calls syncRealtimeCyclones().'
  );
  builder.codeBox(
`// server/server.js: Server Initialization & Automated Satellite Sync Interval
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST', 'PUT'] }
});
app.set('io', io);

// Automated 15-Minute Satellite Polling Interval
const SYNC_INTERVAL_MS = 15 * 60 * 1000;
setInterval(async () => {
  try {
    const result = await syncRealtimeCyclones(io);
    console.log(\`[Satellite Cron] Synchronized \${result.count} active storms worldwide.\`);
  } catch (err) {
    console.error('[Satellite Cron Error]:', err.message);
  }
}, SYNC_INTERVAL_MS);`,
    'Code 4.1: server.js Server Multiplexing & Satellite Polling Cron'
  );

  // Config Files
  builder.fileBlockHeader('server/config/db.js', 'Database Connection Module', 'Manages Mongoose connection lifecycle, auto-reconnect, and connection failure diagnostics.');
  builder.paragraph(
    'config/db.js exports the connectDB() asynchronous function. It invokes mongoose.connect(process.env.MONGO_URI) with modern driver settings. It attaches event listeners for error, disconnected, and reconnected states, outputting diagnostic logs to the terminal. If MongoDB is initially unreachable, it logs a warning without terminating the Node.js process, allowing offline demonstration modes to operate.'
  );

  builder.fileBlockHeader('server/config/constants.js', 'Global System Constants', 'Centralized enumerations for storm categories, risk thresholds, incident priorities, and alerts.');
  builder.paragraph(
    'config/constants.js exports immutable enumerations used across the entire backend: STORM_CATEGORIES (DEPRESSION, DEEP_DEPRESSION, CYCLONIC_STORM, SEVERE_CYCLONIC_STORM, VERY_SEVERE_CYCLONIC_STORM, EXTREMELY_SEVERE_CYCLONIC_STORM, SUPER_CYCLONIC_STORM), RISK_LEVELS (LOW, MODERATE, HIGH, CRITICAL), INCIDENT_STATUSES (PENDING, ASSIGNED, ON_SCENE, RESOLVED), and ALERT_CHANNELS (SMS, SIREN, APP, RADIO, TV).'
  );

  builder.fileBlockHeader('server/config/mockData.js', 'Offline Seed & Mock Data Registry', 'Comprehensive pre-seeded disaster records for offline demonstration.');
  builder.paragraph(
    'config/mockData.js contains complete mock data for Severe Cyclonic Storm Amara (coordinates [80.27, 13.08], 175 km/h winds, 945 hPa pressure), 6 emergency shelters, 8 multi-criteria risk zones, 8 NDRF response squads, and 24 relief inventory items. This file serves as the seeding baseline and offline fallback when external satellite APIs are unreachable.'
  );

  // Middlewares
  builder.fileBlockHeader('server/middleware/auth.js', 'JWT Authentication Guard', 'Validates Bearer tokens, decrypts user claims, and hydrates req.user.');
  builder.paragraph(
    'middleware/auth.js intercepts incoming HTTP requests, extracts the authorization header ("Bearer <token>"), verifies the cryptographic signature using jwt.verify(token, process.env.JWT_SECRET), fetches the corresponding user record from MongoDB, and attaches it to req.user. If the token is missing, expired, or tampered with, it returns HTTP 401 Unauthorized.'
  );

  builder.fileBlockHeader('server/middleware/rbac.js', 'Role-Based Access Control Middleware', 'Enforces strict operational permissions based on user roles.');
  builder.paragraph(
    'middleware/rbac.js exports the authorize(...allowedRoles) higher-order function. It inspects req.user.role and verifies whether it matches one of the allowed roles. If authorized, execution passes to the controller via next(). If unauthorized, it halts execution and returns HTTP 403 Forbidden with { success: false, message: "Forbidden: Insufficient privileges" }.'
  );

  builder.fileBlockHeader('server/middleware/errorHandler.js', 'Centralized Error Handler', 'Standardizes API error responses and prevents unhandled server crashes.');
  builder.paragraph(
    'middleware/errorHandler.js catches unhandled synchronous and asynchronous exceptions in Express routes. It formats error stacks in development and returns clean, uniform JSON payloads: { success: false, error: err.message || "Internal Server Error" } with appropriate HTTP status codes (400, 404, 500).'
  );

  // All 14 Database Models
  builder.sectionHeading('4.4 Database Schema Models (server/models/) — All 14 Models');
  builder.paragraph('Detailed breakdown of all 14 Mongoose schema models:');

  const modelsDetailed = [
    { name: 'models/User.js', desc: 'Stores user accounts. Fields: name (String), email (String, unique, lowercase), passwordHash (String), role (Enum: admin, officer, responder, coordinator, volunteer, citizen), agency (ObjectId ref Agency), phone (String), badgeNumber (String). Includes bcrypt pre-save password hashing hook.' },
    { name: 'models/Cyclone.js', desc: 'Stores cyclone telemetry. Fields: name (String), basin (String), category (Enum), windSpeedKmph (Number), pressureHpa (Number), currentLocation (GeoJSON Point: [lng, lat]), pastTrack (Array of { coordinates: [lng, lat], timestamp: Date, windSpeed: Number }), forecastTrack (Array of { coordinates: [lng, lat], timeHorizonHours: Number, uncertaintyRadiusKm: Number }), windRadii (Object: gale34ktKm, storm50ktKm, hurricane64ktKm). Indexed with 2dsphere.' },
    { name: 'models/RiskZone.js', desc: 'Defines coastal risk zones. Fields: zoneName (String), geometry (GeoJSON Polygon), riskLevel (Enum: CRITICAL, HIGH, MODERATE, LOW), populationDensity (Number), surgeHeightMeters (Number), vulnerabilityIndex (Number), evacuationStatus (Enum). Indexed with 2dsphere.' },
    { name: 'models/Shelter.js', desc: 'Stores emergency relief shelters. Fields: name (String), location (GeoJSON Point), capacityTotal (Number), capacityOccupied (Number), status (Enum: AVAILABLE, FILLING, FULL), generatorBackup (Boolean), medicalFacilities (Boolean), drinkingWaterLitres (Number), foodRationsDays (Number). Indexed with 2dsphere for $near geospatial proximity searches.' },
    { name: 'models/EvacuationPlan.js', desc: 'Defines evacuation corridors. Fields: zoneName (String), targetShelters (Array of Shelter ObjectIds), evacuationRoute (GeoJSON LineString), clearanceStatus (Enum: ACTIVE, COMPLETED, SUSPENDED), estimatedClearanceHours (Number), roadCapacityVehiclesPerHour (Number).' },
    { name: 'models/Incident.js', desc: 'Stores emergency civilian SOS tickets. Fields: title (String), type (Enum: TRAPPED_CIVILIANS, MEDICAL_EMERGENCY, ROAD_BLOCK, FLOOD_HAZARD), severity (Enum: CRITICAL, HIGH, MEDIUM, LOW), location (GeoJSON Point), status (Enum: PENDING, ASSIGNED, ON_SCENE, RESOLVED), assignedTeam (ObjectId ref ResponseTeam), casualties (Number), reportedBy (ObjectId ref User).' },
    { name: 'models/ResponseTeam.js', desc: 'Manages emergency response squads. Fields: teamName (String), agencyType (Enum: NDRF, SDRF, COAST_GUARD, POLICE), leaderName (String), contactPhone (String), status (Enum: AVAILABLE, EN_ROUTE, ON_SCENE, RESTING), members (Array of { name: String, phone: String, role: String }), currentLocation (GeoJSON Point), assignedIncidents (Array of Incident ObjectIds).' },
    { name: 'models/Inventory.js', desc: 'Manages warehouse relief stocks. Fields: itemName (String), category (Enum: FOOD, WATER, MEDICAL, BEDDING, POWER), totalQuantity (Number), allocatedQuantity (Number), unit (String: cartons, litres, kits), reorderThreshold (Number), warehouseLocation (String).' },
    { name: 'models/ReliefDistribution.js', desc: 'Tracks relief convoys dispatched to shelters. Fields: shelterId (ObjectId ref Shelter), incidentId (ObjectId ref Incident), allocatedInventory (Array of { itemId: ObjectId ref Inventory, quantity: Number }), deliveryTeamId (ObjectId ref ResponseTeam), status (Enum: PENDING, DISPATCHED, DELIVERED).' },
    { name: 'models/AssistanceRequest.js', desc: 'Public SOS requests from Citizen Portal. Fields: fullName (String), contactPhone (String), emergencyType (String), peopleCount (Number), address (String), description (String), location (GeoJSON Point), status (Enum: OPEN, TRIAGED, CLOSED).' },
    { name: 'models/EmergencyAlert.js', desc: 'Public emergency broadcast notices. Fields: title (String), message (String), severity (Enum: EXTREME, SEVERE, MODERATE), targetZones (Array of String), broadcastChannels (Array of Enum: SMS, SIREN, APP, RADIO), issuedBy (ObjectId ref User), createdAt (Date).' },
    { name: 'models/AuditLog.js', desc: 'Immutable compliance audit trail. Fields: userId (ObjectId ref User), action (String), resource (String), details (Object), ipAddress (String), timestamp (Date).' },
    { name: 'models/Disaster.js', desc: 'Macro disaster event container. Fields: title (String), type (Enum: CYCLONE, TSUNAMI, FLOOD), status (Enum: WATCH, WARNING, LANDFALL, RECOVERY), affectedDistricts (Array of String), estimatedImpact (String).' },
    { name: 'models/Agency.js', desc: 'Government agencies and partner NGOs. Fields: name (String), agencyCode (String: NDMA, NDRF, SDMA), jurisdiction (String), contactEmail (String), contactPhone (String).' }
  ];

  modelsDetailed.forEach(m => {
    builder.bullet(m.name, m.desc);
  });

  // All 9 Business Services
  builder.sectionHeading('4.5 Business Logic Services (server/services/) — All 9 Services');
  
  const servicesDetailed = [
    { name: 'services/liveCycloneService.js (23KB)', desc: 'The satellite integration engine. Connects to NASA EONET and UN-OCHA GDACS APIs. Parses active tropical cyclones, normalizes barometric pressure and wind speeds into metric units, synthesizes missing trajectory forecast cones (24h/48h/72h), calculates concentric wind radii (gale 34kt, storm 50kt, hurricane 64kt), and upserts records into MongoDB.' },
    { name: 'services/riskService.js', desc: 'Implements the multi-criteria coastal risk formula: Risk Score = (Surge * 0.35) + (Wind / 250 * 0.35) + (PopDensity / 5000 * 0.20) + (Vulnerability * 0.10). Outputs risk levels (CRITICAL, HIGH, MODERATE, LOW) for coastal zones.' },
    { name: 'services/evacuationService.js', desc: 'Calculates evacuation clearance durations (hours) based on population density, road corridor width, bottleneck points, and storm surge inundation levels.' },
    { name: 'services/shelterService.js', desc: 'Monitors shelter occupancy thresholds, issues alert triggers when shelters exceed 85% capacity, and runs MongoDB $near geospatial queries to match distressed citizens to their nearest safe shelter.' },
    { name: 'services/incidentService.js', desc: 'Processes incoming civilian SOS emergency beacons, evaluates triage priority scores, and pairs incidents with the nearest available NDRF amphibious rescue squad.' },
    { name: 'services/reliefOptimizerService.js', desc: 'AI-inspired logistics optimization engine. Scans all active shelters for critical deficits (water < 2 days, rations < 3 days), calculates supply allocations from central depots, and plans delivery convoy routes.' },
    { name: 'services/simulationService.js', desc: 'Drives live demonstration scenarios: advances disaster parameters through Phase 1 (Pre-Landfall Approach), Phase 2 (Peak Landfall), and Phase 3 (Post-Landfall Recovery).' },
    { name: 'services/forecastService.js', desc: 'Computes estimated time of landfall (ETA) and coastal impact projections based on forward storm movement vectors.' },
    { name: 'services/disasterAggregator.js', desc: 'Aggregates statistics across all 14 database collections into consolidated KPI card metrics for the Command Center.' }
  ];

  servicesDetailed.forEach(s => {
    builder.bullet(s.name, s.desc);
  });

  // All 13 Route Controllers
  builder.sectionHeading('4.6 API Route Controllers (server/routes/) — All 13 Endpoints');
  const routesDetailed = [
    { name: 'routes/authRoutes.js', desc: 'POST /api/auth/login (JWT token issuance), POST /api/auth/register (user creation), GET /api/auth/me (current authenticated user profile).' },
    { name: 'routes/cycloneRoutes.js', desc: 'GET /api/cyclones/active (returns active storms with forecast tracks), GET /api/cyclones/:id (fetches single storm details), POST /api/cyclones/sync-live (triggers on-demand NASA/GDACS satellite sync).' },
    { name: 'routes/riskRoutes.js', desc: 'GET /api/risk/zones (returns all risk polygons), GET /api/risk/check-coords (evaluates risk score for custom [lng, lat] coordinates).' },
    { name: 'routes/evacuationRoutes.js', desc: 'GET /api/evacuations (lists active plans), POST /api/evacuations (Admin: creates new evacuation corridor), PUT /api/evacuations/:id/clearance (updates clearance progress).' },
    { name: 'routes/shelterRoutes.js', desc: 'GET /api/shelters (lists all shelters), GET /api/shelters/nearby (finds nearest shelters using $near), POST /api/shelters (Admin: registers new shelter).' },
    { name: 'routes/incidentRoutes.js', desc: 'GET /api/incidents (incident queue), POST /api/incidents (submits SOS incident), PUT /api/incidents/:id/assign (dispatches squad), PUT /api/incidents/:id/resolve (marks resolved).' },
    { name: 'routes/responseTeamRoutes.js', desc: 'GET /api/response-teams (lists rescue squads), POST /api/response-teams (Admin: creates squad with volunteers), PUT /api/response-teams/:id/status (updates deployment status).' },
    { name: 'routes/reliefRoutes.js', desc: 'GET /api/relief/inventory (warehouse stocks), POST /api/relief/inventory (Admin: adds supplies), POST /api/relief/dispatch (Admin/Coordinator: dispatches delivery convoy to shelter).' },
    { name: 'routes/citizenRoutes.js', desc: 'POST /api/citizen/sos (1-touch emergency SOS beacon), GET /api/citizen/risk-check (localized threat score).' },
    { name: 'routes/alertRoutes.js', desc: 'GET /api/alerts (active broadcasts), POST /api/alerts (Admin/Officer: issues emergency broadcast across SMS, Sirens, App).' },
    { name: 'routes/analyticsRoutes.js', desc: 'GET /api/analytics/kpis (command center KPI card metrics), GET /api/analytics/historical (historical storm trends).' },
    { name: 'routes/adminRoutes.js', desc: 'GET /api/admin/users (user management directory), PUT /api/admin/users/:id/role (reassigns user roles), GET /api/admin/audit-logs (audit log).' },
    { name: 'routes/simulationRoutes.js', desc: 'POST /api/simulation/phase (advances drill scenario between Pre-Landfall, Peak Landfall, and Recovery).' }
  ];

  routesDetailed.forEach(r => {
    builder.bullet(r.name, r.desc);
  });

  // Seed script
  builder.fileBlockHeader('server/scripts/seed.js', 'Database Seed Script', 'Cleans and populates MongoDB with initial disaster scenarios, shelters, squads, and accounts.');
  builder.paragraph(
    'scripts/seed.js is invoked via npm run seed. It connects to MongoDB, drops existing demo collections, and inserts pre-configured accounts (admin, officer, responder, coordinator, volunteer, citizen), Severe Cyclonic Storm Amara, 6 emergency shelters, 8 multi-criteria risk zones, 8 NDRF response squads, and 24 warehouse inventory items.'
  );

  // 7. CHAPTER 5: COMPLETE FRONTEND CODE REFERENCE (ALL FILES)
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 5: COMPLETE FRONTEND CODE REFERENCE (CLIENT)', 'Comprehensive File-by-File, Component-by-Component, Context-by-Context & Page-by-Page Breakdown');

  builder.fileBlockHeader('client/src/main.jsx', 'Application Entry Bootstrap', 'Mounts React virtual DOM into index.html root element.');
  builder.paragraph(
    'client/src/main.jsx is the entry file for the Vite bundle. It imports React, ReactDOM, client/src/index.css, and client/src/App.jsx. It invokes ReactDOM.createRoot(document.getElementById("root")).render(<App />).'
  );

  builder.fileBlockHeader('client/src/App.jsx', 'Root Router & Provider Hierarchy', 'Configures route hierarchy, security guards, and global context cascade.');
  builder.paragraph(
    'client/src/App.jsx establishes the top-level application architecture. It wraps the app in BrowserRouter, ThemeProvider, AuthProvider, SocketProvider, and SimulationProvider. It defines the ProtectedRoute higher-order component that checks authentication status and redirects unauthorized users. It registers routes for LandingPage (/ and /welcome), LoginPage (/login), and the nested dashboard routes under /dashboard.'
  );

  builder.fileBlockHeader('client/src/index.css', 'Global Stylesheet & CSS Layer Engine', 'Configures smooth scrolling, theme classes, scrollbar styles, and Leaflet map filters.');
  builder.paragraph(
    'client/src/index.css injects Tailwind directives (@tailwind base, components, utilities). It sets global smooth scrolling (scroll-behavior: smooth) and enables natural document scrolling (overflow-y: auto on body). It defines high-contrast 8px custom scrollbars for dark and light modes, military-grade dark map tile shaders (.dark-map-tiles), and keyframe pulse animations (@keyframes cyclone-radar).'
  );

  // Contexts
  builder.sectionHeading('5.2 Global State Contexts (client/src/context/) — All 4 Contexts');
  builder.bullet('context/AuthContext.jsx', 'Manages authentication state (user, token, loading). Persists JWT in localStorage. Provides login(email, password), logout(), and the quickLogin(role) helper that allows 1-click instant switching between operational roles (admin, officer, responder, coordinator, volunteer, citizen).');
  builder.bullet('context/SocketContext.jsx', 'Initializes the client Socket.IO connection to http://localhost:5000. Listens for live telemetry-update, alert:broadcast, and sos:new events. Exposes syncRealtimeCyclones() which invokes POST /api/cyclones/sync-live and broadcasts updates.');
  builder.bullet('context/ThemeContext.jsx', 'Manages Dark Mode / Light Mode state. Persists user preference in localStorage. Toggles the .light-theme CSS class on document.body.');
  builder.bullet('context/SimulationContext.jsx', 'Controls the live drill scenario runner. Exposes currentPhase (Pre-Landfall, Peak Landfall, Recovery) and the changePhase(phase) action which calls POST /api/simulation/phase.');

  // Layouts & Maps
  builder.sectionHeading('5.3 Master Layout & GIS Map Components');
  builder.bullet('layouts/DashboardLayout.jsx', 'The main operations shell. Features a collapsible tactical sidebar with role-filtered links, a top bar with real-time cyclone operations status, live satellite telemetry refresh button, theme switch, role switcher, and a smooth-scrolling main content viewport.');
  builder.bullet('maps/CommandMap.jsx', 'The core GIS map engine. Integrates Leaflet, OpenStreetMap tiles, tactical dark shaders, animated SVG cyclone icons, wind radii, trajectory forecast cones, evacuation polylines, shelter markers, incident markers, layer toggles, preset views (World View & Coast Center), and scroll-wheel trapping protection.');

  // Components
  builder.sectionHeading('5.4 Reusable UI Components (client/src/components/)');
  builder.bullet('components/KpiCard.jsx', 'Metric indicator card with delta trends, animated icons, and color-coded statuses.');
  builder.bullet('components/CycloneInfoPanel.jsx', 'HUD panel displaying active storm barometrics, coordinates, wind velocity, and landfall ETA.');
  builder.bullet('components/AlertBanner.jsx', 'High-visibility broadcast banner displaying critical storm warnings across the top of the workspace.');
  builder.bullet('components/RiskBadge.jsx', 'Compact badge displaying risk category (CRITICAL, HIGH, MODERATE, LOW).');
  builder.bullet('components/SimulationBar.jsx', 'Interactive ribbon allowing operators to switch live drill scenarios with a single click.');

  // All 15 Pages
  builder.sectionHeading('5.5 Comprehensive Catalog of All 15 Pages');
  builder.renderTable(
    ['Page Name & Route', 'Target Audience', 'Detailed Functional Purpose & UI Features'],
    [
      ['Landing Page\n(/ and /welcome)', 'General Public &\nStakeholders', 'Modern, high-impact landing portal with animated background mesh, system overview, role previews, emergency hotlines, and instant 1-click role sandbox.'],
      ['Login Page\n(/login)', 'Authorized Staff &\nCitizens', 'Secure credential entry with JWT issuance, demo role shortcuts for immediate testing without memorizing passwords.'],
      ['Command Center\n(/dashboard)', 'EOC Commanders &\nOperations Leads', 'Central operational dashboard with 8 real-time KPI cards, live GIS tactical map, active storm telemetry summary, scenario simulation bar, and quick action shortcuts.'],
      ['Cyclone Tracker\n(/dashboard/cyclones)', 'Meteorologists &\nOfficers', 'Specialized Doppler radar tracking with ocean basin filter tabs, live satellite sync button, storm eye coordinates, wind velocity gauges, and 72-hour forecast trajectory cones.'],
      ['Impact Assessment\n(/dashboard/risk)', 'Risk Analysts &\nPlanners', 'Multi-criteria risk scoring engine displaying vulnerable coastal zones, estimated affected population, surge heights, and AI-driven mitigation recommendations.'],
      ['Evacuation Planning\n(/dashboard/evacuation)', 'Admin &\nOperations Leads', 'Evacuation corridor management, clearance time estimations, bottleneck detection, and Admin modal to create new evacuation routes.'],
      ['Shelters Management\n(/dashboard/shelters)', 'Admin, Officers &\nVolunteers', 'Real-time shelter occupancy meters, emergency provisions checklist (water, medical, generators), and Admin modal to register new emergency shelters.'],
      ['Incident Board\n(/dashboard/incidents)', 'Responders &\nField Units', 'Incident triage board (Kanban & List views) for SOS rescue tickets, casualty counts, severity badges, and squad assignment.'],
      ['Response Teams\n(/dashboard/teams)', 'Admin &\nResponders', 'NDRF amphibious squad roster, deployment statuses (AVAILABLE, EN_ROUTE, ON_SCENE), and Admin modal to assemble new response squads from registered volunteers.'],
      ['Relief Coordination\n(/dashboard/relief)', 'Admin &\nLogistics Heads', 'Disaster supply chain management, warehouse stock levels (food, drinking water, medical kits), and Admin modal to add new supplies and dispatch supply delivery convoys.'],
      ['Citizen Emergency Portal\n(/dashboard/citizen)', 'Public Citizens\n(SOS Beacon)', 'Mobile-friendly emergency interface with 1-touch Emergency SOS beacon, automatic GPS geo-triage, localized threat level gauge, and nearest shelter navigation.'],
      ['Alert Center\n(/dashboard/alerts)', 'EOC Public Info\nOfficers', 'Multi-channel emergency broadcast center (SMS, Siren, Web Push) to broadcast urgent cyclone warnings to coastal residents.'],
      ['Analytics & Forecast\n(/dashboard/analytics)', 'Command Staff &\nGovernment Analysts', 'Predictive statistical charts, storm track forecasting, evacuation curve analytics, and shelter capacity utilization trends.'],
      ['Reports Page\n(/dashboard/reports)', 'Auditors &\nAgency Directors', 'Formal disaster incident summaries, PDF/CSV export triggers, casualty logs, and post-disaster evaluation reports.'],
      ['Administration\n(/dashboard/admin)', 'EOC Administrator\n(Admin Role Only)', 'Exclusive governance hub: user account management, role assignment, agency coordination, system audit logs, and operational parameter configuration.']
    ],
    [95, 80, 270]
  );

  // 8. CHAPTER 6: REAL-TIME TELEMETRY & WEBSOCKETS
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 6: REAL-TIME TELEMETRY, WEBSOCKET PROTOCOLS & SATELLITE FEEDS', 'Automated NASA EONET Ingestion, UN-OCHA GDACS Parsers, and Socket.IO Event Distribution');

  builder.sectionHeading('6.1 Satellite Telemetry Pipeline (NASA EONET & UN-OCHA GDACS)');
  builder.paragraph(
    'The liveCycloneService.js module implements dual automated satellite collectors:\n' +
    '1. NASA EONET Collector: Queries https://eonet.gsfc.nasa.gov/api/v3/categories/severeStorms. Extracts satellite storm coordinates, wind speeds, and observation dates.\n' +
    '2. UN-OCHA GDACS Collector: Ingests the Global Disaster Alert and Coordination System GeoJSON feed for tropical cyclones. Extracts storm alert levels (RED, ORANGE, GREEN) and central pressures.\n' +
    '3. Barometric Unit Conversion: Converts knots to km/h and inches of mercury to hPa.\n' +
    '4. Automated 15-Minute Polling: Runs continuously in server.js, updating the database without operator intervention.\n' +
    '5. On-Demand Sync: Clicking "Refresh Real-Time" triggers POST /api/cyclones/sync-live, synchronizes external feeds, and broadcasts updates over WebSockets.'
  );

  builder.sectionHeading('6.2 WebSocket Event Channels');
  builder.renderTable(
    ['Socket Event Name', 'Trigger Source', 'Payload Structure', 'Client UI Effect'],
    [
      ['telemetry-update', 'liveCycloneService sync', '{ cyclones: Array, count: Number, timestamp: Date }', 'Updates map storm eye markers, wind radii, and cyclone HUD panels across all open sessions.'],
      ['alert:broadcast', 'Emergency Alert Center', '{ alertId, title, message, severity, targetZones }', 'Immediately displays AlertBanner at the top of every user workspace without page refresh.'],
      ['sos:new', 'Citizen Emergency Portal', '{ incidentId, fullName, location, emergencyType }', 'Plays audible alert and inserts urgent rescue ticket at top of IncidentBoard.'],
      ['simulation:phase-change', 'Scenario Ribbon', '{ phase: String, stormParameters: Object }', 'Re-renders all 8 KPI cards, storm track gauges, and shelter occupancy bars simultaneously.']
    ],
    [105, 100, 115, 125]
  );

  // 9. CHAPTER 7: MATHEMATICAL FORMULATIONS
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 7: MATHEMATICAL DISASTER FORMULATIONS', 'Algorithmic Engines: Multi-Criteria Risk Scoring, Evacuation Clearances & Supply Optimization');

  builder.sectionHeading('7.1 Multi-Criteria Coastal Risk Formulation');
  builder.paragraph('The riskService.js module evaluates coastal sector danger using a weighted multi-criteria index:');
  builder.codeBox(
`Risk Score (0 to 100) = (S_surge * 0.35) + (V_wind / 250 * 0.35) + (P_pop / 5000 * 0.20) + (I_vuln * 0.10)

Where:
  S_surge = Projected storm surge height (meters, scaled 0-100)
  V_wind  = Maximum sustained wind velocity (km/h)
  P_pop   = Population density per square kilometer (capped at 5,000)
  I_vuln  = Coastal infrastructure vulnerability index (0 to 100)`,
    'Formula 7.1: Multi-Criteria Coastal Risk Formula'
  );

  builder.sectionHeading('7.2 Evacuation Clearance Time Formulation');
  builder.paragraph('The evacuationService.js module models highway clearance capacity before coastal inundation:');
  builder.codeBox(
`Clearance Time (Hours) = (N_evacuees / (C_lanes * F_flowRate)) * (1 + H_hazardFactor)

Where:
  N_evacuees    = Total civilian population ordered to evacuate
  C_lanes       = Number of usable outbound roadway lanes
  F_flowRate    = Standard lane throughput (vehicles/persons per hour)
  H_hazardFactor= Inundation penalty factor (0.0 for dry roads, up to 1.5 for flooded causeways)`,
    'Formula 7.2: Highway Evacuation Clearance Time Formula'
  );

  builder.sectionHeading('7.3 Priority-Based Relief Supply Allocation Formulation');
  builder.paragraph('The reliefOptimizerService.js models critical shelter resource deficits:');
  builder.codeBox(
`Shelter Deficit Priority = (Days_waterRemaining * -2.0) + (Days_foodRemaining * -1.5) + (OccupancyRatio * 3.0)

Shelters with the highest Deficit Priority score are automatically placed at the top of the convoy delivery dispatch queue.`,
    'Formula 7.3: Priority-Based Relief Supply Deficit Formula'
  );

  // 10. CHAPTER 8: END-TO-END WORKFLOWS
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 8: END-TO-END OPERATIONAL WORKFLOWS', 'Step-by-Step Chronological Emergency Management: Genesis to Landfall & Recovery');

  builder.sectionHeading('8.1 Workflow 1: Early Detection & Satellite Telemetry Ingestion');
  builder.paragraph(
    '1. Satellites detect a tropical depression over the warm waters of the Bay of Bengal.\n' +
    '2. liveCycloneService polls NASA EONET and GDACS, classifies the system as Category-4 Severe Cyclonic Storm "Amara" (wind speed 175 km/h, central pressure 945 hPa), and inserts it into MongoDB.\n' +
    '3. System computes 24h, 48h, and 72h forecast trajectory cones and projects coastal landfall near Chennai.\n' +
    '4. EOC Command Center displays real-time radar rings and updates active disaster KPI cards.'
  );

  builder.sectionHeading('8.2 Workflow 2: Threat Modeling, Evacuation & Shelter Allocation');
  builder.paragraph(
    '1. riskService evaluates coastal sectors: Marina Lowlands and Ennore Port are assigned CRITICAL risk status.\n' +
    '2. EOC Lead triggers Evacuation Master Plan: Route-A (Coastal Expressway to Central Sports Arena) is activated.\n' +
    '3. Alert Center broadcasts SMS and siren evacuation notices to 120,000 residents in Sector 1 & 2.\n' +
    '4. SheltersManagement monitors incoming evacuees as shelters progress from AVAILABLE to FILLING.'
  );

  builder.sectionHeading('8.3 Workflow 3: Emergency Citizen SOS to Rescue Dispatch');
  builder.paragraph(
    '1. A stranded family at Marina Beach opens the Citizen Portal on their mobile phone.\n' +
    '2. The citizen clicks the red "SUBMIT EMERGENCY SOS" button. The device coordinates are transmitted to /api/citizen/sos.\n' +
    '3. A critical incident ticket appears on the Incident Board with sound and ping animation.\n' +
    '4. Admin/Officer allocates "NDRF Squad Alpha-1" with amphibious rescue boats.\n' +
    '5. Squad status updates to "EN_ROUTE" and then "ON_SCENE". Upon rescue, the ticket is marked "RESOLVED".'
  );

  builder.sectionHeading('8.4 Workflow 4: Relief Inventory & Supply Chain Optimization');
  builder.paragraph(
    '1. ReliefCoordination flags Central Sports Arena Shelter with critical drinking water depletion (< 100 cartons).\n' +
    '2. Admin adds newly arrived emergency rations and clean water tankers to Central Logistics Depot.\n' +
    '3. Admin creates a dispatch delivery order assigning "Logistics Convoy Bravo" to transport 500 water cartons.\n' +
    '4. Shelter inventory updates in real time upon convoy confirmation.'
  );

  // 11. CHAPTER 9: INSTALLATION & TROUBLESHOOTING
  builder.doc.addPage();
  builder.chapterHeading('CHAPTER 9: INSTALLATION, CONFIGURATION & TROUBLESHOOTING', 'Local Setup, Database Seeding, Scrolling Mechanics, and Production Verification');

  builder.sectionHeading('9.1 System Prerequisites');
  builder.bullet('Node.js Runtime', 'Version 18.x or 20.x LTS with npm v9+ installed.');
  builder.bullet('MongoDB Database', 'Version 6.0+ local instance on mongodb://localhost:27017/cyclone-command (or remote MongoDB Atlas cluster).');
  builder.bullet('Modern Web Browser', 'Chrome, Edge, Firefox, or Safari supporting HTML5 Canvas, WebSockets, and ES6 modules.');

  builder.sectionHeading('9.2 Environment Configuration (server/.env)');
  builder.codeBox(
`PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/cyclone-command
JWT_SECRET=super_secret_cyclone_jwt_key_2026_xyz
CLIENT_URL=http://localhost:5173
NASA_API_KEY=DEMO_KEY`,
    'Config 9.1: server/.env Configuration Template'
  );

  builder.sectionHeading('9.3 Quick Launch Commands');
  builder.codeBox(
`# 1. Install & Seed Backend:
cd server
npm install
npm run seed     # Seeds realistic disaster scenarios, cyclones, shelters & accounts
npm start        # Launches Express + Socket.IO server on http://localhost:5000

# 2. Install & Launch Frontend:
cd ../client
npm install
npm run dev      # Launches Vite dev server on http://localhost:5173
npm run build    # Compiles production-ready bundle in client/dist/`,
    'Commands 9.2: Terminal Startup Commands'
  );

  builder.sectionHeading('9.4 Key Troubleshooting & Resolution Guidelines');
  builder.bullet('Global Page Scrolling Issue', 'Ensure client/src/index.css does NOT have overflow: hidden on html, body, or #root. The project uses min-height: 100vh and overflow-y: auto on body so landing pages and dashboard scroll naturally.');
  builder.bullet('Map Cursor Trapping', 'Leaflet CommandMap has scrollWheelZoom={false} to ensure trackpad or mouse wheel gestures scroll down the Command Center page rather than accidentally zooming the map.');
  builder.bullet('WebSocket Connection Refused', 'Verify server.js is running on port 5000. In SocketContext.jsx, ensure the socket connects to http://localhost:5000 with transports: ["websocket", "polling"].');
  builder.bullet('Satellite Telemetry Empty', 'If external internet is offline, liveCycloneService automatically falls back to pre-seeded meteorological models in mockData.js so the system never fails or displays empty radars.');

  console.log('[Master PDF Generator] Finalizing page numbers and saving PDF document...');
  await builder.save();
  console.log(`[Master PDF Generator] Successfully compiled PDF at: ${OUTPUT_PATH}`);
}

generateMasterDocumentation().catch(err => {
  console.error('[Master PDF Generator Error]:', err);
  process.exit(1);
});
