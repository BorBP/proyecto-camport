import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import MapPage from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Rutas protegidas */}
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="animals" element={<AnimalsPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </div>
  );
}

export default App;