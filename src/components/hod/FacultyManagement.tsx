// src/components/hod/FacultyManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Download, Trash2, Edit } from "lucide-react";

/**
 * FacultyManagement
 * - Shows a searchable, paginated list of faculty
 * - Actions: Edit (navigate), Delete (mock)
 */

/* Mock fetch */
type Faculty = { id: string; name: string; email: string; dept: string; phone?: string; role?: string; };
async function mockFetchFaculty(): Promise<Faculty[]> {
  await new Promise(r => setTimeout(r, 120));
  return Array.from({length: 26}).map((_,i) => ({ id: `f${i+1}`, name: `Dr. Faculty ${i+1}`, email:`fac${i+1}@sathyabama.edu.in`, dept: i%2===0 ? "CSE" : "ECE", phone: `+91-90000${100+i}` }));
}

export default function FacultyManagement() {
  const [list, setList] = useState<Faculty[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  useEffect(() => { (async ()=> setList(await mockFetchFaculty()))(); }, []);

  const filtered = useMemo(() => list.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.email.toLowerCase().includes(query.toLowerCase())), [list, query]);
  const total = filtered.length;
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

  function deleteFaculty(id: string) {
    if (!confirm("Delete faculty?")) return;
    setList(prev => prev.filter(p => p.id !== id));
    // in real app: supabase.from('faculty').delete().eq('id', id)
  }

  function exportCSV() {
    const rows = [["Name","Email","Dept","Phone"], ...filtered.map(f => [f.name,f.email,f.dept,f.phone||""])];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `faculty_list.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Faculty Management</h3>
          <div className="text-sm text-slate-500">Add, edit and remove faculty accounts</div>
        </div>

        <div className="flex items-center gap-2">
          <input className="px-3 py-2 border rounded-md" placeholder="Search by name or email" value={query} onChange={e=>{setQuery(e.target.value); setPage(1);}} />
          <button onClick={exportCSV} className="px-3 py-2 rounded border inline-flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr><th className="py-2 px-3">Name</th><th className="py-2 px-3">Email</th><th className="py-2 px-3">Dept</th><th className="py-2 px-3">Phone</th><th className="py-2 px-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {pageItems.map(f => (
                <tr key={f.id}>
                  <td className="py-3 px-3 font-medium">{f.name}</td>
                  <td className="py-3 px-3">{f.email}</td>
                  <td className="py-3 px-3">{f.dept}</td>
                  <td className="py-3 px-3">{f.phone}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button onClick={()=> alert("Edit not implemented - navigate to edit form")} className="px-2 py-1 rounded border inline-flex items-center gap-2 text-sm"><Edit className="w-4 h-4" /> Edit</button>
                      <button onClick={()=> deleteFaculty(f.id)} className="px-2 py-1 rounded border text-red-600 inline-flex items-center gap-2 text-sm"><Trash2 className="w-4 h-4" /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {Math.min((page-1)*pageSize+1, total)}–{Math.min(page*pageSize, total)} of {total}</div>
          <div className="flex gap-2">
            <button onClick={()=> setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded" disabled={page===1}>Prev</button>
            <button onClick={()=> setPage(p => p*pageSize < total ? p+1 : p)} className="px-3 py-1 border rounded" disabled={page*pageSize >= total}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
