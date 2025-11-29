import React, { useState, useEffect } from 'react';
import StatCard from './components/StatCard';
import AuditTable from './components/AuditTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import { ShieldCheck, RefreshCw, UploadCloud, CheckCircle2 } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/audit-queue`);
      setData(await res.json());
    } catch(err) { console.error("API Error", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimulate = async () => {
    setLoading(true);
    await fetch(`${API_URL}/simulate-exam`, { method: 'POST' });
    await fetchData();
    setLoading(false);
  };

  const handleResolve = async (id) => {
    await fetch(`${API_URL}/resolve/${id}`, { method: 'POST' });
    fetchData(); 
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheet_type", "DESCRIPTIVE");
    setLoading(true);
    try {
        await fetch(`${API_URL}/upload-sheet`, { method: "POST", body: formData });
        await fetchData();
        alert("File Uploaded & Audited Successfully!");
    } catch (e) { alert("Upload Failed"); }
    setLoading(false);
  };

  const critical = data.filter(i => i.status === 'CRITICAL_MISMATCH').length;
  const ghost = data.filter(i => i.status === 'GHOST_ERROR').length;
  const clean = data.filter(i => i.status === 'CLEAN' || i.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-20">
      <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">GradeGuard</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>INTEGRITY ENGINE ACTIVE</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
               <input type="file" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
               <button className="flex items-center gap-2 bg-slate-800 group-hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700"><UploadCloud size={18} className="text-blue-400"/> Upload Sheet</button>
            </div>
            <button onClick={handleSimulate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /> {loading ? "Auditing..." : "Run Global Audit"}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Critical Discrepancies" value={critical} color="border-rose-500 text-rose-600" />
          <StatCard title="Ghost Pages Detected" value={ghost} color="border-violet-500 text-violet-600" />
          <StatCard title="Verified Clean" value={clean} color="border-emerald-500 text-emerald-600" />
        </div>
        {data.length > 0 && <AnalyticsCharts data={data} />}
        <div className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-700">Live Audit Queue</h2><span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">{data.length} Records</span></div>
            <AuditTable data={data} onResolve={handleResolve} />
        </div>
      </main>
    </div>
  );
}
export default App;