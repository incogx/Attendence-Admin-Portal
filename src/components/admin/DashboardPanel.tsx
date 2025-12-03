// src/components/admin/DashboardPanel.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DashboardPanel() {
  const [counts, setCounts] = useState({ totalUsers: 0, totalFaculty: 0, totalHod: 0 });

  useEffect(() => {
    async function load() {
      // count users and roles
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact' });
      const { count: totalFaculty } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'FACULTY');
      const { count: totalHod } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'HOD');
      setCounts({
        totalUsers: totalUsers ?? 0,
        totalFaculty: totalFaculty ?? 0,
        totalHod: totalHod ?? 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-semibold">{counts.totalUsers}</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-sm text-gray-500">Total Faculty</div>
          <div className="text-2xl font-semibold">{counts.totalFaculty}</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-sm text-gray-500">Total HOD</div>
          <div className="text-2xl font-semibold">{counts.totalHod}</div>
        </div>
      </div>
    </div>
  );
}
