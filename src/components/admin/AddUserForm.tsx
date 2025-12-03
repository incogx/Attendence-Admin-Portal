// src/components/admin/AddUserForm.tsx
import React, { useEffect, useState } from "react";

type AddUserFormProps = {
  defaultRole?: "FACULTY" | "HOD";
  lockRole?: boolean;
  onCreated?: (profile?: any) => void;
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) || "http://localhost:4001/api";

export default function AddUserForm({ defaultRole, lockRole = false, onCreated }: AddUserFormProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"FACULTY" | "HOD">(defaultRole ?? "FACULTY");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (defaultRole) setRole(defaultRole);
  }, [defaultRole]);

  function validate() {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email.";
    if (!fullName.trim()) return "Full name is required.";
    if (!["FACULTY", "HOD"].includes(role)) return "Invalid role.";
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), full_name: fullName.trim(), role }),
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch {
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || `Server returned ${res.status}`);
        body = {};
      }

      if (!res.ok) {
        if (res.status === 409 && body?.profile) {
          setErrorMsg(body.error || "User already exists");
          onCreated?.(body.profile);
        } else {
          setErrorMsg(body?.error || body?.message || `Server error (${res.status})`);
        }
        return;
      }

      const createdProfile = body?.profile ?? null;
      setSuccessMsg(`✔ ${createdProfile?.full_name || fullName} created successfully`);
      setEmail("");
      setFullName("");
      onCreated?.(createdProfile);
    } catch (err: any) {
      console.error("create user failed:", err);
      setErrorMsg(err?.message || "Unexpected error creating user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Create {role}</h2>

      {errorMsg && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded mb-3 text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded mb-3 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="text-sm block mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-600 outline-none"
            placeholder="employee@college.edu"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Full Name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-600 outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Role</label>
          {lockRole ? (
            <div className="px-3 py-2 border rounded bg-gray-50 text-sm">{role}</div>
          ) : (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "HOD" | "FACULTY")}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-600 outline-none"
            >
              <option value="HOD">HOD</option>
              <option value="FACULTY">FACULTY</option>
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : `Create ${role}`}
        </button>
      </form>
    </div>
  );
}
