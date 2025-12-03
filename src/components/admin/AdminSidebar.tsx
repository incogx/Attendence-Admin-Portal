// src/components/admin/AdminSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function AdminSidebar() {
  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-md mb-1 text-sm ${isActive ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-6">
        <div className="text-xl font-bold text-purple-700 mb-4">EduAdmin</div>
        <nav>
          {navItem('/admin', 'Dashboard')}
          {navItem('/admin/users', 'Manage Users')}
          {navItem('/admin/add-hod', 'Add HOD')}
          {navItem('/admin/add-faculty', 'Add Faculty')}
        </nav>
      </div>
    </aside>
  );
}
