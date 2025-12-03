// server/adminRoutes.js
// ESM router for admin endpoints (idempotent create-user behavior)

import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// read env provided by server/index.js (dotenv already loaded)
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// helper to always return JSON
function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

// validation helpers
function isEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

// Health
router.get("/health", (req, res) => {
  sendJson(res, 200, { ok: true, env: process.env.NODE_ENV || "development" });
});

// LIST USERS
router.get("/admin/list-users", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, department, phone, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("list-users error:", error);
      return sendJson(res, 500, { error: error.message || "Failed to list users" });
    }
    return sendJson(res, 200, { users: data || [] });
  } catch (err) {
    console.error("list-users unexpected error:", err);
    return sendJson(res, 500, { error: err && err.message ? err.message : "Server error while listing users" });
  }
});

// CREATE USER (idempotent and defensive)
// POST /api/admin/create-user
// body: { email, full_name, role, department?, phone?, password? }
router.post("/admin/create-user", async (req, res) => {
  try {
    const body = req.body || {};
    const email = body.email;
    const full_name = body.full_name;
    const role = body.role ? String(body.role).toUpperCase() : "";
    const department = body.department || null;
    const phone = body.phone || null;
    const providedPassword = body.password;

    if (!isEmail(email) || !isNonEmptyString(full_name) || !isNonEmptyString(role)) {
      return sendJson(res, 400, { error: "email, full_name and role (HOD or FACULTY) are required" });
    }
    if (!["HOD", "FACULTY"].includes(role)) {
      return sendJson(res, 400, { error: "role must be HOD or FACULTY" });
    }

    // 1) If a profile already exists (by email), return it (idempotent)
    try {
      const { data: existingProfile, error: findErr } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, role, department, phone, created_at")
        .eq("email", email)
        .maybeSingle();

      if (findErr) {
        console.warn("profiles lookup error (continuing):", findErr);
      } else if (existingProfile) {
        // Return existing profile with 409 (Conflict)
        return sendJson(res, 409, { error: "User already exists", profile: existingProfile });
      }
    } catch (lookupErr) {
      console.warn("profiles lookup exception (continuing):", lookupErr?.message || lookupErr);
    }

    // 2) use provided password or generate temp password
    const tempPassword = providedPassword || (Math.random().toString(36).slice(-10) + "Aa1!");

    // 3) create auth user (try v2 admin API, fallback)
    let createdUser = null;
    try {
      // v2 admin.createUser
      if (supabaseAdmin.auth && supabaseAdmin.auth.admin && typeof supabaseAdmin.auth.admin.createUser === "function") {
        const resp = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: tempPassword,
          email_confirm: true,
        });

        if (resp && resp.error) {
          const errMsg = (resp.error && resp.error.message) || String(resp.error);
          const errCode = resp.error?.code || resp.status;
          if ((errCode && String(errCode).toLowerCase().includes("email")) || errMsg.toLowerCase().includes("already")) {
            // before returning, try to fetch profile to include it
            const { data: maybeProfile } = await supabaseAdmin.from("profiles").select("*").eq("email", email).maybeSingle();
            return sendJson(res, 409, { error: "A user with this email address has already been registered", profile: maybeProfile ?? null });
          }
          console.error("supabase admin.createUser error:", resp.error);
          return sendJson(res, 500, { error: resp.error.message || "Failed to create auth user" });
        }
        createdUser = resp.user ?? resp.data ?? resp;
      } else if (supabaseAdmin.auth && typeof supabaseAdmin.auth.createUser === "function") {
        // older SDK fallback
        const fallback = await supabaseAdmin.auth.createUser({ email: email, password: tempPassword });
        if (fallback && fallback.error) {
          const errMsg = fallback.error?.message || String(fallback.error);
          if (errMsg.toLowerCase().includes("already")) {
            const { data: maybeProfile } = await supabaseAdmin.from("profiles").select("*").eq("email", email).maybeSingle();
            return sendJson(res, 409, { error: "A user with this email address has already been registered", profile: maybeProfile ?? null });
          }
          console.error("fallback createUser error:", fallback.error);
          return sendJson(res, 500, { error: fallback.error.message || "Failed to create auth user (fallback)" });
        }
        createdUser = fallback.user ?? fallback.data ?? fallback;
      } else {
        console.error("No admin createUser method available in supabase client");
        return sendJson(res, 500, { error: "Supabase admin createUser not available in this SDK version" });
      }
    } catch (createErr) {
      console.error("createUser exception:", createErr);
      const code = createErr?.code || createErr?.status;
      const msg = createErr?.message || String(createErr);
      if (String(code).toLowerCase().includes("email") || msg.toLowerCase().includes("email_exists") || msg.toLowerCase().includes("already")) {
        const { data: maybeProfile } = await supabaseAdmin.from("profiles").select("*").eq("email", email).maybeSingle();
        return sendJson(res, 409, { error: "A user with this email address has already been registered", profile: maybeProfile ?? null });
      }
      return sendJson(res, 500, { error: msg || "Error creating auth user" });
    }

    const userId = createdUser && (createdUser.id || (createdUser.user && createdUser.user.id));
    if (!userId) {
      console.error("No user id returned after creation:", createdUser);
      return sendJson(res, 500, { error: "User created but no id returned from auth provider" });
    }

    // 4) insert profile row
    const { data: profileData, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert([{ id: userId, email: email, full_name: full_name, role: role, department: department, phone: phone }])
      .select()
      .single();

    if (profileErr) {
      console.error("profiles insert error:", profileErr);
      // Attempt rollback of auth user if possible
      try {
        if (supabaseAdmin.auth && supabaseAdmin.auth.admin && typeof supabaseAdmin.auth.admin.deleteUser === "function") {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        }
      } catch (rollbackErr) {
        console.error("Rollback delete failed:", rollbackErr);
      }
      return sendJson(res, 500, { error: profileErr.message || "Failed to insert profile" });
    }

    // success
    return sendJson(res, 200, { message: "User created", user: createdUser, profile: profileData });
  } catch (err) {
    console.error("create-user unexpected error:", err);
    return sendJson(res, 500, { error: err && err.message ? err.message : "Server error while creating user" });
  }
});

