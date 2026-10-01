// Comprehensive File Catalog for Cyclone Disaster Management System Documentation
// Contains detailed technical metadata and multi-paragraph architectural explanations
// for all 83 files in the project.

const backendFiles = [
  {
    path: 'server/server.js',
    type: 'Core Entry Point',
    role: 'Primary HTTP Server, Express Application Initialization, Socket.IO Server Binding & Lifecycle Orchestrator',
    explanation: `server.js serves as the master execution gateway for the backend runtime. It initializes the Express application, configures global CORS policies, parses inbound JSON payloads, and establishes the foundational HTTP server using Node.js's native http module. It mounts the Socket.IO real-time engine via socketManager.js, binding duplex WebSocket channels onto the active HTTP port.

The file orchestrates the connection to MongoDB through config/db.js, gracefully handling connection errors and retry loops. It systematically mounts all 14 REST route modules onto dedicated URI namespaces (/api/v1/cyclones, /api/v1/evacuation, /api/v1/incidents, /api/v1/shelters, etc.). In addition, it launches background synchronization daemons that poll global meteorological APIs (NASA EONET, GDACS) every 15 minutes, ensuring the database stays synchronized with live oceanic cyclone telemetry.

Finally, server.js establishes the centralized error handling middleware and uncaught exception handlers. It ensures graceful shutdown sequences by listening for SIGINT and SIGTERM OS signals, closing active MongoDB database connections, terminating WebSocket listener pools, and safely stopping server listener sockets without dropping in-flight emergency network packets.`
  },
  {
    path: 'server/sockets/socketManager.js',
    type: 'Real-Time Engine',
    role: 'WebSocket Lifecycle Manager, Channel Multiplexer, Room Partitioning & Live Event Emitter',
    explanation: `socketManager.js abstracts and manages the entire Socket.IO real-time communication infrastructure. It encapsulates connection authentication, room-based broadcast segregation, and bidirectional message transmission between the server and connected web clients. When clients connect, socketManager assigns them to contextual rooms such as eoc-commanders, responders, or general-public depending on their verified credentials.

The module provides high-level utility functions like broadcastCycloneUpdate(), emitNewIncident(), broadcastEmergencyAlert(), and emitSimulationTick(). These utilities allow any controller or service across the backend architecture to trigger real-time client UI updates with a single function call, bypassing the overhead of polling.

During disaster simulations, socketManager handles high-frequency state updates, streaming storm coordinate deltas, shifting wind radii, and shelter occupancy changes at sub-second intervals. It also handles reconnection handshakes, maintaining state integrity even when emergency field responders experience intermittent network connectivity in coastal disaster zones.`
  },
  {
    path: 'server/config/db.js',
    type: 'Database Configuration',
    role: 'MongoDB Connection Manager, Mongoose ODM Configuration & Index Verification',
    explanation: `db.js establishes and maintains the persistent connection between the Node.js application and the MongoDB database cluster using the Mongoose Object Document Mapper (ODM). It reads connection strings and credentials from environment variables (MONGO_URI), supporting both local replica sets and cloud-hosted MongoDB Atlas deployments.

The module configures essential connection pool options, including maxPoolSize, serverSelectionTimeoutMS, socketTimeoutMS, and autoIndex creation. It monitors the Mongoose connection lifecycle through event listeners (connected, error, disconnected, reconnected), logging operational statuses to stdout for system administrators.

Crucially, db.js triggers the background verification and creation of 2dsphere geospatial indexes across spatial collections (Cyclones, Shelters, Incidents, RiskZones, ResponseTeams). These spherical indexes enable high-speed $near, $geoWithin, and $geoIntersects queries, allowing the system to perform millisecond-level spatial queries across thousands of disaster coordinates without latency.`
  },
  {
    path: 'server/config/constants.js',
    type: 'System Constants',
    role: 'Global Enums, Threshold Matrices, Cyclone Classifications & Severity Dictionaries',
    explanation: `constants.js provides a single, immutable source of truth for domain-specific constants, operational thresholds, and enumerations used across the entire backend. It defines standard meteorological categories established by the India Meteorological Department (IMD) and World Meteorological Organization (WMO), including Depression (DD), Deep Depression (CS), Cyclonic Storm, Severe Cyclonic Storm (SCS), Very Severe Cyclonic Storm (VSCS), Extremely Severe Cyclonic Storm (ESCS), and Super Cyclonic Storm (SuCS).

The file codifies critical thresholds such as wind speed bands (34 kt, 50 kt, 64 kt), central atmospheric pressure minima (hPa), storm surge heights (meters), and risk score weighting coefficients. It also standardizes system-wide user roles (admin, officer, responder, coordinator, volunteer, citizen) and incident statuses (reported, verified, dispatched, resolved).

By centralizing these constants, the application eliminates magic numbers and hardcoded string literals across routes, controllers, models, and analytical calculation engines, preventing subtle operational bugs and ensuring regulatory compliance with disaster management guidelines.`
  },
  {
    path: 'server/config/mockData.js',
    type: 'Simulation Seed Data',
    role: 'Comprehensive Reference Datasets, Historical Cyclone Tracks & Coastal GIS Feature Sets',
    explanation: `mockData.js provides rich, high-fidelity datasets representing real-world coastal geography, historical cyclonic storms in the Bay of Bengal and Arabian Sea, relief warehouse inventories, pre-designated multi-purpose cyclone shelters, and emergency response teams. It models scenarios based on catastrophic cyclones such as Super Cyclone Amphan, Cyclone Fani, and Cyclone Biparjoy.

The file contains detailed GeoJSON coordinates for vulnerable coastal districts across Odisha, Andhra Pradesh, Tamil Nadu, West Bengal, and Gujarat. Each shelter record includes structural capacity, generator availability, elevated plinth levels, water filtration capabilities, and medical supply stores.

These reference datasets serve dual purposes: they seed initial database states during local deployment or disaster drills (via seed.js), and they act as deterministic test fixtures for algorithmic regression testing across the risk scoring, shelter allocation, and evacuation routing engines.`
  },
  {
    path: 'server/middleware/auth.js',
    type: 'Security Middleware',
    role: 'JSON Web Token (JWT) Verification, Stateless Authentication & Request Context Injection',
    explanation: `auth.js enforces stateless, token-based authentication across all protected API routes in the Cyclone Disaster Management System. It intercepts inbound HTTP requests, extracts bearer tokens from the standard Authorization header (or session cookies), and cryptographically validates the token against the application's JWT_SECRET using the jsonwebtoken library.

Upon successful verification, the middleware queries the MongoDB database to retrieve the active user profile, ensuring that deactivated, suspended, or invalid accounts cannot access restricted endpoints. It attaches the authenticated user document directly to req.user, making identity context seamlessly available to downstream controllers.

If the token is missing, malformed, expired, or cryptographically invalid, auth.js immediately halts the request lifecycle, returning a structured HTTP 401 Unauthorized response with a standardized JSON error envelope, preventing unauthorized data exfiltration from the emergency command platform.`
  },
  {
    path: 'server/middleware/rbac.js',
    type: 'Security Middleware',
    role: 'Role-Based Access Control (RBAC), Permission Matrix Validation & Authorization Gatekeeper',
    explanation: `rbac.js implements granular Role-Based Access Control to enforce organizational hierarchy and operational security across multi-agency emergency operations. It accepts an array of permitted roles (e.g., checkRole(['admin', 'officer'])) and compares the caller's req.user.role against the allowed operational tiers.

The middleware implements strict defense-in-depth principles: while general citizens can submit emergency assistance requests (SOS) and view public shelter locations, only Operations Officers and Administrators can issue mandatory evacuation orders, broadcast emergency alerts, or modify live cyclone telemetry. Field responders are restricted to updating assigned incidents and reporting tactical statuses.

When an authenticated user attempts to execute an action beyond their designated authorization level, rbac.js rejects the request with an HTTP 403 Forbidden status code and generates an automated entry in the system audit log, alerting EOC administrators to potential unauthorized access attempts.`
  },
  {
    path: 'server/middleware/errorHandler.js',
    type: 'Error Handling Middleware',
    role: 'Centralized Exception Interceptor, Operational Error Normalization & Safe Error Response Formatter',
    explanation: `errorHandler.js is the terminal middleware mounted at the end of the Express request pipeline. It captures all synchronous exceptions and asynchronous rejections passed via next(err), preventing unhandled exceptions from crashing the Node.js event loop during critical emergency operations.

The middleware inspects error types, normalizing Mongoose validation errors, duplicate key constraints (MongoServerError 11000), JWT authentication failures, and custom AppError instances into consistent, standardized JSON payloads with appropriate HTTP status codes (400, 401, 403, 404, 422, 500).

In production environments, errorHandler.js suppresses internal stack traces and database connection strings to prevent information leakage to malicious actors, while providing human-readable, actionable diagnostic messages to client applications. In development mode, full diagnostic traces are preserved to expedite rapid developer debugging.`
  }
];

module.exports = {
  backendFiles
};
