import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { CitizenDashboard } from './components/CitizenDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import './utils/i18n';

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <Router>
          <Routes>
            {/* Public route - Landing/Login page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GOVERNMENT']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Citizen Routes */}
            <Route 
              path="/citizen-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route - redirect to home */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;
