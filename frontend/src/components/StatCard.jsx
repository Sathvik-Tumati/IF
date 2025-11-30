import React from 'react';

export default function StatCard({ title, value, color, icon: Icon, subtext }) {
  // Map color strings to Tailwind classes
  const colorMap = {
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    violet: "bg-violet-50 text-violet-600 border-violet-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200"
  };

  const theme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${theme}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      {subtext && (
        <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
          {subtext}
        </div>
      )}
    </div>
  );
}