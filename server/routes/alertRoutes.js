/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Routes - Alert Endpoints
 * File: server/routes/alertRoutes.js
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  acknowledgeAlert
} = require('../controllers/alertController');

// GET /api/alerts - List all alerts with optional ?acknowledged= query filter
router.get('/', getAllAlerts);

// PATCH /api/alerts/:id/acknowledge - Mark an alert as acknowledged
router.patch('/:id/acknowledge', acknowledgeAlert);

module.exports = router;
