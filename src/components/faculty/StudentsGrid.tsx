import React from "react";
import { Student } from "./types";

interface Props {
  students: Student[];
  attendance: Record<string, boolean>;
  onToggle: (id: string, present: boolean) => void;
}

export default function StudentsGrid({ students, attendance, onToggle }: Props) {
  if (!students.length)
    return (
      <div className="text-center py-10 text-slate-500">
        No students loaded for this class.
      </div>
    );

  return (
    <div className="space-y-3">
      {students.map((s) => {
        const present = attendance[s.id] ?? false;

        return (
          <div
            key={s.id}
            className="flex items-center justify-between px-4 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            {/* Student Info */}
            <div>
              <div className="font-medium text-slate-800">{s.name}</div>
              <div className="text-xs text-slate-500">{s.roll}</div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => onToggle(s.id, !present)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                present
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-red-100 text-red-700 border-red-300"
              }`}
            >
              {present ? "Present" : "Absent"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
