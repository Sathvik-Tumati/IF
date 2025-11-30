import React from 'react';
import { FileText, Grid, CheckCircle2, AlertOctagon, AlertTriangle, ExternalLink, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AuditTable({ data, onResolve }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Format</th>
              <th className="px-6 py-4 text-center">AI Score</th>
              <th className="px-6 py-4 text-center">Human Score</th>
              <th className="px-6 py-4">Audit Status</th>
              <th className="px-6 py-4">Evidence</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.map((row, index) => (
              <tr 
                key={row.id} 
                className="hover:bg-slate-50 transition-colors duration-150 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }} 
              >
                <td className="px-6 py-4 font-mono text-slate-600 font-medium">
                  {row.secret_code}
                </td>
                
                <td className="px-6 py-4">
                  {row.sheet_type === 'OMR' ? 
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      <Grid size={12}/> OMR
                    </span> :
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                      <FileText size={12}/> DESC
                    </span>
                  }
                </td>

                <td className="px-6 py-4 text-center font-bold text-slate-800 bg-slate-50/50">
                  {row.cv_total_score}
                </td>
                <td className="px-6 py-4 text-center font-medium text-slate-500">
                  {row.manual_total_entry}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>

                <td className="px-6 py-4">
                  {row.file_url ? (
                    <a href={row.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 hover:underline">
                      View <ExternalLink size={14}/>
                    </a>
                  ) : <span className="text-slate-300 italic">None</span>}
                </td>

                <td className="px-6 py-4 text-right">
                  {row.status !== 'CLEAN' && row.status !== 'RESOLVED' && (
                    <button 
                      onClick={() => onResolve(row.id)} 
                      className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      Resolve <ArrowRight size={12}/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const styles = {
    CLEAN: "bg-emerald-50 text-emerald-700 border-emerald-200 icon-emerald-600",
    CRITICAL_MISMATCH: "bg-rose-50 text-rose-700 border-rose-200 icon-rose-600",
    GHOST_ERROR: "bg-violet-50 text-violet-700 border-violet-200 icon-violet-600",
    RESOLVED: "bg-slate-100 text-slate-600 border-slate-200 icon-slate-500",
  };

  const config = {
    CLEAN: { icon: CheckCircle2, text: "Verified" },
    CRITICAL_MISMATCH: { icon: AlertOctagon, text: "Math Error" },
    GHOST_ERROR: { icon: AlertTriangle, text: "Ghost Page" },
    RESOLVED: { icon: ShieldAlert, text: "Resolved" },
  };

  const style = styles[status] || styles.RESOLVED;
  const { icon: Icon, text } = config[status] || config.RESOLVED;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}>
      <Icon size={14} className="shrink-0" /> {text}
    </span>
  );
};