/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Backend Server Entry Point
 * File: server/server.js
 * ============================================================================
 * 
 * Purpose:
 * Core entry point for the Express.js REST API server.
 * Connects to MongoDB, configures middleware, registers domain routes
 * (Hosts, Bandwidth Ingestion, Alerts), and provides health check endpoints.
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Route Handlers
const hostRoutes = require('./routes/hostRoutes');
const bandwidthRoutes = require('./routes/bandwidthRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Initialize Express application
const app = express();

// Default port configuration
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------------------------------
// Middleware Configuration
// ----------------------------------------------------------------------------

// Enable Cross-Origin Resource Sharing (CORS) for frontend requests
app.use(cors());

// Enable built-in JSON body parser for incoming API requests
app.use(express.json());

// ----------------------------------------------------------------------------
// API Route Registration
// ----------------------------------------------------------------------------

// Domain routes
app.use('/api/hosts', hostRoutes);
app.use('/api/bandwidth', bandwidthRoutes);
app.use('/api/alerts', alertRoutes);

/**
 * Health Check Route
 * GET /api/health
 * Returns JSON status confirming backend health and timestamp.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Network Bandwidth Anomaly Detection backend is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Root Information Route
 * GET /
 */
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Network Bandwidth Usage Anomaly Detection API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      hosts: 'GET, POST /api/hosts',
      bandwidth: 'POST /api/bandwidth, GET /api/bandwidth/:hostId/history',
      alerts: 'GET /api/alerts'
    }
  });
});

// ----------------------------------------------------------------------------
// Server Startup Lifecycle
// ----------------------------------------------------------------------------

/**
 * Initializes database connection and starts the Express HTTP server.
 * 
 * @param {number|string} [port] - Port number to bind. Defaults to PORT (5000).
 * @returns {Promise<import('http').Server>} The running HTTP server instance.
 */
async function startServer(port = PORT) {
  try {
    // 1. Wait for MongoDB connection to complete successfully
    console.log('[STARTUP] Connecting to MongoDB before launching HTTP server...');
    await connectDB();

    // 2. Start HTTP server only after database is connected
    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`[SERVER] Express backend is running on http://localhost:${port}`);
        console.log(`[SERVER] Health check available at: http://localhost:${port}/api/health`);
        resolve(server);
      });
    });
  } catch (error) {
    // If DB fails, log clearly and terminate with non-zero exit code without starting server
    console.error(`[FATAL] Server startup aborted: Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

// Automatically start server only when executed directly (e.g. node server.js / npm start)
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer
};
