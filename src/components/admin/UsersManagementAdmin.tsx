// src/components/admin/UserManagement.tsx
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";

type ProfileRow = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  created_at?: string | null;
};

export default function UserManagement() {
  const { user, profile, loading } = useAuth() as any;

  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  // add form state
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<"HOD" | "FACULTY" | "ADMIN">("FACULTY");

  // basic client-side toast messages
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!loading) fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function fetchProfiles() {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles((data ?? []) as ProfileRow[]);
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      setToast({ type: "error", message: "Failed to load users." });
    } finally {
      setLoadingProfiles(false);
    }
  }

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        (p.full_name ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q) ||
        (p.role ?? "").toLowerCase().includes(q)
    );
  }, [profiles, searchTerm]);

  async function handleCreateUser(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newEmail) {
      setToast({ type: "error", message: "Email is required" });
      return;
    }
    setAddLoading(true);

    // Try server-side admin endpoint first (safer to create auth+profile)
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          full_name: newFullName,
          role: newRole,
          // you can send a temporary password or let server generate & email
        }),
      });

      if (res.ok) {
        setToast({ type: "success", message: "User created (server)." });
        setShowAddModal(false);
        setNewEmail("");
        setNewFullName("");
        setNewRole("FACULTY");
        await fetchProfiles();
        setAddLoading(false);
        return;
      }

      // If endpoint not found or returns error, fall back to client-side insert (dev only)
      const text = await res.text();
      console.warn("Server create-user failed:", res.status, text);
    } catch (err) {
      // network or 404 — fallback
      console.info("Create-user server endpoint not available, falling back to profiles insert.");
    }

    try {
      // NOTE: This will not create an auth account in Supabase auth; it's only profiles table.
      // Prefer server endpoint that creates both auth user and profile.
      const { error } = await supabase.from("profiles").insert([
        {
          email: newEmail,
          full_name: newFullName,
          role: newRole,
        },
      ]);
      if (error) throw error;

      setToast({ type: "success", message: "Profile created. (Add auth user server-side.)" });
      setShowAddModal(false);
      setNewEmail("");
      setNewFullName("");
      setNewRole("FACULTY");
      await fetchProfiles();
    } catch (err) {
      console.error("Failed to create profile:", err);
      setToast({ type: "error", message: "Failed to create user." });
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user profile? This cannot be undone from client.")) return;
    setDeleteLoadingId(id);

    // Try server-side delete endpoint first (recommended)
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setToast({ type: "success", message: "User deleted (server)." });
        await fetchProfiles();
        setDeleteLoadingId(null);
        return;
      }
    } catch (err) {
      console.info("Server delete endpoint not available, falling back to client profiles delete.");
    }

    // Fallback: remove profile row only
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setToast({ type: "success", message: "Profile removed." });
      await fetchProfiles();
    } catch (err) {
      console.error("Failed to delete profile:", err);
      setToast({ type: "error", message: "Delete failed." });
    } finally {
      setDeleteLoadingId(null);
    }
  }

  async function copyId(id?: string) {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setToast({ type: "success", message: "ID copied" });
      setTimeout(() => setToast(null), 1500);
    } catch (err) {
      console.warn("clipboard failed", err);
      setToast({ type: "error", message: "Copy failed" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Users</h2>
          <p className="text-gray-600">Create HOD and Faculty accounts and delete credentials.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            aria-label="Add user"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add User</span>
          </button>
          <button
            onClick={() => fetchProfiles()}
            className="px-4 py-2 rounded border border-gray-200 bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
            aria-label="Search users"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingProfiles ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-4 px-4">
                      <div className="font-medium">{p.full_name ?? "—"}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{p.email}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{p.role ?? "—"}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {p.created_at ? dayjs(p.created_at).format("M/D/YYYY, h:mm:ss A") : "—"}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <button
                        onClick={() => copyId(p.id)}
                        className="mr-4 text-indigo-600 hover:underline"
                      >
                        CopyID
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:underline"
                        disabled={deleteLoadingId === p.id}
                      >
                        {deleteLoadingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5">
            <form
              onSubmit={handleCreateUser}
              className="p-6"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create User</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create an account for HOD, Faculty, or Admin. For production, use server-side user
                creation to also provision Auth accounts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Full name</label>
                  <input
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="email@example.com"
                    type="email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="FACULTY">Faculty</option>
                    <option value="HOD">HOD</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="flex items-end justify-end">
                  <div className="text-right text-sm text-gray-500">
                    <div className="mb-2"> </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded border border-gray-200 bg-white hover:bg-gray-50"
                  disabled={addLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                  disabled={addLoading}
                >
                  {addLoading ? "Creating..." : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-60 rounded px-4 py-2 shadow ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-3 underline text-xs opacity-90"
            aria-label="dismiss"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
