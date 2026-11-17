/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Controller - Anomaly Alerts
 * File: server/controllers/alertController.js
 * ============================================================================
 * 
 * Purpose:
 * Handles querying of anomaly alerts, supports filtering by acknowledgment
 * status, includes populated host information, and enables acknowledgment updates.
 * ============================================================================
 */

const Alert = require('../models/Alert');

/**
 * Retrieve anomaly alerts sorted newest first.
 * GET /api/alerts?acknowledged=false
 */
async function getAllAlerts(req, res) {
  try {
    const filter = {};

    // Support optional filter by acknowledged boolean query parameter
    if (req.query.acknowledged !== undefined) {
      if (req.query.acknowledged === 'true') {
        filter.acknowledged = true;
      } else if (req.query.acknowledged === 'false') {
        filter.acknowledged = false;
      }
    }

    // Support optional filter by hostId
    if (req.query.hostId) {
      filter.hostId = req.query.hostId;
    }

    // Retrieve alerts sorted newest first, populating host details
    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .populate('host', 'hostId ipAddress currentState currentBandwidth');

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Server error while fetching alerts: ${error.message}`
    });
  }
}

/**
 * Mark an alert as acknowledged.
 * PATCH /api/alerts/:id/acknowledge
 */
async function acknowledgeAlert(req, res) {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndUpdate(
      id,
      { acknowledged: true },
      { returnDocument: 'after' }
    ).populate('host', 'hostId ipAddress currentState');

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: `Alert with ID "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully.',
      data: alert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Server error while acknowledging alert: ${error.message}`
    });
  }
}

module.exports = {
  getAllAlerts,
  acknowledgeAlert
};
