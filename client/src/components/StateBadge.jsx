import React from 'react';

/**
 * Reusable badge for FSM States (S0, S1, S2, S3) and Alert Severities.
 */
export function StateBadge({ state, label }) {
  const stateConfig = {
    S0: { text: 'S0 Normal', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    S1: { text: 'S1 High Usage', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    S2: { text: 'S2 Suspicious', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    S3: { text: 'S3 Blocked', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' }
  };

  const config = stateConfig[state] || {
    text: state || 'Unknown',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1'
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
          marginRight: '0.375rem'
        }}
      />
      {label || config.text}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const isCritical = severity === 'Critical';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: isCritical ? '#fef2f2' : '#fffbeb',
        color: isCritical ? '#b91c1c' : '#b45309',
        border: `1px solid ${isCritical ? '#fecaca' : '#fde68a'}`
      }}
    >
      {severity}
    </span>
  );
}

export function SymbolBadge({ symbol }) {
  const symbolColors = {
    L: { bg: '#ecfdf5', color: '#047857' },
    H: { bg: '#eff6ff', color: '#1d4ed8' },
    S: { bg: '#fffbeb', color: '#b45309' },
    B: { bg: '#fef2f2', color: '#b91c1c' }
  };

  const style = symbolColors[symbol] || { bg: '#f1f5f9', color: '#475569' };

  return (
    <span
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        display: 'inline-block',
        padding: '0.125rem 0.4rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '700',
        backgroundColor: style.bg,
        color: style.color
      }}
    >
      {symbol}
    </span>
  );
}
