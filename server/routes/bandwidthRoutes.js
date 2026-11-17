/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Routes - Bandwidth Telemetry Endpoints
 * File: server/routes/bandwidthRoutes.js
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  ingestBandwidth,
  getBandwidthHistory
} = require('../controllers/bandwidthController');

// POST /api/bandwidth - Ingest a new bandwidth telemetry reading
router.post('/', ingestBandwidth);

// GET /api/bandwidth/:hostId/history - Fetch reverse-chronological history for a host
router.get('/:hostId/history', getBandwidthHistory);

module.exports = router;
