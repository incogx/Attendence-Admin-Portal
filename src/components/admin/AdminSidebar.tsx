// src/components/admin/AdminSidebar.tsx
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const location = useLocation();

  // Determine if any /admin/users* route is active — used to highlight parent compactly
  const usersActive = location.pathname.startsWith("/admin/users");

  const linkBaseClasses =
    "block px-4 py-3 rounded-md mb-1 text-sm transition-colors duration-150";
  const activeClasses = "bg-purple-600 text-white";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      end // ensures exact matching for routes like '/admin' or '/admin/users'
      className={({ isActive }) =>
        `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
      onClick={() => setMobileOpen(false)} // close mobile menu on click
    >
      {label}
    </NavLink>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-3 border-b">
        <div className="text-lg font-bold text-purple-700">EduAdmin</div>
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="px-3 py-2 rounded-md bg-white border"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white border-r w-64 md:static fixed inset-y-0 left-0 z-30 transform md:translate-x-0 transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="hidden md:block text-xl font-bold text-purple-700 mb-4">
            EduAdmin
          </div>

          <nav className="flex-1">
            {navItem("/admin", "Dashboard")}

            {/* Users parent row: single compact control that shows submenu */}
            <div
              className={`flex items-center justify-between px-2 py-1 mb-1 rounded-md ${
                usersActive ? "bg-purple-50" : ""
              }`}
            >
              <button
                onClick={() => setUsersOpen((v) => !v)}
                className={`text-left w-full ${usersActive ? "text-purple-700" : "text-gray-700"} px-4 py-3 rounded-md`}
                aria-expanded={usersOpen}
                aria-controls="users-submenu"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Users</span>
                  <span className="text-xs opacity-75">{usersActive ? "(open)" : ""}</span>
                </div>
              </button>
            </div>

            {/* Submenu — render in smaller indent. Only one active child at a time */}
            {usersOpen && (
              <div id="users-submenu" className="pl-6">
                {navItem("/admin/users", "Manage Users")}
                {/* Use query params so Add User route can preselect role */}
                <NavLink
                  to={"/admin/users/add?role=HOD"}
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Add HOD
                </NavLink>
                <NavLink
                  to={"/admin/users/add?role=FACULTY"}
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Add Faculty
                </NavLink>
                <NavLink
                  to={"/admin/users/add"}
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Add User
                </NavLink>
              </div>
            )}

            {navItem("/admin/settings", "Settings")}
          </nav>

          <div className="mt-auto text-xs text-gray-500">
            Manage HOD, Faculty and view analytics
          </div>
        </div>
      </aside>
    </>
  );
}
