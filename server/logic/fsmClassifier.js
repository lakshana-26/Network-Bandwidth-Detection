/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Formal Languages & Automata Theory (FLAT) - FSM Classifier
 * File: server/logic/fsmClassifier.js
 * ============================================================================
 * 
 * Purpose:
 * Implements the Deterministic Finite Automaton (DFA) transition function
 * δ: Q × Σ → Q for host bandwidth anomaly classification.
 * 
 * States (Q):
 * - S0: Normal (Initial State)
 * - S1: High Usage
 * - S2: Suspicious
 * - S3: Blocked (Trap State)
 * 
 * Input Alphabet (Σ):
 * - L: Low bandwidth (0 to 50 Mbps)
 * - H: High bandwidth (Above 50 to 100 Mbps)
 * - S: Suspicious bandwidth (Above 100 to 200 Mbps)
 * - B: Burst / Anomaly bandwidth (Above 200 Mbps)
 * - R: Administrator manual reset
 * 
 * Transition Table:
 * | Current State | L  | H  | S  | B  | R  |
 * |:-------------:|:--:|:--:|:--:|:--:|:--:|
 * |      S0       | S0 | S1 | S2 | S3 | S0 |
 * |      S1       | S0 | S1 | S2 | S3 | S0 |
 * |      S2       | S0 | S1 | S2 | S3 | S0 |
 * |      S3       | S3 | S3 | S3 | S3 | S0 |
 * ============================================================================
 */

/**
 * Valid FSM States
 */
const STATES = Object.freeze({
  S0: 'S0',
  S1: 'S1',
  S2: 'S2',
  S3: 'S3'
});

/**
 * Valid FSM Input Alphabet Symbols
 */
const SYMBOLS = Object.freeze({
  L: 'L',
  H: 'H',
  S: 'S',
  B: 'B',
  R: 'R'
});

/**
 * Deterministic Transition Table
 * Mapping: TRANSITION_TABLE[currentState][inputSymbol] -> nextState
 */
const TRANSITION_TABLE = Object.freeze({
  S0: Object.freeze({ L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' }),
  S1: Object.freeze({ L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' }),
  S2: Object.freeze({ L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' }),
  S3: Object.freeze({ L: 'S3', H: 'S3', S: 'S3', B: 'S3', R: 'S0' })
});

/**
 * Calculates the next state given a current state and an input symbol.
 * 
 * @param {string} currentState - Current state of the host ('S0', 'S1', 'S2', 'S3').
 * @param {string} inputSymbol - Input symbol ('L', 'H', 'S', 'B', 'R').
 * @returns {string} The next state ('S0', 'S1', 'S2', 'S3').
 * @throws {Error} If currentState or inputSymbol is unrecognized.
 */
function getNextState(currentState, inputSymbol) {
  if (!Object.prototype.hasOwnProperty.call(TRANSITION_TABLE, currentState)) {
    throw new Error(`Invalid state: "${currentState}". Valid states are: ${Object.keys(TRANSITION_TABLE).join(', ')}.`);
  }

  const transitionsForState = TRANSITION_TABLE[currentState];

  if (!Object.prototype.hasOwnProperty.call(transitionsForState, inputSymbol)) {
    throw new Error(`Invalid input symbol: "${inputSymbol}". Valid symbols are: ${Object.keys(SYMBOLS).join(', ')}.`);
  }

  return transitionsForState[inputSymbol];
}

/**
 * Sequentially evaluates a series of input symbols from an initial state and returns the final state.
 * 
 * @param {string} initialState - Starting state ('S0', 'S1', 'S2', 'S3').
 * @param {string[]|string} inputSymbols - Array or string sequence of symbols.
 * @returns {string} The final state reached after consuming all symbols in order.
 * @throws {Error} If initialState or any symbol in the sequence is invalid.
 */
function classifySequence(initialState, inputSymbols) {
  if (!Object.prototype.hasOwnProperty.call(TRANSITION_TABLE, initialState)) {
    throw new Error(`Invalid initial state: "${initialState}". Valid states are: ${Object.keys(TRANSITION_TABLE).join(', ')}.`);
  }

  if (!inputSymbols || (typeof inputSymbols !== 'string' && !Array.isArray(inputSymbols))) {
    throw new Error('Invalid input symbols: expected an array or string of symbols.');
  }

  const symbols = Array.isArray(inputSymbols) ? inputSymbols : inputSymbols.split('');

  let state = initialState;
  for (let i = 0; i < symbols.length; i++) {
    state = getNextState(state, symbols[i]);
  }

  return state;
}

module.exports = {
  STATES,
  SYMBOLS,
  TRANSITION_TABLE,
  getNextState,
  classifySequence
};
