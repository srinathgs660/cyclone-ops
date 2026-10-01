// Complete Frontend & Repository Source Code Documentation Catalog (Enriched Edition)
// Exhaustive technical specifications, hooks, props, and UI architectures for all 35 client & root files

const frontendFiles = [
  // -------------------------------------------------------------------------
  // 1. ENTRY POINTS, SHELLS & GLOBAL STYLES
  // -------------------------------------------------------------------------
  {
    path: 'client/index.html',
    type: 'Frontend HTML Shell',
    role: 'Root Single Page Application Shell, Leaflet CSS Linkage, Typography CDN & Viewport Meta Configuration',
    explanation: `index.html serves as the foundational HTML5 entry document for the React Single Page Application (SPA). It configures the essential responsive viewport metadata (<meta name="viewport" content="width=device-width, initial-scale=1.0">), guaranteeing proper layout scaling across high-resolution command center video walls, desktop monitors, tablets, and field mobile devices.

The document directly links external stylesheets required before bundle initialization, specifically the Leaflet 1.9.4 CSS stylesheet (leaflet.css). This external linkage ensures that map tile containers, marker pin sprites, tooltip balloons, and zoom control button styles are immediately available in the DOM before React components mount, preventing awkward unstyled layout shifts (FOUC).

Furthermore, index.html preconnects and loads high-readability tactical typography from Google Fonts: 'Plus Jakarta Sans' for clean, geometric UI typography and 'JetBrains Mono' for high-precision GPS coordinates, barometric pressures, and telemetry numerals. The root <div> element with id="root" provides the mount target for the React virtual DOM tree.`,
    technicalDetails: [
      'External CSS: <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />.',
      'Google Fonts: Plus Jakarta Sans (weights 400-800) and JetBrains Mono (weights 400-700).',
      'Body Attributes: class="bg-[#0B1120] text-slate-100 antialiased font-[\'Plus_Jakarta_Sans\',sans-serif]".',
      'Mount Target: <div id="root"></div> hydrated by React createRoot in main.jsx.'
    ],
    dataFlow: 'Initial HTTP response loaded by client browser; loads Leaflet styles and web fonts before executing main.jsx.'
  },
  {
    path: 'client/src/main.jsx',
    type: 'React DOM Entry Point',
    role: 'React Virtual DOM Root Mounter, StrictMode Enforcement & Global Provider Tree Assembly',
    explanation: `main.jsx is the top-level JavaScript entry point executed by the browser engine upon loading the SPA bundle. It imports React 18's createRoot API from 'react-dom/client' and mounts the root application component into the DOM container element with id 'root'.

The file encapsulates the application within React.StrictMode, enabling enhanced development-time checks for component side effects, deprecated API usage, and unhandled memory leaks. It imports the master Tailwind CSS stylesheet (index.css), propagating global utility classes, custom scrollbar styling, and color variables throughout the component hierarchy.

By serving as the clean gateway between the static HTML shell and dynamic React component tree, main.jsx ensures reliable client-side hydration and initializes top-level runtime instrumentation.`,
    technicalDetails: [
      'DOM Root: ReactDOM.createRoot(document.getElementById("root")).render(...).',
      'StrictMode: Wraps <App /> in <React.StrictMode> for runtime sanity checks.',
      'Global Styles Import: Imports "./index.css" for Tailwind and Leaflet custom CSS.',
      'Module Architecture: Native ES Module executed via <script type="module" src="/src/main.jsx">.'
    ],
    dataFlow: 'Mounts React Virtual DOM into static index.html shell; initializes top-level React component tree.'
  },
  {
    path: 'client/src/App.jsx',
    type: 'Root Application Component & Router',
    role: 'Centralized React Router Configuration, Role-Based Route Protection & Global Context Hierarchy',
    explanation: `App.jsx defines the central routing topology and global state architecture of the client application using React Router v6. It nests the entire component tree within four essential React Context Providers: ThemeProvider (dark/light theme toggle), AuthProvider (user session and token management), SocketProvider (real-time WebSocket connectivity), and SimulationProvider (disaster training scenario state).

The component implements declarative routing via <Routes> and <Route> elements. It defines public unauthenticated paths (/ for LandingPage, /login for LoginPage, and /citizen for the public CitizenPortal) alongside protected operations routes wrapped within ProtectedRoute higher-order components.

These protected routes dynamically enforce Role-Based Access Control on the client side: attempting to navigate to /admin without the 'admin' role, or /command without authorized operational credentials, automatically redirects users with clear visual feedback. The file also nests operational viewports within the persistent DashboardLayout, ensuring consistent navigation headers and sidebar controls across all views.`,
    technicalDetails: [
      'Provider Hierarchy: ThemeProvider -> AuthProvider -> SocketProvider -> SimulationProvider -> BrowserRouter.',
      'Public Routes: "/" (LandingPage), "/login" (LoginPage), "/citizen" (CitizenPortal).',
      'Protected Routes: "/command", "/tracker", "/impact", "/evacuation", "/shelters", "/incidents", "/admin".',
      'Route Guard: <ProtectedRoute requiredRole="..."> validates user permissions before rendering.'
    ],
    dataFlow: 'Intercepts browser URL location; checks authentication/role status; renders matched layout and page component.'
  },
  {
    path: 'client/src/index.css',
    type: 'Global CSS & Tailwind Rules',
    role: 'Tailwind CSS Directive Imports, Dark Military Color Variables, Custom Scrollbars & Tactical Shader Filters',
    explanation: `index.css defines the comprehensive global styling framework for the frontend interface. It imports the foundational Tailwind CSS directives (@tailwind base; @tailwind components; @tailwind utilities;), enabling high-velocity utility-first CSS styling throughout the application.

Crucially, index.css establishes the custom military-grade dark command center theme. It defines CSS custom properties for deep navy/slate backgrounds (#0B1120, #0F172A), border hairlines (#1E293B, #334155), and neon accent highlights representing operational severities (emerald for safe/resolved, amber for warning/standby, rose for critical danger, and cyan for active telemetry).

The file contains the vital architectural CSS rules that resolved the application-wide scroll lock: it sets html and body to overflow-x: hidden, min-height: 100%, and overflow-y: auto, ensuring smooth, native vertical scrolling on all pages. Additionally, it defines the custom CSS filter shader class (.leaflet-dark-mode) that inverts and recolors standard OpenStreetMap raster tiles into a high-contrast tactical night-vision map.`,
    technicalDetails: [
      'Scroll Lock Architecture: html, body { min-height: 100%; overflow-y: auto; overflow-x: hidden; }.',
      'Tactical Dark Map Shader: .leaflet-dark-mode .leaflet-tile-pane { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3); }.',
      'Custom Scrollbars: ::-webkit-scrollbar styling with 6px width and slate-800 thumb.',
      'Keyframes: Custom radar-pulse and vortex-spin animations for tactical map icons.'
    ],
    dataFlow: 'Applied globally to browser DOM; styles all UI components, modals, and Leaflet map tile panes.'
  },

  // -------------------------------------------------------------------------
  // 2. CONTEXT STATE PROVIDERS (ALL 4 CONTEXTS)
  // -------------------------------------------------------------------------
  {
    path: 'client/src/context/AuthContext.jsx',
    type: 'React Context State Provider',
    role: 'Client Authentication State, JWT Token Storage, User Session Hydration & Login/Logout Methods',
    explanation: `AuthContext.jsx provides global identity, authentication state, and session lifecycle management across the client application. It encapsulates user credentials, role permissions, authentication loading states, and persistent token storage using browser localStorage.

Upon application mount, the context automatically checks for an existing JWT token in localStorage and validates it against the server's /api/v1/auth/me endpoint. If valid, it hydrates the active user object; if expired or corrupted, it clears stored credentials and resets state cleanly.

The provider exposes clean helper methods (login, logout, register, hasRole) via the custom useAuth() hook. This allows any UI component, navigation bar, or action button across the application to conditionally render administrative controls or enforce role restrictions with a single line of code.`,
    technicalDetails: [
      'State Variables: user (object), token (string), loading (boolean), error (string).',
      'useAuth() Hook: Exports { user, token, loading, login, logout, register, hasRole }.',
      'Token Storage: localStorage.setItem("token", jwtToken) and automatic Authorization header injection.',
      'Session Hydration: Checks /api/v1/auth/me in useEffect() upon initial application boot.'
    ],
    dataFlow: 'Manages user session token; provides authentication status and role checking functions to entire React tree.'
  },
  {
    path: 'client/src/context/SocketContext.jsx',
    type: 'React Context State Provider',
    role: 'Duplex WebSocket Client Connection, Automatic Reconnection, Event Subscription & Network Status',
    explanation: `SocketContext.jsx manages the real-time WebSocket connection to the backend server using the socket.io-client library. It establishes the persistent connection to the server URL, automatically passing authentication tokens during the initial connection handshake.

The context provides robust lifecycle resilience, handling disconnection events, reconnection attempts with exponential backoff, and network latency monitoring. It exposes the live socket instance and connection state (isConnected) via the custom useSocket() hook.

Components throughout the application consume this context to subscribe to real-time disaster events (cyclone:update, incident:new, alert:broadcast, simulation:tick), ensuring UI dashboards reflect changing disaster conditions instantaneously without manual browser refreshes.`,
    technicalDetails: [
      'State Variables: socket (Socket.IO client instance), isConnected (boolean).',
      'useSocket() Hook: Exports { socket, isConnected }.',
      'Connection Options: transports: ["websocket", "polling"], reconnectionAttempts: 10, reconnectionDelay: 2000.',
      'Token Auth Handshake: Injects auth: { token } from AuthContext into Socket.IO handshake payload.'
    ],
    dataFlow: 'Maintains persistent WebSocket channel to server port 5000; exposes subscription hooks to UI components.'
  },
  {
    path: 'client/src/context/ThemeContext.jsx',
    type: 'React Context State Provider',
    role: 'Dark/Light Tactical Theme Toggle, Local Storage Persistence & DOM Class Manipulation',
    explanation: `ThemeContext.jsx controls the visual theme mode (tactical dark mode vs high-contrast daylight mode) across the application. It defaults to the tactical dark theme (#0B1120) favored by emergency operations centers to minimize operator eye fatigue during extended 24-hour disaster shifts.

The context persists user theme preferences in localStorage and dynamically synchronizes the 'dark' class on the document's root <html> element, enabling Tailwind's dark: variant classes to adapt instantaneously across all UI components.

Exposing toggleTheme() and theme state via useTheme(), it empowers operators to switch to high-visibility daylight mode when operating laptops in direct coastal sunlight or field tents.`,
    technicalDetails: [
      'State Variables: theme ("dark" | "light").',
      'useTheme() Hook: Exports { theme, toggleTheme }.',
      'DOM Mutation: document.documentElement.classList.toggle("dark", theme === "dark").',
      'Persistence: Synchronizes with localStorage.getItem("app_theme") on mount.'
    ],
    dataFlow: 'Modifies root <html> element class attribute; propagates theme mode to all Tailwind CSS selectors.'
  },
  {
    path: 'client/src/context/SimulationContext.jsx',
    type: 'React Context State Provider',
    role: 'Disaster Training Drill State, Scenario Selector, Timeline Step Management & Virtual Data Overrides',
    explanation: `SimulationContext.jsx manages the state of the disaster training drill engine within the client interface. It tracks whether the application is operating in Live Mode (connected to real-world meteorological feeds) or Simulation Mode (executing a synthetic training drill).

The context maintains active scenario metadata, temporal simulation offsets (e.g., T+0h, T+6h, T+12h, T+24h Landfall), playback state (playing, paused, speed multiplier), and simulated data feeds. It synchronizes with the server's simulation service via dedicated WebSocket channels.

When simulation mode is active, the context injects synthetic storm vectors, expanding surge zones, and cascading emergency incidents into downstream views, allowing personnel to conduct immersive disaster drills without altering production operational records.`,
    technicalDetails: [
      'State Variables: isSimulation (boolean), activeScenario (object), step (number), simSpeed (number).',
      'useSimulation() Hook: Exports { isSimulation, activeScenario, step, startSimulation, stepForward, resetSimulation }.',
      'WebSocket Synchronization: Listens for "simulation:tick" and dispatches state updates to components.',
      'Data Layer Interception: Overrides live cyclone telemetry with synthetic drill parameters when active.'
    ],
    dataFlow: 'Coordinates with backend simulationService.js; controls simulation timeline displayed in SimulationBar.jsx.'
  },

  // -------------------------------------------------------------------------
  // 3. LAYOUTS & MASTER GIS MAP
  // -------------------------------------------------------------------------
  {
    path: 'client/src/layouts/DashboardLayout.jsx',
    type: 'Master Application Layout',
    role: 'EOC Command Shell, Responsive Collapsible Sidebar, Live Status Marquee, Header Bar & Main Viewport Container',
    explanation: `DashboardLayout.jsx serves as the overarching structural frame for all authenticated operational views in the Cyclone Disaster Management System. It establishes a multi-panel layout comprising a fixed top navigation header, a responsive collapsible navigation sidebar, and an expandable main content viewport.

The top header bar displays critical situational intelligence: live server connection pulses, current active cyclone names with IMD category badges, an emergency alert ticker banner, active user profile details with role badges, and quick-action buttons (Simulation Mode toggle, Theme switch, Logout). The sidebar provides intuitive navigation links to all 12 operational modules, automatically highlighting the active route and filtering links based on the user's RBAC role.

Crucially, DashboardLayout implements the structural layout architecture that guarantees page scrolling: the main container is configured with flex-1 h-screen overflow-y-auto, ensuring that dashboard pages with extensive tables, charts, or operational cards scroll vertically with complete fluidity while preserving the fixed command header.`,
    technicalDetails: [
      'Layout Structure: Flex container with fixed TopBar (h-14), Collapsible Sidebar (w-64/w-16), and Main Viewport.',
      'Scrolling Fix Architecture: Main container styled with className="flex-1 overflow-y-auto h-screen bg-[#0B1120]".',
      'Navigation Links: 12 modular operational links with Lucide React icons, filtered dynamically by user.role.',
      'Header Badges: Live connection indicator, active cyclone pill, CAP alert marquee, user role tag.'
    ],
    dataFlow: 'Wraps child Route elements (<Outlet />); passes authentication state to navigation components.'
  },
  {
    path: 'client/src/maps/CommandMap.jsx',
    type: 'Master GIS Mapping Engine',
    role: 'Leaflet 1.9 Map Controller, OpenStreetMap Tile Pipeline, Vector Layers, SVG DivIcons, Wind Radii & Landfall Cones',
    explanation: `CommandMap.jsx is the premier cartographic visualization engine of the entire disaster management platform. Built upon the robust, open-source Leaflet 1.9.4 library, it provides high-performance, interactive geospatial mapping of coastal disaster theaters without requiring costly proprietary map API keys.

The component streams raster map tiles directly from the official OpenStreetMap tile infrastructure (https://tile.openstreetmap.org/{z}/{x}/{y}.png). It applies an advanced CSS dark shader pipeline (.leaflet-dark-mode) to standard OSM tiles, dynamically transforming them into a sleek, tactical military-grade dark command display that integrates seamlessly with the EOC dark theme.

CommandMap renders a comprehensive array of layered geospatial features:
1. Cyclonic Storm Eye & Vortex: Custom animated SVG DivIcons displaying rotating spiral rainbands, pulsing central eyes, and color-coded severity halos.
2. Concentric Wind Radii: Geospatial circular vectors (L.circle) representing standard 34-knot (gale), 50-knot (storm-force), and 64-knot (hurricane-force) wind envelopes calculated in nautical miles and converted to meters.
3. 72-Hour Forecast Cones: Expanding polygon uncertainty envelopes and polyline projected trajectories illustrating projected storm tracks and estimated coastal landfall zones.
4. Multi-Purpose Shelters: Color-coded map markers displaying real-time occupancy percentages, structural amenities, and capacity status.
5. Tactical Response Teams: Live GPS vehicle and watercraft markers indicating responder locations, deployment states, and operational callsigns.
6. Field Emergency Incidents: Interactive warning markers pinpointing fallen power lines, collapsed bridges, flooding, and medical emergencies.
7. Coastal Risk Polygons: Semi-transparent GeoJSON polygon overlays color-coded by vulnerability index.

The component incorporates smooth camera flight transitions (map.flyTo([lat, lng], zoom, { duration: 1.5 })), automatically centering and zooming when operators select specific storms, shelters, or incidents from dashboard lists. To ensure optimal user experience and resolve scroll-wheel trapping, the map is configured with scrollWheelZoom={false}, allowing parent web pages to scroll naturally while preserving on-screen zoom buttons and full drag-pan navigation.`,
    technicalDetails: [
      'Leaflet Config: MapContainer with scrollWheelZoom={false}, zoomControl={true}, center={[20.5937, 78.9629]}, zoom={5}.',
      'TileLayer: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png with className="leaflet-dark-mode".',
      'Vector Layers: L.circle (concentric radii), L.polygon (forecast cone & risk zones), L.polyline (storm track).',
      'Custom SVG DivIcons: L.divIcon({ html: svgMarkup, className: "custom-vortex-icon", iconSize: [44, 44] }).',
      'Flight Controls: map.flyTo([lat, lng], zoom, { duration: 1.5 }) for smooth entity focus transitions.'
    ],
    dataFlow: 'Consumes cyclone tracks, shelters, incidents, and risk zones props; renders interactive SVG/raster map.'
  },

  // -------------------------------------------------------------------------
  // 4. REUSABLE UI COMPONENTS (ALL 5 COMPONENTS)
  // -------------------------------------------------------------------------
  {
    path: 'client/src/components/KpiCard.jsx',
    type: 'Reusable UI Component',
    role: 'Executive KPI Metric Display, Real-Time Delta Trends, Icon Accents & Severity Color Coding',
    explanation: `KpiCard.jsx renders executive summary metric cards displayed across the top of operational dashboards. It accepts props for title, metric value, unit suffix, percentage trend comparison, icon component, and semantic color variant (blue, emerald, amber, rose, cyan).

The component features subtle glowing gradients, hairline borders, and dark glassmorphic backgrounds. It incorporates animated counter transitions when metric values update via WebSocket feeds.

By standardizing metric presentation across the platform, KpiCard allows commanders to assess critical counts (Active Cyclones, Evacuated Persons, Shelter Capacity, Deployed Teams, Open Incidents) at a glance.`,
    technicalDetails: [
      'Props: title (string), value (number|string), unit (string), trend (number), icon (ReactNode), color (string).',
      'Color Variants: blue (#3B82F6), emerald (#10B981), amber (#F59E0B), rose (#EF4444), cyan (#06B6D4).',
      'Styling: bg-slate-900/60 border border-slate-800 backdrop-blur-sm rounded-xl p-4.',
      'Trend Indicator: Renders green upward arrow or red downward arrow based on positive/negative trend.'
    ],
    dataFlow: 'Receives aggregated metric values from parent dashboard; renders styled metric card.'
  },
  {
    path: 'client/src/components/CycloneInfoPanel.jsx',
    type: 'Reusable UI Component',
    role: 'Detailed Storm Telemetry Panel, Barometric Gauges, Wind Velocity Meters & Landfall Countdown',
    explanation: `CycloneInfoPanel.jsx renders an information-dense telemetry panel summarizing the meteorological state of an active cyclonic disturbance. It displays storm name, IMD intensity classification, coordinates (latitude/longitude in degrees and cardinal directions), current central pressure in hectopascals (hPa), and maximum sustained wind speeds in knots and km/h.

The component features visual progress bars comparing current wind speeds against historical super cyclone benchmarks (e.g., Cyclone Fani, Amphan). It includes forward speed vectors, compass heading azimuths, and an automated countdown timer to estimated coastal landfall.

Operators can toggle between imperial and metric units, inspect quadrant-specific wind radii dimensions, and trigger manual track refresh requests directly from this panel.`,
    technicalDetails: [
      'Props: cyclone (object), onRefresh (function), onFlyTo (function).',
      'Gauges: Visual progress bar representing current wind speed as percentage of 160 knots.',
      'Metric Conversion: Knots to km/h (knots * 1.852) and pressure delta calculations.',
      'Landfall Countdown: Computes remaining hours and minutes until estimated coastal intersection.'
    ],
    dataFlow: 'Consumes active Cyclone telemetry; renders real-time meteorological panel on CommandCenter.jsx.'
  },
  {
    path: 'client/src/components/AlertBanner.jsx',
    type: 'Reusable UI Component',
    role: 'High-Visibility Emergency Broadcast Banner, Audio Siren Trigger, CAP Urgency Styling & Dismissal',
    explanation: `AlertBanner.jsx provides a prominent, high-urgency broadcast banner mounted at the top of the interface whenever an active emergency warning is issued. It styles warnings based on CAP urgency tiers: red flashing borders for immediate evacuation warnings, amber for cyclone watches, and cyan for advisory updates.

The component supports automated audio alert chimes (using Web Audio API synthesizers) to immediately capture operator attention during high-priority broadcasts.

It displays affected coastal districts, recommended protective actions, issue timestamps, and authorizing agency signatures, with responsive dismissal controls for operational officers.`,
    technicalDetails: [
      'Props: alerts (array of objects), onDismiss (function).',
      'CAP Severity Styling: "Extreme" (red flashing animation), "Severe" (amber border), "Moderate" (cyan highlight).',
      'Audio Chime: Synthesizes two-tone emergency warning frequency using HTML5 AudioContext.',
      'Carousel / Multi-Alert: Cycle through multiple active warnings with left/right navigation arrows.'
    ],
    dataFlow: 'Subscribed to SocketContext alert:broadcast events; mounts dynamically when alerts are active.'
  },
  {
    path: 'client/src/components/RiskBadge.jsx',
    type: 'Reusable UI Component',
    role: 'Standardized Severity Pill Badge, Dynamic Color Coding, Pulsing Status Indicator & Compact Tag',
    explanation: `RiskBadge.jsx is an atomic UI component that renders compact, standardized risk level badges across data tables, incident lists, shelter cards, and map tooltips. It accepts a severity level prop (Critical, High, Moderate, Low, or Informational) and renders appropriate background tints, text colors, and icon glyphs.

For Critical and High risk states, the badge incorporates an animated pulsing CSS dot that signals active danger to operators.

Its standardized styling maintains visual consistency across diverse application views, ensuring immediate recognition of hazard tiers throughout the user interface.`,
    technicalDetails: [
      'Props: level ("Critical" | "High" | "Moderate" | "Low" | "Info"), size ("sm" | "md" | "lg").',
      'Color Mappings: Critical (rose-500/20 text-rose-400), High (amber-500/20 text-amber-400), Low (emerald-500/20 text-emerald-400).',
      'Animation: Includes <span className="animate-ping"> pulsing dot for Critical and High tiers.',
      'Compact Dimensions: Inline-flex styling with rounded-full border for embedding in dense data tables.'
    ],
    dataFlow: 'Consumes severity string prop; renders styled pill badge across all data tables and lists.'
  },
  {
    path: 'client/src/components/SimulationBar.jsx',
    type: 'Reusable UI Component',
    role: 'Simulation Control Header, Play/Pause Toggles, Time-Step Slider & Drill Scenario Status Display',
    explanation: `SimulationBar.jsx renders a dedicated, persistent control header that appears when the application enters Disaster Drill / Simulation Mode. It features interactive controls for playback: Play/Pause toggles, temporal step-forward buttons, playback speed selectors (1x, 2x, 5x real-time), and an interactive time-slider scrubbing through disaster phases (T-24h Advisory, T-12h Watch, T-6h Warning, T+0h Landfall, T+12h Recovery).

The bar displays the active scenario title, elapsed simulation time, and a prominent red "EXIT SIMULATION" button to safely return the interface to live operational monitoring.

It connects directly to SimulationContext, synchronizing user playback adjustments with the backend simulation engine via WebSocket commands.`,
    technicalDetails: [
      'Controls: Play/Pause button, Step Forward (+6h), Speed Selector (1x, 2x, 5x), Exit Drill button.',
      'Timeline Slider: <input type="range" min="0" max="4" value={step} onChange={handleSliderChange} />.',
      'Phase Labels: Visual markers indicating T-24h (Advisory), T-12h (Watch), T-6h (Warning), T+0h (Landfall).',
      'Status Banner: Displays active drill scenario name and simulated timestamp in high-contrast amber bar.'
    ],
    dataFlow: 'Subscribes to SimulationContext; dispatches drill control commands to backend simulation routes.'
  },

  // -------------------------------------------------------------------------
  // 5. APPLICATION PAGES (ALL 15 PAGES)
  // -------------------------------------------------------------------------
  {
    path: 'client/src/pages/LandingPage.jsx',
    type: 'Public Application Page',
    role: 'Public Gateway, System Mission Overview, Live Threat Indicator, Feature Highlights & Portal Entry Points',
    explanation: `LandingPage.jsx serves as the public front door to the Cyclone Disaster Management platform. Designed with clean, accessible visual aesthetics, it informs citizens, civic organizations, and visiting emergency officials about the system's operational capabilities.

The page features an interactive hero section displaying real-time cyclone alert summaries, high-level system capability overviews (GIS tracking, mass evacuation management, shelter coordination, emergency SOS dispatch), and dual entry gateways: one leading to the public Citizen Emergency Portal and another leading to the secured Command Center authentication portal.

It also presents emergency helpline directories (NDRF, State EOC, Coast Guard, Medical Services) accessible without requiring user registration or login credentials.`,
    technicalDetails: [
      'Sections: Hero Header, Live Threat Ticker, Feature Grid (GIS, Evacuation, Shelters, Logistics), Helplines Footer.',
      'Navigation Links: Quick buttons routing to "/citizen" (Public Portal) and "/login" (EOC Command Login).',
      'Live Threat Fetch: Queries public /api/v1/alerts/active to display current coastal cyclone warnings.',
      'Responsive Styling: Multi-column responsive layout optimized for mobile smartphones and desktop viewports.'
    ],
    dataFlow: 'Public entry point; fetches live active alerts; routes visitors to CitizenPortal or LoginPage.'
  },
  {
    path: 'client/src/pages/LoginPage.jsx',
    type: 'Authentication Page',
    role: 'Secure EOC Access Portal, Role Credential Inputs, Demo Account Selectors & JWT Session Launch',
    explanation: `LoginPage.jsx handles authenticated access into the restricted disaster command system. It features a secure login form with email and password fields, integrating client-side validation, password visibility toggles, and animated loading indicators during authentication handshakes.

To facilitate rapid testing, operator onboarding, and evaluation drills, the page includes convenient "Demo Quick-Login" buttons that instantly populate verified credentials for six operational roles: Admin (EOC Commander), Operations Officer, NDRF Responder, Logistics Coordinator, Volunteer, and Citizen.

Upon successful authentication via AuthContext, the component redirects users to their role's authorized home viewport (CommandCenter for commanders, IncidentBoard for responders, ReliefCoordination for logistics officers).`,
    technicalDetails: [
      'Form State: email, password, rememberMe, loading, error, showPassword.',
      'Demo Quick-Logins: 6 buttons pre-filling credentials for Admin, Officer, Responder, Coordinator, Volunteer, Citizen.',
      'API Integration: Calls authContext.login(email, password) which posts to /api/v1/auth/login.',
      'Role Redirection: Redirects to /command, /incidents, or /citizen based on decoded user.role.'
    ],
    dataFlow: 'Submits user credentials to backend authRoutes.js; stores JWT token in localStorage and redirects.'
  },
  {
    path: 'client/src/pages/CommandCenter.jsx',
    type: 'Core Operations Page',
    role: 'Master Executive EOC Dashboard, Dual-Pane GIS Map & Telemetry Feeds, Real-Time Incident Stream & KPI Ticker',
    explanation: `CommandCenter.jsx is the premier operational nexus of the entire platform. Designed for high-tempo emergency operations centers and video wall projection, it delivers complete, synchronized situational awareness across all disaster domains in a single unified interface.

The page features an executive KPI row displaying real-time metrics (Active Storms, Evacuated Citizens, Safe Shelter Capacity, Open Incidents, Deployed Rescue Battalions). The central viewport is dominated by the interactive CommandMap, accompanied by a collapsible side drawer featuring CycloneInfoPanel telemetry, live emergency broadcast feeds, and an active incident priority stream.

Incoming WebSocket updates trigger real-time UI transitions: new incidents pulse on the map, shelter occupancy meters adjust dynamically, and storm vector updates advance seamlessly across the tactical display without requiring manual page refreshes.`,
    technicalDetails: [
      'Components Mounted: KpiCard (x5), CommandMap, CycloneInfoPanel, AlertBanner, IncidentStream list.',
      'Data Fetching: Parallel queries to /api/v1/disasters/summary, /api/v1/cyclones, /api/v1/incidents.',
      'WebSocket Subscriptions: Listens for "cyclone:update", "incident:new", "alert:broadcast", "sos:trigger".',
      'Layout: Full-height grid with top KPI banner, main GIS viewport (65% width), and operational side drawer (35% width).'
    ],
    dataFlow: 'Central operational hub; aggregates live data from 5 services; updates in real time via WebSockets.'
  },
  {
    path: 'client/src/pages/CycloneTracker.jsx',
    type: 'Meteorological Tracking Page',
    role: 'Dedicated Storm Tracking Viewport, Satellite Image Overlays, Multi-Quadrant Wind Profiles & Landfall Forecasting',
    explanation: `CycloneTracker.jsx focuses specifically on meteorological analysis and trajectory monitoring of active tropical cyclones. It provides an expanded GIS tracking viewport dedicated to displaying historical tracking fixes, animated spiral vortex markers, and projected landfall cones.

The page includes a detailed tabular history of all recorded storm coordinates, displaying chronological timestamps, central pressures (hPa), sustained wind velocities (knots/km/h), forward speeds, and quadrant-specific wind radii (NE, SE, SW, NW gale extensions).

Operators can trigger manual track refreshes, inspect satellite imagery layers, evaluate forward trajectory uncertainty cones, and compare multi-model ensemble tracks to determine the most probable coastal landfall corridor.`,
    technicalDetails: [
      'Components Mounted: Expanded CommandMap with focused meteorological overlays, TrackHistoryTable.',
      'Data Integration: GET /api/v1/cyclones/:id returns full chronological fix array and forecast cone.',
      'On-Demand Satellite Sync: POST /api/v1/cyclones/sync-live triggers immediate NASA/GDACS API polling.',
      'Quadrant Radii Breakdown: Detailed cards displaying 34kt, 50kt, and 64kt radii for NE, SE, SW, NW quadrants.'
    ],
    dataFlow: 'Retrieves storm history from cycloneRoutes.js; provides interactive map and track inspection.'
  },
  {
    path: 'client/src/pages/ImpactAssessment.jsx',
    type: 'Vulnerability Analysis Page',
    role: 'Coastal Risk Zonation, Storm Surge Inundation Modeling, Population Exposure Analytics & Critical Infrastructure Audits',
    explanation: `ImpactAssessment.jsx delivers multi-criteria coastal vulnerability analysis and hazard modeling. It calculates and displays risk zone contours categorized by combined storm surge, coastal elevation, tidal breach risk, and population density.

The page features interactive risk breakdown charts, estimating total exposed civilian populations, vulnerable kutcha housing structures, and threatened critical infrastructure (coastal hospitals, electrical substations, water treatment facilities) within projected storm impact zones.

Decision-makers use these quantitative impact models to prioritize mandatory evacuation zones, designate staging locations for rescue boats, and deploy emergency medical units well in advance of cyclone landfall.`,
    technicalDetails: [
      'Data Integration: GET /api/v1/risk/zones returns GeoJSON polygons categorized by risk score.',
      'Analytics Charts: Vulnerability distribution by district, kutcha housing exposure bar chart.',
      'Impacted Infrastructure Table: Lists hospitals, power substations, and water plants inside danger zones.',
      'Threshold Controls: Slider allowing planners to simulate rising surge heights (2m to 6m) dynamically.'
    ],
    dataFlow: 'Fetches risk zone polygons from riskRoutes.js; overlays colored hazard contours onto CommandMap.'
  },
  {
    path: 'client/src/pages/EvacuationPlanning.jsx',
    type: 'Evacuation Operations Page',
    role: 'Mass Evacuation Strategy Formulation, Safe Transit Corridors, Clearance Time Calculators & Checkpoint Monitoring',
    explanation: `EvacuationPlanning.jsx provides comprehensive tools for planning, issuing, and monitoring mass coastal evacuations. It maps designated evacuation corridors connecting vulnerable coastal villages to inland multi-purpose cyclone shelters.

The page incorporates an algorithmic Evacuation Clearance Time (ECT) calculator that estimates the total hours required to safely evacuate specific coastal sectors based on population headcounts, available transport vehicles, and roadway lane capacities.

Operations Officers can formally issue evacuation orders for specific coastal districts, monitor live civilian transit counts reported from highway checkpoints, and identify emerging traffic bottlenecks before storm surges cut off coastal causeways.`,
    technicalDetails: [
      'Clearance Calculator: Inputs for population, road lanes, vehicle count; computes ECT hours in real time.',
      'Plan Management: Table listing active and draft evacuation plans with status and progress bars.',
      'Order Authorization: "Issue Mandatory Evacuation Order" button triggering CAP broadcast dispatch.',
      'Checkpoint Feed: Real-time counter of evacuee buses logged through arterial highway transit points.'
    ],
    dataFlow: 'Interfaces with evacuationRoutes.js; computes clearance times; issues broadcast alerts upon order activation.'
  },
  {
    path: 'client/src/pages/SheltersManagement.jsx',
    type: 'Shelter Operations Page',
    role: 'Cyclone Shelter Directory, Live Occupancy Audits, Structural Amenity Filters & Relief Supply Deficit Alerts',
    explanation: `SheltersManagement.jsx provides complete administrative and operational control over the network of pre-designated multi-purpose cyclone shelters and safe havens. It displays a searchable, filterable directory of shelters across all coastal districts.

Each shelter card provides real-time occupancy gauges (displaying current headcount versus structural capacity), power generator operational status, potable water reserve levels, medical officer presence, and sanitation provisions.

Shelter managers and EOC logistics officers can update live evacuee headcounts as rescue buses arrive, trigger supply replenishment requests, and flag structural or utility emergencies directly to the central EOC desk.`,
    technicalDetails: [
      'Directory Filters: Search by district, minimum available slots, generator availability, medical staff.',
      'Occupancy Gauge: Visual progress bar (green < 60%, amber 60-80%, red > 80% capacity).',
      'Headcount Modal: Interactive dialog allowing authorized shelter managers to increment/decrement evacuee count.',
      'Restocking Trigger: Automated alert button when shelter supply days fall below 3 days.'
    ],
    dataFlow: 'Queries and updates shelterRoutes.js; emits real-time shelter:headcount_update WebSocket events.'
  },
  {
    path: 'client/src/pages/IncidentBoard.jsx',
    type: 'Field Incident Operations Page',
    role: 'Kanban Incident Triage Board, Drag-and-Drop Workflow, Team Dispatch Modal & Resolution Tracking',
    explanation: `IncidentBoard.jsx manages field emergency reports using an intuitive, visual Kanban board workflow. Incidents are organized across four operational columns: Reported (new incoming reports), Dispatched (assigned to response units), In Progress (units on scene), and Resolved (operations completed).

The page allows dispatchers to review incoming citizen distress calls and field damage reports, inspect attached photographic evidence and GPS coordinates, and assign specialized response teams (NDRF swift-water rescue, fire department road-clearing crews, electrical repair teams) with drag-and-drop ease.

Card colors indicate urgency tiers (Critical, High, Medium, Low), and all status transitions emit real-time WebSocket events that synchronize across all connected dispatcher terminals instantaneously.`,
    technicalDetails: [
      'Kanban Columns: "Reported" (unassigned), "Dispatched" (en route), "In Progress" (on scene), "Resolved" (completed).',
      'Card Metadata: Incident title, severity RiskBadge, timestamp, reporter contact, assigned team callsign.',
      'Dispatch Modal: Dropdown selector pairing nearest available ResponseTeam to incident coordinates.',
      'WebSocket Sync: Subscribes to "incident:new" and "incident:status_change" for instant multi-user sync.'
    ],
    dataFlow: 'CRUD operations against incidentRoutes.js; coordinates tactical response units via WebSockets.'
  },
  {
    path: 'client/src/pages/ResponseTeamsPage.jsx',
    type: 'Tactical Units Page',
    role: 'Rescue Battalion Roster, Live GPS Telemetry, Operational Readiness States & Equipment Inventory Audits',
    explanation: `ResponseTeamsPage.jsx provides a comprehensive roster and real-time operational status monitor for all deployed tactical emergency units (National Disaster Response Force, State Disaster Response Force, Coast Guard, Civil Defense).

The page displays active team rosters, team leader contact frequencies, specialized equipment allocations (inflatable motorboats, deep-diving gear, acoustic life detectors, tree-cutting chainsaws, satellite communications terminals), and current deployment locations.

Commanders can inspect live GPS coordinates transmitted by field units, reassign teams to high-priority emergency incidents, and track team operational duty cycles to prevent responder exhaustion during prolonged disaster operations.`,
    technicalDetails: [
      'Roster Table: Unit callsign, agency badge, personnel headcount, equipment tags, duty status.',
      'Status Toggles: Quick dropdown to transition team status (Available, Mobilizing, En Route, On Scene, Rest).',
      'Map Focus: "Locate on Map" action button executing CommandMap flyTo transition to team coordinates.',
      'Equipment Roster: Itemized inventory of inflatable boats, chainsaws, medical gear per battalion.'
    ],
    dataFlow: 'Consumes responseTeamRoutes.js; tracks live responder coordinates across the operational theatre.'
  },
  {
    path: 'client/src/pages/ReliefCoordination.jsx',
    type: 'Logistics Operations Page',
    role: 'Emergency Supply Chain Management, Warehouse Stock Auditing, Convoy Waybills & Delivery Receipts',
    explanation: `ReliefCoordination.jsx oversees the distribution of critical emergency supplies (potable drinking water, dry food rations, trauma medical packs, tarpaulins, hygiene kits, backup diesel generators) across the disaster theatre.

The page displays live inventory levels across regional staging warehouses and district transit depots. It includes tools for generating outbound relief convoy manifests, allocating delivery vehicles, tracking convoy transit states, and logging digital delivery sign-offs from receiving shelter managers.

It interfaces with the relief optimizer service to highlight shelters facing imminent stock exhaustion, ensuring equitable and transparent supply distribution.`,
    technicalDetails: [
      'Inventory Table: Item name, warehouse facility, current quantity, reserve threshold, status pill.',
      'Convoy Dispatcher Modal: Multi-step form allocating trucks, drivers, items, and destination shelter.',
      'Supply Deficit Widget: Highlights shelters with < 2 days of drinking water or food reserves.',
      'Delivery Verification: Digital receipt confirmation logging delivery sign-offs into the audit ledger.'
    ],
    dataFlow: 'Manages Inventory and ReliefDistribution models via reliefRoutes.js and reliefOptimizerService.js.'
  },
  {
    path: 'client/src/pages/CitizenPortal.jsx',
    type: 'Public Civilian Portal Page',
    role: 'Civilian Self-Service Interface, One-Touch Emergency SOS Beacon, Nearest Safe Shelter Finder & Evacuation Guide',
    explanation: `CitizenPortal.jsx is a dedicated, public-facing web portal engineered specifically for citizens living in coastal communities threatened by cyclonic disasters. Built with a streamlined, high-contrast, mobile-first design, it operates reliably even on low-cost smartphones and degraded 3G/2G coastal wireless connections.

The portal provides three paramount public safety tools:
1. One-Touch Emergency SOS: Allows trapped or injured citizens to transmit immediate distress signals with automatic browser GPS coordinate capture, occupant headcounts, and distress category selections (flood entrapment, medical trauma, structural collapse).
2. Nearest Safe Shelter Finder: Utilizes the device's GPS location to calculate walking and driving routes to the closest open, non-flooded cyclone shelter with available capacity, displaying facility amenities and emergency contacts.
3. Live Threat & Evacuation Guidance: Delivers clear, jargon-free coastal warning bulletins, evacuation checklists, and emergency helpline dialers.

The portal requires zero complex registration, removing all friction during life-threatening emergencies.`,
    technicalDetails: [
      'One-Touch SOS Form: Captures navigator.geolocation coordinates; posts to /api/v1/citizen/sos.',
      'Nearest Shelter Finder: Geospatial query finding shelters within 15km sorted by available capacity.',
      'Urgency Selector: Distress categories (Trapped by Flood, Medical Injury, Structural Collapse, Food/Water).',
      'Safety Check-In: Allows displaced citizens to register their name and status for family tracing inquiries.'
    ],
    dataFlow: 'Public citizen client interface; uploads emergency distress beacons directly to EOC triage desks.'
  },
  {
    path: 'client/src/pages/AlertCenter.jsx',
    type: 'Emergency Broadcast Page',
    role: 'CAP Alert Broadcasting Studio, Multi-Channel Dissemination (SMS/Web/Push), Geo-Targeting & Active Alert Feed',
    explanation: `AlertCenter.jsx serves as the official public warning broadcast console for EOC Operations Officers and Public Information Officers. It provides a structured authoring studio compliant with the Common Alerting Protocol (CAP-v1.2).

Officers can compose emergency alerts, select severity tiers (Extreme, Severe, Moderate), designate affected coastal districts or draw custom geospatial broadcast polygons, and specify protective action instructions (Mandatory Evacuation, Shelter in Place, Coastal Fishermen Warning).

Upon authorization, the page dispatches broadcasts simultaneously across multiple channels: public web portal alert banners, SMS gateway APIs, mobile push notification servers, and emergency siren controllers.`,
    technicalDetails: [
      'CAP Authoring Studio: Fields for headline, urgency, severity, instruction, affected district checkboxes.',
      'Active Alerts Feed: Table of live broadcasts with revocation/deactivation controls.',
      'Multi-Channel Toggles: Selectors for Web Portal Banner, Mobile SMS Gateway, Siren Activation.',
      'Broadcast Dispatch: Calls POST /api/v1/alerts; triggers immediate WebSocket alert:broadcast event.'
    ],
    dataFlow: 'Inbound officer broadcast authoring; posts to alertRoutes.js; pushes alerts across public web channels.'
  },
  {
    path: 'client/src/pages/AnalyticsForecast.jsx',
    type: 'Data Intelligence Page',
    role: 'Statistical Disaster Analytics, Multi-Scenario Trend Comparisons, Landfall Intensity Decay & Response KPIs',
    explanation: `AnalyticsForecast.jsx provides advanced statistical intelligence and trend analysis for meteorological analysts and senior disaster planners. It renders interactive multi-axis charts comparing historical cyclone intensity trajectories against active storm projections.

The page visualizes post-landfall inland wind decay curves (modeled via Kaplan-DeMaria inland decay algorithms), cumulative coastal rainfall projections, and comparative evacuation compliance curves across districts.

These predictive data visualizations enable authorities to anticipate inland flooding and riverine surges hours before outer storm bands cross the coastline.`,
    technicalDetails: [
      'Charts Rendered: Cyclone Intensity Trend (pressure vs wind), Shelter Utilization, Incident Resolution Velocity.',
      'Data Integration: Queries /api/v1/analytics endpoints with historical and real-time time-series datasets.',
      'Model Comparisons: Visual comparison of IMD vs JTWC vs GFS forecast track trajectories.',
      'Inland Decay Modeling: Visualizes wind velocity attenuation curve after coastal crossing.'
    ],
    dataFlow: 'Consumes analytical aggregations from analyticsRoutes.js; renders interactive charts and graphs.'
  },
  {
    path: 'client/src/pages/ReportsPage.jsx',
    type: 'Reporting & Export Page',
    role: 'Statutory Disaster Situation Reports (SITREPs), PDF/CSV Data Export, Damage Audits & Post-Storm Reviews',
    explanation: `ReportsPage.jsx enables the automated compilation and export of official statutory disaster documentation and Situation Reports (SITREPs). It consolidates data from all operational modules into standardized executive summaries required by state and national disaster management authorities (NDMA/SDMA).

The page allows operators to select reporting intervals, filter by affected administrative districts, and generate comprehensive PDF and CSV reports covering casualty statistics, evacuated headcounts, shelter utilization rates, relief distribution manifests, and infrastructure damage assessments.

It provides transparent, audited documentation essential for post-disaster financial recovery grants, insurance audits, and administrative reviews.`,
    technicalDetails: [
      'Export Formats: PDF SITREP generation (via backend PDFKit) and tabular CSV data exports.',
      'Filter Criteria: Reporting date range, affected district selector, operational sector checkboxes.',
      'SITREP Sections: Meteorological Summary, Evacuation Statistics, Shelter Headcounts, Casualties, Damages.',
      'Audit Archival: Automatically logs report generation actions into the immutable AuditLog collection.'
    ],
    dataFlow: 'Aggregates multi-module reporting data; downloads formatted PDF/CSV situation reports for authorities.'
  },
  {
    path: 'client/src/pages/AdminPage.jsx',
    type: 'System Administration Page',
    role: 'User Account Management, Agency Registration, Immutable Audit Trail Inspection & Global System Settings',
    explanation: `AdminPage.jsx provides master administrative governance for the entire disaster management platform, accessible strictly to users with verified 'admin' credentials.

The page features an Agency Management module for onboarding new response organizations, a User Administration console for creating personnel accounts and assigning RBAC operational roles, and an immutable Audit Trail viewer displaying chronological logs of all critical administrative actions with IP addresses and user timestamps.

It also provides system health monitors, showing active database connection pool statistics, WebSocket client counts, and API response latency metrics.`,
    technicalDetails: [
      'User Management Table: List users, modify assigned roles, deactivate credentials, reset passwords.',
      'Agency Onboarding Modal: Register new response organizations (NDRF, SDRF, Coast Guard, NGOs).',
      'Audit Trail Table: Filterable ledger showing user actions, IP addresses, target IDs, and timestamps.',
      'System Diagnostics: Server uptime, MongoDB connection pool health, connected WebSocket clients counter.'
    ],
    dataFlow: 'Manages user accounts, agencies, and audit logs via adminRoutes.js; restricted strictly to administrators.'
  },

  // -------------------------------------------------------------------------
  // 6. BUILD TOOLING, BUNDLER & CONFIGURATION FILES
  // -------------------------------------------------------------------------
  {
    path: 'client/vite.config.js',
    type: 'Frontend Build Configuration',
    role: 'Vite 5 Bundler Configuration, React Plugin Integration, Dev Server Proxy & Production Chunking',
    explanation: `vite.config.js configures the high-performance Vite 5 frontend build tool and local development server. It integrates the official @vitejs/plugin-react plugin for ultra-fast Hot Module Replacement (HMR) and JSX compilation.

The file configures local development server proxy rules, routing requests prefixed with /api and /socket.io seamlessly to the backend Node.js server (http://localhost:5000), eliminating cross-origin CORS friction during local development.

For production builds, it defines rollup chunking strategies, optimizing vendor bundle splitting (react, react-router, leaflet, lucide-react) to guarantee lightning-fast initial page loads on mobile networks.`,
    technicalDetails: [
      'Plugins: [@vitejs/plugin-react()] for JSX compilation and fast refresh.',
      'Server Config: port: 5173, host: true (enables LAN mobile testing), proxy configuration.',
      'Proxy Rules: "/api" and "/socket.io" proxied to "http://localhost:5000" with changeOrigin: true.',
      'Build Optimization: rollupOptions with manual vendor chunking for leaflet and react libraries.'
    ],
    dataFlow: 'Build toolchain configuration executed by Vite during development and production bundle compilation.'
  },
  {
    path: 'client/tailwind.config.js',
    type: 'CSS Framework Configuration',
    role: 'Tailwind CSS Customization, Military Dark Palette Extension, Font Families & Keyframe Animations',
    explanation: `tailwind.config.js defines the custom design tokens and theme extensions for the Tailwind CSS framework. It specifies content scanning globs across all JSX and HTML files, ensuring unused CSS utilities are automatically purged during production compilation.

The configuration extends Tailwind's color palette with specialized tactical military hues: deep navy midnight backgrounds (#0B1120, #0F172A), slate border tones, and high-visibility alert accents (cyan-400, emerald-500, amber-400, rose-500).

It also configures custom font families ('Plus Jakarta Sans' for primary UI and 'JetBrains Mono' for numeric telemetry) and keyframe animations for pulsing danger beacons and rotating cyclone spiral icons.`,
    technicalDetails: [
      'Content Scan: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"].',
      'Dark Mode: darkMode: "class" for manual theme switching via ThemeContext.',
      'Color Palette: Custom midnight slates (#0B1120, #0F172A), tactical cyans, and severity alerts.',
      'Keyframes: Custom radarPulse, vortexSpin, and beaconPing CSS animations.'
    ],
    dataFlow: 'Scans source files during build; compiles optimized, purges unused CSS into the production stylesheet.'
  },
  {
    path: 'client/postcss.config.js',
    type: 'CSS Post-Processing Configuration',
    role: 'PostCSS Pipeline Setup, Tailwind CSS Integration & Vendor Prefix Autoprefixer Configuration',
    explanation: `postcss.config.js configures the PostCSS processing pipeline used during the Vite build process. It registers tailwindcss to parse custom Tailwind directives and autoprefixer to automatically append vendor prefixes to CSS rules.

This ensures comprehensive cross-browser compatibility across legacy and modern web browsers (Chrome, Firefox, Safari, Edge), guaranteeing consistent layout rendering and animation performance across diverse emergency center display hardware.`,
    technicalDetails: [
      'Plugins: tailwindcss: {}, autoprefixer: {}.',
      'Browser Targets: Configured to support all browsers with > 0.2% global market share.',
      'Vendor Prefixing: Automatically prepends -webkit-, -moz-, and -ms- prefixes where required.'
    ],
    dataFlow: 'Processes index.css during Vite compilation; emits vendor-prefixed browser-compatible CSS.'
  },
  {
    path: 'client/package.json',
    type: 'Frontend Package Manifest',
    role: 'Client Dependencies Specification, Build Scripts, Vite Toolchain & Asset Versioning',
    explanation: `package.json defines the dependencies, scripts, and runtime environment for the React Single Page Application. It lists critical production libraries: react and react-dom (v18.2), react-router-dom (v6 routing), leaflet and react-leaflet (GIS mapping), lucide-react (tactical iconography), socket.io-client (real-time WebSockets), and axios (HTTP API requests).

The file defines standard development and build scripts: "dev" (vite dev server with hot reload), "build" (vite build for production distribution), and "preview" (local preview of production build).

It guarantees deterministic package installations and locks frontend dependencies to verified stable releases.`,
    technicalDetails: [
      'Production Dependencies: react, react-dom, react-router-dom, leaflet, lucide-react, socket.io-client, axios.',
      'DevDependencies: vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer.',
      'Scripts: { "dev": "vite", "build": "vite build", "preview": "vite preview" }.'
    ],
    dataFlow: 'Governs frontend library dependencies installed in client/node_modules/.'
  },
  {
    path: 'README.md',
    type: 'Project Documentation',
    role: 'Master Project Guide, Architecture Overview, Quick-Start Installation, Docker Instructions & API Index',
    explanation: `README.md serves as the primary technical onboarding guide and repository handbook. It articulates the overarching mission of the Cyclone Disaster Management System, detailing its full-stack MERN + Socket.IO + Leaflet GIS architecture.

The document provides comprehensive step-by-step setup guides: prerequisites (Node.js LTS, MongoDB), environment variable configurations, database seeding execution, and separate commands for launching backend and frontend servers.

It includes an index of all REST API endpoints, WebSocket event channels, and default administrative test credentials, enabling new engineers and emergency personnel to deploy and operate the platform rapidly.`,
    technicalDetails: [
      'Sections: System Architecture, Prerequisites, Quick-Start Guide, REST API Index, Sockets Catalog.',
      'Test Accounts: Credentials for Admin, Officer, Responder, Volunteer, and Citizen demo personas.',
      'GIS Specs: Details zero-cost Leaflet OpenStreetMap streaming architecture.'
    ],
    dataFlow: 'Human-readable engineering guide and developer onboarding manual for the entire repository.'
  }
];

module.exports = {
  frontendFiles
};
