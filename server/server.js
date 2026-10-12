const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');
const errorHandler = require('./middleware/errorHandler');
const { syncGlobalCyclones } = require('./services/liveCycloneService');

const app = express();
const server = http.createServer(app);

// Sockets
initSocket(server);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'Cyclone Disaster Operations Command Center',
    timestamp: new Date(),
    liveDataConnected: true
  });
});

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/disasters', require('./routes/disasterRoutes'));
app.use('/api/cyclones', require('./routes/cycloneRoutes'));
app.use('/api/risk', require('./routes/riskRoutes'));
app.use('/api/evacuations', require('./routes/evacuationRoutes'));
app.use('/api/shelters', require('./routes/shelterRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/response-teams', require('./routes/responseTeamRoutes'));
app.use('/api/relief', require('./routes/reliefRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/simulation', require('./routes/simulationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/registry', require('./routes/registryRoutes'));
app.use('/api/volunteer-tasks', require('./routes/volunteerTaskRoutes'));
app.use('/api/sitrep', require('./routes/sitrepRoutes'));
app.use('/api/live-tracking', require('./routes/liveTrackingRoutes'));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('[Server Started] Disaster Operations Command API listening on port ' + PORT);
  console.log('[System Status] Ready for emergency response coordination');

  // Trigger initial background telemetry sync
  setTimeout(() => {
    syncGlobalCyclones().catch(err => console.error('[Init Sync Err]:', err.message));
  }, 1000);

  // Background polling every 15 minutes
  setInterval(() => {
    syncGlobalCyclones().catch(err => console.error('[Periodic Sync Err]:', err.message));
  }, 15 * 60 * 1000);
});

connectDB();
