import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState('');

  // Primary Gateway URL
  const socketUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : (typeof window !== 'undefined' ? window.location.origin : ''));

  const checkHealth = useCallback(async () => {
    try {
      const res = await axios.get('/api/health');
      if (res.data?.liveDataConnected || res.data?.status === 'OPERATIONAL') {
        setConnected(true);
      }
    } catch (err) {
      // Backend unreachable
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth();

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 25,
      reconnectionDelay: 1500,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected to Disaster Operations Gateway at', socketUrl);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from Disaster Operations Gateway - checking HTTP fallback');
      checkHealth();
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[Socket Warning] Transport error:', err.message);
      checkHealth();
    });

    // Real-time disaster events
    newSocket.on('cyclone:live_sync', (data) => {
      setLastUpdated(new Date());
      setConnected(true);
      addEvent(`Live Telemetry Synchronized: ${data.count || 0} active cyclones updated worldwide`);
    });

    newSocket.on('cyclone:update', (data) => {
      setLastUpdated(new Date());
      setConnected(true);
      addEvent('Cyclone Telemetry Updated: ' + data.name + ' (' + data.category + ')');
    });

    newSocket.on('risk:update', (data) => {
      setLastUpdated(new Date());
      addEvent('Risk Assessment Recalculated across ' + (data.zonesCount || 'all') + ' sectors');
    });

    newSocket.on('incident:new', (data) => {
      setLastUpdated(new Date());
      addAlert({
        id: data._id || Date.now(),
        type: 'INCIDENT',
        title: data.title,
        severity: data.severity || 'CRITICAL',
        time: new Date()
      });
      addEvent('New Incident Reported: ' + data.title);
    });

    newSocket.on('alert:new', (data) => {
      setLastUpdated(new Date());
      addAlert({
        id: data._id || Date.now(),
        type: 'EMERGENCY_ALERT',
        title: data.title,
        severity: data.severity || 'CRITICAL',
        time: new Date()
      });
      addEvent('Official Emergency Alert Broadcast: ' + data.title);
    });

    newSocket.on('shelter:update', (data) => {
      setLastUpdated(new Date());
      addEvent('Shelter Status Changed: ' + data.name + ' (' + (data.occupancyPercent || 0) + '% Occupied)');
    });

    newSocket.on('evacuation:progress', (data) => {
      setLastUpdated(new Date());
      addEvent('Evacuation Progress: ' + (data.zoneName || 'Sector') + ' reached ' + (data.progressPercent || 0) + '%');
    });

    newSocket.on('relief:update', (data) => {
      setLastUpdated(new Date());
      addEvent('Relief Dispatch Update: ' + data.itemType + ' to ' + (data.destinationName || 'Shelter'));
    });

    setSocket(newSocket);

    // Heartbeat health check every 15 seconds
    const interval = setInterval(checkHealth, 15000);

    return () => {
      clearInterval(interval);
      newSocket.close();
    };
  }, [socketUrl, checkHealth]);

  const addAlert = (alertObj) => {
    setLiveAlerts(prev => [alertObj, ...prev.slice(0, 7)]);
  };

  const addEvent = (msg) => {
    setRecentEvents(prev => [{ id: Date.now() + Math.random(), text: msg, time: new Date() }, ...prev.slice(0, 15)]);
  };

  const dismissAlert = (id) => {
    setLiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
    checkHealth();
  };

  /**
   * On-demand Real-Time Cyclone Telemetry Refresh
   * Polls global meteorological satellite feeds (IMD, NOAA NHC, NASA EONET, GDACS)
   */
  const syncRealtimeCyclones = async () => {
    setIsSyncing(true);
    setSyncStatusMessage('Polling NOAA, NASA & IMD Satellite Feeds...');
    try {
      const res = await axios.post('/api/cyclones/sync-live');
      setLastUpdated(new Date());
      setConnected(true);
      if (socket && !socket.connected) {
        socket.connect();
      }
      const count = res.data?.count || 0;
      const msg = `Synchronized ${count} real-time cyclones worldwide`;
      setSyncStatusMessage(msg);
      addEvent(msg);
      return res.data;
    } catch (err) {
      console.error('[Sync Error]:', err);
      setSyncStatusMessage('Failed to reach satellite gateway. Re-checking connection...');
      checkHealth();
      throw err;
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMessage(''), 5000);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      lastUpdated,
      liveAlerts,
      recentEvents,
      dismissAlert,
      reconnect,
      syncRealtimeCyclones,
      isSyncing,
      syncStatusMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
