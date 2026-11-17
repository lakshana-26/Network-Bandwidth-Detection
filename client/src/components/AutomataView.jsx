import React from 'react';

const states = [
  { id: 'S0', name: 'Normal', description: 'Normal bandwidth activity', color: '#2563eb' },
  { id: 'S1', name: 'High Usage', description: 'Bandwidth is in the high range', color: '#d97706' },
  { id: 'S2', name: 'Suspicious', description: 'Suspicious bandwidth activity detected', color: '#ea580c' },
  { id: 'S3', name: 'Blocked', description: 'Trap state — remains blocked until reset', color: '#dc2626' }
];

const transitionRows = [
  { state: 'S0', L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' },
  { state: 'S1', L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' },
  { state: 'S2', L: 'S0', H: 'S1', S: 'S2', B: 'S3', R: 'S0' },
  { state: 'S3', L: 'S3', H: 'S3', S: 'S3', B: 'S3', R: 'S0' }
];

const symbols = [
  { symbol: 'L', range: '0–50 Mbps', meaning: 'Low bandwidth' },
  { symbol: 'H', range: 'Above 50–100 Mbps', meaning: 'High bandwidth' },
  { symbol: 'S', range: 'Above 100–200 Mbps', meaning: 'Suspicious bandwidth' },
  { symbol: 'B', range: 'Above 200 Mbps', meaning: 'Burst / Anomaly bandwidth' },
  { symbol: 'R', range: 'Administrator control input', meaning: 'Manual FSM reset' }
];

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '22px',
  marginBottom: '20px'
};

const headingStyle = {
  fontSize: '17px',
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 16px'
};

export function AutomataView() {
  return (
    <div style={{ width: '100%', color: '#0f172a' }}>
      {/* Automata definition */}
      <section style={cardStyle}>
        <h2 style={headingStyle}>Finite State Machine (FSM)</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: 0 }}>
          Automata design for network bandwidth anomaly detection.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {[
            ['States (Q)', '{S0, S1, S2, S3}'],
            ['Input Alphabet (Σ)', '{L, H, S, B, R}'],
            ['Initial State (q0)', 'S0'],
            ['Transition Function', 'δ (Current State, Input)']
          ].map(([label, value]) => (
            <div key={label} style={{
              padding: '14px',
              borderRadius: '9px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '7px' }}>
                {label}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FSM states */}
      <section style={cardStyle}>
        <h2 style={headingStyle}>FSM States</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px'
        }}>
          {states.map(state => (
            <div key={state.id} style={{
              border: `1px solid ${state.color}35`,
              borderLeft: `4px solid ${state.color}`,
              borderRadius: '9px',
              padding: '14px',
              background: '#ffffff'
            }}>
              <div style={{ color: state.color, fontWeight: 800, fontSize: '17px' }}>
                {state.id}
              </div>
              <div style={{ fontWeight: 700, margin: '5px 0' }}>
                {state.name}
              </div>
              <div style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>
                {state.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* State transition diagram */}
      <section style={cardStyle}>
        <h2 style={headingStyle}>State Transition Diagram</h2>
        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '-8px' }}>
          Arrow labels represent input symbols. All transitions follow the table below.
        </p>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox="0 0 700 660"
            role="img"
            aria-label="FSM state transition diagram with four states and administrator reset"
            style={{ width: '100%', minWidth: '570px', height: 'auto', display: 'block' }}
          >
            <defs>
              <marker
                id="fsm-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0 0 L8 4 L0 8 Z" fill="#64748b" />
              </marker>
              <marker
                id="fsm-reset-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0 0 L8 4 L0 8 Z" fill="#2563eb" />
              </marker>
            </defs>

            {/* Initial state arrow */}
            <path
              d="M35 170 L102 170"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              markerEnd="url(#fsm-arrow)"
            />
            <text x="38" y="153" fontSize="12" fill="#64748b">Start</text>

            {/* S0 to S1: H */}
            <path d="M195 155 L485 155" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="340" y="143" textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">H</text>

            {/* S1 to S0: L, R */}
            <path d="M485 190 L195 190" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="340" y="207" textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">L, R</text>

            {/* S0 to S2: S */}
            <path d="M137 213 L137 387" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="120" y="305" textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">S</text>

            {/* S2 to S0: L, R */}
            <path d="M165 387 L165 213" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="185" y="305" fontSize="12" fontWeight="700" fill="#334155">L, R</text>

            {/* S1 to S2: S */}
            <path d="M493 207 Q355 300 195 405" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="350" y="282" fontSize="13" fontWeight="700" fill="#334155">S</text>

            {/* S2 to S1: H */}
            <path d="M195 420 Q355 315 493 220" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="365" y="340" fontSize="13" fontWeight="700" fill="#334155">H</text>

            {/* S0 to S3: B */}
            <path d="M190 204 Q350 310 493 400" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="345" y="310" fontSize="13" fontWeight="700" fill="#334155">B</text>

            {/* S1 to S3: B */}
            <path d="M535 213 L535 387" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="550" y="305" fontSize="13" fontWeight="700" fill="#334155">B</text>

            {/* S2 to S3: B */}
            <path d="M195 440 L485 440" fill="none" stroke="#64748b"
              strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="340" y="428" textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">B</text>

            {/* S0 self-loop: L, R */}
            <path d="M115 132 C75 70 215 70 175 132" fill="none"
              stroke="#64748b" strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="145" y="78" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">L, R</text>

            {/* S1 self-loop: H */}
            <path d="M495 132 C455 70 595 70 555 132" fill="none"
              stroke="#64748b" strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="525" y="78" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">H</text>

            {/* S2 self-loop: S */}
            <path d="M115 478 C75 540 215 540 175 478" fill="none"
              stroke="#64748b" strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="145" y="545" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">S</text>

            {/* S3 self-loop: L, H, S, B */}
            <path d="M495 478 C455 540 595 540 555 478" fill="none"
              stroke="#64748b" strokeWidth="2" markerEnd="url(#fsm-arrow)" />
            <text x="525" y="545" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">L, H, S, B</text>

            {/* S3 to S0: administrator reset R */}
            <path
              d="M495 470 C420 625 35 625 65 250 C70 185 85 160 102 160"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              markerEnd="url(#fsm-reset-arrow)"
            />
            <text x="330" y="615" textAnchor="middle" fontSize="13"
              fontWeight="700" fill="#2563eb">R — Administrator Reset</text>

            {/* State nodes */}
            {[
              { x: 150, y: 175, id: 'S0', name: 'Normal', color: '#2563eb' },
              { x: 535, y: 175, id: 'S1', name: 'High Usage', color: '#d97706' },
              { x: 150, y: 440, id: 'S2', name: 'Suspicious', color: '#ea580c' },
              { x: 535, y: 440, id: 'S3', name: 'Blocked', color: '#dc2626' }
            ].map(node => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r="43"
                  fill="#ffffff" stroke={node.color} strokeWidth="3" />
                <text x={node.x} y={node.y - 3} textAnchor="middle"
                  fontSize="17" fontWeight="800" fill={node.color}>
                  {node.id}
                </text>
                <text x={node.x} y={node.y + 15} textAnchor="middle"
                  fontSize="10" fill="#475569">
                  {node.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '12px',
          color: '#1e40af',
          fontSize: '12px',
          lineHeight: 1.6
        }}>
          <strong>Note:</strong> S3 is the trap state. L, H, S and B keep the
          machine in S3. Administrator reset input R returns the machine to S0.
          The complete transition table below defines every transition.
        </div>
      </section>

      {/* Transition table */}
      <section style={cardStyle}>
        <h2 style={headingStyle}>State Transition Table</h2>
        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '-8px' }}>
          δ (Current State, Input Symbol) = Next State
        </p>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['Current State', 'L', 'H', 'S', 'B', 'R'].map(item => (
                  <th key={item} style={{
                    padding: '12px 10px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#334155'
                  }}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transitionRows.map(row => (
                <tr key={row.state}>
                  {[row.state, row.L, row.H, row.S, row.B, row.R].map((value, index) => (
                    <td key={index} style={{
                      padding: '12px 10px',
                      borderBottom: '1px solid #e2e8f0',
                      fontWeight: 600,
                      color: index === 0 ? '#0f172a' : '#475569'
                    }}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Input symbol classification */}
      <section style={cardStyle}>
        <h2 style={headingStyle}>Input Symbol Classification</h2>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['Symbol', 'Bandwidth Range / Meaning', 'Description'].map(item => (
                  <th key={item} style={{
                    padding: '12px',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#334155'
                  }}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map(item => (
                <tr key={item.symbol}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 800 }}>
                    {item.symbol}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    {item.range}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    {item.meaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trap state and reset */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #dc2626',
          marginBottom: 0
        }}>
          <h3 style={{ fontSize: '14px', color: '#dc2626', marginTop: 0 }}>
            Trap State — S3
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
            S3 + L/H/S/B → S3. The host remains blocked until an administrator reset.
          </p>
        </div>

        <div style={{
          ...cardStyle,
          borderLeft: '4px solid #2563eb',
          marginBottom: 0
        }}>
          <h3 style={{ fontSize: '14px', color: '#2563eb', marginTop: 0 }}>
            Administrator Reset — R
          </h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
            R moves any FSM state to S0. Existing bandwidth history and alert records
            are preserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AutomataView;