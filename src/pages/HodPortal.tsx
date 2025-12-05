// src/pages/HodPortal.tsx
import React, { useState } from "react";
import HodHeader from "../components/hod/HodHeader";
import HodSidebar from "../components/hod/HodSidebar";
import HodDashboard from "../components/hod/HodDashboard";
import FacultyManagement from "../components/hod/FacultyManagement";
import AddFacultyForm from "../components/hod/AddFacultyForm";
import { Route, Routes } from "react-router-dom";
import NotificationCenter from "../components/Notifications/NotificationCenter";
import SettingsView from "../components/Settings/SettingsView";

export default function HodPortal() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-800 flex">
      <div className="w-64">
        <div className="sticky top-0"><HodSidebar /></div>
      </div>

      <main className="flex-1 px-6 py-6">
        <HodHeader />
        <div className="mt-6">
          <Routes>
            <Route index element={<HodDashboard />} />
            <Route path="faculty" element={<FacultyManagement />} />
            <Route path="add-faculty" element={<AddFacultyForm open={true} onClose={()=>{ window.history.back(); }} />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="settings" element={<SettingsView />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
