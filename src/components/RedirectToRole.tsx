// src/components/RedirectToRole.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RedirectToRole() {
  const navigate = useNavigate();
  const { user, profile, adminUser } = useAuth() as any; // support both naming conventions

  useEffect(() => {
    // If not signed in, go to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Profile may be stored as `profile` or `adminUser` depending on your AuthContext
    const p = profile ?? adminUser ?? null;
    const role = p?.role ?? null;

    // Normalize role to uppercase if needed
    const r = typeof role === 'string' ? role.toUpperCase() : role;

    if (r === 'ADMIN') navigate('/admin', { replace: true });
    else if (r === 'HOD') navigate('/hod', { replace: true });
    else if (r === 'FACULTY') navigate('/faculty', { replace: true });
    else navigate('/no-access', { replace: true });

  }, [user, profile, adminUser, navigate]);

  return null;
}
