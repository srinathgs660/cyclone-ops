import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SimulationProvider } from './context/SimulationContext';

import DashboardLayout from './layouts/DashboardLayout';
import CommandCenter from './pages/CommandCenter';
import CycloneTracker from './pages/CycloneTracker';
import ImpactAssessment from './pages/ImpactAssessment';
import EvacuationPlanning from './pages/EvacuationPlanning';
import SheltersManagement from './pages/SheltersManagement';
import IncidentBoard from './pages/IncidentBoard';
import ResponseTeamsPage from './pages/ResponseTeamsPage';
import ReliefCoordination from './pages/ReliefCoordination';
import CitizenPortal from './pages/CitizenPortal';
import AlertCenter from './pages/AlertCenter';
import AnalyticsForecast from './pages/AnalyticsForecast';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

const getDefaultDashboardForRole = (role) => {
  switch (role) {
    case 'citizen':
    case 'volunteer':
      return '/dashboard/citizen';
    case 'responder':
      return '/dashboard/incidents';
    case 'coordinator':
      return '/dashboard/relief';
    case 'officer':
    case 'admin':
    default:
      return '/dashboard';
  }
};

const ProtectedRoute = ({ children, roleRequired, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B1120] text-cyan-400 font-mono text-sm">
        Initializing Command Telemetry...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to={getDefaultDashboardForRole(user.role)} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultDashboardForRole(user.role)} replace />;
  }
  return children;
};

import LandingPage from './pages/LandingPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Root path '/' now displays LandingPage */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage defaultMode="signup" />} />

      {/* Main Command Operations Workspace (Dashboard) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route 
          index 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer', 'responder', 'coordinator']}>
              <CommandCenter />
            </ProtectedRoute>
          } 
        />
        <Route path="cyclones" element={<CycloneTracker />} />
        <Route 
          path="risk" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <ImpactAssessment />
            </ProtectedRoute>
          } 
        />
        <Route path="evacuation" element={<EvacuationPlanning />} />
        <Route path="shelters" element={<SheltersManagement />} />
        <Route 
          path="incidents" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer', 'responder']}>
              <IncidentBoard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="teams" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer', 'responder']}>
              <ResponseTeamsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="relief" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer', 'coordinator']}>
              <ReliefCoordination />
            </ProtectedRoute>
          } 
        />
        <Route path="citizen" element={<CitizenPortal />} />
        <Route 
          path="alerts" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <AlertCenter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <AnalyticsForecast />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer', 'coordinator']}>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Legacy direct routes redirect to /dashboard paths */}
      <Route path="/cyclones" element={<Navigate to="/dashboard/cyclones" replace />} />
      <Route path="/risk" element={<Navigate to="/dashboard/risk" replace />} />
      <Route path="/evacuation" element={<Navigate to="/dashboard/evacuation" replace />} />
      <Route path="/shelters" element={<Navigate to="/dashboard/shelters" replace />} />
      <Route path="/incidents" element={<Navigate to="/dashboard/incidents" replace />} />
      <Route path="/teams" element={<Navigate to="/dashboard/teams" replace />} />
      <Route path="/relief" element={<Navigate to="/dashboard/relief" replace />} />
      <Route path="/citizen" element={<Navigate to="/dashboard/citizen" replace />} />
      <Route path="/alerts" element={<Navigate to="/dashboard/alerts" replace />} />
      <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
      <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
      <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <SimulationProvider>
              <AppRoutes />
            </SimulationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
