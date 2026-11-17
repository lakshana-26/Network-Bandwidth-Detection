import React, { useState } from 'react';
import { apiService } from '../api/apiService';

export function CsvUploadView({ onUploadComplete }) {
  const [csvText, setCsvText] = useState('');
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Sample CSV template
  const sampleCsv = `hostId,bandwidth,timestamp
HOST-203,30,
HOST-203,80,
HOST-203,150,
HOST-203,250,
HOST-203,20,`;
const handleDownloadSample = () => {
  const blob = new Blob([sampleCsv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'sample-bandwidth-readings.csv';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};


  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = event => {
        setCsvText(event.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleProcessCsv = async () => {
    setError(null);
    setResults([]);
    if (!csvText.trim()) {
      setError('Please provide CSV content or select a CSV file.');
      return;
    }

    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) {
      setError('CSV must contain a header row and at least one data row.');
      return;
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const hostIdIdx = header.indexOf('hostid');
    const bwIdx = header.indexOf('bandwidth');
    const tsIdx = header.indexOf('timestamp');

    if (hostIdIdx === -1 || bwIdx === -1) {
      setError('CSV header must contain "hostId" and "bandwidth" columns.');
      return;
    }

    const dataRows = lines.slice(1);
    setIsProcessing(true);
    setProgress({ current: 0, total: dataRows.length });

    const processedLogs = [];

    // Process rows sequentially to preserve temporal FSM state order
    for (let i = 0; i < dataRows.length; i++) {
      const rowLine = dataRows[i];
      const cols = rowLine.split(',').map(c => c.trim());
      const rowNum = i + 2;

      const hostId = cols[hostIdIdx];
      const bandwidth = cols[bwIdx];
      const timestamp = tsIdx !== -1 && cols[tsIdx] ? cols[tsIdx] : undefined;

      try {
        const payload = { hostId, bandwidth };
        if (timestamp) payload.timestamp = timestamp;

        const res = await apiService.ingestBandwidth(payload);
        processedLogs.push({
          row: rowNum,
          hostId,
          bandwidth,
          status: 'success',
          symbol: res.data.record.symbol,
          state: res.data.record.resultingState,
          alert: res.data.alert ? res.data.alert.severity : null
        });
      } catch (err) {
        processedLogs.push({
          row: rowNum,
          hostId,
          bandwidth,
          status: 'error',
          error: err.message
        });
      }

      setProgress({ current: i + 1, total: dataRows.length });
    }

    setIsProcessing(false);
    setResults(processedLogs);
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
        Batch CSV Telemetry Ingestion
      </h3>
      <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
        Upload or paste network logs formatted as <code className="font-mono">hostId,bandwidth,timestamp</code>. Rows are evaluated sequentially.
      </p>

      {error && (
        <div className="alert-banner error">
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>&times;</button>
        </div>
      )}

      {/* File input and Sample load */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          style={{ fontSize: '0.8125rem' }}
        />
        <button
          type="button"
          onClick={() => setCsvText(sampleCsv)}
          className="btn btn-secondary btn-sm"
        >
          Load Sample Incident Sequence
        </button>
        <button
          type="button"
          onClick={handleDownloadSample}
          className="btn btn-outline btn-sm"
        >
          Download Sample CSV
        </button>
      </div>

      {/* Textarea for CSV */}
      <div className="form-group">
        <label className="form-label">CSV Content</label>
        <textarea
          rows={6}
          className="form-input font-mono"
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder={`hostId,bandwidth,timestamp\nHOST-001,35.0,2026-11-15 10:00:00`}
          style={{ fontSize: '0.8125rem' }}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleProcessCsv}
        disabled={isProcessing}
        className="btn btn-primary"
      >
        {isProcessing
          ? `Processing Row ${progress.current} of ${progress.total}...`
          : 'Ingest CSV Telemetry'}
      </button>

      {/* Progress Bar */}
      {isProcessing && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ height: '6px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#2563eb',
                width: `${(progress.current / progress.total) * 100}%`,
                transition: 'width 0.2s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Sequential Results Report */}
      {results.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
            Batch Execution Log ({results.filter(r => r.status === 'success').length}/{results.length} Succeeded)
          </h4>
          <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Host ID</th>
                  <th>Bandwidth</th>
                  <th>Status</th>
                  <th>FSM State</th>
                  <th>Alert</th>
                  <th>Error Details</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>#{r.row}</td>
                    <td className="font-mono">{r.hostId}</td>
                    <td>{r.bandwidth}M</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: r.status === 'success' ? '#047857' : '#b91c1c'
                        }}
                      >
                        {r.status === 'success' ? 'Accepted' : 'Rejected'}
                      </span>
                    </td>
                    <td>{r.state || 'N/A'}</td>
                    <td>
                      {r.alert ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.alert === 'Critical' ? '#b91c1c' : '#b45309' }}>
                          {r.alert}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={{ color: '#b91c1c', fontSize: '0.75rem' }}>
  {r.error || '-'}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
