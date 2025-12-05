// src/pages/FacultyPortal.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import FacultySidebar from "../components/faculty/FacultySidebar";
import FacultyHeader from "../components/faculty/FacultyHeader";

import FacultyDashboard from "../components/faculty/FacultyDashboard";
import FacultyClasses from "../components/faculty/FacultyClasses";
import GenerateQRPanel from "../components/faculty/GenerateQRPanel";
import AttendancePage from "../components/faculty/AttendancePage";

// common pages
import NotificationCenter from "../components/Notifications/NotificationCenter";
import SettingsView from "../components/Settings/SettingsView";

export default function FacultyPortal() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <FacultySidebar />
      <div className="flex-1 flex flex-col">
        <FacultyHeader title="Faculty Portal" subtitle="Manage attendance" />

        <main className="p-8">
          <Routes>
            {/* default dashboard */}
            <Route path="/" element={<FacultyDashboard />} />

            {/* faculty-specific pages */}
            <Route path="today" element={<FacultyDashboard />} />
            <Route path="classes" element={<FacultyClasses />} />
            <Route path="generate-qr" element={<GenerateQRPanel />} />
            <Route path="attendance" element={<AttendancePage />} />

            {/* common pages */}
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="settings" element={<SettingsView />} />

            {/* add more faculty routes here as needed */}
          </Routes>
        </main>
      </div>
    </div>
  );
}
