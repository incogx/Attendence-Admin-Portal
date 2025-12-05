import React, { useEffect, useMemo, useState } from "react";
import { Eye, DownloadCloud, FilePlus, Play } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Single-column AttendanceReports
 * - Header + controls at top (matches Image 1)
 * - QR / Live Session panel rendered below (matches Image 2)
 * - Removed the large right-side floating Create button/panel (Image 3)
 */

type AttendanceEntry = {
  student_id?: string;
  student_name?: string;
  roll_number?: string;
  present?: boolean;
};

type AttendanceReport = {
  id: string;
  classId?: string;
  className?: string;
  date?: string;
  semester?: string;
  notes?: string;
  students?: AttendanceEntry[];
};

const API_LIST = "/api/attendance";
const API_CREATE = "/api/attendance";

function sampleReports(): AttendanceReport[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: "sample-1",
      classId: "CS201",
      className: "CS201 • Data Structures",
      date: today,
      semester: "Fall 2025",
      notes: "Sample report (mock)",
      students: [
        { student_id: "s1", student_name: "John Doe", roll_number: "001", present: true },
        { student_id: "s2", student_name: "Jane Smith", roll_number: "002", present: false },
      ],
    },
  ];
}

export default function AttendanceReports() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth() as any;
  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState<AttendanceReport[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [classId, setClassId] = useState<string>("CSE-2A");
  const classQuery = searchParams.get("class");
  useEffect(() => { if (classQuery) setClassId(classQuery); }, [classQuery]);

  useEffect(() => {
    if (authLoading) return;
    if (!user && !profile) { setReports([]); return; }
    if (useMock) { setReports(sampleReports()); return; }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const facultyId = (profile?.id ?? user?.id ?? "").toString();
        const url = facultyId ? `${API_LIST}?facultyId=${encodeURIComponent(facultyId)}` : API_LIST;
        const res = await fetch(url, { credentials: "include" });

        if (res.status === 404) {
          setError("Create failed (404) — attendance API endpoint not found.");
          if (!mounted) return;
          setReports([]);
          setLoading(false);
          return;
        }

        const text = await res.text();
        if (!text) {
          setError("Empty response from server.");
          setReports([]);
          setLoading(false);
          return;
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          // server returned HTML (SPA fallback) or non-JSON
          setError("Unexpected server response (not JSON). Check backend routing.");
          setReports([]);
          setLoading(false);
          return;
        }

        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
        if (!mounted) return;
        setReports(arr && arr.length ? arr : []);
      } catch (err: any) {
        console.error("AttendanceReports fetch error:", err);
        setError(String(err?.message ?? err));
        setReports([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [authLoading, user, profile, useMock]);

  const list = useMemo(() => (reports ?? []), [reports]);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        facultyId: profile?.id ?? user?.id,
        classId,
        date,
        semester: "Fall 2025",
        entries: [],
      };
      const res = await fetch(API_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 404) setError("Create failed (404) — endpoint not found.");
        else {
          const txt = await res.text().catch(() => "");
          setError(`Create failed (${res.status})${txt ? `: ${txt}` : ""}`);
        }
        setLoading(false);
        return;
      }

      const created = await res.json().catch(() => null);
      setReports((prev) => (created ? [created, ...(prev ?? [])] : prev));
    } catch (err: any) {
      console.error("Create error:", err);
      setError(String(err?.message ?? "Create failed"));
    } finally {
      setLoading(false);
    }
  }

  function handleUseMock() {
    setUseMock(true);
    setReports(sampleReports());
    setError(null);
  }

  function handleView(r: AttendanceReport) {
    navigate(`/faculty/attendance/${r.id}`);
  }

  function handleExport(r: AttendanceReport) {
    const rows: string[][] = [["Roll", "Name", "Present"]];
    (r.students ?? []).forEach((s) => {
      rows.push([s.roll_number ?? "", s.student_name ?? "", s.present ? "1" : "0"]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${r.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* TOP: header + controls (Image 1 style) */}
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Attendance Reports</h1>
            <p className="text-sm text-slate-500 mt-1">View, export or create attendance reports for your classes.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border px-4 py-2 text-sm bg-white"
            />

            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-lg border px-4 py-2 text-sm bg-white"
            >
              <option value="CSE-2A">Select class</option>
              <option value="CSE-2A">CSE - II A</option>
              <option value="CSE-2B">CSE - II B</option>
            </select>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-red-700 text-white px-4 py-2 text-sm hover:bg-red-800"
            >
              <FilePlus className="w-4 h-4" />
              Create Attendance
            </button>
          </div>
        </div>

        {/* error (compact) */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700 flex items-center justify-between gap-3">
            <div className="truncate">{error}</div>
            <div className="flex gap-2">
              <button onClick={() => window.location.reload()} className="px-3 py-1 rounded border bg-white text-sm">Retry</button>
              <button onClick={handleUseMock} className="px-3 py-1 rounded bg-purple-600 text-white text-sm">Use Mock Data</button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN: list / empty state (under header) */}
      <div className="bg-white border rounded-2xl p-6 min-h-[36vh] flex flex-col">
        {loading && !reports ? (
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-40 bg-slate-100 rounded" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
            <svg width="140" height="100" viewBox="0 0 160 120" className="mb-6" aria-hidden>
              <rect x="6" y="14" rx="8" ry="8" width="148" height="86" fill="#f8fafc" stroke="#eef2ff" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No attendance reports yet</h3>
            <p className="text-sm text-slate-500">Create one using the controls above. Or use mock data to continue designing.</p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setReports(sampleReports())} className="px-4 py-2 border rounded">Load Sample</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-red-700 text-white rounded">Create Attendance</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border">
                <div>
                  <div className="text-sm text-slate-400">Class</div>
                  <div className="text-lg font-medium">{r.className ?? r.classId}</div>
                  <div className="text-xs text-slate-500 mt-1">{r.date} • {r.semester}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleView(r)} className="px-3 py-2 rounded border hover:bg-gray-50 text-sm">
                    <Eye className="w-4 h-4 inline-block mr-2" /> View
                  </button>
                  <button onClick={() => handleExport(r)} className="px-3 py-2 rounded bg-purple-600 text-white text-sm">
                    <DownloadCloud className="w-4 h-4 inline-block mr-2" /> Export CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BELOW: Generate QR / Live Session panel (Image 2 style) */}
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Generate QR — Live Session</h3>
            <p className="text-sm text-slate-500 mt-1">Display QR, review scanned students and submit attendance.</p>
          </div>

          <div className="flex items-center gap-3">
            <select className="rounded-lg border px-4 py-2 text-sm bg-white">
              <option>CS201 — Data Structures (09:00-09:50)</option>
              <option>CS301 — Operating Systems (10:30-11:20)</option>
            </select>

            <button className="inline-flex items-center gap-2 rounded bg-green-600 text-white px-4 py-2 text-sm hover:bg-green-700">
              <Play className="w-4 h-4" /> Start Live Session
            </button>

            <button className="inline-flex items-center gap-2 rounded border px-4 py-2 text-sm bg-white">Download QR</button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-6 text-center min-h-[220px] flex flex-col items-center justify-center">
            <div className="text-sm text-slate-400 mb-2">Class</div>
            <div className="font-medium text-lg">CS201 • Data Structures</div>
            <div className="text-xs text-slate-400 mt-1">09:00 - 09:50 • Lab 3</div>

            <div className="mt-6 w-48 h-48 bg-slate-50 rounded border flex items-center justify-center text-slate-400">
              Start session to generate QR
            </div>

            <div className="text-xs text-slate-400 mt-4">No active live session</div>
          </div>

          <div className="rounded-lg border p-6 min-h-[220px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-medium">Scanned Students</div>
              <div className="text-xs text-slate-400">Last polled: —</div>
            </div>

            <div className="flex-1 flex items-center justify-center text-slate-500">No students scanned yet.</div>

            <div className="mt-4 flex items-center gap-3 justify-end">
              <button className="px-3 py-1 border rounded">Clear</button>
              <button className="px-4 py-1 bg-purple-600 text-white rounded">Submit Attendance (0)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
