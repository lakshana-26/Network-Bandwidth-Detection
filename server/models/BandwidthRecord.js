/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Database Model - BandwidthRecord Entity
 * File: server/models/BandwidthRecord.js
 * ============================================================================
 * 
 * Purpose:
 * Stores individual bandwidth telemetry readings and logs the discrete FSM state
 * transition (previousState -> resultingState) triggered by each reading.
 * ============================================================================
 */

const mongoose = require('mongoose');
const { isValidHostId } = require('../logic/regexValidator');

const bandwidthRecordSchema = new mongoose.Schema(
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
    symbol: {
      type: String,
      required: [true, 'FSM input symbol is required.'],
      enum: {
        values: ['L', 'H', 'S', 'B'],
        message: '"{VALUE}" is not a valid FSM symbol. Must be one of: L, H, S, B.'
      }
    },
    previousState: {
      type: String,
      required: [true, 'Previous FSM state is required.'],
      enum: {
        values: ['S0', 'S1', 'S2', 'S3'],
        message: '"{VALUE}" is not a valid previous FSM state. Must be one of: S0, S1, S2, S3.'
      }
    },
    resultingState: {
      type: String,
      required: [true, 'Resulting FSM state is required.'],
      enum: {
        values: ['S0', 'S1', 'S2', 'S3'],
        message: '"{VALUE}" is not a valid resulting FSM state. Must be one of: S0, S1, S2, S3.'
      }
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required.']
      // Note: Lexical regex validation (YYYY-MM-DD HH:MM:SS) and semantic date checks
      // are performed at the API validation layer BEFORE converting strings into Date objects.
    }
  },
  {
    // Automatically manage createdAt and updatedAt ISO timestamps
    timestamps: true
  }
);

// Compound indexes for optimized descending chronological history queries per host
bandwidthRecordSchema.index({ hostId: 1, timestamp: -1 });
bandwidthRecordSchema.index({ host: 1, timestamp: -1 });

const BandwidthRecord = mongoose.model('BandwidthRecord', bandwidthRecordSchema);

module.exports = BandwidthRecord;
