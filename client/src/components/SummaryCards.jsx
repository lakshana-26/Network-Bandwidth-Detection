import React from 'react';

export function SummaryCards({ hosts = [] }) {
  const totalHosts = hosts.length;
  const normalCount = hosts.filter(h => h.currentState === 'S0').length;
  const highCount = hosts.filter(h => h.currentState === 'S1').length;
  const suspiciousCount = hosts.filter(h => h.currentState === 'S2').length;
  const blockedCount = hosts.filter(h => h.currentState === 'S3').length;

  const cards = [
    {
      title: 'Total Monitored Hosts',
      count: totalHosts,
      subtext: 'Registered endpoints',
      badgeColor: '#64748b',
      borderLeft: '#2563eb'
    },
    {
      title: 'Normal State (S0)',
      count: normalCount,
      subtext: '0 to 50 Mbps baseline',
      badgeColor: '#10b981',
      borderLeft: '#10b981'
    },
    {
      title: 'High Usage (S1)',
      count: highCount,
      subtext: '50 to 100 Mbps',
      badgeColor: '#3b82f6',
      borderLeft: '#3b82f6'
    },
    {
      title: 'Suspicious (S2)',
      count: suspiciousCount,
      subtext: '100 to 200 Mbps warning',
      badgeColor: '#f59e0b',
      borderLeft: '#f59e0b'
    },
    {
      title: 'Blocked (S3)',
      count: blockedCount,
      subtext: '>200 Mbps quarantined',
      badgeColor: '#ef4444',
      borderLeft: '#ef4444'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}
    >
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            borderLeft: `4px solid ${card.borderLeft}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            {card.title}
          </p>
          <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: '0.375rem 0' }}>
            {card.count}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
