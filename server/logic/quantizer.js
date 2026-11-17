/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Formal Languages & Automata Theory (FLAT) - Quantizer
 * File: server/logic/quantizer.js
 * ============================================================================
 * 
 * Purpose:
 * Converts a continuous, validated non-negative bandwidth metric (in Mbps)
 * into a discrete FSM input alphabet symbol (Σ = {L, H, S, B}).
 * 
 * Quantization Rules:
 * - 0 to 50 Mbps inclusive        -> 'L' (Low / Normal)
 * - Above 50 to 100 Mbps inclusive -> 'H' (High Usage)
 * - Above 100 to 200 Mbps inclusive-> 'S' (Suspicious)
 * - Above 200 Mbps                 -> 'B' (Burst / Anomaly)
 * ============================================================================
 */

/**
 * Quantizes a validated bandwidth reading into an FSM input symbol.
 * 
 * @param {number|string} bandwidth - The bandwidth reading in Mbps (must be non-negative).
 * @returns {'L'|'H'|'S'|'B'} The corresponding discrete FSM input symbol.
 * @throws {Error} If the bandwidth is not a valid non-negative finite number.
 */
function quantizeBandwidth(bandwidth) {
  // Disallow null, undefined, boolean, or empty string inputs
  if (bandwidth === null || bandwidth === undefined || typeof bandwidth === 'boolean' || bandwidth === '') {
    throw new Error(`Invalid bandwidth input: ${bandwidth}. Expected a valid non-negative number.`);
  }

  // Convert numeric string to number if needed
  if (typeof bandwidth === 'string' && bandwidth.trim() === '') {
    throw new Error('Invalid bandwidth input: empty value.');
  }
  const value = typeof bandwidth === 'string' ? Number(bandwidth) : bandwidth;

  // Validate that the value is a real, finite, non-negative number
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value) || value < 0) {
    throw new Error(`Invalid bandwidth input: "${bandwidth}". Expected a non-negative number.`);
  }

  // Quantization decision tree based on exact boundary specifications
  if (value <= 50) {
    return 'L';
  } else if (value <= 100) {
    return 'H';
  } else if (value <= 200) {
    return 'S';
  } else {
    return 'B';
  }
}

module.exports = {
  quantizeBandwidth
};
