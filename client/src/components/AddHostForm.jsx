import React, { useState } from 'react';
export function AddHostForm({ onHostRegistered }) {
  const [hostId, setHostId] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await onHostRegistered({ hostId: hostId.trim(), ipAddress: ipAddress.trim() });
      setSuccess(`Host ${hostId} (${ipAddress}) registered successfully!`);
      setHostId('');
      setIpAddress('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
        Register New Network Host
      </h3>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
        Enforces FLAT regular expression format rules for device identifiers and IPv4 addresses.
      </p>

      {error && (
        <div className="alert-banner error">
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>&times;</button>
        </div>
      )}

      {success && (
        <div className="alert-banner success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>&times;</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Host Identifier (Host ID)</label>
          <input
            type="text"
            className="form-input font-mono"
            placeholder="e.g. HOST-001, SRV-1024, NODE-99999"
            value={hostId}
            onChange={e => setHostId(e.target.value)}
            required
          />
          <p className="form-hint">Must match uppercase category prefix and 3-5 digits.</p>
        </div>

        <div className="form-group">
          <label className="form-label">IPv4 Address</label>
          <input
            type="text"
            className="form-input font-mono"
            placeholder="e.g. 192.168.1.50"
            value={ipAddress}
            onChange={e => setIpAddress(e.target.value)}
            required
          />
          <p className="form-hint">Must be 4 decimal octets between 0 and 255.</p>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Registering...' : 'Register Host'}
        </button>
      </form>
    </div>
  );
}
