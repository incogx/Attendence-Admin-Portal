// src/components/admin/AdminSidebar.tsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, Users, Settings, Bell, Shield, Plus } from "lucide-react";

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const location = useLocation();

  // Determine if we're in any /admin/users* route — used to highlight parent compactly
  const usersActive = location.pathname.startsWith("/admin/users") || location.pathname === "/admin/users";

  // auto open users submenu when on users routes
  useEffect(() => {
    if (usersActive) setUsersOpen(true);
  }, [usersActive]);

  const linkBaseClasses =
    "block px-4 py-3 rounded-md mb-1 text-sm transition-colors duration-150";
  const activeClasses = "bg-purple-600 text-white";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  const navItem = (to: string, label: string, end = false, extra?: React.ReactNode) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
      onClick={() => setMobileOpen(false)} // close mobile menu on click
    >
      <div className="flex items-center justify-between">
        <div className="truncate">{label}</div>
        {extra}
      </div>
    </NavLink>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-white">
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
            <div className="mb-2">
              {/* Dashboard: use relative/root path */}
              {navItem("/admin", "Dashboard", true)}
            </div>

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
                  <div className="flex items-center gap-3">
                    <Users className={usersActive ? "w-4 h-4 text-purple-600" : "w-4 h-4 text-gray-400"} />
                    <span className="text-sm font-medium">Users</span>
                  </div>
                  <span className="text-xs opacity-75">{usersActive ? "(open)" : ""}</span>
                </div>
              </button>
            </div>

            {/* Submenu — render in smaller indent. Only shown when usersOpen true */}
            {usersOpen && (
              <div id="users-submenu" className="pl-6 mb-4">
                {navItem("/admin/users", "Manage Users")}
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

            {/* OTHER sections: analytics, notifications, moderation, settings */}
            <div className="mb-2">
              <NavLink
                to="/admin/analytics"
                className={({ isActive }) =>
                  `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses} flex items-center justify-between`
                }
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span className="truncate">Analytics</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/notifications"
                className={({ isActive }) =>
                  `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses} flex items-center justify-between`
                }
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span className="truncate">Notifications</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/moderation"
                className={({ isActive }) =>
                  `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses} flex items-center justify-between`
                }
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  <span className="truncate">Moderation</span>
                </div>
              </NavLink>

              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses} flex items-center justify-between`
                }
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span className="truncate">Settings</span>
                </div>
              </NavLink>
            </div>
          </nav>

          <div className="mt-auto text-xs text-gray-500">
            Manage HOD, Faculty and view analytics
          </div>
        </div>
      </aside>
    </>
  );
}
