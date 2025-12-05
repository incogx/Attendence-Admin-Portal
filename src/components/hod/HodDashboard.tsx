// src/components/hod/HodDashboard.tsx
import React from "react";

/* Simple dashboard that reuses card style from faculty */
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-lg p-4 shadow-sm border">{children}</div>;
}

export default function HodDashboard() {
  // Replace with real fetches for timetable & department totals
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">HOD Dashboard</h1>
          <div className="text-sm text-slate-500 mt-1">Department overview and quick actions</div>
        </div>
        <div className="text-sm text-slate-600">Overview</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-slate-500">Total Faculty</div>
          <div className="text-2xl font-semibold mt-2">42</div>
          <div className="text-xs text-slate-400 mt-2">Active in department</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Department Attendance (today)</div>
          <div className="text-2xl font-semibold mt-2">88%</div>
          <div className="text-xs text-slate-400 mt-2">Average across classes</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Pending Requests</div>
          <div className="text-2xl font-semibold mt-2">3</div>
          <div className="text-xs text-slate-400 mt-2">Approvals needed</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-medium">Recent Activity</h3>
          <div className="mt-3 text-sm text-slate-500">Latest attendance changes, faculty logins and requests.</div>
          <ul className="mt-3 space-y-2">
            <li className="p-2 border rounded">Ali marked attendance for CS201</li>
            <li className="p-2 border rounded">New faculty account created: Dr. X</li>
            <li className="p-2 border rounded">Attendance report exported for CSE</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="font-medium">Quick Actions</h3>
          <div className="mt-3 flex flex-col gap-2">
            <button className="px-3 py-2 rounded bg-purple-600 text-white">Add Faculty</button>
            <button className="px-3 py-2 rounded border">View Attendance</button>
            <button className="px-3 py-2 rounded border">Export Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}
