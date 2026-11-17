/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Controller - Bandwidth Ingestion & History
 * File: server/controllers/bandwidthController.js
 * ============================================================================
 * 
 * Purpose:
 * Ingests network bandwidth telemetry, validates input strings with FLAT regex,
 * quantizes continuous bandwidth into discrete FSM symbols (L, H, S, B),
 * executes the FSM state transition engine, logs bandwidth history,
 * updates host health state, and triggers alerts on transitions into S2 or S3.
 * ============================================================================
 */

const Host = require('../models/Host');
const BandwidthRecord = require('../models/BandwidthRecord');
const Alert = require('../models/Alert');
const {
  isValidHostId,
  isValidBandwidth,
  isValidTimestamp
} = require('../logic/regexValidator');
const { quantizeBandwidth } = require('../logic/quantizer');
const { getNextState } = require('../logic/fsmClassifier');

/**
 * Ingest bandwidth telemetry reading.
 * POST /api/bandwidth
 * Body: { hostId: string, bandwidth: number|string, timestamp?: string }
 */
async function ingestBandwidth(req, res) {
  try {
    const { hostId, bandwidth, timestamp } = req.body;

    // 1. Validate required presence of hostId and bandwidth
    if (!hostId || bandwidth === undefined || bandwidth === null || bandwidth === '') {
      return res.status(400).json({
        success: false,
        error: 'Both "hostId" and "bandwidth" fields are required.'
      });
    }

    // 2. Validate Host ID format using FLAT regex
    if (!isValidHostId(hostId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid hostId: "${hostId}". Must match format (e.g., HOST-001, SRV-1024, NODE-99999).`
      });
    }

    // 3. Validate raw bandwidth input using FLAT regex BEFORE converting to number
    if (!isValidBandwidth(bandwidth)) {
      return res.status(400).json({
        success: false,
        error: `Invalid bandwidth: "${bandwidth}". Must be a non-negative number with up to 2 decimal places.`
      });
    }

    // 4. Validate timestamp if supplied, using FLAT regex and semantic checks BEFORE Date conversion
    let recordDate;
    if (timestamp) {
      if (!isValidTimestamp(timestamp)) {
        return res.status(400).json({
          success: false,
          error: `Invalid timestamp: "${timestamp}". Must match format "YYYY-MM-DD HH:MM:SS" and be a valid calendar date.`
        });
      }
      recordDate = new Date(timestamp.replace(' ', 'T') + 'Z');
      // If parsing fails for any unexpected reason
      if (isNaN(recordDate.getTime())) {
        recordDate = new Date(timestamp);
      }
    } else {
      recordDate = new Date();
    }

    // 5. Locate registered host in database
    const host = await Host.findOne({ hostId });
    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host with ID "${hostId}" not found. Please register the host first.`
      });
    }

    // 6. Convert numerical bandwidth to numeric float and quantize to symbol (L, H, S, B)
    const numericBandwidth = typeof bandwidth === 'number' ? bandwidth : parseFloat(bandwidth);
    const symbol = quantizeBandwidth(numericBandwidth);

    // 7. Calculate FSM transition: delta(previousState, symbol) -> resultingState
    const previousState = host.currentState;
    const resultingState = getNextState(previousState, symbol);

    // 8. Save one BandwidthRecord
    const record = await BandwidthRecord.create({
      host: host._id,
      hostId: host.hostId,
      bandwidth: numericBandwidth,
      symbol,
      previousState,
      resultingState,
      timestamp: recordDate
    });

    // 9. Update the Host document's current telemetry and state
    host.currentBandwidth = numericBandwidth;
    host.currentSymbol = symbol;
    host.currentState = resultingState;
    host.lastSeen = recordDate;
    await host.save();

    // 10. Alert Creation Logic:
    // Create Alert when transitioning INTO an anomalous state (S2 or S3).
    // Do NOT create duplicate alerts for repeated readings that leave the host in the same anomalous state.
    let createdAlert = null;

    if (previousState !== 'S2' && resultingState === 'S2') {
      // Transition INTO S2 (Suspicious) -> Severity 'Warning'
      createdAlert = await Alert.create({
        host: host._id,
        hostId: host.hostId,
        bandwidth: numericBandwidth,
        state: 'S2',
        severity: 'Warning',
        message: `Host ${host.hostId} escalated to Suspicious (S2) state. Bandwidth reading: ${numericBandwidth} Mbps.`,
        timestamp: recordDate,
        acknowledged: false
      });
    } else if (previousState !== 'S3' && resultingState === 'S3') {
      // Transition INTO S3 (Blocked) -> Severity 'Critical'
      createdAlert = await Alert.create({
        host: host._id,
        hostId: host.hostId,
        bandwidth: numericBandwidth,
        state: 'S3',
        severity: 'Critical',
        message: `Host ${host.hostId} reached Blocked (S3) quarantine state due to extreme bandwidth surge: ${numericBandwidth} Mbps.`,
        timestamp: recordDate,
        acknowledged: false
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Bandwidth telemetry ingested successfully.',
      data: {
        record,
        host,
        alert: createdAlert
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Server error while ingesting bandwidth telemetry: ${error.message}`
    });
  }
}

/**
 * Retrieve bandwidth history for a specific host.
 * GET /api/bandwidth/:hostId/history?limit=50
 */
async function getBandwidthHistory(req, res) {
  try {
    const { hostId } = req.params;

    // 1. Validate hostId format
    if (!isValidHostId(hostId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid hostId parameter: "${hostId}". Must match format (e.g., HOST-001).`
      });
    }

    // 2. Verify host exists
    const host = await Host.findOne({ hostId });
    if (!host) {
      return res.status(404).json({
        success: false,
        error: `Host with ID "${hostId}" not found.`
      });
    }

    // 3. Parse and sanitize limit query parameter (default 50, maximum 100)
    let limit = 50;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 100);
      }
    }

    // 4. Query bandwidth records sorted newest first
    const records = await BandwidthRecord.find({ hostId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      hostId,
      count: records.length,
      limit,
      data: records
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Server error while fetching bandwidth history: ${error.message}`
    });
  }
}

module.exports = {
  ingestBandwidth,
  getBandwidthHistory
};
