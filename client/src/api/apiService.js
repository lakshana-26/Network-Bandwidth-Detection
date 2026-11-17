/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Frontend API Service
 * File: client/src/api/apiService.js
 * ============================================================================
 * 
 * Provides unified, async fetch wrappers for backend REST endpoints.
 * Base URL: http://localhost:5000/api
 * ============================================================================
 */

// Base URL configurable via Vite environment variables with local fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper to handle fetch responses and standardize error messages.
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const apiService = {
  /**
   * Check backend server health.
   */
  async checkHealth() {
    const response = await fetch(`${API_BASE}/health`);
    return handleResponse(response);
  },

  /**
   * Get all registered hosts.
   */
  async getHosts() {
    const response = await fetch(`${API_BASE}/hosts`);
    return handleResponse(response);
  },

  /**
   * Get single host details by hostId.
   */
  async getHost(hostId) {
    const response = await fetch(`${API_BASE}/hosts/${encodeURIComponent(hostId)}`);
    return handleResponse(response);
  },

  /**
   * Register a new host.
   */
  async registerHost(hostData) {
    const response = await fetch(`${API_BASE}/hosts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hostData)
    });
    return handleResponse(response);
  },

  /**
   * Ingest a single bandwidth reading.
   */
  async ingestBandwidth(payload) {
    const response = await fetch(`${API_BASE}/bandwidth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  /**
   * Get chronological bandwidth history for a host.
   */
  async getBandwidthHistory(hostId, limit = 50) {
    const response = await fetch(
      `${API_BASE}/bandwidth/${encodeURIComponent(hostId)}/history?limit=${limit}`
    );
    return handleResponse(response);
  },

  /**
   * Get all alerts with optional acknowledged filter.
   */
  async getAlerts(acknowledgedFilter = null) {
    let url = `${API_BASE}/alerts`;
    if (acknowledgedFilter !== null && acknowledgedFilter !== undefined && acknowledgedFilter !== '') {
      url += `?acknowledged=${acknowledgedFilter}`;
    }
    const response = await fetch(url);
    return handleResponse(response);
  },

  /**
   * Mark an alert as acknowledged.
   */
  async acknowledgeAlert(alertId) {
    const response = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};
