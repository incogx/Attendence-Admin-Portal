// src/components/hod/HodSidebar.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Users, QrCode, CheckSquare, Bell, Settings, Plus, Menu, X } from "lucide-react";

function NavItem({ to, label, icon, end=false, onClick }: { to: string; label: string; icon?: React.ReactNode; end?: boolean; onClick?: ()=>void; }) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${isActive ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function HodSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <img src="/sathyabama-logo.png" alt="logo" className="w-8 h-8 object-contain"/>
          <span className="font-semibold text-purple-700">Sathyabama</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="p-2 rounded border bg-white shadow-sm">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>

      <aside className={`bg-white border-r w-64 md:static fixed inset-y-0 left-0 z-40 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:shadow-none shadow-lg`}>
        <div className="p-6 flex flex-col h-full justify-between">
          <div>
            <div className="hidden md:flex items-center gap-3 mb-6">
              <img src="/sathyabama-logo.png" alt="logo" className="w-12 h-12"/>
              <div>
                <h1 className="text-lg font-bold text-purple-700">SATHYABAMA</h1>
                <p className="text-xs text-gray-500">Institute of Science & Technology</p>
              </div>
            </div>

            <nav className="flex-1 space-y-3">
              <NavItem to="/hod" label="Dashboard" icon={<BarChart3/>} onClick={closeMobile}/>
              <NavItem to="/hod/faculty" label="Faculty" icon={<Users/>} onClick={closeMobile}/>
              <NavItem to="/hod/add-faculty" label="Add Faculty" icon={<Plus/>} onClick={closeMobile}/>
              <NavItem to="/hod/attendance" label="Department Attendance" icon={<CheckSquare/>} onClick={closeMobile}/>
              <NavItem to="/hod/notifications" label="Notifications" icon={<Bell/>} onClick={closeMobile}/>
              <NavItem to="/hod/settings" label="Settings" icon={<Settings/>} onClick={closeMobile}/>
            </nav>
          </div>

          <div className="text-xs text-gray-500">
            <div className="mb-2 hidden md:block">Logged in as</div>
            <div className="font-medium text-gray-700">HOD</div>
            <div className="mt-3"><a href="https://sathyabama.edu.in" className="text-purple-600 hover:underline">sathyabama.edu.in</a></div>
          </div>
        </div>
      </aside>
    </>
  );
}
