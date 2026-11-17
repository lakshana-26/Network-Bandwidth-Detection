import React, { useState } from 'react';
import { StateBadge, SymbolBadge } from './StateBadge';

export function HostTable({ hosts = [], onSelectHost, onOpenAddReading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHosts = hosts.filter(h =>
    h.hostId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Registered Network Hosts
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Live status and discrete FSM state classifications
          </p>
        </div>

        {/* Search input */}
        <div style={{ width: '240px' }}>
          <input
            type="text"
            placeholder="Search Host ID or IP..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {filteredHosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
          <p style={{ fontSize: '0.875rem' }}>
            {hosts.length === 0 ? 'No hosts registered yet. Register your first host to begin monitoring.' : 'No matching hosts found.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Host ID</th>
                <th>IP Address</th>
                <th>Current Bandwidth</th>
                <th>FSM Symbol</th>
                <th>State Status</th>
                <th>Last Telemetry</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHosts.map(host => (
                <tr key={host.hostId}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>
                    <span className="font-mono">{host.hostId}</span>
                  </td>
                  <td>
                    <span className="font-mono" style={{ color: '#475569' }}>{host.ipAddress}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{host.currentBandwidth || 0}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.25rem' }}>Mbps</span>
                  </td>
                  <td>
                    <SymbolBadge symbol={host.currentSymbol || 'L'} />
                  </td>
                  <td>
                    <StateBadge state={host.currentState || 'S0'} />
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    {host.lastSeen ? new Date(host.lastSeen).toLocaleString() : 'Never'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => onSelectHost(host.hostId)}
                        className="btn btn-secondary btn-sm"
                        title="View bandwidth history chart"
                      >
                        History
                      </button>
                      <button
                        onClick={() => onOpenAddReading(host.hostId)}
                        className="btn btn-primary btn-sm"
                        title="Submit bandwidth reading"
                      >
                        Add Metric
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
