import React, { useEffect, useState } from 'react';
import { StateBadge, SymbolBadge } from './StateBadge';

export function AddBandwidthForm({ hosts = [], onIngestBandwidth, defaultHostId = '' }) {
  const [hostId, setHostId] = useState(defaultHostId || (hosts[0]?.hostId || ''));
  const [bandwidth, setBandwidth] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
  if (defaultHostId) {
    setHostId(defaultHostId);
  } else if (!hostId && hosts.length > 0) {
    setHostId(hosts[0].hostId);
  }
}, [defaultHostId, hosts, hostId]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        hostId: hostId.trim(),
        bandwidth: bandwidth.trim()
      };
      if (timestamp.trim()) {
        payload.timestamp = timestamp.trim();
      }

      const res = await onIngestBandwidth(payload);
      setResult(res.data);
      setBandwidth('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Form Card */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Submit Bandwidth Telemetry
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
          Sends telemetry to backend for regex validation, quantization, and FSM classification.
        </p>

        {error && (
          <div className="alert-banner error">
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Registered Host</label>
            {hosts.length > 0 ? (
              <select
                className="form-select font-mono"
                value={hostId}
                onChange={e => setHostId(e.target.value)}
                required
              >
                {hosts.map(h => (
                  <option key={h.hostId} value={h.hostId}>
                    {h.hostId} ({h.ipAddress}) - State: {h.currentState}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-input font-mono"
                placeholder="e.g. HOST-001"
                value={hostId}
                onChange={e => setHostId(e.target.value)}
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Bandwidth Usage (Mbps)</label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="e.g. 45, 80.5, 160, 250"
              value={bandwidth}
              onChange={e => setBandwidth(e.target.value)}
              required
            />
            <p className="form-hint">Non-negative number (e.g. 0-50: L, 51-100: H, 101-200: S, &gt;200: B).</p>
          </div>

          <div className="form-group">
            <label className="form-label">Timestamp (Optional)</label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="YYYY-MM-DD HH:MM:SS (Leave empty for current time)"
              value={timestamp}
              onChange={e => setTimestamp(e.target.value)}
            />
            <p className="form-hint">Format: YYYY-MM-DD HH:MM:SS (e.g. 2026-11-15 14:30:00).</p>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? 'Evaluating...' : 'Ingest & Classify Reading'}
          </button>
        </form>
      </div>

      {/* FSM Classification Result Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Live FSM Transition Result
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
          State evaluation produced by Deterministic Finite Automaton engine
        </p>

        {result ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Host ID:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{result.record.hostId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Bandwidth Ingested:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{result.record.bandwidth} Mbps</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Quantized Alphabet Symbol:</span>
                <SymbolBadge symbol={result.record.symbol} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>State Transition:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <StateBadge state={result.record.previousState} />
                  <span>&rarr;</span>
                  <StateBadge state={result.record.resultingState} />
                </div>
              </div>
            </div>

            {/* Alert banner if an anomaly occurred */}
            {result.alert ? (
              <div
                style={{
                  backgroundColor: result.alert.severity === 'Critical' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${result.alert.severity === 'Critical' ? '#fecaca' : '#fde68a'}`,
                  color: result.alert.severity === 'Critical' ? '#b91c1c' : '#b45309',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                  &#9888; {result.alert.severity.toUpperCase()} ANOMALY ALERT TRIGGERED!
                </div>
                <div>{result.alert.message}</div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                &#10003; Normal telemetry accepted. No new security alert generated.
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '0.875rem' }}>Submit a reading to observe live FSM state calculation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
