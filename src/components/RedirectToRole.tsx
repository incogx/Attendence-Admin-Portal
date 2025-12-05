import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Strict route guard + role-based redirect.
 * Enforces that only the correct role can view /admin, /hod, /faculty.
 * Replaces history entries when redirecting so Back cannot return to an invalid page.
 */
export default function RedirectToRole() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth() as any;

  useEffect(() => {
    if (loading) return;

    // Not signed in → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Signed in but no profile → deny
    if (!profile) {
      navigate("/no-access", { replace: true });
      return;
    }

    const role = (profile.role ?? "").toString().toUpperCase().trim();

    const isPath = (base: string) =>
      location.pathname === base || location.pathname.startsWith(base + "/");

    // Enforce admin area ownership
    if (isPath("/admin") && role !== "ADMIN") {
      if (role === "HOD") navigate("/hod", { replace: true });
      else if (role === "FACULTY") navigate("/faculty", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    // Enforce hod area ownership
    if (isPath("/hod") && role !== "HOD") {
      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "FACULTY") navigate("/faculty", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    // Enforce faculty area ownership
    if (isPath("/faculty") && role !== "FACULTY") {
      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "HOD") navigate("/hod", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    // If at an entry point, route directly to the appropriate portal
    if (location.pathname === "/" || location.pathname === "/login") {
      if (role === "ADMIN") navigate("/admin", { replace: true });
      else if (role === "HOD") navigate("/hod", { replace: true });
      else if (role === "FACULTY") navigate("/faculty", { replace: true });
      else navigate("/no-access", { replace: true });
      return;
    }

    // otherwise allow (user is on an allowed page)
  }, [user, profile, loading, location.pathname, navigate]);

  return null;
}
