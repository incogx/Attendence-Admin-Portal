// src/components/RedirectToRole.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Strict route guard + role-based redirect.
 * - Ensures only ADMIN/HOD/FACULTY access their respective areas.
 * - Preserves attempted path when sending unauthenticated users to /login.
 * - Allows a small set of explicit public routes to avoid redirect loops.
 *
 * Usage: mount this at the top-level (App or Router wrapper).
 */
export default function RedirectToRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth() as any;

  useEffect(() => {
    if (loading) return; // wait for auth to settle

    // Public routes that should never be forcibly redirected away from
    const publicPaths = ["/login", "/no-access", "/privacy", "/healthcheck", "/forgot", "/reset-password"];

    // helper to check if current path is within base path (exact or startsWith)
    const isPath = (base: string) =>
      location.pathname === base || location.pathname.startsWith(base + "/");

    // Not signed in → send to login (preserve original location)
    if (!user) {
      if (!publicPaths.includes(location.pathname)) {
        navigate("/login", { replace: true, state: { from: location } });
      }
      return;
    }

    // Signed in but no profile → show no-access (allow no-access page)
    if (!profile) {
      if (location.pathname !== "/no-access") {
        navigate("/no-access", { replace: true });
      }
      return;
    }

    // Normalise role
    const role = (profile.role ?? "").toString().toUpperCase().trim();

    // If user is in an area they shouldn't be in, redirect to their portal
    if (isPath("/admin") && role !== "ADMIN") {
      if (role === "HOD") navigate("/hod", { replace: true });
      else if (role === "FACULTY") navigate("/faculty", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    if (isPath("/hod") && role !== "HOD") {
      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "FACULTY") navigate("/faculty", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    if (isPath("/faculty") && role !== "FACULTY") {
      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "HOD") navigate("/hod", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    // If at a root entry point, route to the appropriate portal
    if (location.pathname === "/" || location.pathname === "/login") {
      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "HOD") navigate("/hod", { replace: true });
      else if (role === "FACULTY") navigate("/faculty", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    // no-op: user is on an allowed page
  }, [user, profile, loading, location, navigate]);

  return null;
}
