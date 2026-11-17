
/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Controller - Host Management
 * File: server/controllers/hostController.js
 * ============================================================================
 *
 * Purpose:
 * Handles host registration, retrieval of all monitored hosts,
 * single host lookup, and administrator FSM reset.
 * ============================================================================
 */

const Host = require('../models/Host');
const {
  isValidHostId,
  isValidIPv4
} = require('../logic/regexValidator');
const {
  getNextState
} = require('../logic/fsmClassifier');

/**
 * Register a new network host.
 * POST /api/hosts
 * Body: { hostId: string, ipAddress: string }
 */
async function registerHost(req, res) {
  try {
    const { hostId, ipAddress } = req.body;

    // Check required fields
    if (!hostId || !ipAddress) {
      return res.status(400).json({
        success: false,
        error: 'Both "hostId" and "ipAddress" are required.'
      });
    }

    // Validate Host ID using FLAT regex
    if (!isValidHostId(hostId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid hostId: "${hostId}". Must match format (e.g., HOST-001, SRV-1024, NODE-99999).`
      });
    }

    // Validate IPv4 address using FLAT regex
    if (!isValidIPv4(ipAddress)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ipAddress: "${ipAddress}". Must be a valid IPv4 address.`
      });
    }

    // Check duplicate Host ID
    const existingHostId = await Host.findOne({ hostId });

    if (existingHostId) {
      return res.status(409).json({
        success: false,
        error: `Host with ID "${hostId}" already exists.`
      });
    }

    // Check duplicate IP address
    const existingIp = await Host.findOne({ ipAddress });

    if (existingIp) {
      return res.status(409).json({
        success: false,
        error: `Host with IP address "${ipAddress}" already exists.`
      });
    }

    // Create and save new host
    const host = await Host.create({
      hostId,
      ipAddress,
      currentBandwidth: 0,
      currentSymbol: 'L',
      currentState: 'S0'
    });

    return res.status(201).json({
      success: true,
      message: 'Host registered successfully.',
      data: host
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';

      return res.status(409).json({
        success: false,
        error: `Duplicate key violation: ${field} already registered.`
      });
    }

    return res.status(500).json({
      success: false,
      error: `Server error while registering host: ${error.message}`
    });
  }
}

/**
 * Retrieve all registered hosts.
 * GET /api/hosts
 */
async function getAllHosts(req, res) {
  try {
    const hosts = await Host.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: hosts.length,
      data: hosts
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Server error while fetching hosts: ${error.message}`
    });
  }
}

/**
 * Retrieve a single host by Host ID.
 * GET /api/hosts/:hostId
 */
async function getHostById(req, res) {
  try {
    const { hostId } = req.params;

    if (!isValidHostId(hostId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid hostId parameter: "${hostId}".`
      });
    }

    const host = await Host.findOne({ hostId });

    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host with ID "${hostId}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: host
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Server error while fetching host: ${error.message}`
    });
  }
}

/**
 * Administrator FSM Reset.
 * POST /api/hosts/:hostId/reset
 *
 * Reset symbol R moves the host FSM to S0.
 * Previous bandwidth history and alerts are preserved.
 */
async function resetHost(req, res) {
  try {
    const { hostId } = req.params;

    // Validate Host ID
    if (!isValidHostId(hostId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Host ID.'
      });
    }

    // Find host in MongoDB
    const host = await Host.findOne({ hostId });

    if (!host) {
      return res.status(404).json({
        success: false,
        error: 'Host not found.'
      });
    }

    // Check whether host is already in normal state
    if (host.currentState === 'S0') {
      return res.status(409).json({
        success: false,
        error: 'Host is already in Normal state.'
      });
    }

    const previousState = host.currentState;

    // Apply FSM reset transition using symbol R
    const resultingState = getNextState(previousState, 'R');

    if (resultingState !== 'S0') {
      return res.status(500).json({
        success: false,
        error: 'FSM reset transition failed.'
      });
    }

    // Update host state and save in MongoDB
    host.currentState = resultingState;

    await host.save();

    return res.status(200).json({
      success: true,
      message: `Host ${hostId} successfully reset to Normal state.`,
      data: {
        hostId: host.hostId,
        previousState,
        resetSymbol: 'R',
        resultingState: host.currentState
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Server error while resetting host: ${error.message}`
    });
  }
}

// Export controller functions
module.exports = {
  registerHost,
  getAllHosts,
  getHostById,
  resetHost
};
