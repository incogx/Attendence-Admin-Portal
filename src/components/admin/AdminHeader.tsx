// src/components/admin/AdminHeader.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminHeader() {
  const { user, profile, signOut } = useAuth() as any;

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Admin Portal</h2>
          <p className="text-sm text-gray-500">Manage HOD, Faculty and view analytics</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">{profile?.full_name ?? user?.email}</div>
            <div className="text-xs text-gray-500">{profile?.role ?? ''}</div>
          </div>
          <button
            onClick={async () => { try { await signOut(); } catch (e) { console.error(e); } }}
            className="px-3 py-2 bg-red-50 text-red-700 rounded"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
