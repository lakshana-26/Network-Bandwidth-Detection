/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Formal Languages & Automata Theory (FLAT) - Unit Tests
 * File: server/logic/fsm.test.js
 * ============================================================================
 * 
 * Execution:
 * node server/logic/fsm.test.js
 * 
 * Dependencies:
 * Built-in Node.js 'assert' module only. Zero external packages.
 * ============================================================================
 */

const assert = require('assert');
const {
  isValidHostId,
  isValidIPv4,
  isValidBandwidth,
  isValidTimestamp
} = require('./regexValidator');
const { quantizeBandwidth } = require('./quantizer');
const { getNextState, classifySequence } = require('./fsmClassifier');

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
    console.error(`         ${err.message}`);
    process.exit(1);
  }
}

console.log('================================================================');
console.log(' Network Bandwidth Anomaly Detection - FLAT Verification Suite');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// 1. Regex Validation Tests
// ----------------------------------------------------------------------------
console.log('Group 1: Regex Validation Tests');

runTest('Valid host ID "HOST-001"', () => {
  assert.strictEqual(isValidHostId('HOST-001'), true);
});

runTest('Invalid host ID "host-001" (lowercase forbidden)', () => {
  assert.strictEqual(isValidHostId('host-001'), false);
});

runTest('Valid IPv4 "192.168.1.1"', () => {
  assert.strictEqual(isValidIPv4('192.168.1.1'), true);
});

runTest('Invalid IPv4 "256.100.0.1" (octet > 255)', () => {
  assert.strictEqual(isValidIPv4('256.100.0.1'), false);
});

runTest('Valid bandwidth "120.5"', () => {
  assert.strictEqual(isValidBandwidth('120.5'), true);
});

runTest('Invalid bandwidth "12.345" (more than 2 decimal digits)', () => {
  assert.strictEqual(isValidBandwidth('12.345'), false);
});

runTest('Valid timestamp "2024-02-29 12:00:00" (valid leap year)', () => {
  assert.strictEqual(isValidTimestamp('2024-02-29 12:00:00'), true);
});

runTest('Invalid timestamp "2026-02-29 12:00:00" (2026 is non-leap year)', () => {
  assert.strictEqual(isValidTimestamp('2026-02-29 12:00:00'), false);
});

// ----------------------------------------------------------------------------
// 2. Quantizer Boundary Tests
// ----------------------------------------------------------------------------
console.log('\nGroup 2: Quantizer Boundary Tests');

runTest('Quantize 0 Mbps -> L', () => {
  assert.strictEqual(quantizeBandwidth(0), 'L');
});

runTest('Quantize 50 Mbps -> L', () => {
  assert.strictEqual(quantizeBandwidth(50), 'L');
});

runTest('Quantize 50.5 Mbps -> H', () => {
  assert.strictEqual(quantizeBandwidth(50.5), 'H');
});

runTest('Quantize 100 Mbps -> H', () => {
  assert.strictEqual(quantizeBandwidth(100), 'H');
});

runTest('Quantize 100.5 Mbps -> S', () => {
  assert.strictEqual(quantizeBandwidth(100.5), 'S');
});

runTest('Quantize 200 Mbps -> S', () => {
  assert.strictEqual(quantizeBandwidth(200), 'S');
});

runTest('Quantize 200.5 Mbps -> B', () => {
  assert.strictEqual(quantizeBandwidth(200.5), 'B');
});

// ----------------------------------------------------------------------------
// 3. FSM State Transition Tests
// ----------------------------------------------------------------------------
console.log('\nGroup 3: FSM State Transition Tests');

runTest('FSM: S0 + L -> S0', () => {
  assert.strictEqual(getNextState('S0', 'L'), 'S0');
});

runTest('FSM: S0 + H -> S1', () => {
  assert.strictEqual(getNextState('S0', 'H'), 'S1');
});

runTest('FSM: S0 + S -> S2', () => {
  assert.strictEqual(getNextState('S0', 'S'), 'S2');
});

runTest('FSM: S0 + B -> S3', () => {
  assert.strictEqual(getNextState('S0', 'B'), 'S3');
});

runTest('FSM: S3 + L -> S3 (Trap State self-loop)', () => {
  assert.strictEqual(getNextState('S3', 'L'), 'S3');
});

runTest('FSM: S3 + H -> S3 (Trap State self-loop)', () => {
  assert.strictEqual(getNextState('S3', 'H'), 'S3');
});

runTest('FSM: S3 + S -> S3 (Trap State self-loop)', () => {
  assert.strictEqual(getNextState('S3', 'S'), 'S3');
});

runTest('FSM: S3 + B -> S3 (Trap State self-loop)', () => {
  assert.strictEqual(getNextState('S3', 'B'), 'S3');
});

runTest('FSM: S3 + R -> S0 (Administrator manual reset)', () => {
  assert.strictEqual(getNextState('S3', 'R'), 'S0');
});

runTest('FSM Sequence: [L, H, S, B, R] starting at S0 ends in S0', () => {
  assert.strictEqual(classifySequence('S0', ['L', 'H', 'S', 'B', 'R']), 'S0');
});

// ----------------------------------------------------------------------------
// 4. Invalid Input Handling Tests
// ----------------------------------------------------------------------------
console.log('\nGroup 4: Invalid Input Handling Tests');

runTest('Quantizer: Throws error on negative number (-10)', () => {
  assert.throws(() => quantizeBandwidth(-10), /Invalid bandwidth input/);
});

runTest('Quantizer: Throws error on non-numeric string ("abc")', () => {
  assert.throws(() => quantizeBandwidth('abc'), /Invalid bandwidth input/);
});

runTest('Quantizer: Throws error on null input', () => {
  assert.throws(() => quantizeBandwidth(null), /Invalid bandwidth input/);
});

runTest('FSM: Throws error on invalid state ("INVALID_STATE")', () => {
  assert.throws(() => getNextState('INVALID_STATE', 'L'), /Invalid state/);
});

runTest('FSM: Throws error on invalid symbol ("X")', () => {
  assert.throws(() => getNextState('S0', 'X'), /Invalid input symbol/);
});

runTest('FSM: Throws error on sequence starting with invalid state', () => {
  assert.throws(() => classifySequence('INVALID', ['L']), /Invalid initial state/);
});

runTest('FSM: Throws error on sequence containing invalid symbol', () => {
  assert.throws(() => classifySequence('S0', ['L', 'X']), /Invalid input symbol/);
});

// ----------------------------------------------------------------------------
// Final Summary
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(` Test Execution Summary: ${passedTests}/${totalTests} Tests PASSED (100%)`);
console.log('================================================================\n');