// DELETE USER
// POST /api/admin/delete-user
router.post("/admin/delete-user", async (req, res) => {
  try {
    const id = req.body && req.body.id;
    if (!isNonEmptyString(id)) return sendJson(res, 400, { error: "id required" });

    // delete auth user (if available)
    try {
      if (supabaseAdmin.auth && supabaseAdmin.auth.admin && typeof supabaseAdmin.auth.admin.deleteUser === "function") {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) {
          console.error("auth delete error:", error);
          return sendJson(res, 500, { error: error.message || "Failed to delete auth user" });
        }
      } else if (supabaseAdmin.auth && typeof supabaseAdmin.auth.deleteUser === "function") {
        const { error } = await supabaseAdmin.auth.deleteUser(id);
        if (error) {
          console.error("auth delete fallback error:", error);
          return sendJson(res, 500, { error: error.message || "Failed to delete auth user (fallback)" });
        }
      } else {
        console.warn("No admin.deleteUser available; will delete profile only.");
      }
    } catch (authErr) {
      console.error("auth delete exception:", authErr);
      return sendJson(res, 500, { error: authErr && authErr.message ? authErr.message : "Failed to delete auth user" });
    }

    // delete profile row
    const { error: delErr } = await supabaseAdmin.from("profiles").delete().eq("id", id);
    if (delErr) {
      console.error("profile delete error:", delErr);
      return sendJson(res, 500, { error: delErr.message || "Failed to delete profile" });
    }

    return sendJson(res, 200, { ok: true, message: "User deleted" });
  } catch (err) {
    console.error("delete-user unexpected error:", err);
    return sendJson(res, 500, { error: err && err.message ? err.message : "Server error while deleting user" });
  }
});

export default router;
