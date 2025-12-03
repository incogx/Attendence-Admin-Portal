// server/middleware.js (ESM)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in server/.env');
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

/**
 * requireAdmin middleware:
 * Expects Authorization: Bearer <access_token> header from frontend.
 * Validates token -> reads profile row -> allows only ADMIN role.
 */
export async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'no token provided' });

    // validate token and get user
    const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'invalid token' });

    const uid = userData.user.id;

    // fetch profile (using admin client)
    const { data: profile, error: pErr } = await adminClient
      .from('profiles')
      .select('id, role, email')
      .eq('id', uid)
      .maybeSingle();

    if (pErr) {
      console.error('profile lookup error', pErr);
      return res.status(500).json({ error: 'profile lookup failed' });
    }
    if (!profile) return res.status(403).json({ error: 'profile not found' });

    if ((profile.role ?? '').toString().toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ error: 'admin only' });
    }

    // attach profile to request for downstream handlers if needed
    req.profile = profile;
    next();
  } catch (err) {
    console.error('requireAdmin error', err);
    return res.status(500).json({ error: 'server error' });
  }
}
