
/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Routes - Host Management
 * File: server/routes/hostRoutes.js
 * ============================================================================
 *
 * Purpose:
 * Defines API routes for host registration, retrieval,
 * and administrator FSM reset.
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

const {
  registerHost,
  getAllHosts,
  getHostById,
  resetHost
} = require('../controllers/hostController');

// Register a new host
// POST /api/hosts
router.post('/', registerHost);

// Retrieve all registered hosts
// GET /api/hosts
router.get('/', getAllHosts);

// Administrator FSM reset
// POST /api/hosts/:hostId/reset
router.post('/:hostId/reset', resetHost);

// Retrieve a single host
// GET /api/hosts/:hostId
router.get('/:hostId', getHostById);

module.exports = router;
