// src/components/admin/DashboardPanel.tsx
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

type Counts = { totalUsers: number; totalFaculty: number; totalHod: number };

function StatCard({ title, value, loading }: { title: string; value: number | string; loading?: boolean }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div aria-hidden className="text-xs text-gray-400">📈</div>
      </div>

      <div className="mt-4">
        {loading ? (
          // simple skeleton
          <div className="h-10 w-28 bg-gray-100 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPanel() {
  const [counts, setCounts] = useState<Counts>({ totalUsers: 0, totalFaculty: 0, totalHod: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // run three queries in parallel
      const promises = [
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "FACULTY"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "HOD"),
      ];

      const [resAll, resFaculty, resHod] = await Promise.all(promises);

      // Supabase returns count in .count when head:true
      // Also check for error objects
      const anyError = (resAll as any)?.error || (resFaculty as any)?.error || (resHod as any)?.error;
      if (anyError) {
        console.error("Supabase count error:", anyError);
        throw new Error((anyError as any)?.message || "Failed to load counts");
      }

      const totalUsers = (resAll as any)?.count ?? 0;
      const totalFaculty = (resFaculty as any)?.count ?? 0;
      const totalHod = (resHod as any)?.count ?? 0;

      setCounts({ totalUsers, totalFaculty, totalHod });
      setLastUpdated(Date.now());
    } catch (err: any) {
      console.error("fetchCounts error:", err);
      setError(err?.message || "Failed to load dashboard counts");
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 id="dashboard-heading" className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">Overview of users and roles</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCounts}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-white border text-sm hover:bg-gray-50 disabled:opacity-60"
            aria-label="Refresh dashboard counts"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24v-2a10 10 0 110-20z" />
              </svg>
            ) : (
              "Refresh"
            )}
          </button>

          <div className="text-xs text-gray-500">
            {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : "Not updated"}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={counts.totalUsers} loading={loading} />
        <StatCard title="Total Faculty" value={counts.totalFaculty} loading={loading} />
        <StatCard title="Total HOD" value={counts.totalHod} loading={loading} />
      </div>
    </section>
  );
}
