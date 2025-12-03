// src/components/admin/AdminHeader.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Avatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  const initials = (name || "")
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
        background:
          "linear-gradient(135deg, rgba(99,102,241,1) 0%, rgba(139,92,246,1) 100%)",
        color: "white",
      }}
    >
      {initials}
    </div>
  );
}

/** Small confirm modal used for sign out */
function ConfirmModal({
  open,
  title,
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 50);
      document.addEventListener("keydown", onKey);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    // backdrop
    <div
      className="fixed inset-0 z-60 flex items-center justify-center px-4 sm:px-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
      onMouseDown={(e) => {
        // close on backdrop click (only if clicking the backdrop, not the modal)
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5">
        <div className="p-5">
          <h3 id="confirm-title" className="text-lg font-medium text-gray-900">
            {title}
          </h3>
          {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-gray-200 text-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              disabled={loading}
            >
              {loading ? "Signing out..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminHeader() {
  const { user, profile, signOut } = useAuth() as any;
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingSignOut, setLoadingSignOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null); // desktop menu
  const mobileMenuRef = useRef<HTMLDivElement | null>(null); // mobile menu
  const firstMenuItemRef = useRef<HTMLButtonElement | null>(null);

  // Close dropdown on outside click or Escape — now checks both desktop + mobile menus
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const desktopContains = menuRef.current?.contains(target);
      const mobileContains = mobileMenuRef.current?.contains(target);
      if (!desktopContains && !mobileContains) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // focus first item when opening menu
  useEffect(() => {
    if (menuOpen) {
      setTimeout(() => firstMenuItemRef.current?.focus(), 50);
    }
  }, [menuOpen]);

  const displayName =
    profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? "Admin";
  const role = profile?.role ?? "";

  async function doSignOut() {
    try {
      setLoadingSignOut(true);
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      alert("Sign out failed. Check console for details.");
    } finally {
      setLoadingSignOut(false);
      setConfirmOpen(false);
    }
  }

  function handleSignOutClick() {
    // open custom modal instead of native confirm
    setConfirmOpen(true);
  }

  // Explicit navigate helpers (ensures navigation even if Link has routing quirks)
  function goProfile() {
    setMenuOpen(false);
    navigate("/admin/profile");
  }
  function goSettings() {
    setMenuOpen(false);
    navigate("/admin/settings");
  }

  return (
    <>
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Portal</h2>
              <p className="hidden sm:block text-sm text-gray-500">
                Manage HOD, Faculty and view analytics
              </p>
            </div>

            {/* Right: Profile / actions */}
            <div className="flex items-center gap-4">
              {/* Desktop: show name + role + dropdown */}
              <div className="hidden sm:flex items-center gap-3 text-right">
                <div>
                  <div
                    className="text-sm font-medium text-gray-800 max-w-[220px] truncate"
                    title={displayName}
                  >
                    {displayName}
                  </div>
                  <div className="text-xs mt-0.5">
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {role ? role : "ADMIN"}
                    </span>
                  </div>
                </div>

                <div className="relative" ref={menuRef}>
                  <button
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <Avatar name={displayName} size={40} />
                    <svg
                      className="w-4 h-4 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      aria-label="User menu"
                      className="origin-top-right right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transform transition ease-out duration-150"
                    >
                      <div className="py-1">
                        <button
                          onClick={goProfile}
                          ref={firstMenuItemRef as any}
                          role="menuitem"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                          Profile
                        </button>
                        <button
                          onClick={goSettings}
                          role="menuitem"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                          Settings
                        </button>
                        <button
                          onClick={handleSignOutClick}
                          disabled={loadingSignOut}
                          role="menuitem"
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile: avatar and simple sign out */}
              <div className="flex sm:hidden items-center gap-2 relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-1 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  aria-label="Open user menu"
                >
                  <Avatar name={displayName} size={36} />
                </button>

                {/* small inline sign out (fallback) */}
                <button
                  onClick={handleSignOutClick}
                  disabled={loadingSignOut}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm"
                >
                  Sign out
                </button>

                {/* Mobile dropdown if open */}
                {menuOpen && (
                  <div
                    ref={mobileMenuRef}
                    className="absolute right-4 top-16 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 sm:hidden"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/admin/profile");
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/admin/settings");
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmText="Sign out"
        cancelText="Cancel"
        loading={loadingSignOut}
        onConfirm={doSignOut}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
