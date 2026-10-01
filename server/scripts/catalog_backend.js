// Complete Backend Source Code Documentation Catalog (Enriched Edition)
// Exhaustive technical specifications, methods, schemas, and operational roles for all 48 backend files

const backendFiles = [
  // -------------------------------------------------------------------------
  // 1. CORE RUNTIME & REAL-TIME WEBSOCKETS
  // -------------------------------------------------------------------------
  {
    path: 'server/server.js',
    type: 'Core Application Server',
    role: 'Primary HTTP/WebSocket Gateway, Middleware Pipeline Assembly, Route Mounting & Background Daemon Dispatcher',
    explanation: `server.js serves as the master execution gateway for the backend runtime. It initializes the Express application, configures global CORS policies with credentials support, parses inbound JSON and URL-encoded payloads, and establishes the foundational HTTP server using Node.js's native http module. It mounts the Socket.IO real-time engine via socketManager.js, binding duplex WebSocket channels onto the active HTTP port.

The file orchestrates the connection to MongoDB through config/db.js, gracefully handling connection errors and retry loops. It systematically mounts all 14 REST route modules onto dedicated URI namespaces (/api/v1/cyclones, /api/v1/evacuation, /api/v1/incidents, /api/v1/shelters, /api/v1/auth, etc.). In addition, it launches background synchronization daemons that poll global meteorological APIs (NASA EONET, GDACS) every 15 minutes, ensuring the database stays synchronized with live oceanic cyclone telemetry.

Finally, server.js establishes the centralized error handling middleware and uncaught exception handlers. It ensures graceful shutdown sequences by listening for SIGINT and SIGTERM OS signals, closing active MongoDB database connections, terminating WebSocket listener pools, and safely stopping server listener sockets without dropping in-flight emergency network packets.`,
    technicalDetails: [
      'HTTP & Socket Server: Instantiates http.createServer(app) and mounts socketManager.initSocket(server).',
      'CORS & Security: Whitelists origin from process.env.CLIENT_URL, credentials: true, methods: GET, POST, PUT, DELETE, PATCH.',
      'Background Telemetry Cron: Executes setInterval(() => liveCycloneService.syncExternalFeeds(), 15 * 60 * 1000).',
      'Signal Handling: Registers process.on("SIGINT") and process.on("SIGTERM") for clean resource deallocation.'
    ],
    dataFlow: 'Inbound HTTP/REST requests from web browsers and mobile apps; outbound WebSocket broadcasts to connected operational dashboards; asynchronous polling to NASA/GDACS endpoints.'
  },
  {
    path: 'server/sockets/socketManager.js',
    type: 'Real-Time WebSocket Engine',
    role: 'Socket.IO Connection Orchestrator, Room-Based Broadcast Multiplexer & Low-Latency Event Dispatcher',
    explanation: `socketManager.js abstracts and manages the entire Socket.IO real-time communication infrastructure. It encapsulates connection authentication, room-based broadcast segregation, and bidirectional message transmission between the server and connected web clients. When clients connect, socketManager assigns them to contextual rooms such as eoc-commanders, responders, or general-public depending on their verified credentials.

The module provides high-level utility functions like broadcastCycloneUpdate(), emitNewIncident(), broadcastEmergencyAlert(), and emitSimulationTick(). These utilities allow any controller or service across the backend architecture to trigger real-time client UI updates with a single function call, bypassing the overhead of polling.

During disaster simulations, socketManager handles high-frequency state updates, streaming storm coordinate deltas, shifting wind radii, and shelter occupancy changes at sub-second intervals. It also handles reconnection handshakes, maintaining state integrity even when emergency field responders experience intermittent network connectivity in coastal disaster zones.`,
    technicalDetails: [
      'initSocket(server): Configures Socket.IO server with CORS options and transports: ["websocket", "polling"].',
      'Room Segregation: io.to("commanders"), io.to("responders"), io.to("public") for targeted operational broadcasts.',
      'Broadcast Methods: broadcastCycloneUpdate(cyclone), emitIncidentUpdate(incident), broadcastEmergencyAlert(alert).',
      'Heartbeat & Ping: Implements pingTimeout: 60000, pingInterval: 25000 to detect disconnected field terminals promptly.'
    ],
    dataFlow: 'Bi-directional WebSocket frames over port 5000; receives client subscriptions and GPS updates; emits real-time disaster alerts and storm telemetry updates.'
  },

  // -------------------------------------------------------------------------
  // 2. CONFIGURATION & CONSTANTS
  // -------------------------------------------------------------------------
  {
    path: 'server/config/db.js',
    type: 'Database Engine Configuration',
    role: 'MongoDB Connection Lifecycle Manager, Pool Optimization & Geospatial Index Verification',
    explanation: `db.js establishes and maintains the persistent connection between the Node.js application and the MongoDB database cluster using the Mongoose Object Document Mapper (ODM). It reads connection strings and credentials from environment variables (MONGO_URI), supporting both local replica sets and cloud-hosted MongoDB Atlas deployments.

The module configures essential connection pool options, including maxPoolSize, serverSelectionTimeoutMS, socketTimeoutMS, and autoIndex creation. It monitors the Mongoose connection lifecycle through event listeners (connected, error, disconnected, reconnected), logging operational statuses to stdout for system administrators.

Crucially, db.js triggers the background verification and creation of 2dsphere geospatial indexes across spatial collections (Cyclones, Shelters, Incidents, RiskZones, ResponseTeams). These spherical indexes enable high-speed $near, $geoWithin, and $geoIntersects queries, allowing the system to perform millisecond-level spatial queries across thousands of disaster coordinates without latency.`,
    technicalDetails: [
      'connectDB(): Async function wrapping mongoose.connect() with structured retry backoff.',
      'Pool Settings: maxPoolSize: 50, minPoolSize: 10, serverSelectionTimeoutMS: 5000.',
      'Connection Events: mongoose.connection.on("connected"), "error", "disconnected" listeners.',
      'Index Validation: Ensures 2dsphere indexes are properly indexed on all GeoJSON Point and Polygon fields.'
    ],
    dataFlow: 'Reads process.env.MONGO_URI; outputs active Mongoose Connection instance to all models and controllers.'
  },
  {
    path: 'server/config/constants.js',
    type: 'Domain Constants & Enums',
    role: 'Centralized Cyclone Classification Standards, Meteorological Thresholds & System Enums',
    explanation: `constants.js provides a single, immutable source of truth for domain-specific constants, operational thresholds, and enumerations used across the entire backend. It defines standard meteorological categories established by the India Meteorological Department (IMD) and World Meteorological Organization (WMO), including Depression (DD), Deep Depression (CS), Cyclonic Storm, Severe Cyclonic Storm (SCS), Very Severe Cyclonic Storm (VSCS), Extremely Severe Cyclonic Storm (ESCS), and Super Cyclonic Storm (SuCS).

The file codifies critical thresholds such as wind speed bands (34 kt, 50 kt, 64 kt), central atmospheric pressure minima (hPa), storm surge heights (meters), and risk score weighting coefficients. It also standardizes system-wide user roles (admin, officer, responder, coordinator, volunteer, citizen) and incident statuses (reported, verified, dispatched, resolved).

By centralizing these constants, the application eliminates magic numbers and hardcoded string literals across routes, controllers, models, and analytical calculation engines, preventing subtle operational bugs and ensuring regulatory compliance with disaster management guidelines.`,
    technicalDetails: [
      'CYCLONE_CATEGORIES: Object mapping intensity labels to wind thresholds (e.g. SuCS: >= 120 knots).',
      'USER_ROLES: Object defining "admin", "officer", "responder", "coordinator", "volunteer", "citizen".',
      'INCIDENT_STATUS: ["reported", "dispatched", "in-progress", "resolved", "cancelled"].',
      'RISK_WEIGHTS: Coefficients for Wind (0.35), Surge (0.25), Population (0.20), Vulnerability (0.10), Coast (0.10).'
    ],
    dataFlow: 'Exported as frozen constants dictionary consumed by models, validation schemas, and analytical services.'
  },
  {
    path: 'server/config/mockData.js',
    type: 'Simulation Seed Data',
    role: 'Realistic Coastal Feature Geometries, Shelter Specifications, Response Team Profiles & Historical Cyclone Seeds',
    explanation: `mockData.js provides rich, high-fidelity datasets representing real-world coastal geography, historical cyclonic storms in the Bay of Bengal and Arabian Sea, relief warehouse inventories, pre-designated multi-purpose cyclone shelters, and emergency response teams. It models scenarios based on catastrophic cyclones such as Super Cyclone Amphan, Cyclone Fani, and Cyclone Biparjoy.

The file contains detailed GeoJSON coordinates for vulnerable coastal districts across Odisha, Andhra Pradesh, Tamil Nadu, West Bengal, and Gujarat. Each shelter record includes structural capacity, generator availability, elevated plinth levels, water filtration capabilities, and medical supply stores.

These reference datasets serve dual purposes: they seed initial database states during local deployment or disaster drills (via seed.js), and they act as deterministic test fixtures for algorithmic regression testing across the risk scoring, shelter allocation, and evacuation routing engines.`,
    technicalDetails: [
      'Historical Storm Datasets: Complete track coordinates, central pressure, wind radii for Amphan, Fani, Biparjoy.',
      'Shelters Array: 25+ coastal shelters with GeoJSON Point coordinates, capacity, amenities, contact details.',
      'Response Teams: 15+ NDRF/SDRF teams with unit IDs, specialized equipment rosters, vehicle callsigns.',
      'Vulnerability Zones: GeoJSON MultiPolygon coordinates for low-lying coastal floodplains and taluks.'
    ],
    dataFlow: 'Supplies static seed data to seed.js and fallback fixtures for offline development testing.'
  },

  // -------------------------------------------------------------------------
  // 3. MIDDLEWARE LAYER
  // -------------------------------------------------------------------------
  {
    path: 'server/middleware/auth.js',
    type: 'Authentication Middleware',
    role: 'Stateless JWT Token Validator, Header Extraction, User Profile Lookup & Context Injection',
    explanation: `auth.js enforces stateless, token-based authentication across all protected API routes in the Cyclone Disaster Management System. It intercepts inbound HTTP requests, extracts bearer tokens from the standard Authorization header (or session cookies), and cryptographically validates the token against the application's JWT_SECRET using the jsonwebtoken library.

Upon successful verification, the middleware queries the MongoDB database to retrieve the active user profile, ensuring that deactivated, suspended, or invalid accounts cannot access restricted endpoints. It attaches the authenticated user document directly to req.user, making identity context seamlessly available to downstream controllers.

If the token is missing, malformed, expired, or cryptographically invalid, auth.js immediately halts the request lifecycle, returning a structured HTTP 401 Unauthorized response with a standardized JSON error envelope, preventing unauthorized data exfiltration from the emergency command platform.`,
    technicalDetails: [
      'protect(): Express middleware extracting Bearer <token> from req.headers.authorization.',
      'jwt.verify(token, process.env.JWT_SECRET): Decodes user payload containing userId and role.',
      'req.user = await User.findById(decoded.id).select("-password"): Injects user context into request.',
      'Error Handling: Catches JsonWebTokenError and TokenExpiredError with standardized 401 response.'
    ],
    dataFlow: 'Inbound HTTP Authorization header -> validated user document attached to req.user -> downstream route controller.'
  },
  {
    path: 'server/middleware/rbac.js',
    type: 'Authorization Middleware',
    role: 'Role-Based Access Control Gatekeeper, Multi-Agency Permission Enforcer & Privilege Boundary Guard',
    explanation: `rbac.js implements granular Role-Based Access Control to enforce organizational hierarchy and operational security across multi-agency emergency operations. It accepts an array of permitted roles (e.g., checkRole(['admin', 'officer'])) and compares the caller's req.user.role against the allowed operational tiers.

The middleware implements strict defense-in-depth principles: while general citizens can submit emergency assistance requests (SOS) and view public shelter locations, only Operations Officers and Administrators can issue mandatory evacuation orders, broadcast emergency alerts, or modify live cyclone telemetry. Field responders are restricted to updating assigned incidents and reporting tactical statuses.

When an authenticated user attempts to execute an action beyond their designated authorization level, rbac.js rejects the request with an HTTP 403 Forbidden status code and generates an automated entry in the system audit log, alerting EOC administrators to potential unauthorized access attempts.`,
    technicalDetails: [
      'checkRole(...roles): Higher-order middleware factory returning (req, res, next).',
      'Role Validation: if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: "Forbidden" }).',
      'Audit Trail Integration: Records unauthorized access attempts with user ID, IP address, and attempted endpoint.',
      'Hierarchical Scoping: Allows admin role to bypass role restrictions for system maintenance tasks.'
    ],
    dataFlow: 'Inspects req.user.role; permits execution to next() or rejects with HTTP 403 Forbidden response.'
  },
  {
    path: 'server/middleware/errorHandler.js',
    type: 'Exception Interception Middleware',
    role: 'Global Catch-All Error Handler, Database Error Normalization & Safe Client JSON Response Generator',
    explanation: `errorHandler.js is the terminal middleware mounted at the end of the Express request pipeline. It captures all synchronous exceptions and asynchronous rejections passed via next(err), preventing unhandled exceptions from crashing the Node.js event loop during critical emergency operations.

The middleware inspects error types, normalizing Mongoose validation errors, duplicate key constraints (MongoServerError 11000), JWT authentication failures, and custom AppError instances into consistent, standardized JSON payloads with appropriate HTTP status codes (400, 401, 403, 404, 422, 500).

In production environments, errorHandler.js suppresses internal stack traces and database connection strings to prevent information leakage to malicious actors, while providing human-readable, actionable diagnostic messages to client applications. In development mode, full diagnostic traces are preserved to expedite rapid developer debugging.`,
    technicalDetails: [
      'Signature: (err, req, res, next) with 4 parameters declaring Express error middleware.',
      'Mongoose Error Handling: CastError -> 404 Not Found; ValidationError -> 400 Bad Request.',
      'Duplicate Keys: Error code 11000 converted into friendly field collision message.',
      'Environment Switch: Returns err.stack only when process.env.NODE_ENV === "development".'
    ],
    dataFlow: 'Catches unhandled errors from route controllers; formats and sends structured JSON error response.'
  },

  // -------------------------------------------------------------------------
  // 4. MONGOOSE DATA MODELS (ALL 14 MODELS)
  // -------------------------------------------------------------------------
  {
    path: 'server/models/Agency.js',
    type: 'Data Model (Mongoose)',
    role: 'Multi-Agency Organization Registry, Contact Coordinates, Operational Jurisdictions & Resource Capacities',
    explanation: `Agency.js defines the Mongoose schema for all governmental, military, non-governmental, and volunteer organizations participating in cyclone operations (e.g., National Disaster Response Force (NDRF), State Disaster Management Authority (SDMA), Indian Coast Guard, Red Cross).

The schema captures agency type, contact dispatch points, regional jurisdictions defined by coastal administrative polygons, authorized communication channels, and primary coordinator credentials.

By modeling agencies as first-class entities, the system enables automated multi-agency incident routing, allowing the EOC dispatcher to assign flood rescues to naval units, medical evacuations to health services, and shelter provisioning to civil welfare departments.`,
    technicalDetails: [
      'Fields: name, code, type (NDRF, SDRF, CoastGuard, Police, Fire, NGO), contactEmail, phone, jurisdiction.',
      'Jurisdiction: GeoJSON Polygon defining administrative operational territory.',
      'Active Units: Array of ObjectId references to ResponseTeam documents.',
      'Timestamps: Automatic createdAt and updatedAt tracking.'
    ],
    dataFlow: 'Referenced by ResponseTeam.js and User.js; queried by adminRoutes.js and incidentService.js.'
  },
  {
    path: 'server/models/AssistanceRequest.js',
    type: 'Data Model (Mongoose)',
    role: 'Civilian Emergency SOS Requests, Geospatial GPS Pinpoints, Triage Priority & Rescue Assignment Tracking',
    explanation: `AssistanceRequest.js models emergency SOS signals and assistance requests initiated by citizens in distress via the Citizen Portal. The schema captures precise GPS coordinates (GeoJSON Point), physical location descriptions, distress categories (trapped flood victim, medical trauma, structural roof collapse, food/water shortage), and headcount of stranded individuals.

It tracks operational lifecycles from pending through dispatched to rescued. The schema incorporates a 2dsphere index on the location field, enabling responders to query distress calls within a specific radius of their deployed rescue boats.

Additionally, the model records urgency scores computed based on vulnerable occupants (elderly, infants, pregnant women) and rapidly rising floodwaters, ensuring life-threatening emergencies receive highest operational priority.`,
    technicalDetails: [
      'Location: { type: "Point", coordinates: [longitude, latitude] } with 2dsphere geospatial index.',
      'Distress Fields: category (medical, trapped, food_water, shelter), headcount, vulnerableCount.',
      'Status Enum: ["pending", "acknowledged", "dispatched", "rescued", "cancelled"].',
      'Assigned Unit: ObjectId reference to ResponseTeam assigned for rescue extraction.'
    ],
    dataFlow: 'Created via citizenRoutes.js; read and triaged in IncidentBoard.jsx and CommandCenter.jsx.'
  },
  {
    path: 'server/models/AuditLog.js',
    type: 'Data Model (Mongoose)',
    role: 'Immutable Administrative Audit Trail, Security Event Logging, Operational Compliance & Forensic Review',
    explanation: `AuditLog.js establishes an append-only, tamper-evident audit ledger capturing every critical operational action executed within the EOC command software. It records the executing user ID, role, client IP address, action verb (e.g., EVACUATION_ORDER_ISSUED, ALERT_BROADCASTED, TEAM_DISPATCHED), affected target entity, and timestamp.

The schema stores before-and-after change diffs in a structured JSON payload, enabling forensic reconstruction of administrative decisions during post-disaster judicial and legislative inquiries.

TTL (Time-To-Live) indexing can be configured to meet statutory record retention mandates, while default indexes on action, user, and createdAt ensure rapid retrieval during live operational reviews.`,
    technicalDetails: [
      'Fields: user (ObjectId), action (string), module (string), targetId (string), ipAddress (string).',
      'Payload: Mixed schema storing JSON delta of modified record attributes.',
      'Indexes: Compound index on { action: 1, createdAt: -1 } and { user: 1, createdAt: -1 }.',
      'Immutability: Write-only schema; no update or delete endpoints exposed in API.'
    ],
    dataFlow: 'Populated by controllers upon critical state changes; viewed by administrators on AdminPage.jsx.'
  },
  {
    path: 'server/models/Cyclone.js',
    type: 'Data Model (Mongoose)',
    role: 'Master Cyclone System Entity, Track History, Real-Time Coordinates, Wind Radii & 72h Forecast Cones',
    explanation: `Cyclone.js is the meteorological heart of the database architecture. It encapsulates comprehensive data structures representing an active cyclonic disturbance, including IMD/WMO storm identifier, name, current oceanic basin (Bay of Bengal / Arabian Sea), intensity category, and central atmospheric pressure (hPa).

The schema maintains an array of historical tracking fixes, each storing chronological timestamps, geographical coordinates [longitude, latitude], maximum sustained wind speeds (knots / km/h), movement vectors (forward speed and azimuth heading), and asymmetric wind radii quadrants (34-kt, 50-kt, 64-kt radii).

Crucially, Cyclone.js stores 72-hour forecast trajectory waypoints with expanding error cones of uncertainty (probability polygons). This rich spatial document powers the Leaflet CommandMap, driving vector animations, concentric wind circles, and projected coastal landfall cones.`,
    technicalDetails: [
      'Identification: stormId, name, basin (Bay of Bengal, Arabian Sea), status (active, dissipated).',
      'Current Fix: coordinates: [lng, lat], maxWindSpeedKnots, centralPressureHpa, category.',
      'Wind Radii: { r34kt: Number, r50kt: Number, r64kt: Number } (dimensions in nautical miles).',
      'Track History: Array of past fixes; Forecast: Array of projected fixes with uncertainty radius.',
      'Geospatial Index: 2dsphere index on current coordinates for spatial proximity queries.'
    ],
    dataFlow: 'Updated by liveCycloneService.js and cycloneRoutes.js; streamed to client CommandMap.jsx via WebSockets.'
  },
  {
    path: 'server/models/Disaster.js',
    type: 'Data Model (Mongoose)',
    role: 'Operational Disaster Declaration Master, Multi-Agency Activation State, Phased Emergency Lifecycle',
    explanation: `Disaster.js represents the overarching disaster declaration event issued by state or national emergency authorities. It links active cyclones to specific geographic response jurisdictions, declaring operational alert levels (Advisory, Alert, Warning, Landfall, Recovery).

The schema aggregates high-level disaster metrics, including total impacted population, activated evacuation sectors, mobilized response personnel, and declared disaster zones under the National Disaster Management Act.

It serves as the parent container connecting all child operational entities (EvacuationPlans, Incidents, EmergencyAlerts, and ReliefDistributions) during a named cyclonic crisis.`,
    technicalDetails: [
      'Declaration Fields: name, disasterType ("Cyclone"), declaredAt, severityLevel, declaringAuthority.',
      'Active Cyclone Link: ObjectId reference to associated Cyclone document.',
      'Phases: Enum ["Pre-Disaster / Watch", "Warning / Evacuation", "Landfall / Emergency", "Post-Disaster / Relief"].',
      'Summary Counters: evacuatedCount, casualtyCount, activeSheltersCount, totalDamagesEstimated.'
    ],
    dataFlow: 'Modified by disasterRoutes.js; powers top-level metrics in CommandCenter.jsx and ReportsPage.jsx.'
  },
  {
    path: 'server/models/EmergencyAlert.js',
    type: 'Data Model (Mongoose)',
    role: 'CAP-Compliant Public Warnings, Broadcast Alert Dispatches, Multi-Channel Push Notifications & Geo-Fencing',
    explanation: `EmergencyAlert.js implements data structures aligned with the Common Alerting Protocol (CAP-v1.2) standard for public warnings. It captures alert urgency, severity, certainty, headline, full instructional text, and affected geographical zones (GeoJSON polygons or district lists).

The schema tracks multi-channel dissemination statuses, including SMS gateways, public web portal broadcast banners, mobile push notifications, and siren activations.

Alert records are indexed spatially and by timestamp, allowing the Citizen Portal and Command Center to instantly filter active warnings relevant to a citizen's immediate GPS coordinates.`,
    technicalDetails: [
      'CAP Standard Fields: headline, description, instruction, urgency (Immediate, Expected, Future).',
      'Severity: Enum ["Extreme", "Severe", "Moderate", "Minor"].',
      'Geo-Targeting: targetDistricts (array of strings) and targetPolygon (GeoJSON Polygon).',
      'Channels: { webBanner: Boolean, smsBroadcast: Boolean, sirensActivated: Boolean }.'
    ],
    dataFlow: 'Created via alertRoutes.js; displayed across AlertBanner.jsx, CitizenPortal.jsx, and mobile SMS gateways.'
  },
  {
    path: 'server/models/EvacuationPlan.js',
    type: 'Data Model (Mongoose)',
    role: 'Sectoral Evacuation Plans, Clearance Time Estimates, Designated Safe Corridors & Target Population Counts',
    explanation: `EvacuationPlan.js models district-level and taluk-level evacuation operations designed by EOC planners. It stores target population headcounts, designated safe transit corridors (polylines with road capacity specifications), originating coastal villages, and destination cyclone shelters.

The schema records calculated Evacuation Clearance Times (ECT), computed using roadway bottleneck algorithms and vehicle throughput coefficients. It maintains operational progress states (draft, approved, active, completed), tracking actual evacuated persons versus targeted civilian populations in real time.

Planners utilize this model to sequence phased evacuations, preventing catastrophic gridlock on narrow coastal bridges and arterial highways as storm surges approach.`,
    technicalDetails: [
      'Sector Details: district, sectorName, targetPopulation, evacuatedCount, progressPercentage.',
      'Corridor Geometry: GeoJSON LineString representing safe highway and arterial evacuation route.',
      'Calculated Metrics: clearanceTimeHours (ECT), requiredBuses, roadCapacityVehiclesPerHour.',
      'Shelters: Array of ObjectId references to designated destination Shelter documents.'
    ],
    dataFlow: 'Managed in EvacuationPlanning.jsx; computes clearance metrics via evacuationService.js.'
  },
  {
    path: 'server/models/Incident.js',
    type: 'Data Model (Mongoose)',
    role: 'Operational Field Incident Reports, Damage Assessments, Resource Dispatch Tracking & Resolution Verification',
    explanation: `Incident.js tracks localized emergencies reported during cyclonic impact, such as electrical power grid failures, embankment breaches, uprooted trees blocking evacuation routes, structural damage, and stranded watercraft.

The schema captures exact geospatial coordinates (GeoJSON Point), incident severity tier (Low, Medium, High, Critical), reported timestamps, photographic evidence URLs, and current resolution status. It establishes foreign key references to assigned ResponseTeams and supervising Agencies.

Real-time mutations in Incident documents emit Socket.IO events, updating the IncidentBoard Kanban UI and the Leaflet tactical map overlay instantaneously.`,
    technicalDetails: [
      'Location: GeoJSON Point with 2dsphere index for spatial search and map plotting.',
      'Type Enum: ["Flood Inundation", "Blocked Road", "Power Outage", "Structural Collapse", "Medical Emergency"].',
      'Severity: Enum ["Critical", "High", "Medium", "Low"].',
      'Workflow Status: Enum ["reported", "dispatched", "in-progress", "resolved", "cancelled"].',
      'Assigned Unit: ObjectId reference to ResponseTeam.'
    ],
    dataFlow: 'Reported via citizenRoutes or responder mobile app; managed on IncidentBoard.jsx Kanban board.'
  },
  {
    path: 'server/models/Inventory.js',
    type: 'Data Model (Mongoose)',
    role: 'Relief Warehouse Stock Levels, Critical Supply Reserves, Expiration Dates & Reorder Thresholds',
    explanation: `Inventory.js manages emergency supply caches across regional relief distribution warehouses, district transit depots, and localized cyclone shelters. It tracks specific commodity categories, including drinking water packets, dry food rations (ready-to-eat meals), medical trauma kits, tarpaulins, inflatable rescue boats, life jackets, and emergency diesel generators.

The schema tracks current stock quantities, reserved allocations, unit measures, expiration dates, and minimum threshold triggers.

When inventory levels in vulnerable shelter hubs fall below emergency reserve thresholds, automated replenishment alerts are dispatched to logistics coordinators to prevent critical supply exhaustion.`,
    technicalDetails: [
      'Item Specifications: itemName, category (water, food, medical, shelter, equipment), unit (liters, packs, units).',
      'Stock Levels: currentQuantity, reservedQuantity, availableQuantity, minimumThreshold.',
      'Storage Facility: warehouseName, facilityType (central_warehouse, transit_depot, shelter_cache).',
      'Location: GeoJSON Point coordinates of the storage warehouse.'
    ],
    dataFlow: 'Audited in ReliefCoordination.jsx; consumed by reliefOptimizerService.js to plan deliveries.'
  },
  {
    path: 'server/models/ReliefDistribution.js',
    type: 'Data Model (Mongoose)',
    role: 'Supply Chain Dispatch Manifests, Convoy Waybills, Transit Telemetry & Delivery Confirmation Audit',
    explanation: `ReliefDistribution.js tracks outbound supply convoys moving relief consignments from central staging warehouses to frontline cyclone shelters and community distribution centers. The schema records origin and destination facilities, allocated vehicle identifiers, driver contact information, and detailed itemized manifests.

It monitors transit states from dispatch through checkpoint transit to final delivery receipt, recording digital sign-offs from receiving shelter managers.

This operational tracking ensures transparency and prevents supply diversion, ensuring critical food and medical relief reaches vulnerable displaced families without administrative delay.`,
    technicalDetails: [
      'Manifest Details: manifestNumber, sourceWarehouse (ObjectId), destinationShelter (ObjectId).',
      'Consignment Items: Array of { item: ObjectId, quantityDispatched, quantityReceived }.',
      'Transport: vehicleNumber, driverName, driverPhone, convoyLeader.',
      'Status: Enum ["preparing", "dispatched", "in-transit", "delivered", "exception"].'
    ],
    dataFlow: 'Generated in ReliefCoordination.jsx; updated by logistics coordinators during transit.'
  },
  {
    path: 'server/models/ResponseTeam.js',
    type: 'Data Model (Mongoose)',
    role: 'Tactical Rescue Teams (NDRF, SDRF, Fire Services), Real-Time GPS Tracking, Personnel Skills & Deployment Status',
    explanation: `ResponseTeam.js models deployed field rescue units, such as NDRF search-and-rescue battalions, SDRF swift-water rescue squads, military medical teams, and civil defense units. The schema maintains live GPS location telemetry (Point coordinates), personnel headcounts, specialized equipment inventory (chainsaws, inflatable motorboats, sat-phones), and current operational status (Standby, Mobilizing, En Route, On Scene, Demobilizing).

The schema includes a 2dsphere spatial index, allowing the automated dispatch service to calculate the closest available rescue team to a high-priority citizen SOS beacon using geospatial spherical distance calculations.

Live updates sent from responders' mobile terminals update their coordinates in this collection, which are immediately reflected on the Command Map.`,
    technicalDetails: [
      'Identity: teamName, callsign, agency (ObjectId to Agency), leaderName, leaderPhone.',
      'Location: GeoJSON Point with 2dsphere index for spatial proximity queries ($near).',
      'Status: Enum ["available", "mobilizing", "en-route", "on-scene", "rest", "offline"].',
      'Capabilities: Array of strings (e.g., "swift-water", "tree-clearing", "trauma-care", "deep-dive").'
    ],
    dataFlow: 'Telemetry updated via responseTeamRoutes.js; plotted as dynamic vehicle icons on CommandMap.jsx.'
  },
  {
    path: 'server/models/RiskZone.js',
    type: 'Data Model (Mongoose)',
    role: 'Vulnerability Polygons, Coastal Inundation Contours, Storm Surge Hazard Boundaries & Population Exposure',
    explanation: `RiskZone.js stores spatial polygons representing coastal vulnerability zones categorized by combined storm surge, elevation, and tidal breach risk (Very High, High, Moderate, Low).

The schema captures demographic vulnerability indices, including total resident population, kutcha (fragile) housing percentages, elderly and infant demographic counts, and critical infrastructure assets (hospitals, substations, water treatment plants) within the zone contour.

These polygons are projected as semi-transparent colored overlays onto the Command Map, enabling decision-makers to visually correlate cyclone landfall corridors with densely populated, high-risk lowlands.`,
    technicalDetails: [
      'Geometry: GeoJSON Polygon with 2dsphere index representing district / taluk hazard boundary.',
      'Risk Metrics: compositeRiskScore (0-100), riskTier (Very High, High, Moderate, Low).',
      'Demographics: totalPopulation, vulnerablePopulationCount, kutchaHouseRatio.',
      'Contributing Scores: windRisk, surgeRisk, populationRisk, coastalProximityRisk.'
    ],
    dataFlow: 'Computed by riskService.js; rendered as semi-transparent vector overlays on CommandMap.jsx.'
  },
  {
    path: 'server/models/Shelter.js',
    type: 'Data Model (Mongoose)',
    role: 'Multi-Purpose Cyclone Shelters, Structural Capacities, Real-Time Occupancy, Amenities & Geospatial Pins',
    explanation: `Shelter.js models dedicated multi-purpose cyclone shelters, schools, and community centers designated as safe havens during storm emergencies. The schema captures structural characteristics, maximum capacity, current live occupancy, sanitation facilities, backup generator power, water filtration systems, and medical officer presence.

It maintains a 2dsphere index on its location field, powering the "Find Nearest Safe Shelter" feature in the Citizen Portal, which calculates the closest non-flooded shelter with available capacity relative to a citizen's GPS coordinates.

The schema also tracks supply deficits, triggering automated restocking alerts when occupancy exceeds 80% of capacity.`,
    technicalDetails: [
      'Location: GeoJSON Point with 2dsphere index for $near spherical discovery queries.',
      'Capacity: totalCapacity, currentOccupancy, availableSlots (virtual), occupancyPercentage.',
      'Amenities: hasGenerator, hasWaterPurifier, hasMedicalClinic, hasHelipad, plinthHeightMeters.',
      'Manager Contact: managerName, contactPhone, designatedDistrict.'
    ],
    dataFlow: 'Queried by citizenRoutes.js; managed on SheltersManagement.jsx; updated during evacuation intake.'
  },
  {
    path: 'server/models/User.js',
    type: 'Data Model (Mongoose)',
    role: 'System User Profiles, Cryptographic Password Hashing (Bcrypt), RBAC Role Assignments & Account Status',
    explanation: `User.js encapsulates identity, authentication credentials, and operational role assignments for all system actors (administrators, officers, responders, coordinators, volunteers, and citizens). It enforces unique email constraints and stores cryptographic password hashes generated with bcryptjs using adaptive salt cost factors.

The schema implements Mongoose pre-save middleware hooks to automatically hash modified passwords before database writes, ensuring plaintext credentials are never stored. It includes utility methods for password verification (matchPassword()) and role permission checks.

It also records last login timestamps, mobile contact numbers for emergency SMS routing, and assigned agency affiliations for seamless multi-agency coordination.`,
    technicalDetails: [
      'Fields: name, email (unique), password (bcrypt hash), role, phone, agency (ObjectId).',
      'Roles: Enum ["admin", "officer", "responder", "coordinator", "volunteer", "citizen"].',
      'Pre-save Hook: Generates bcrypt salt (cost 10) and hashes password if modified.',
      'Instance Method: matchPassword(enteredPassword) executes bcrypt.compare().'
    ],
    dataFlow: 'Authenticated by authRoutes.js; verifies JWT claims; queried in admin user management.'
  },

  // -------------------------------------------------------------------------
  // 5. BUSINESS LOGIC SERVICES (ALL 9 SERVICES)
  // -------------------------------------------------------------------------
  {
    path: 'server/services/disasterAggregator.js',
    type: 'Business Logic Service',
    role: 'High-Level Disaster Intelligence Synthesis, Cross-Module KPI Aggregation & Executive Overview Generator',
    explanation: `disasterAggregator.js acts as the centralized data aggregation engine powering the executive KPI cards on the CommandCenter dashboard. It queries multiple database collections concurrently using MongoDB Promise.all pipelines to calculate real-time operational metrics.

The service computes total active cyclones, aggregate evacuated population, active shelter occupancy percentages, open critical incidents, deployed response teams, and pending civilian SOS requests.

By aggregating these metrics in a dedicated service layer with optimized caching headers, it shields the database from redundant queries while providing EOC commanders with unified situational awareness updated every few seconds.`,
    technicalDetails: [
      'getDashboardOverview(): Parallel Promise.all query across Cyclone, Shelter, Incident, ResponseTeam.',
      'KPI Metrics: activeCyclonesCount, totalEvacuated, shelterCapacityUtilization, openIncidentsCount.',
      'Performance Optimization: Lightweight .lean().countDocuments() queries minimize memory overhead.',
      'Caching: Short 5-second in-memory memoization prevents database saturation under high concurrent users.'
    ],
    dataFlow: 'Aggregates data from 5+ Mongoose models; feeds CommandCenter.jsx and ReportsPage.jsx.'
  },
  {
    path: 'server/services/evacuationService.js',
    type: 'Business Logic Service',
    role: 'Evacuation Route Optimization, Roadway Capacity Modeling & Phased Clearance Time Estimation',
    explanation: `evacuationService.js implements transportation network modeling algorithms to formulate safe evacuation strategies. It evaluates coastal road networks, identifying bottleneck bridges and low-elevation arterial roads subject to premature storm surge inundation.

The service calculates Evacuation Clearance Times (ECT) by dividing projected evacuee vehicle volumes by roadway hourly capacity coefficients, incorporating safety buffers for deteriorating weather and wind conditions.

It pairs evacuating coastal populations with optimal destination shelters, balancing shelter capacity to prevent overcrowding while minimizing civilian travel distance through hazardous coastal zones.`,
    technicalDetails: [
      'calculateClearanceTime(population, lanes, capacity): Implements deterministic ECT equation.',
      'assignSheltersToSectors(sectors, shelters): Greedy capacity-matching optimization algorithm.',
      'generateEvacuationCorridor(origin, destination): Calculates polyline waypoints along arterial routes.',
      'Bottleneck Identification: Flags coastal bridges with elevated risk of early surge inundation.'
    ],
    dataFlow: 'Invoked by evacuationRoutes.js; populates plan metrics in EvacuationPlanning.jsx.'
  },
  {
    path: 'server/services/forecastService.js',
    type: 'Business Logic Service',
    role: 'Storm Track Interpolation, 72h Forward Projections, Cone of Uncertainty Generation & Landfall Prediction',
    explanation: `forecastService.js provides predictive modeling capabilities for cyclonic movement. It consumes chronological storm fixes, calculating instantaneous forward velocity, heading azimuth, and central pressure intensification rates.

The service employs meteorological extrapolation models to project 12, 24, 48, and 72-hour forecast waypoints. For each forecast interval, it generates expanding uncertainty radii (cones of uncertainty) based on historical track error statistics.

It automatically estimates projected landfall points along coastal boundaries, calculating estimated time of arrival (ETA) and expected storm surge heights at landfall to guide proactive coastal evacuation issuance.`,
    technicalDetails: [
      'extrapolateTrack(fixes, hoursAhead): Computes forward coordinates using great-circle azimuth formulas.',
      'generateUncertaintyCone(forecastFixes): Constructs GeoJSON Polygon enclosing expanding error radii.',
      'estimateLandfall(track, coastlineGeometry): Calculates intersection point of track with coastal boundary.',
      'Surge Height Model: Computes peak surge based on central pressure deficit and bathymetry slope.'
    ],
    dataFlow: 'Processes Cyclone track data; provides forecast layers rendered by CommandMap.jsx.'
  },
  {
    path: 'server/services/incidentService.js',
    type: 'Business Logic Service',
    role: 'Field Incident Triage, Automated Priority Scoring, Nearest Team Dispatch & SLA Monitoring',
    explanation: `incidentService.js manages the operational lifecycle of field emergency reports. Upon receipt of an incident, the service computes a composite severity score based on hazard type, proximity to vulnerable populations, and blockage of critical evacuation corridors.

It utilizes MongoDB geospatial spherical queries to locate the closest available ResponseTeam with matching equipment capabilities (e.g., matching boat rescue teams to flooding incidents).

The service monitors operational Service Level Agreements (SLAs), raising escalations to EOC dispatchers if critical incidents remain unacknowledged or unassigned beyond predefined operational thresholds.`,
    technicalDetails: [
      'findNearestTeam(incidentLocation, requiredCapability): Geospatial $near query on ResponseTeam collection.',
      'dispatchTeamToIncident(incidentId, teamId): Updates both documents in atomic session and emits WebSocket.',
      'triageIncident(incident): Calculates urgency rank based on population density and rising floodwaters.',
      'SLA Monitor: Flags incidents pending > 30 minutes for urgent dispatcher escalation.'
    ],
    dataFlow: 'Orchestrates Incident and ResponseTeam models; pushes updates to IncidentBoard.jsx.'
  },
  {
    path: 'server/services/liveCycloneService.js',
    type: 'External Telemetry Service',
    role: 'Meteorological Satellite API Ingestion (NASA EONET / GDACS), Coordinate Parsing & Normalization Pipeline',
    explanation: `liveCycloneService.js connects the system to global Earth observation and disaster monitoring feeds, specifically NASA EONET (Earth Observatory Natural Event Tracker) v3 and the UN-OCHA GDACS (Global Disaster Alert and Coordination System) APIs.

The service executes scheduled HTTP requests using axios, retrieving live GeoJSON storm tracks and satellite observation packets. It filters global feeds for severe storm events situated in the North Indian Ocean, Bay of Bengal, and Arabian Sea basins.

It normalizes heterogeneous external payloads into standardized Cyclone document formats, converting imperial knots to metric km/h, parsing pressure figures, updating active track histories, and triggering real-time WebSocket broadcast events whenever significant track deviations occur.`,
    technicalDetails: [
      'fetchEonetEvents(): Queries https://eonet.gsfc.nasa.gov/api/v3/categories/severeStorms.',
      'fetchGdacsFeed(): Queries https://www.gdacs.org/xml/rss.xml or GeoJSON endpoints for cyclone alerts.',
      'normalizeCoordinates(externalData): Extracts [longitude, latitude] and translates category scales.',
      'syncExternalFeeds(): Master sync function scheduled via cron daemon in server.js.'
    ],
    dataFlow: 'Inbound external REST API data -> normalized to Cyclone model -> triggers WebSocket broadcast.'
  },
  {
    path: 'server/services/reliefOptimizerService.js',
    type: 'Logistics Optimization Service',
    role: 'Multi-Criteria Shelter Supply Deficit Optimization, Priority Allocation & Convoy Dispatch Calculation',
    explanation: `reliefOptimizerService.js addresses the complex logistical challenge of distributing finite emergency supplies across dozens of overcrowded coastal shelters. It computes a Shelter Supply Deficit Index by comparing current shelter inventory against daily nutritional, hydration, and medical consumption rates for actual shelter headcounts.

The service applies linear optimization heuristics to formulate convoy delivery manifests, prioritizing isolated or high-deficit shelters while accounting for vehicle cargo capacities and traversable road networks.

Logistics coordinators utilize the recommendations generated by this service to mobilize warehouse distribution convoys rapidly and equitably.`,
    technicalDetails: [
      'computeShelterDeficits(): Compares shelter occupancy against stock levels across all commodities.',
      'Daily Consumption Ratios: Water (3.0L/person/day), Food (2 ration packs/person/day), Medical kits.',
      'optimizeConvoys(warehouses, shelters): Generates optimal truck dispatch manifests minimizing travel.',
      'Urgency Sorting: Sorts candidate shelters by deficit severity multiplied by road isolation risk factor.'
    ],
    dataFlow: 'Analyzes Shelter and Inventory collections; outputs delivery manifests for ReliefCoordination.jsx.'
  },
  {
    path: 'server/services/riskService.js',
    type: 'Spatial Analytical Service',
    role: 'Multi-Criteria Coastal Vulnerability Scoring, Inundation Modeling & Risk Polygon Synthesis',
    explanation: `riskService.js calculates multi-criteria risk indices for coastal geographic zones. It integrates multiple physical and socioeconomic hazard layers: coastal proximity, digital elevation, maximum sustained wind gusts, projected storm surge inundation, population density, and housing construction vulnerability (kutcha vs pucca structures).

The service evaluates the mathematical formula:
Risk = (0.35 * WindScore) + (0.25 * SurgeScore) + (0.20 * PopDensityScore) + (0.10 * VulnerabilityScore) + (0.10 * CoastalProximityScore).

Based on the calculated score, the service classifies zones into Very High, High, Moderate, and Low hazard categories, dynamically generating colored GeoJSON polygon layers for cartographic visualization on the Command Map.`,
    technicalDetails: [
      'calculateRiskScore(zoneData, stormData): Evaluates weighted multi-criteria formulation.',
      'generateRiskZones(cyclone): Synthesizes dynamic risk contour polygons based on current storm winds.',
      'getVulnerablePopulation(zoneId): Computes headcount of elderly, infants, and kutcha house residents.',
      'Classification Tiers: Very High (>=80), High (60-79), Moderate (40-59), Low (<40).'
    ],
    dataFlow: 'Processes meteorological storm parameters and coastal census data; populates RiskZone collection.'
  },
  {
    path: 'server/services/shelterService.js',
    type: 'Shelter Management Service',
    role: 'Real-Time Capacity Auditing, Safe Haven Geospatial Discovery & Deficit Alert Triggering',
    explanation: `shelterService.js encapsulates business logic governing emergency shelter operations. It maintains real-time occupancy counts, validating that new evacuee check-ins do not breach structural safety thresholds.

The service powers the citizen shelter finder API, executing geospatial spherical queries that find shelters within walking or driving distance of a citizen's coordinates, automatically sorting candidates by available capacity, generator capability, and safety from flood contours.

It automatically triggers operational warnings when shelter occupancy crosses 85%, alerting EOC managers to redirect subsequent evacuation convoys to secondary overflow facilities.`,
    technicalDetails: [
      'findNearestShelters(lng, lat, maxDistanceMeters): Geospatial $near query on Shelter collection.',
      'updateOccupancy(shelterId, countDelta): Atomically adjusts occupancy; verifies capacity limits.',
      'checkCapacityThreshold(shelter): Emits warning if occupancy exceeds 85% of total capacity.',
      'filterByAmenities(filters): Filters shelters by generator, water purifier, or medical staff availability.'
    ],
    dataFlow: 'Serves nearest safe shelter requests to CitizenPortal.jsx; audits capacity for EOC commanders.'
  },
  {
    path: 'server/services/simulationService.js',
    type: 'Simulation & Drill Engine',
    role: 'Deterministic Disaster Scenario Simulation, Time-Step Trajectory Advancing & Training Drill Orchestration',
    explanation: `simulationService.js provides a sophisticated disaster simulation and drill environment for training EOC emergency personnel. It models pre-configured cyclone scenarios (e.g., "Category 5 Super Cyclone Bay of Bengal Landfall") across discrete temporal time-steps (T+0h, T+6h, T+12h, T+24h).

With each simulation tick, the service advances storm coordinates along pre-computed trajectories, increases coastal wind speeds, expands storm surge zones, and generates synthetic civilian SOS calls and infrastructure incidents.

It broadcasts simulation ticks via Socket.IO, enabling trainees to experience realistic disaster operational tempo, practice mass evacuation orders, and optimize resource dispatches in a safe, repeatable sandbox environment without endangering real-world operational databases.`,
    technicalDetails: [
      'loadScenario(scenarioId): Loads pre-configured scenario parameters from mockData.js.',
      'stepSimulation(): Advances temporal offset by +6 hours; interpolates coordinates and wind speeds.',
      'injectSyntheticIncidents(step): Generates simulated power failures, road blocks, and SOS calls.',
      'resetSimulation(): Restores live operational state and notifies all connected client terminals.'
    ],
    dataFlow: 'Broadcasts simulation state over WebSockets; drives SimulationBar.jsx and drill training mode.'
  },

  // -------------------------------------------------------------------------
  // 6. REST ROUTE CONTROLLERS (ALL 14 ROUTES)
  // -------------------------------------------------------------------------
  {
    path: 'server/routes/adminRoutes.js',
    type: 'REST API Route',
    role: 'System Administration Endpoints, User Management, Agency Registration & Audit Log Retrieval',
    explanation: `adminRoutes.js defines administrative API endpoints restricted strictly to users with the admin role. It exposes routes for registering new response agencies, managing user accounts, modifying system parameters, and inspecting immutable audit trails.

The routes incorporate pagination and filter criteria, allowing administrators to audit operational actions performed during specific disaster operational phases.

Security is enforced via a composite middleware chain: router.use(protect, checkRole(['admin'])), guaranteeing that operational officers or public users cannot access privileged administrative controls.`,
    technicalDetails: [
      'GET /api/v1/admin/users: Paginated list of registered users with role and agency filters.',
      'POST /api/v1/admin/users: Create new operator account with assigned role and credentials.',
      'GET /api/v1/admin/audit-logs: Query immutable audit logs with date range and user filters.',
      'POST /api/v1/admin/agencies: Register new response organization (NDRF, Coast Guard, SDMA).'
    ],
    dataFlow: 'Restricted administrative traffic; powers User Administration and Audit Trail on AdminPage.jsx.'
  },
  {
    path: 'server/routes/alertRoutes.js',
    type: 'REST API Route',
    role: 'Emergency Broadcast Endpoints, CAP-Compliant Alert Creation, Multi-District Geo-Targeting & Deactivation',
    explanation: `alertRoutes.js handles the lifecycle of emergency public alerts and warnings. It provides POST endpoints for EOC officers to compose and dispatch urgent cyclone warnings to targeted coastal districts.

Upon route execution, the controller writes the alert to MongoDB and immediately invokes socketManager.broadcastEmergencyAlert(), broadcasting the alert payload to all connected citizen browsers and EOC dashboards within milliseconds.

It also exposes GET endpoints for public citizens to retrieve active alerts filtered by their current geographical district or GPS coordinates.`,
    technicalDetails: [
      'GET /api/v1/alerts/active: Public endpoint returning currently active alerts for citizen viewports.',
      'POST /api/v1/alerts: Protected endpoint (officer, admin) to compose and broadcast a new CAP warning.',
      'PUT /api/v1/alerts/:id/deactivate: Allows officers to cancel or expire outdated emergency warnings.',
      'GET /api/v1/alerts/district/:district: Retrieves active alerts targeting specific administrative district.'
    ],
    dataFlow: 'Inbound alert authoring payloads; broadcasts to AlertBanner.jsx and CitizenPortal.jsx.'
  },
  {
    path: 'server/routes/analyticsRoutes.js',
    type: 'REST API Route',
    role: 'Meteorological Analytics, Historical Trend Reporting, Damage Assessment Aggregations & Export Feeds',
    explanation: `analyticsRoutes.js provides specialized analytical endpoints powering charts, time-series graphs, and executive reports on the AnalyticsForecast and ReportsPage views.

The controller executes MongoDB aggregation pipelines that compute cyclone intensity progressions, shelter occupancy trends, incident resolution rates by agency, and relief distribution throughput over time.

These analytical feeds enable commanders to identify logistical bottlenecks, monitor emergency response velocity, and generate statutory situation reports (SITREPs) for state and national disaster management authorities.`,
    technicalDetails: [
      'GET /api/v1/analytics/cyclone-intensity: Historical central pressure and wind speed curves.',
      'GET /api/v1/analytics/shelter-utilization: Aggregate capacity vs occupancy across all districts.',
      'GET /api/v1/analytics/incident-metrics: Resolution velocity and mean time to dispatch by severity tier.',
      'GET /api/v1/analytics/summary: Consolidated executive metrics for statutory SITREP generation.'
    ],
    dataFlow: 'Executes MongoDB aggregate queries; feeds charts in AnalyticsForecast.jsx and ReportsPage.jsx.'
  },
  {
    path: 'server/routes/authRoutes.js',
    type: 'REST API Route',
    role: 'User Authentication, Secure Login, Password Validation, JWT Token Issuance & Profile Self-Inspection',
    explanation: `authRoutes.js governs identity authentication across the application. It exposes public POST /login and POST /register endpoints. During login, it validates credentials against bcrypt password hashes and, upon verification, signs and issues a JSON Web Token (JWT) containing user ID and role claims.

The file also exposes a protected GET /me route that allows clients to fetch the currently authenticated user's profile and permissions upon application boot or page refresh.

Rate limiting can be attached to prevent brute-force credential stuffing attacks on administrative accounts.`,
    technicalDetails: [
      'POST /api/v1/auth/login: Validates email/password; returns JWT token and user profile object.',
      'POST /api/v1/auth/register: Registers new civilian user account with default citizen role.',
      'GET /api/v1/auth/me: Protected endpoint returning active user profile using req.user.',
      'POST /api/v1/auth/logout: Clears server session tokens if cookie-based auth is configured.'
    ],
    dataFlow: 'Validates user credentials; returns signed JWT tokens stored in client localStorage.'
  },
  {
    path: 'server/routes/citizenRoutes.js',
    type: 'REST API Route',
    role: 'Public Citizen Services, SOS Distress Signal Submission, Nearest Safe Shelter Lookup & Family Safety Check-In',
    explanation: `citizenRoutes.js provides public-facing, low-friction API endpoints specifically designed for citizens living in cyclone-threatened coastal areas. It allows anonymous or citizen-authenticated users to transmit high-priority SOS emergency assistance requests containing exact GPS coordinates and distress descriptions.

It provides optimized GET endpoints for finding nearest available shelters, retrieving local evacuation instructions, and submitting safe family check-ins.

These endpoints are optimized for low bandwidth and mobile browsers, ensuring rapid payload delivery even under degraded coastal mobile network conditions.`,
    technicalDetails: [
      'POST /api/v1/citizen/sos: Ingests citizen SOS beacons with GPS coordinates and urgency metadata.',
      'GET /api/v1/citizen/nearest-shelter: Geospatial $near query finding safe shelters with capacity.',
      'GET /api/v1/citizen/warnings: Returns localized warnings and evacuation advisories.',
      'POST /api/v1/citizen/check-in: Allows displaced persons to register as safe for family tracing.'
    ],
    dataFlow: 'Serves the public CitizenPortal.jsx; feeds distress beacons directly to EOC triage desks.'
  },
  {
    path: 'server/routes/cycloneRoutes.js',
    type: 'REST API Route',
    role: 'Cyclone Telemetry Management, Active Storm Track Queries, Manual Intensity Overrides & NASA Ingestion Triggers',
    explanation: `cycloneRoutes.js manages all meteorological data endpoints. It provides GET / to list active cyclonic storms, GET /:id to retrieve comprehensive track history and 72-hour forecast cones for a specific cyclone, and POST /sync-live to trigger on-demand synchronization with NASA EONET and GDACS satellite feeds.

It also allows authorized meteorologists and operations officers to manually record new storm fixes or modify wind radii parameters during real-time radar trackings.

Every track update processed through these routes automatically notifies connected clients via WebSocket broadcast events.`,
    technicalDetails: [
      'GET /api/v1/cyclones: Lists all active cyclonic storms with latest fix coordinates and wind speed.',
      'GET /api/v1/cyclones/:id: Comprehensive track history, wind radii, and 72-hour forecast cones.',
      'POST /api/v1/cyclones/sync-live: Manually triggers external NASA EONET and GDACS synchronization.',
      'POST /api/v1/cyclones/:id/track: Authorized route to append new radar tracking fix.'
    ],
    dataFlow: 'Supplies storm coordinates and wind envelopes to CommandCenter.jsx and CycloneTracker.jsx.'
  },
  {
    path: 'server/routes/disasterRoutes.js',
    type: 'REST API Route',
    role: 'Master Disaster Declaration Endpoints, Phase Transitions, Multi-Agency Coordination & Metric Summaries',
    explanation: `disasterRoutes.js controls high-level disaster operational state transitions. It provides endpoints for EOC Commanders to officially declare a disaster event, transition operational phases (e.g., from Cyclone Watch to Landfall Warning), and link meteorological storms to activated civil defense plans.

The route coordinates multi-agency activations, querying disasterAggregator to provide unified operational status summaries across all coastal districts.

Only verified Administrators and Operations Officers are authorized to execute state transitions via these routes.`,
    technicalDetails: [
      'GET /api/v1/disasters/active: Returns current declared disaster event and operational phase.',
      'POST /api/v1/disasters/declare: Formally issues disaster declaration under Disaster Management Act.',
      'PUT /api/v1/disasters/:id/phase: Transitions phase (Watch -> Warning -> Landfall -> Relief).',
      'GET /api/v1/disasters/summary: Returns cross-agency operational summary metrics.'
    ],
    dataFlow: 'Governs overarching disaster lifecycle; consumed by DashboardLayout.jsx top marquee.'
  },
  {
    path: 'server/routes/evacuationRoutes.js',
    type: 'REST API Route',
    role: 'Evacuation Corridor Management, Clearance Time Inquiries, Route Activation & Zone Evacuation Orders',
    explanation: `evacuationRoutes.js governs evacuation operations. It exposes endpoints to retrieve calculated evacuation corridors, clearance time estimates, and designated pickup zones.

It allows Operations Officers to officially activate evacuation orders for specific coastal taluks, which in turn triggers automated emergency broadcasts and updates the tactical map overlay with highlighted evacuation arteries.

The route also tracks real-time civilian evacuation counts reported by transit checkpoint officers.`,
    technicalDetails: [
      'GET /api/v1/evacuation/plans: Lists all sectoral evacuation plans with clearance times.',
      'POST /api/v1/evacuation/plans: Creates new sectoral evacuation plan with designated shelters.',
      'PUT /api/v1/evacuation/plans/:id/activate: Formally issues mandatory evacuation order.',
      'POST /api/v1/evacuation/checkpoint: Records evacuee transit counts reported from highway checkpoints.'
    ],
    dataFlow: 'Powers EvacuationPlanning.jsx; triggers CAP broadcast alerts upon order issuance.'
  },
  {
    path: 'server/routes/incidentRoutes.js',
    type: 'REST API Route',
    role: 'Emergency Incident Dispatch, Kanban Board Status Transitions, Resource Allocation & Photo Uploads',
    explanation: `incidentRoutes.js provides comprehensive CRUD and workflow transition endpoints for field incidents. It powers the IncidentBoard Kanban UI, supporting transitions between Reported, Dispatched, In Progress, and Resolved states.

It exposes endpoints for dispatching specific ResponseTeams to emergency incidents and allows field responders to append situation updates, casualty reports, and resolution timestamps.

All status mutations trigger immediate WebSocket broadcasts, keeping commanders and field units continuously synchronized.`,
    technicalDetails: [
      'GET /api/v1/incidents: Retrieves all field incidents with severity, type, and status filters.',
      'POST /api/v1/incidents: Records new emergency incident with GPS coordinates and photos.',
      'PUT /api/v1/incidents/:id/status: Updates Kanban status (reported -> dispatched -> resolved).',
      'PUT /api/v1/incidents/:id/dispatch: Assigns ResponseTeam to incident; emits WebSocket update.'
    ],
    dataFlow: 'Powers IncidentBoard.jsx Kanban board; sends tactical notifications to field responders.'
  },
  {
    path: 'server/routes/reliefRoutes.js',
    type: 'REST API Route',
    role: 'Logistics Supply Chain Management, Warehouse Inventory Tracking, Convoy Manifests & Delivery Verification',
    explanation: `reliefRoutes.js manages relief logistics operations. It exposes endpoints for monitoring warehouse inventory levels, creating outbound relief distribution convoys, and logging receipt confirmations at frontline cyclone shelters.

It interfaces with reliefOptimizerService to expose an automated supply recommendation endpoint, helping logistics coordinators identify which shelters require urgent water, food, or medical replenishments.

The route enforces strict role validation, ensuring only logistics officers and authorized warehouse managers can modify supply quantities.`,
    technicalDetails: [
      'GET /api/v1/relief/inventory: Audits stock levels across all relief warehouses and shelters.',
      'POST /api/v1/relief/convoys: Creates outbound distribution convoy manifest with truck and driver info.',
      'PUT /api/v1/relief/convoys/:id/deliver: Confirms safe delivery receipt at destination shelter.',
      'GET /api/v1/relief/deficits: Evaluates shelter supply deficits and recommends optimal restock runs.'
    ],
    dataFlow: 'Manages emergency relief supply chain on ReliefCoordination.jsx.'
  },
  {
    path: 'server/routes/responseTeamRoutes.js',
    type: 'REST API Route',
    role: 'Tactical Team Telemetry, Responder GPS Location Ingestion, Duty Status Transitions & Field Rosters',
    explanation: `responseTeamRoutes.js manages tactical response units (NDRF, SDRF, Coast Guard). It provides endpoints to register response teams, inspect their current operational readiness, and ingest high-frequency GPS coordinate beacons transmitted by field units.

It also allows commanders to assign teams to specific high-severity incidents or relief convoy security escorts.

Spatial queries exposed by these routes enable the Command Map to display live moving vehicle and boat icons across the disaster operational theatre.`,
    technicalDetails: [
      'GET /api/v1/response-teams: Lists all tactical rescue units with live readiness status.',
      'POST /api/v1/response-teams/telemetry: High-frequency GPS endpoint for field mobile apps.',
      'PUT /api/v1/response-teams/:id/status: Updates duty state (Available, En Route, On Scene).',
      'GET /api/v1/response-teams/nearby: Geospatial search finding nearest teams to emergency coordinates.'
    ],
    dataFlow: 'Ingests field GPS beacons; renders live tactical team positions on CommandMap.jsx.'
  },
  {
    path: 'server/routes/riskRoutes.js',
    type: 'REST API Route',
    role: 'Coastal Risk Assessment Endpoints, Vulnerability Polygon Queries & Dynamic Hazard Heatmap Generation',
    explanation: `riskRoutes.js serves spatial risk analysis data. It exposes endpoints that return multi-criteria coastal risk zones formatted as standard GeoJSON FeatureCollections, ready for immediate rendering on the Leaflet CommandMap.

It allows officers to query vulnerable populations within specific coastal buffers and triggers dynamic recalculation of hazard indices when storm wind speeds or surge predictions change.

This data underpins pre-landfall evacuation planning and targeted warning dissemination.`,
    technicalDetails: [
      'GET /api/v1/risk/zones: Returns GeoJSON FeatureCollection of coastal vulnerability polygons.',
      'GET /api/v1/risk/assessment/:cycloneId: Calculates dynamic risk scores based on active storm track.',
      'GET /api/v1/risk/vulnerable-headcount: Returns aggregate count of residents in high-risk zones.',
      'POST /api/v1/risk/recalculate: Recalculates risk indices upon receipt of updated storm wind fixes.'
    ],
    dataFlow: 'Feeds GeoJSON risk overlays to CommandMap.jsx and charts in ImpactAssessment.jsx.'
  },
  {
    path: 'server/routes/shelterRoutes.js',
    type: 'REST API Route',
    role: 'Shelter Network Directory, Occupancy Reporting, Amenity Inspections & Resource Deficit Audits',
    explanation: `shelterRoutes.js governs the multi-purpose cyclone shelter network. It provides endpoints for listing all regional shelters, filtering by current availability and facilities (generator, water filtration, medical clinic), and updating live headcounts as evacuee buses arrive.

It also serves the critical nearest-shelter query utilized by coastal citizens seeking immediate life safety during storm landfall.

Shelter managers utilize these endpoints to report supply shortages directly to the central EOC logistics desk.`,
    technicalDetails: [
      'GET /api/v1/shelters: Filterable list of all designated shelters with capacity and occupancy.',
      'GET /api/v1/shelters/:id: Detailed shelter profile with amenities, supply levels, and contact info.',
      'PUT /api/v1/shelters/:id/occupancy: Updates evacuee headcount; validates against maximum capacity.',
      'GET /api/v1/shelters/nearby: Geospatial query for public citizen nearest shelter discovery.'
    ],
    dataFlow: 'Powers SheltersManagement.jsx; updates real-time occupancy pins on CommandMap.jsx.'
  },
  {
    path: 'server/routes/simulationRoutes.js',
    type: 'REST API Route',
    role: 'Disaster Simulation Controls, Scenario Selection, Time-Step Advancement & Virtual Drill Resets',
    explanation: `simulationRoutes.js exposes control endpoints for the disaster training and simulation engine. It enables EOC trainers to launch predefined disaster drills, step forward through temporal intervals (T+6h, T+12h, T+24h), inject synthetic emergencies, and reset the simulation environment back to baseline states.

All simulation state mutations emit coordinated Socket.IO events that drive the frontend SimulationBar and time-slider UI widgets.

Access to these routes is strictly guarded to prevent accidental drill activation during actual real-world cyclone events.`,
    technicalDetails: [
      'POST /api/v1/simulation/start: Initiates simulation drill with selected historical scenario.',
      'POST /api/v1/simulation/step: Advances simulation timeline by +6 hours; emits simulation:tick.',
      'POST /api/v1/simulation/reset: Terminates drill and restores production real-time feeds.',
      'GET /api/v1/simulation/status: Returns current simulation mode, active scenario, and elapsed time.'
    ],
    dataFlow: 'Controls virtual training drills; coordinates with SimulationContext.jsx and SimulationBar.jsx.'
  },

  // -------------------------------------------------------------------------
  // 7. SEED SCRIPT, MANIFESTS & ENVIRONMENT TEMPLATES
  // -------------------------------------------------------------------------
  {
    path: 'server/scripts/seed.js',
    type: 'Database Seeding Script',
    role: 'Comprehensive Database Seeder, Realistic Coastal Data Synthesizer & Operational Baseline Initializer',
    explanation: `seed.js is a standalone operational script that populates a clean MongoDB database with realistic, high-fidelity disaster management data. It connects to the database via Mongoose, purges existing test collections, and systematically inserts coordinated records across all 14 database models.

The script seeds administrative user accounts (admin, officer, responder, citizen) with pre-computed bcrypt password hashes. It creates realistic cyclone tracking histories for severe Bay of Bengal storms, populates multi-purpose cyclone shelters across coastal districts, registers NDRF and SDRF response teams with real GPS coordinates, maps vulnerable coastal risk polygons, and populates warehouse inventories with emergency relief supplies.

Executing "npm run seed" establishes a turnkey, production-grade operational environment ready for immediate live demonstrations, operator training drills, or unit testing.`,
    technicalDetails: [
      'Database Purge: Cleans collections using Promise.all(models.map(m => m.deleteMany({}))).',
      'Entity Seeding: Seeds Users, Agencies, Cyclones, Shelters, Teams, Incidents, Inventories.',
      'Password Hashing: Uses bcryptjs to generate authentic cryptographic hashes for test accounts.',
      'Execution: node scripts/seed.js (or npm run seed) with automated terminal logging.'
    ],
    dataFlow: 'Direct database population; establishes initial records for development and demonstrations.'
  },
  {
    path: 'server/package.json',
    type: 'Node.js Package Manifest',
    role: 'Server Dependencies Specification, Runtime Scripts, Engine Versioning & Project Metadata',
    explanation: `package.json defines the operational dependencies, scripts, and runtime configuration for the backend Node.js server. It specifies critical production libraries including express (HTTP routing), mongoose (MongoDB ODM), socket.io (real-time WebSockets), jsonwebtoken and bcryptjs (security and cryptography), axios (HTTP requests for external APIs), cors and dotenv (configuration and security), and pdfkit (programmatic PDF document generation).

The file defines standard operational npm scripts: "start" (node server.js), "dev" (nodemon server.js for hot-reloading development), and "seed" (node scripts/seed.js).

It ensures deterministic dependency resolution across deployment environments and documents the server runtime requirements.`,
    technicalDetails: [
      'Dependencies: express, mongoose, socket.io, jsonwebtoken, bcryptjs, axios, cors, dotenv, pdfkit.',
      'DevDependencies: nodemon (optional development hot-reloading).',
      'Scripts: { "start": "node server.js", "dev": "nodemon server.js", "seed": "node scripts/seed.js" }.',
      'Node Engine: Configured for Node.js LTS (>= 18.0.0).'
    ],
    dataFlow: 'Parsed by npm/yarn package managers to install runtime modules in server/node_modules/.'
  },
  {
    path: 'server/.env.example',
    type: 'Configuration Template',
    role: 'Environment Variable Specifications, Port Allocations, Database URIs & Secret Key Templates',
    explanation: `.env.example provides the official template documenting all required environment variables for the backend application. It defines PORT (default 5000), MONGO_URI (MongoDB connection string), JWT_SECRET (cryptographic signing key for user authentication tokens), CLIENT_URL (frontend origin for CORS whitelisting), and external meteorological API configuration endpoints.

This template guarantees that new systems engineers and deployment specialists can configure a secure, functional production or staging environment without exposing sensitive production secrets in version control.`,
    technicalDetails: [
      'PORT: TCP listener port for HTTP and WebSocket traffic (standard 5000).',
      'MONGO_URI: MongoDB connection string (e.g., mongodb://127.0.0.1:27017/cyclone_management).',
      'JWT_SECRET: High-entropy secret key for cryptographic JWT token signing.',
      'CLIENT_URL: CORS whitelisted frontend URL (standard http://localhost:5173).'
    ],
    dataFlow: 'Read during server startup via dotenv.config(); injected into process.env.'
  }
];

module.exports = {
  backendFiles
};
