import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import AuditTable from './components/AuditTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import { 
  AlertOctagon, Ghost, CheckCircle2, TrendingUp, Search, 
  Hash, FileText, Target, Key, UploadCloud, ArrowRight, Shield 
} from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

// --- ANIMATION SETTINGS ---
const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- API LOGIC ---
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
    setActiveTab('audit'); // Jump to list to show results
  };

  const handleResolve = async (id) => {
    await fetch(`${API_URL}/resolve/${id}`, { method: 'POST' });
    fetchData(); 
  };

  // --- STATS ---
  const critical = data.filter(i => i.status === 'CRITICAL_MISMATCH').length;
  const ghost = data.filter(i => i.status === 'GHOST_ERROR').length;
  const clean = data.filter(i => i.status === 'CLEAN' || i.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSimulate={handleSimulate} 
        loading={loading} 
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          
          {/* === DASHBOARD VIEW === */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Integrity Overview</h2>
                  <p className="text-slate-500 text-sm mt-1">Real-time forensic analysis of examination data.</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp size={12}/> AI Analysis Active
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Critical Discrepancies" value={critical} color="rose" icon={AlertOctagon} subtext="Math errors & mismatches" />
                <StatCard title="Ghost Pages Detected" value={ghost} color="violet" icon={Ghost} subtext="Ungraded content found" />
                <StatCard title="Verified Clean" value={clean} color="emerald" icon={CheckCircle2} subtext="Passed AI & Human checks" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
                 {data.length > 0 ? <AnalyticsCharts data={data} /> : <div className="text-center py-20 text-slate-400 italic">No data available. Run Global Audit to initialize.</div>}
              </div>
            </motion.div>
          )}

          {/* === AUDIT LIST VIEW === */}
          {activeTab === 'audit' && (
            <motion.div key="audit" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Live Audit Queue</h2>
                  <p className="text-slate-500 text-sm">Review specific anomalies detected by the engine.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                  <Search size={16} className="text-slate-400"/>
                  <span className="text-xs font-medium text-slate-500">{data.length} Records</span>
                </div>
              </div>
              <AuditTable data={data} onResolve={handleResolve} />
            </motion.div>
          )}

          {/* === UPLOAD VIEW === */}
          {activeTab === 'upload' && (
            <motion.div key="upload" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <UploadView 
                onUploadComplete={() => { 
                  fetchData(); 
                  setActiveTab('audit'); 
                }} 
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: UPLOAD FORM ---
function UploadView({ onUploadComplete }) {
  const [loading, setLoading] = useState(false);
  const [rollNo, setRollNo] = useState('');
  const [file, setFile] = useState(null);
  const [refFile, setRefFile] = useState(null);
  const [humanScore, setHumanScore] = useState('');
  const [sheetType, setSheetType] = useState('DESCRIPTIVE');

  const handleSubmit = async () => {
    if (!file || !humanScore) {
      alert('Please fill required fields (File & Score)');
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheet_type", sheetType);
    formData.append("manual_total_entry", humanScore);
    if (refFile) formData.append("reference_file", refFile);

    setLoading(true);
    try {
      await fetch(`${API_URL}/upload-sheet`, { method: "POST", body: formData });
      alert("Script Processed Successfully.");
      onUploadComplete();
    } catch (e) { alert("Upload Failed"); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4 text-indigo-600 shadow-sm border border-indigo-100"><Shield size={32} /></div>
        <h2 className="text-3xl font-bold text-slate-900">Upload Answer Script</h2>
        <p className="text-slate-500 mt-2">Upload student scripts for AI-driven forensic analysis.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"><Hash size={14}/> Sheet ID</label>
            <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. 1024" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"><FileText size={14}/> Format</label>
            <select value={sheetType} onChange={(e) => setSheetType(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none">
              <option value="DESCRIPTIVE">Descriptive</option>
              <option value="OMR">OMR</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"><Target size={14} className="text-rose-500"/> Human Awarded Marks</label>
          <input type="number" value={humanScore} onChange={(e) => setHumanScore(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 text-lg outline-none" placeholder="e.g. 85" />
        </div>

        <div className="space-y-4">
          {/* STUDENT SCRIPT */}
          <div className="relative group cursor-pointer">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className={`flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-2xl transition-all ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
              <div className={`p-3 rounded-xl mb-3 ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{file ? <FileText size={24}/> : <UploadCloud size={24}/>}</div>
              <p className="text-sm font-medium text-slate-700">{file ? file.name : "Click to Upload Student Script"}</p>
            </div>
          </div>

          {/* REFERENCE FILE */}
          <div className="relative group cursor-pointer animate-fade-in">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {sheetType === 'OMR' ? "Master Answer Key" : "Question Paper (Optional)"}
            </label>
            <input type="file" onChange={(e) => setRefFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className={`flex items-center gap-4 px-6 py-4 border-2 border-dashed rounded-2xl transition-all ${refFile ? 'border-blue-400 bg-blue-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
              <div className={`p-2 rounded-lg ${refFile ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}><Key size={20}/></div>
              <div className="flex-1"><p className="text-sm font-medium text-slate-700">{refFile ? refFile.name : `Upload ${sheetType === 'OMR' ? 'Key' : 'Reference Doc'}`}</p></div>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          {loading ? "Processing Analysis..." : <>Start Forensic Audit <ArrowRight size={20}/></>}
        </button>
      </div>
    </div>
  );
}