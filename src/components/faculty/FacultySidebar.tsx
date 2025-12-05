// src/components/faculty/FacultySidebar.tsx
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  BookOpen,
  QrCode,
  CheckSquare,
  Bell,
  Settings,
  Menu,
  X
} from "lucide-react";

type NavItemProps = {
  to: string;
  label: string;
  end?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
};

function NavItem({ to, label, end = false, icon, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-purple-300",
          isActive ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-50"
        ].join(" ")
      }
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function FacultySidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <img
            src="/sathyabama-logo.png"
            alt="Sathyabama Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-purple-700">Sathyabama</span>
        </div>

        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center justify-center p-2 rounded-md border bg-white shadow-sm hover:bg-gray-50"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={[
          "bg-white border-r w-72 md:static fixed inset-y-0 left-0 z-40 transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:shadow-none shadow-lg"
        ].join(" ")}
      >
        <div className="p-6 h-full flex flex-col">
          {/* BRANDING */}
          <div className="hidden md:flex items-center gap-3 mb-6">
            <img
              src="/sathyabama-logo.png"
              alt="Sathyabama Logo"
              className="w-12 h-12 object-contain"
            />
            <div className="leading-tight">
              <h1 className="text-lg font-bold text-purple-700">SATHYABAMA</h1>
              <p className="text-xs text-gray-500">Institute of Science & Technology</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <div className="mb-4">
              <NavItem
                to="/faculty"
                label="Dashboard"
                end
                icon={<BarChart3 className="w-5 h-5" />}
                onClick={closeMobile}
              />
            </div>

            <div className="mb-4 space-y-2">
              <NavItem
                to="/faculty/generate-qr"
                label="Generate QR"
                icon={<QrCode className="w-4 h-4" />}
                onClick={closeMobile}
              />

              <NavItem
                to="/faculty/attendance"
                label="Attendance"
                icon={<CheckSquare className="w-4 h-4" />}
                onClick={closeMobile}
              />
            </div>

            <div className="space-y-2 mt-3">
              <NavItem
                to="/faculty/notifications"
                label="Notifications"
                icon={<Bell className="w-4 h-4" />}
                onClick={closeMobile}
              />
              <NavItem
                to="/faculty/settings"
                label="Settings"
                icon={<Settings className="w-4 h-4" />}
                onClick={closeMobile}
              />
            </div>
          </nav>

          {/* Optional footer / small copyright or quick help */}
          <div className="mt-6 text-xs text-gray-500">
            <div className="hidden md:block">
              <div className="mb-1">Logged in as</div>
              <div className="font-medium text-gray-700">Faculty</div>
            </div>

            <div className="mt-4">
              <a href="https://sathyabama.edu.in" className="text-purple-600 hover:underline">
                sathyabama.edu.in
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
