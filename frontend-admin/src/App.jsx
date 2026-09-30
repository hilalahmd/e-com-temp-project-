import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SuperAdminDashboard from './SuperAdminDashboard';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  // Auth context-il ninnu role edukkunnu
  const { role } = useAuth();

  return (
    <>
      {/* Toast notifications kanikkan vendi */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'border-2 border-black rounded-none font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          style: {
            background: '#fff',
            color: '#000',
            borderRadius: '0',
          },
        }} 
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={
          // Super admin anenkil SuperAdminDashboard kanikkum, allenkil normal Dashboard
          role === 'super_admin' ? (
            <SuperAdminDashboard />
          ) : (
            <DashboardPage />
          )
        } />
        {/* Illatha route vannal landing page-lekku pokum */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
