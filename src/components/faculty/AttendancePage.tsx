// src/components/faculty/AttendancePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Send,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ClipboardList, // New icon for the main title
} from "lucide-react";

import { AttendanceReport, AttendanceStatus } from "../../types/attendance";
import { useAuth } from "../../contexts/AuthContext";

// Reuse your components (they exist in faculty folder)
import StudentsGrid from "./AttendanceReports"; // Assuming this is actually StudentsGrid as the panel below suggests
import GenerateQRPanel from "./GenerateQRPanel";

/**
 * AttendancePage
 * - Lists the most recent attendance reports for the faculty's classes
 * - Lets the faculty create a new attendance record (quick flow)
 * - Shows a right-side panel with QR generator or details (using your GenerateQRPanel)
 *
 * Assumptions:
 * - API endpoints:
 * GET  /api/attendance?facultyId=...
 * POST /api/attendance   { facultyId, classId, date, students: [{id, status}] }
 * Adjust paths to match your server.
 *
 * - useAuth() returns: { user, profile, loading }
 */

const API_LIST = "/api/attendance";
const API_CREATE = "/api/attendance";

// Define a professional primary color for the system, e.g., a deep indigo or university maroon
const PRIMARY_COLOR = "[#7A0D15]"; // Your existing deep maroon color

