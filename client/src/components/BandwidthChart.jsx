import React, { useState } from 'react';

/**
 * Clean, lightweight SVG Line Chart for Bandwidth History.
 * Supports threshold lines (50, 100, 200 Mbps) and point hover inspection.
 */
export function BandwidthChart({ history = [], selectedHostId, onSelectHost, hosts = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter or take records in chronological order for the line chart
  const chronHistory = [...history].reverse();

  if (chronHistory.length === 0) {
    return (
      <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <h4 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#334155' }}>No Bandwidth Data Available</h4>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
          Select a host or submit a bandwidth reading to plot the timeline.
        </p>
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Maximum value for scaling (at least 250 Mbps to cleanly visualize all thresholds)
const maxBw = Math.max(250, ...chronHistory.map(r => (r.bandwidth || 0) * 1.15));
  const getX = index => {
    if (chronHistory.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (chronHistory.length - 1)) * chartWidth;
  };

  const getY = val => {
    return padding.top + chartHeight - (val / maxBw) * chartHeight;
  };

  // Build SVG path
  const points = chronHistory.map((d, i) => `${getX(i)},${getY(d.bandwidth || 0)}`);
  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';

  // Area under line
  const areaD = points.length > 0
    ? `M ${getX(0)},${getY(0)} L ${points.join(' L ')} L ${getX(chronHistory.length - 1)},${getY(0)} Z`
    : '';

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Bandwidth Usage Over Time
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Continuous telemetry with FSM threshold reference markers
          </p>
        </div>

        {/* Host Selector */}
        {hosts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Host:</span>
            <select
              value={selectedHostId || ''}
              onChange={e => onSelectHost(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
            >
              {hosts.map(h => (
                <option key={h.hostId} value={h.hostId}>
                  {h.hostId} ({h.currentState})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '600px', display: 'block' }}
        >
          {/* Background grid lines */}
          {[0, 50, 100, 200].map(threshold => {
            const yPos = getY(threshold);
            return (
              <g key={threshold}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="#e2e8f0"
                  strokeDasharray={threshold === 0 ? 'none' : '4 4'}
                  strokeWidth={threshold === 0 ? 1.5 : 1}
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {threshold}M
                </text>
              </g>
            );
          })}

          {/* Threshold zone labels */}
          <text x={width - padding.right} y={getY(200) - 6} fill="#ef4444" fontSize="10" textAnchor="end" fontWeight="600">
            &gt; 200M (Blocked / Critical)
          </text>
          <text x={width - padding.right} y={getY(100) - 6} fill="#f59e0b" fontSize="10" textAnchor="end" fontWeight="600">
            &gt; 100M (Suspicious / Warning)
          </text>
          <text x={width - padding.right} y={getY(50) - 6} fill="#3b82f6" fontSize="10" textAnchor="end" fontWeight="600">
            &gt; 50M (High Usage)
          </text>

          {/* Gradient area */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Primary Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {chronHistory.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.bandwidth || 0);
            const isHovered = hoveredPoint && hoveredPoint.idx === idx;

            // Point color mapped to state
            let pointColor = '#10b981';
            if (d.resultingState === 'S1') pointColor = '#3b82f6';
            if (d.resultingState === 'S2') pointColor = '#f59e0b';
            if (d.resultingState === 'S3') pointColor = '#ef4444';

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint({ ...d, x: cx, y: cy, idx })}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={pointColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Bottom X-axis labels (first and last timestamp) */}
          {chronHistory.length > 0 && (
            <g fontSize="10" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">
              <text x={padding.left} y={height - 12} textAnchor="start">
                {new Date(chronHistory[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </text>
              <text x={width - padding.right} y={height - 12} textAnchor="end">
                {new Date(chronHistory[chronHistory.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </text>
            </g>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: `${hoveredPoint.y - 70}px`,
              left: `${Math.min(Math.max(hoveredPoint.x - 70, 10), width - 150)}px`,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'none',
              zIndex: 20,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ fontWeight: 700 }}>{hoveredPoint.bandwidth} Mbps ({hoveredPoint.symbol})</div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              State: {hoveredPoint.previousState} &rarr; {hoveredPoint.resultingState}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              {new Date(hoveredPoint.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
