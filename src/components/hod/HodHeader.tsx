// src/components/hod/HodHeader.tsx
import React, { useEffect, useRef, useState } from "react";
// Update the import path if AuthContext is located elsewhere, for example:
import { useAuth } from "../../contexts/AuthContext";
// Or create the file at ../../contexts/AuthContext.tsx if it doesn't exist.
import { useNavigate } from "react-router-dom";

/* Small Avatar similar to Faculty */
function Avatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  const initials =
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("") || (name ? name[0].toUpperCase() : "?");

  return (
    <div
      aria-hidden
      title={name ?? "User"}
      className="flex items-center justify-center rounded-full flex-shrink-0 ring-1 ring-white/10"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, size / 2.7),
        background: "linear-gradient(135deg, rgba(99,102,241,1) 0%, rgba(139,92,246,1) 100%)",
        color: "white",
      }}
    >
      {initials}
    </div>
  );
}

function AppleSignOutModal({ open, onConfirm, onClose, loading }: { open: boolean; onConfirm: () => void; onClose: () => void; loading?: boolean; }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      setTimeout(() => ref.current?.focus(), 50);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="relative z-20 w-[min(560px,94%)] max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-medium">Sign out</h3>
        <p className="text-sm text-slate-600 mt-1">Are you sure you want to sign out?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-full border">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-full bg-red-600 text-white" disabled={loading}>{loading ? "Signing out..." : "Sign out"}</button>
        </div>
      </div>
    </div>
  );
}

export default function HodHeader({ title = "HOD Portal", subtitle = "Department overview" }: { title?: string; subtitle?: string; }) {
  const { user, profile, signOut } = useAuth() as any;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingSignOut, setLoadingSignOut] = useState(false);

  const displayName = profile?.full_name ?? user?.email ?? "HOD";

  async function doSignOut() {
    try {
      setLoadingSignOut(true);
      await signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    } catch (err) {
      console.error(err);
      setLoadingSignOut(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-right">
                <div>
                  <div className="text-sm font-medium text-gray-800">{displayName}</div>
                  <div className="text-xs mt-0.5"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">HOD</span></div>
                </div>

                <div className="relative">
                  <button onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-2 p-1 rounded hover:bg-gray-50">
                    <Avatar name={displayName} />
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                  </button>

                  {menuOpen && (
                    <div className="origin-top-right right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 z-50">
                      <div className="py-1">
                        <button onClick={() => { setMenuOpen(false); navigate("/hod/profile"); }} className="block w-full text-left px-4 py-2 text-sm">Profile</button>
                        <button onClick={() => { setMenuOpen(false); navigate("/hod/settings"); }} className="block w-full text-left px-4 py-2 text-sm">Settings</button>
                        <button onClick={() => { setMenuOpen(false); setConfirmOpen(true); }} className="block w-full text-left px-4 py-2 text-sm text-red-600">Sign out</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:hidden">
                <button onClick={() => setConfirmOpen(true)} className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm">Sign out</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AppleSignOutModal open={confirmOpen} onConfirm={doSignOut} onClose={() => setConfirmOpen(false)} loading={loadingSignOut} />
    </>
  );
}