export default function AttendancePage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth() as any;

  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UI state for creating a new attendance
  const [creating, setCreating] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    // Ensure the date format is consistent: YYYY-MM-DD
    return d.toISOString().slice(0, 10);
  });

  // small local cache for last created report to show instantly
  const [lastCreatedReport, setLastCreatedReport] = useState<
    AttendanceReport | null
  >(null);

  // fetch reports for this faculty on mount / whenever profile changes
  useEffect(() => {
    if (authLoading) return;
    if (!profile || !user) return;

    let mounted = true;
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const facultyId = profile.id ?? user.id;
        const res = await fetch(
          `${API_LIST}?facultyId=${encodeURIComponent(facultyId)}`
        );
        if (!res.ok) throw new Error(`Failed to load reports (${res.status})`);
        const data = (await res.json()) as AttendanceReport[];
        if (!mounted) return;
        setReports(data || []);
      } catch (err: any) {
        console.error("Error fetching attendance:", err);
        if (mounted)
          setError(
            err?.message?.includes("Failed to load")
              ? "Failed to load reports."
              : err?.message ?? "Unable to load attendance"
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReports();
    return () => {
      mounted = false;
    };
  }, [authLoading, profile, user]);

  // Derived helpers
  const recent = useMemo(() => {
    // Sort descending by date (assuming report.date is ISO string or comparable)
    return [...reports].sort((a, b) =>
      (b.date || "").localeCompare(a.date || "")
    );
  }, [reports]);

  const handleCreate = async () => {
    if (!profile && !user) {
      return navigate("/login");
    }
    if (!selectedClassId) {
      setError("Please select a class first.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const payload = {
        facultyId: profile?.id ?? user.id,
        classId: selectedClassId,
        date: selectedDate,
        // default empty students array here; you might populate using StudentsGrid flow
        students: [],
      };

      const res = await fetch(API_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Create failed (${res.status})`);
      }

      const created = (await res.json()) as AttendanceReport;
      // optimistic update
      setReports((prev) => [created, ...prev]);
      setLastCreatedReport(created);
    } catch (err: any) {
      console.error("Create attendance error:", err);
      setError(
        err?.message?.includes("failed")
          ? "Failed to create attendance."
          : err?.message ?? "Unable to create attendance"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpen = (reportId: string) => {
    // Navigate to a detail page (implement route if required)
    navigate(`/faculty/attendance/${reportId}`);
  };

  /**
   * Status badge component with enhanced styling.
   * @param s AttendanceStatus
   * @returns JSX.Element
   */
  const statusBadge = (s?: AttendanceStatus) => {
    switch (s) {
      case "PRESENT":
        return (
          <span className="inline-flex items-center gap-1 font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs transition-colors duration-150">
            <CheckCircle className="w-4 h-4" /> Present
          </span>
        );
      case "ABSENT":
        return (
          <span className="inline-flex items-center gap-1 font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs transition-colors duration-150">
            <XCircle className="w-4 h-4" /> Absent
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs transition-colors duration-150">
            <Clock className="w-4 h-4" /> Late
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-full text-xs transition-colors duration-150">
            <AlertTriangle className="w-4 h-4" /> Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col lg:flex-row gap-6 p-4">
      {/* Left column: reports list & actions */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-gray-700" />
            Attendance Reports
          </h2>
          {/* Action controls group */}
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-all"
              aria-label="Attendance Date"
            />

            <select
              value={selectedClassId ?? ""}
              onChange={(e) => setSelectedClassId(e.target.value || null)}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-300 focus:border-red-500 transition-all"
              aria-label="Select Class"
            >
              <option value="" disabled>
                Select class
              </option>
              {/* TODO: replace these with dynamic classes from profile or API */}
              <option value="CSE-2A">CSE - II A</option>
              <option value="CSE-2B">CSE - II B</option>
              <option value="MECH-1A">MECH - I A</option>
            </select>

            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 shadow-md ${
                creating || !selectedClassId
                  ? "bg-gray-400 cursor-not-allowed"
                  : `bg-${PRIMARY_COLOR} hover:bg-[#600c10] active:bg-[#4d090c] hover:shadow-lg`
              }`}
              onClick={handleCreate}
              disabled={creating || !selectedClassId}
              aria-busy={creating}
            >
              <Send className="w-4 h-4" />
              {creating ? "Creating..." : "Create Attendance"}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 rounded-lg bg-red-50 border border-red-300 px-4 py-3 text-sm font-medium text-red-800 flex items-center gap-2"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5" />
            **Error:** {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-lg text-gray-500">
            <span className="animate-pulse">Loading reports...</span>
          </div>
        ) : recent.length === 0 ? (
          <div className="py-20 text-center text-lg text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p>No attendance reports yet. Create one using the controls above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-red-100 transition-all duration-200 shadow-sm hover:shadow-lg"
              >
                {/* Report Details */}
                <div>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {r.className ?? r.classId}
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {r.date ? new Date(r.date).toLocaleDateString() : 'Unknown Date'}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      **{r.students?.length ?? 0}** Students
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 italic">
                    {r.notes ? `"${r.notes}"` : "No notes recorded."}
                  </p>
                </div>

                {/* Actions and Status */}
                <div className="flex items-center gap-3 mt-3 sm:mt-0 flex-shrink-0">
                  {/* small summary badges */}
                  {statusBadge(r.overallStatus)}

                  <button
                    onClick={() => handleOpen(r.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors text-sm"
                    title="Open report details"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>

                  <button
                    onClick={() => {
                      // Quick re-open or edit — you may replace with edit modal
                      navigate(`/faculty/attendance/${r.id}/edit`);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors text-sm"
                    title="Edit report"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right column: StudentsGrid / QR panel (visual) */}
      <aside className="w-full lg:w-1/3">
        <div className="sticky top-6 space-y-6">
          {/* QR generator panel: pass lastCreatedReport for quick QR context */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xl">
            <h4 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-800">
              <Send className="w-5 h-5 inline mr-2 text-gray-600" />
              QR Generation
            </h4>
            <GenerateQRPanel report={lastCreatedReport ?? recent[0] ?? null} />
          </div>

          {/* StudentsGrid: if you want to show the students for the selected class/date */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xl">
            <h4 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-800">
              <ClipboardList className="w-5 h-5 inline mr-2 text-gray-600" />
              Class Roster
            </h4>
            {/* StudentsGrid should accept classId/date props — adjust if different */}
            <StudentsGrid
              classId={selectedClassId ?? (recent[0]?.classId ?? "")}
              date={selectedDate}
            />
            <p className="mt-4 text-xs text-gray-400 italic">
              * Showing roster for selected class and date.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}