
/**
 * ============================================================================
 * Network Bandwidth Usage Anomaly Detection System
 * Module: Formal Languages & Automata Theory (FLAT)
 * File: server/logic/regexValidator.js
 * ============================================================================
 *
 * Purpose:
 * Validates host IDs, IPv4 addresses, bandwidth values and timestamps
 * before records enter the FSM classification process.
 *
 * Regex performs lexical validation.
 * Timestamp validation also includes calendar-date verification.
 */

// 1. Regular Expression Patterns

// Host ID: HOST-001, SRV-1024, NODE-99999
const HOST_ID_REGEX = /^(HOST|SRV|NODE)-\d{3,5}$/;

// IPv4: Four valid octets (0–255), separated by literal dots.
const IPV4_REGEX = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

// Bandwidth: Non-negative integer or decimal with up to 2 decimal places.
const BANDWIDTH_REGEX = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// Timestamp format: YYYY-MM-DD HH:MM:SS
const TIMESTAMP_REGEX = /^(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;


// 2. Validation Functions

function isValidHostId(hostId) {
    if (typeof hostId !== 'string') {
        return false;
    }

    return HOST_ID_REGEX.test(hostId);
}


function isValidIPv4(ip) {
    if (typeof ip !== 'string') {
        return false;
    }

    return IPV4_REGEX.test(ip);
}


function isValidBandwidth(bandwidth) {
    if (typeof bandwidth !== 'string' && typeof bandwidth !== 'number') {
        return false;
    }

    if (typeof bandwidth === 'number') {
        if (!Number.isFinite(bandwidth) || bandwidth < 0) {
            return false;
        }
    }

    return BANDWIDTH_REGEX.test(String(bandwidth));
}


function isValidTimestamp(timestamp) {
    if (typeof timestamp !== 'string') {
        return false;
    }

    const match = timestamp.match(TIMESTAMP_REGEX);

    if (!match) {
        return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    // Leap-year calculation
    const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) ||
        (year % 400 === 0);

    // Maximum days in each month
    const maxDaysPerMonth = [
        0,
        31,
        isLeapYear ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    return day <= maxDaysPerMonth[month];
}


// 3. CommonJS Exports

module.exports = {
    isValidHostId,
    isValidIPv4,
    isValidBandwidth,
    isValidTimestamp
};
