/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Database Configuration (MongoDB / Mongoose)
 * File: server/config/db.js
 * ============================================================================
 * 
 * Purpose:
 * Establishes and manages the connection to MongoDB using Mongoose.
 * Provides a reusable, asynchronous connection function for server startup
 * and testing workflows.
 * ============================================================================
 */

const mongoose = require('mongoose');

// Default local MongoDB connection URI
const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/network_bandwidth_detection';

/**
 * Connects to MongoDB database using Mongoose.
 * 
 * @param {string} [uri] - Optional MongoDB connection string. Defaults to local URI.
 * @returns {Promise<typeof mongoose>} Resolves with the mongoose instance upon successful connection.
 */
async function connectDB(uri) {
  const connectionURI = uri || process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(connectionURI);
    console.log(`[DATABASE] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DATABASE] MongoDB connection error: ${error.message}`);
    throw error;
  }
}

/**
 * Closes the active MongoDB connection.
 * Useful for graceful shutdowns and test teardowns.
 * 
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('[DATABASE] MongoDB disconnected successfully.');
  } catch (error) {
    console.error(`[DATABASE] Error disconnecting from MongoDB: ${error.message}`);
    throw error;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  DEFAULT_MONGO_URI
};
