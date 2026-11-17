/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Database Model - Alert Entity
 * File: server/models/Alert.js
 * ============================================================================
 * 
 * Purpose:
 * Stores security and anomaly incident alerts generated when a host transitions
 * into warning or critical FSM states:
 * - S2 (Suspicious) -> 'Warning' severity
 * - S3 (Blocked)    -> 'Critical' severity
 * 
 * Enforces strict 1-to-1 mapping between FSM states and severity levels,
 * while automatically assigning the severity if omitted.
 * ============================================================================
 */

const mongoose = require('mongoose');
const { isValidHostId } = require('../logic/regexValidator');

const alertSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host',
      required: [true, 'Host reference ObjectId is required.']
    },
    hostId: {
      type: String,
      required: [true, 'Host ID is required.'],
      trim: true,
      validate: {
        validator: isValidHostId,
        message: props => `"${props.value}" is not a valid Host ID (format e.g. HOST-001, SRV-1024, NODE-99999).`
      }
    },
    bandwidth: {
      type: Number,
      required: [true, 'Bandwidth value is required.'],
      min: [0, 'Bandwidth must be a non-negative number.']
    },
    state: {
      type: String,
      required: [true, 'Alert state is required.'],
      enum: {
        values: ['S2', 'S3'],
        message: '"{VALUE}" is not a valid alert state. Only anomalous states S2 (Suspicious) or S3 (Blocked) generate alerts.'
      }
    },
    severity: {
      type: String,
      required: [true, 'Alert severity is required.'],
      enum: {
        values: ['Warning', 'Critical'],
        message: '"{VALUE}" is not a valid severity level. Must be "Warning" or "Critical".'
      }
    },
    message: {
      type: String,
      required: [true, 'Alert message is required.'],
      trim: true
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required.']
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  },
  {
    // Automatically manage createdAt and updatedAt ISO timestamps
    timestamps: true
  }
);

// 1. Pre-validate hook: Automatically assigns the correct severity based on state if omitted
alertSchema.pre('validate', function() {
  if (this.state === 'S2' && !this.severity) {
    this.severity = 'Warning';
  } else if (this.state === 'S3' && !this.severity) {
    this.severity = 'Critical';
  }
});

// 2. Custom validator: Enforces strict state-severity mapping and rejects mismatched combinations
alertSchema.path('severity').validate(function(value) {
  if (this.state === 'S2' && value !== 'Warning') {
    return false;
  }
  if (this.state === 'S3' && value !== 'Critical') {
    return false;
  }
  return true;
}, 'Mismatched state and severity: state S2 requires "Warning" severity, and state S3 requires "Critical" severity.');

// 3. Compound indexes for queries by host and acknowledgment in descending chronological order
alertSchema.index({ hostId: 1, timestamp: -1 });
alertSchema.index({ host: 1, timestamp: -1 });
alertSchema.index({ acknowledged: 1, timestamp: -1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
