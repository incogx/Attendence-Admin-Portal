// src/components/admin/AddUserModal.tsx
import React, { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:4001/api";

export default function AddUserModal({
  role,
  open,
  onClose,
  onCreated,
}: {
  role: "HOD" | "FACULTY";
  open: boolean;
  onClose: () => void;
  onCreated?: (profile?: any) => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setFullName("");
      setErrorMsg("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !fullName.trim()) {
      setErrorMsg("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), full_name: fullName.trim(), role }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMsg(body?.error || `Server returned ${res.status}`);
        return;
      }
      onCreated?.(body.profile ?? null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 className="text-2xl font-semibold mb-3">Create {role}</h3>

        {errorMsg && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded mb-3 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full px-3 py-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input className="w-full px-3 py-2 border rounded" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded">
              {loading ? "Creating..." : `Create ${role}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
