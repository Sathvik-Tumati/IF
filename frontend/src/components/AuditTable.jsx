import React from 'react';
import { FileText, Grid, CheckCircle, AlertOctagon, AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';

export default function AuditTable({ data, onResolve }) {
  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
      <table className="min-w-full leading-normal">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-4">Sheet ID</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">AI Score</th>
            <th className="px-6 py-4">Human</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Evidence</th>
            <th className="px-6 py-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-blue-50/50 transition duration-150">
              <td className="px-6 py-4 text-sm font-mono text-gray-700">{row.secret_code}</td>
              <td className="px-6 py-4">
                {row.sheet_type === 'OMR' ? 
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700"><Grid size={14}/> OMR</span> :
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700"><FileText size={14}/> DESC</span>
                }
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.cv_total_score}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{row.manual_total_entry}</td>
              <td className="px-6 py-4">
                {row.status === 'CLEAN' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle size={14}/> Verified</span>}
                {row.status === 'CRITICAL_MISMATCH' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800"><AlertOctagon size={14}/> Math Error</span>}
                {row.status === 'GHOST_ERROR' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800"><AlertTriangle size={14}/> Ghost Page</span>}
                {row.status === 'RESOLVED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600"><CheckCircle size={14}/> Resolved</span>}
              </td>
              <td className="px-6 py-4">
                {row.file_url ? <a href={row.file_url} target="_blank" className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1">View <ExternalLink size={12}/></a> : <span className="text-gray-400 text-xs italic">No Image</span>}
              </td>
              <td className="px-6 py-4">
                {row.status !== 'CLEAN' && row.status !== 'RESOLVED' && (
                  <button onClick={() => onResolve(row.id)} className="group flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-all active:scale-95">Resolve <ArrowRight size={12}/></button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}