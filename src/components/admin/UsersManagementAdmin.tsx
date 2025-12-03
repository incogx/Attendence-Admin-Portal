// src/components/admin/UsersManagementAdmin.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type ProfileRow = { id: string; email: string; full_name?: string; role?: string; created_at?: string };

export default function UsersManagementAdmin() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchProfiles();
    // optionally subscribe to changes
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    const q = supabase.from('profiles').select('id,email,full_name,role,created_at');
    if (query) q.ilike('email', `%${query}%`);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) console.error(error);
    else setRows(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete user? This also requires server-side removal of auth user.')) return;
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'Delete failed');
      alert('Deleted');
      fetchProfiles();
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search by email"
            className="px-3 py-2 border rounded"
          />
          <button onClick={() => fetchProfiles()} className="px-4 py-2 bg-purple-600 text-white rounded">Search</button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-sm">Email</th>
                <th className="px-4 py-3 text-sm">Name</th>
                <th className="px-4 py-3 text-sm">Role</th>
                <th className="px-4 py-3 text-sm">Created</th>
                <th className="px-4 py-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{r.email}</td>
                  <td className="px-4 py-3 text-sm">{r.full_name}</td>
                  <td className="px-4 py-3 text-sm">{r.role}</td>
                  <td className="px-4 py-3 text-sm">{new Date(r.created_at || '').toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => navigator.clipboard.writeText(r.id)} className="mr-2 text-sm text-gray-600">CopyID</button>
                    <button onClick={() => handleDelete(r.id)} className="text-sm text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
