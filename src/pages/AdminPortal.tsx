// src/pages/AdminPortal.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

import DashboardPanel from "../components/admin/DashboardPanel";
import UsersManagementAdmin from "../components/admin/UsersManagementAdmin";
import AddUserForm from "../components/admin/AddUserForm";

// common admin pages
import AnalyticsView from "../components/Analytics/AnalyticsView";
import NotificationCenter from "../components/Notifications/NotificationCenter";
import ContentModeration from "../components/Moderation/ContentModeration";
import SettingsView from "../components/Settings/SettingsView";

export default function AdminPortal() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-8">
          <Routes>
            {/* default dashboard */}
            <Route path="/" element={<DashboardPanel />} />

            {/* user management */}
            <Route path="users" element={<UsersManagementAdmin />} />
            <Route path="add-hod" element={<AddUserForm defaultRole="HOD" />} />
            <Route path="add-faculty" element={<AddUserForm defaultRole="FACULTY" />} />

            {/* additional common admin pages */}
            <Route path="analytics" element={<AnalyticsView />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="moderation" element={<ContentModeration />} />
            <Route path="settings" element={<SettingsView />} />

            {/* add more admin routes here as needed */}
          </Routes>
        </main>
      </div>
    </div>
  );
}
