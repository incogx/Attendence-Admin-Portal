// src/pages/faculty/AttendancePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

/**
 * Faculty Attendance Page (patched)
 *
 * - Local-date-safe formatDate (avoids UTC off-by-one)
 * - Apply button disabled while loading + shows busy state
 * - Export buttons disabled when no data
 * - Table headers include scope="col" for accessibility
 * - Small helpful comments showing where to replace mocks with Supabase
 *
 * Replace mock* functions with real backend calls (Supabase / REST).
 */

/* ------------------------- Types ------------------------- */
type ClassItem = {
  id: string;
  courseCode: string;
  courseTitle: string;
  room?: string;
};

type StudentAttendance = {
  studentId: string;
  name: string;
  roll: string;
  status: "present" | "absent" | "leave" | "unknown";
  markedAt?: string;
};

type AttendanceRecord = {
  classId: string;
  date: string; // YYYY-MM-DD
  students: StudentAttendance[];
};

/* ------------------------ MOCKED BACKEND ------------------------ */
/**
 * NOTE: Replace mocks with real API calls.
 *
 * Example Supabase sketch for exact date:
 * const { data, error } = await supabase
 *   .from('attendance')
 *   .select('class_id, date, students:students(id, name, roll), status, marked_at')
 *   .eq('date', date);
 *
 * Then transform rows into AttendanceRecord[] grouped by class_id.
 */

/* Mock classes available to faculty */
const MOCK_CLASSES: ClassItem[] = [
  { id: "c1", courseCode: "CS201", courseTitle: "Data Structures", room: "Lab 3" },
  { id: "c2", courseCode: "CS301", courseTitle: "Operating Systems", room: "Room 102" },
  { id: "c3", courseCode: "CS401", courseTitle: "AI & Robotics", room: "Room 204" },
];

/* Small helper to format date -> YYYY-MM-DD using local date (avoids UTC shift) */
function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* Create sample attendance for a date */
function createMockAttendanceForDate(date: string): AttendanceRecord[] {
  return MOCK_CLASSES.map((c, idx) => {
    const students = Array.from({ length: 30 }).map((_, i) => {
      const studentId = `${c.id}-s${i + 1}`;
      // deterministic-ish pseudo-random based on date/class/index
      const hash = (date + c.id + i).split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
      const presentProbability = 0.75 - ((idx * 0.03) + ((hash % 5) * 0.01));
      const rnd = (hash % 100) / 100;
      const status = rnd < presentProbability ? "present" : "absent";
      return {
        studentId,
        name: `Student ${i + 1}`,
        roll: `R${(i + 1).toString().padStart(3, "0")}`,
        status: status as StudentAttendance["status"],
        markedAt: new Date().toISOString(),
      } as StudentAttendance;
    });

    return {
      classId: c.id,
      date,
      students,
    } as AttendanceRecord;
  });
}

/* Mock fetch: range query by date OR by month+year OR year */
async function mockFetchAttendance({ date, month, year }: { date?: string; month?: number; year?: number; }): Promise<AttendanceRecord[]> {
  await new Promise((r) => setTimeout(r, 180));

  if (date) {
    return createMockAttendanceForDate(date);
  }

  if (month != null && year != null) {
    const days = new Date(year, month, 0).getDate(); // month is 1..12
    const results: AttendanceRecord[] = [];
    // return a sampling of days across the month (keeps response small)
    const step = Math.max(1, Math.floor(days / 7));
    for (let d = 1; d <= days; d += step) {
      const day = new Date(year, month - 1, d);
      results.push(...createMockAttendanceForDate(formatDate(day)));
    }
    return results;
  }

  if (year != null) {
    const results: AttendanceRecord[] = [];
    for (let m = 0; m < 12; m++) {
      const day = new Date(year, m, Math.min(3, new Date(year, m + 1, 0).getDate()));
      results.push(...createMockAttendanceForDate(formatDate(day)));
    }
    return results;
  }

  return createMockAttendanceForDate(formatDate(new Date()));
}

