// src/pages/AdminPortal.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import DashboardPanel from '../components/admin/DashboardPanel';
import UsersManagementAdmin from '../components/admin/UsersManagementAdmin';
import AddUserForm from '../components/admin/AddUserForm';

export default function AdminPortal() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-8">
          <Routes>
            <Route path="/" element={<DashboardPanel />} />
            <Route path="users" element={<UsersManagementAdmin />} />
            <Route path="add-hod" element={<AddUserForm defaultRole="HOD" />} />
            <Route path="add-faculty" element={<AddUserForm defaultRole="FACULTY" />} />
            {/* add more admin routes here */}
          </Routes>
        </main>
      </div>
    </div>
  );
}
