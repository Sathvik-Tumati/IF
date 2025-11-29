import React from 'react';
import { RefreshCw, UploadCloud } from 'lucide-react';

const Navbar = ({ onSimulate, onUpload, loading }) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            INTEGRITY ENGINE ACTIVE
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onUpload} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700">
            <UploadCloud size={18} className="text-blue-400" /> Upload Sheet
          </button>
          <button onClick={onSimulate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> {loading ? "Auditing..." : "Run Global Audit"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;