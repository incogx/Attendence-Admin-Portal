// src/components/RedirectToRole.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RedirectToRole() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth() as any;

  useEffect(() => {
    // Wait until initial auth/profile load finishes
    if (loading) return;

    // If not signed in, go to login (replace so back doesn't return here)
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // If signed in but profile missing (meaning not found / role unknown), show no-access
    if (!profile) {
      navigate("/no-access", { replace: true });
      return;
    }

    // Normalize role to uppercase if needed
    const role = typeof profile.role === "string" ? profile.role.toUpperCase().trim() : profile.role;

    if (role === "ADMIN") {
      // direct admins to the users management page
      navigate("/admin/users", { replace: true });
    } else if (role === "HOD") {
      navigate("/hod", { replace: true });
    } else if (role === "FACULTY") {
      navigate("/faculty", { replace: true });
    } else {
      navigate("/no-access", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return null;
}
