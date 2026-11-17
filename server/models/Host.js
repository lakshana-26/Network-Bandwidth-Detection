/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Database Model - Host Entity
 * File: server/models/Host.js
 * ============================================================================
 * 
 * Purpose:
 * Mongoose schema and model definition for monitored network hosts.
 * Stores persistent state, current bandwidth telemetry, FSM classification,
 * and tracks individual host health over time.
 * ============================================================================
 */

const mongoose = require('mongoose');
const { isValidHostId, isValidIPv4 } = require('../logic/regexValidator');

const hostSchema = new mongoose.Schema(
  {
    hostId: {
      type: String,
      required: [true, 'Host ID is required'],
      unique: true,
      trim: true,
      validate: {
        validator: isValidHostId,
        message: props => `"${props.value}" is not a valid Host ID (format e.g. HOST-001, SRV-1024, NODE-99999).`
      }
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      unique: true,
      trim: true,
      validate: {
        validator: isValidIPv4,
        message: props => `"${props.value}" is not a valid IPv4 address.`
      }
    },
    currentBandwidth: {
      type: Number,
      default: 0,
      min: [0, 'Current bandwidth must be a non-negative number.']
    },
    currentSymbol: {
      type: String,
      enum: {
        values: ['L', 'H', 'S', 'B'],
        message: '"{VALUE}" is not a valid FSM symbol. Must be one of: L, H, S, B.'
      },
      default: 'L'
    },
    currentState: {
      type: String,
      enum: {
        values: ['S0', 'S1', 'S2', 'S3'],
        message: '"{VALUE}" is not a valid FSM state. Must be one of: S0, S1, S2, S3.'
      },
      default: 'S0'
    },
    lastSeen: {
      type: Date
    }
  },
  {
    // Automatically manage createdAt and updatedAt ISO timestamps
    timestamps: true
  }
);

const Host = mongoose.model('Host', hostSchema);

module.exports = Host;
