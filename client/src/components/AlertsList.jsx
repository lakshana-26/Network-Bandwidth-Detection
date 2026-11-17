import React, { useState } from 'react';
import { StateBadge, SeverityBadge } from './StateBadge';

export function AlertsList({ alerts = [], onAcknowledgeAlert, isAcknowledging }) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'unack', 'ack'

  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus === 'unack') return !alert.acknowledged;
    if (filterStatus === 'ack') return alert.acknowledged;
    return true;
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Anomaly Incident Alerts
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Automated alerts triggered on FSM transitions to S2 (Warning) or S3 (Critical)
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unack', label: 'Unacknowledged' },
            { id: 'ack', label: 'Acknowledged' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              className="btn btn-sm"
              style={{
                backgroundColor: filterStatus === btn.id ? '#eff6ff' : '#ffffff',
                color: filterStatus === btn.id ? '#2563eb' : '#64748b',
                borderColor: filterStatus === btn.id ? '#bfdbfe' : '#e2e8f0',
                fontWeight: filterStatus === btn.id ? 600 : 500
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
          <p style={{ fontSize: '0.875rem' }}>
            {alerts.length === 0 ? 'No anomaly alerts recorded. All hosts operating normally.' : 'No alerts match this filter.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>State</th>
                <th>Host ID</th>
                <th>Trigger Bandwidth</th>
                <th>Incident Details</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map(alert => (
                <tr key={alert._id}>
                  <td>
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td>
                    <StateBadge state={alert.state} />
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <span className="font-mono">{alert.hostId}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{alert.bandwidth}</span> Mbps
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '0.8125rem' }}>
                    {alert.message}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: alert.acknowledged ? '#047857' : '#b45309'
                      }}
                    >
                      {alert.acknowledged ? 'Acknowledged' : 'Active'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert._id)}
                        disabled={isAcknowledging === alert._id}
                        className="btn btn-secondary btn-sm"
                        style={{ borderColor: '#cbd5e1' }}
                      >
                        {isAcknowledging === alert._id ? 'Saving...' : 'Acknowledge'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Resolved</span>
                    )}
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
