// src/components/hod/DepartmentAttendance.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

/* This mirrors Faculty AttendancePage but aggregates per-department */
type DeptRecord = { dept: string; date: string; present: number; absent: number; total: number; };

async function mockFetchDeptAttendance({ date }: { date: string }): Promise<DeptRecord[]> {
  await new Promise(r=>setTimeout(r,150));
  const depts = ["CSE","ECE","MECH","CIVIL"];
  return depts.map((d,i) => ({ dept: d, date, present: Math.floor(20 + i*2 + Math.random()*5), absent: Math.floor(5 + Math.random()*3), total: 30 }));
}

export default function DepartmentAttendance() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [rows, setRows] = useState<DeptRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await mockFetchDeptAttendance({ date });
      if (!mounted) return;
      setRows(data);
      setLoading(false);
    })();
    return ()=> { mounted = false; };
  }, [date]);

  function exportCSV() {
    const out = [["Dept","Date","Present","Absent","Total"], ...rows.map(r=>[r.dept, r.date, String(r.present), String(r.absent), String(r.total)])];
    const csv = out.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `dept_attendance_${date}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  const totals = useMemo(() => rows.reduce((acc,r) => { acc.present += r.present; acc.absent += r.absent; acc.total += r.total; return acc; }, { present:0, absent:0, total:0 }), [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Department Attendance</h3>
          <div className="text-sm text-slate-500">See department-wise attendance for selected date</div>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="px-3 py-2 border rounded" />
          <button onClick={exportCSV} className="px-3 py-2 rounded border inline-flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        {loading ? <div className="py-6 text-center text-slate-500">Loading…</div> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr><th className="py-2 px-3">Department</th><th className="py-2 px-3">Present</th><th className="py-2 px-3">Absent</th><th className="py-2 px-3">Total</th></tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map(r=>(
                    <tr key={r.dept}>
                      <td className="py-3 px-3 font-medium">{r.dept}</td>
                      <td className="py-3 px-3 text-green-600">{r.present}</td>
                      <td className="py-3 px-3 text-red-600">{r.absent}</td>
                      <td className="py-3 px-3">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-slate-500">Totals — Present: <strong className="text-green-600">{totals.present}</strong> • Absent: <strong className="text-red-600">{totals.absent}</strong></div>
          </>
        )}
      </div>
    </div>
  );
}