/* --------------------- Utility / UI Helpers --------------------- */
function csvDownload(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* --------------------- Attendance Page Component --------------------- */
export default function FacultyAttendancePage() {
  // filter states
  const [filterMode, setFilterMode] = useState<"date" | "month" | "year">("date");
  const [date, setDate] = useState<string>(formatDate(new Date()));
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // 1..12
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedClassId, setSelectedClassId] = useState<string>(""); // empty => all classes

  // data state
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state for detail
  const [activeRecord, setActiveRecord] = useState<AttendanceRecord | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // fetch when filter changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        let res: AttendanceRecord[] = [];
        if (filterMode === "date") {
          res = await mockFetchAttendance({ date });
        } else if (filterMode === "month") {
          res = await mockFetchAttendance({ month, year });
        } else {
          res = await mockFetchAttendance({ year });
        }
        if (!mounted) return;
        setRecords(res);
        // auto-open appropriate record
        const chosen = selectedClassId ? res.find((r) => r.classId === selectedClassId) ?? null : (res[0] ?? null);
        setActiveRecord(chosen);
        setPage(1);
      } catch (err) {
        console.error("fetch attendance failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filterMode, date, month, year, selectedClassId]);

  // summary per class (aggregated across fetched records)
  const summaryByClass = useMemo(() => {
    const map = new Map<string, { present: number; absent: number; total: number }>();
    for (const rec of records) {
      const cls = map.get(rec.classId) ?? { present: 0, absent: 0, total: 0 };
      for (const s of rec.students) {
        cls.total += 1;
        if (s.status === "present") cls.present += 1;
        else cls.absent += 1;
      }
      map.set(rec.classId, cls);
    }
    return map;
  }, [records]);

  const classList = MOCK_CLASSES; // ideally fetch classes from backend filtered by faculty

  // detail page rows for activeRecord (paginated)
  const activeRows = useMemo(() => {
    if (!activeRecord) return [] as StudentAttendance[];
    const start = (page - 1) * pageSize;
    return activeRecord.students.slice(start, start + pageSize);
  }, [activeRecord, page]);

  /* -------------------- UI Actions -------------------- */

  function handleModeChange(m: "date" | "month" | "year") {
    setFilterMode(m);
    // sensible defaults
    if (m === "date") setDate(formatDate(new Date()));
    if (m === "month") {
      const now = new Date();
      setMonth(now.getMonth() + 1);
      setYear(now.getFullYear());
    }
    if (m === "year") setYear(new Date().getFullYear());
  }

  function exportSummaryCSV() {
    if (summaryByClass.size === 0) {
      alert("No attendance summary to export for the selected filter.");
      return;
    }
    const rows: string[][] = [["Class", "Present", "Absent", "Total"]];
    for (const [classId, stats] of summaryByClass.entries()) {
      const c = classList.find((x) => x.id === classId);
      rows.push([c ? `${c.courseCode} - ${c.courseTitle}` : classId, String(stats.present), String(stats.absent), String(stats.total)]);
    }
    csvDownload(`attendance_summary_${filterMode}_${filterMode === "date" ? date : `${month}-${year}`}.csv`, rows);
  }

  function exportDetailCSV() {
    if (!activeRecord) {
      alert("Select a class record to export details.");
      return;
    }
    if ((activeRecord.students?.length ?? 0) === 0) {
      alert("No student detail to export for the selected record.");
      return;
    }
    const rows: string[][] = [["StudentId", "Name", "Roll", "Status", "MarkedAt"]];
    for (const s of activeRecord.students) {
      rows.push([s.studentId, s.name, s.roll, s.status, s.markedAt ?? ""]);
    }
    csvDownload(`attendance_${activeRecord.classId}_${activeRecord.date}.csv`, rows);
  }

  function openRecordForClass(classId: string) {
    setSelectedClassId(classId);
    const found = records.find((r) => r.classId === classId);
    setActiveRecord(found ?? null);
    setPage(1);
  }

  /* -------------------- Render -------------------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Attendance — Reports</h1>
          <div className="text-sm text-slate-500 mt-1">Filter by date / month / year, and by class</div>
          <div className="text-sm text-slate-600 mt-2">
            <span className="mr-3">Classes: <strong>{classList.length}</strong></span>
            <span>Records loaded: <strong>{records.length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportSummaryCSV}
            className="px-3 py-1 rounded border inline-flex items-center gap-2 text-sm"
            disabled={summaryByClass.size === 0}
            aria-disabled={summaryByClass.size === 0}
          >
            <Download className="w-4 h-4" /> Export Summary
          </button>
          <button
            onClick={exportDetailCSV}
            className="px-3 py-1 rounded bg-purple-600 text-white text-sm"
            disabled={!activeRecord}
            aria-disabled={!activeRecord}
          >
            <Download className="w-4 h-4" /> Export Details
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Filter</label>
          <div className="inline-flex rounded-md overflow-hidden border">
            <button
              onClick={() => handleModeChange("date")}
              className={`px-3 py-1 text-sm ${filterMode === "date" ? "bg-purple-600 text-white" : "bg-white text-slate-700"}`}
            >
              Date
            </button>
            <button
              onClick={() => handleModeChange("month")}
              className={`px-3 py-1 text-sm ${filterMode === "month" ? "bg-purple-600 text-white" : "bg-white text-slate-700"}`}
            >
              Month
            </button>
            <button
              onClick={() => handleModeChange("year")}
              className={`px-3 py-1 text-sm ${filterMode === "year" ? "bg-purple-600 text-white" : "bg-white text-slate-700"}`}
            >
              Year
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {filterMode === "date" && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
              aria-label="Select date"
            />
          )}

          {filterMode === "month" && (
            <>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 border rounded-md"
                aria-label="Select month"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 border rounded-md w-28"
                aria-label="Enter year"
              />
            </>
          )}

          {filterMode === "year" && (
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-2 border rounded-md w-36"
              aria-label="Enter year"
            />
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 border rounded-md"
              aria-label="Select class"
            >
              <option value="">All classes</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseTitle}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              // manual refresh - triggers useEffect due to state
              if (filterMode === "date") setDate((d) => d);
              else if (filterMode === "month") setMonth((m) => m);
              else setYear((y) => y);
            }}
            className="px-3 py-2 rounded bg-purple-600 text-white"
            aria-busy={loading}
            disabled={loading}
          >
            {loading ? "Loading…" : "Apply"}
          </button>
        </div>
      </div>

      {/* Body: left summary (classes) + right detail */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Class summary */}
        <div className="lg:col-span-1 bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Classes</h3>
            <div className="text-xs text-slate-500">{records.length} day(s) loaded</div>
          </div>

          <div className="mt-3 space-y-2 max-h-[540px] overflow-y-auto">
            {[...classList].map((c) => {
              const stats = summaryByClass.get(c.id) ?? { present: 0, absent: 0, total: 0 };
              return (
                <button
                  key={c.id}
                  onClick={() => openRecordForClass(c.id)}
                  className="w-full text-left p-2 rounded-md hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{c.courseCode}</div>
                    <div className="text-xs text-slate-500">{c.courseTitle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{stats.present}/{stats.total}</div>
                    <div className="text-xs text-slate-400">present</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-xs text-slate-500">Tip: pick a class to see student details for the selected filter.</div>
        </div>

        {/* Right: Detail / Table */}
        <div className="lg:col-span-3 bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {activeRecord
                  ? `Details — ${MOCK_CLASSES.find((c) => c.id === activeRecord.classId)?.courseCode ?? activeRecord.classId} (${activeRecord.date})`
                  : "Select a class"}
              </h3>
              <div className="text-sm text-slate-500 mt-1">
                {activeRecord ? `${activeRecord.students.length} students` : "No data"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">Page {page}</div>
              <button
                onClick={exportDetailCSV}
                className="px-3 py-1 rounded border inline-flex items-center gap-2 text-sm"
                disabled={!activeRecord}
                aria-disabled={!activeRecord}
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="py-8 text-center text-slate-500">Loading attendance…</div>
            ) : !activeRecord ? (
              <div className="py-8 text-center text-slate-500">No record selected</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500">
                        <th scope="col" className="py-2 px-3">Roll</th>
                        <th scope="col" className="py-2 px-3">Name</th>
                        <th scope="col" className="py-2 px-3">Status</th>
                        <th scope="col" className="py-2 px-3">Marked at</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {activeRows.map((s) => (
                        <tr key={s.studentId}>
                          <td className="py-3 px-3">{s.roll}</td>
                          <td className="py-3 px-3">{s.name}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                s.status === "present" ? "bg-green-100 text-green-800" : s.status === "absent" ? "bg-red-100 text-red-700" : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">{s.markedAt ? new Date(s.markedAt).toLocaleTimeString() : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Showing {Math.min((page - 1) * pageSize + 1, activeRecord.students.length)}–{Math.min(page * pageSize, activeRecord.students.length)} of {activeRecord.students.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 border rounded text-sm"
                      disabled={page === 1}
                      aria-disabled={page === 1}
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => (p * pageSize < activeRecord.students.length ? p + 1 : p))}
                      className="px-3 py-1 border rounded text-sm"
                      disabled={page * pageSize >= activeRecord.students.length}
                      aria-disabled={page * pageSize >= activeRecord.students.length}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
