import React, { useState } from "react";
import { ClassItem, Student } from "./types";
import { supabase } from "../../lib/supabase";
import StudentsGrid from "./StudentsGrid";
import GenerateQRPanel from "./GenerateQRPanel";
import AttendancePage from "./AttendancePage";

export default function FacultyClasses() {
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  async function openClass(c: ClassItem) {
    setSelectedClass(c);
    setAttendance({});
    try {
      const { data, error } = await supabase
        .from("class_students")
        .select("student:students(id,name,roll)")
        .eq("class_id", c.id);

      if (error) throw error;

      const list = (data || []).map((r: any) => r.student) as Student[];
      setStudents(list);
      const init: Record<string, boolean> = {};
      list.forEach((s) => (init[s.id] = false));
      setAttendance(init);
    } catch (err) {
      // fallback demo
      const demo: Student[] = [
        { id: "s1", name: "Ali Khan", roll: "CSE201" },
        { id: "s2", name: "Fatima", roll: "CSE202" },
        { id: "s3", name: "Ravi Kumar", roll: "CSE203" },
      ];
      setStudents(demo);
      const init: Record<string, boolean> = {};
      demo.forEach((s) => (init[s.id] = false));
      setAttendance(init);
    }
  }

  function toggleStudent(id: string, present: boolean) {
    setAttendance((prev) => ({ ...prev, [id]: present }));
  }

  async function saveAttendance() {
    if (!selectedClass) {
      alert("Select a class first.");
      return;
    }
    const rows = Object.entries(attendance).map(([student_id, present]) => ({
      class_id: selectedClass.id,
      student_id,
      present,
      marked_at: new Date().toISOString(),
    }));
    try {
      const { error } = await supabase.from("attendance").insert(rows);
      if (error) throw error;
      alert("Attendance saved");
    } catch (err) {
      console.error(err);
      alert("Save failed — check console");
    }
  }

  // Demo classes — replace with backend fetch if available
  const demoClasses: ClassItem[] = [
    { id: "demo-1", name: "AI & Robotics - Theory", start: "10:00", end: "11:00" },
    { id: "demo-2", name: "Embedded Systems - Lab", start: "14:00", end: "16:00" },
  ];

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Select Class</h2>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-slate-600">Choose class:</label>
          <select
            value={selectedClass?.id ?? ""}
            onChange={(e) => {
              const found = demoClasses.find((d) => d.id === e.target.value);
              if (found) openClass(found);
              if (e.target.value === "") {
                setSelectedClass(null);
                setStudents([]);
                setAttendance({});
              }
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">-- choose class --</option>
            {demoClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.start} - {c.end})
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="text-sm text-slate-500">
            Selected: {selectedClass.name} ({selectedClass.start} - {selectedClass.end})
          </div>
        )}
      </div>

      {selectedClass ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left: QR and controls */}
          <div className="col-span-5 space-y-4">
            <GenerateQRPanel classId={selectedClass.id} />

            <div className="bg-white p-4 rounded-xl border shadow-sm flex gap-3">
              <button
                onClick={() =>
                  setAttendance(
                    Object.fromEntries(Object.keys(attendance).map((k) => [k, true]))
                  )
                }
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Mark All Present
              </button>
              <button
                onClick={() =>
                  setAttendance(
                    Object.fromEntries(Object.keys(attendance).map((k) => [k, false]))
                  )
                }
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Clear
              </button>
              <button
                onClick={saveAttendance}
                className="ml-auto px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700"
              >
                Save Attendance
              </button>
            </div>
          </div>

          {/* Right: Students grid + attendance viewer */}
          <div className="col-span-7 space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="text-lg font-medium mb-3">{selectedClass.name} — Students</h3>
              <StudentsGrid students={students} attendance={attendance} onToggle={toggleStudent} />
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4">
              <AttendancePage classId={selectedClass.id} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
          <p className="text-slate-500">Please select a class to manage attendance.</p>
        </div>
      )}
    </div>
  );
}
