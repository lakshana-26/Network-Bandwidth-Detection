import React, { useCallback, useEffect, useState } from 'react';
import { apiService } from './api/apiService';
import { AutomataView } from './components/AutomataView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { HostTable } from './components/HostTable';
import { BandwidthChart } from './components/BandwidthChart';
import { AddHostForm } from './components/AddHostForm';
import { AddBandwidthForm } from './components/AddBandwidthForm';
import { CsvUploadView } from './components/CsvUploadView';
import { AlertsList } from './components/AlertsList';

function extractRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.hosts)) {
    return response.data.hosts;
  }
  if (Array.isArray(response?.data?.alerts)) {
    return response.data.alerts;
  }
  return [];
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [hosts, setHosts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedHostId, setSelectedHostId] = useState('');
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(null);
  const [pageError, setPageError] = useState('');

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    setPageError('');

    try {
      const results = await Promise.allSettled([
        apiService.checkHealth(),
        apiService.getHosts(),
        apiService.getAlerts()
      ]);

      const [healthResult, hostResult, alertResult] = results;

      setBackendHealthy(healthResult.status === 'fulfilled');

      if (hostResult.status === 'fulfilled') {
        setHosts(extractRows(hostResult.value));
      } else {
        setPageError(
          hostResult.reason?.message || 'Unable to load hosts.'
        );
      }

      if (alertResult.status === 'fulfilled') {
        setAlerts(extractRows(alertResult.value));
      }
    } catch (error) {
      setPageError(error.message || 'Unable to refresh dashboard.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    if (!selectedHostId && hosts.length > 0) {
      setSelectedHostId(hosts[0].hostId);
    }
  }, [hosts, selectedHostId]);

  useEffect(() => {
    let active = true;

    if (!selectedHostId) {
      setHistory([]);
      return () => {
        active = false;
      };
    }

    apiService
      .getBandwidthHistory(selectedHostId, 50)
      .then(response => {
        if (active) {
          setHistory(extractRows(response));
        }
      })
      .catch(error => {
        if (active) {
          setHistory([]);
          console.error(error);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedHostId, hosts]);

  async function handleRegisterHost(data) {
    const response = await apiService.registerHost(data);

    setSelectedHostId(data.hostId);
    await refreshDashboard();

    return response;
  }

  async function handleIngestBandwidth(payload) {
    const response = await apiService.ingestBandwidth(payload);

    setSelectedHostId(payload.hostId);

    await refreshDashboard();

    const historyResponse = await apiService.getBandwidthHistory(
      payload.hostId,
      50
    );

    setHistory(extractRows(historyResponse));

    return response;
  }

  async function handleAcknowledgeAlert(alertId) {
    setIsAcknowledging(alertId);

    try {
      await apiService.acknowledgeAlert(alertId);
      await refreshDashboard();
    } finally {
      setIsAcknowledging(null);
    }
  }

  const unacknowledgedCount = alerts.filter(
    alert => !alert.acknowledged
  ).length;

  // Page titles
  const titles = {
    dashboard: 'Network Overview',
    hosts: 'Host Management',
    monitoring: 'Bandwidth Monitoring',
    'add-reading': 'Add Bandwidth Reading',
    'csv-upload': 'CSV Upload',
    alerts: 'Anomaly Alerts',
    automata: 'FLAT / Automata'
  };

  function openReadingForm(hostId) {
    if (hostId) {
      setSelectedHostId(hostId);
    }

    setCurrentTab('add-reading');
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'Inter, Arial, sans-serif'
      }}
    >
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        alertCount={unacknowledgedCount}
      />

      <main style={{ flex: 1, minWidth: 0 }}>
        <Header
          title={titles[currentTab]}
          backendHealthy={backendHealthy}
          onRefresh={refreshDashboard}
          isRefreshing={isRefreshing}
        />

        <div
          style={{
            padding: '24px',
            maxWidth: '1500px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {pageError && (
            <div className="alert-banner error">
              {pageError}
            </div>
          )}

          {/* Dashboard */}
          {currentTab === 'dashboard' && (
            <>
              <SummaryCards hosts={hosts} />

              <BandwidthChart
                history={history}
                selectedHostId={selectedHostId}
                onSelectHost={setSelectedHostId}
                hosts={hosts}
              />

              <HostTable
                hosts={hosts}
                onSelectHost={id => {
                  setSelectedHostId(id);
                  setCurrentTab('monitoring');
                }}
                onOpenAddReading={openReadingForm}
              />

              <AlertsList
                alerts={alerts.slice(0, 5)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                isAcknowledging={isAcknowledging}
              />
            </>
          )}

          {/* Host Management */}
          {currentTab === 'hosts' && (
            <>
              <AddHostForm
                onHostRegistered={handleRegisterHost}
              />

              <HostTable
                hosts={hosts}
                onSelectHost={id => {
                  setSelectedHostId(id);
                  setCurrentTab('monitoring');
                }}
                onOpenAddReading={openReadingForm}
              />
            </>
          )}

          {/* Bandwidth Monitoring */}
          {currentTab === 'monitoring' && (
            <BandwidthChart
              history={history}
              selectedHostId={selectedHostId}
              onSelectHost={setSelectedHostId}
              hosts={hosts}
            />
          )}

          {/* Add Bandwidth Reading */}
          {currentTab === 'add-reading' && (
            <AddBandwidthForm
              hosts={hosts}
              defaultHostId={selectedHostId}
              onIngestBandwidth={handleIngestBandwidth}
            />
          )}

          {/* CSV Upload */}
          {currentTab === 'csv-upload' && (
            <CsvUploadView
              onUploadComplete={refreshDashboard}
            />
          )}

          {/* Anomaly Alerts */}
          {currentTab === 'alerts' && (
            <AlertsList
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              isAcknowledging={isAcknowledging}
            />
          )}

          {/* FLAT / Automata */}
          {currentTab === 'automata' && (
            <AutomataView />
          )}
        </div>
      </main>
    </div>
  );
}