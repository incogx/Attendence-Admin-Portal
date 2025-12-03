// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// pages
import AdminPortal from './pages/AdminPortal';
import HodPortal from './pages/HodPortal';
import FacultyPortal from './pages/FacultyPortal';

// components
import LoginForm from './components/Auth/LoginForm';
import RedirectToRole from './components/RedirectToRole';

function NoAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-xl text-center">
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to view this portal.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<RedirectToRole />} />

          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="/hod/*" element={<HodPortal />} />
          <Route path="/faculty/*" element={<FacultyPortal />} />

          <Route path="/no-access" element={<NoAccess />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
