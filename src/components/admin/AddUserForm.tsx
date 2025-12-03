// src/components/admin/AddUserForm.tsx
import React, { useState } from 'react';

export default function AddUserForm({ defaultRole = 'FACULTY' }: { defaultRole?: 'FACULTY' | 'HOD' }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'Create failed');
      alert('User created');
      setEmail(''); setFullName('');
    } catch (err: any) {
      alert(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create {role}</h2>
      <form onSubmit={handleCreate} className="max-w-md space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="text-sm block mb-1">Email</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="text-sm block mb-1">Full name</label>
          <input required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="text-sm block mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="HOD">HOD</option>
            <option value="FACULTY">FACULTY</option>
          </select>
        </div>
        <button disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded">
          {loading ? 'Creating...' : `Create ${role}`}
        </button>
      </form>
    </div>
  );
}
