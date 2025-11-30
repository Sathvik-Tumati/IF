import React from 'react';
import { UploadCloud, LayoutDashboard, ListChecks, RefreshCw, Shield } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onSimulate, loading }) {
  
  const navItemClass = (tabName) => `
    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none
    ${activeTab === tabName 
      ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700' 
      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
  `;

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800 shadow-lg backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Brand */}
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <div className="hidden md:block">
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Integrity Forensics</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              System Online
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
          <div onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
            <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
          </div>
          <div onClick={() => setActiveTab('audit')} className={navItemClass('audit')}>
            <ListChecks size={16} /> <span className="hidden sm:inline">Live Audit</span>
          </div>
          <div onClick={() => setActiveTab('upload')} className={navItemClass('upload')}>
            <UploadCloud size={16} /> <span className="hidden sm:inline">Upload Script</span>
          </div>
        </nav>

        {/* Global Audit Button */}
        <button 
          onClick={onSimulate} 
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
            loading 
              ? 'bg-slate-700 cursor-wait opacity-70' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/20'
          }`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> 
          <span className="hidden sm:inline">{loading ? "Running..." : "Global Audit"}</span>
        </button>

      </div>
    </header>
  );
}