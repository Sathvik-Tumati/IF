import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { UploadCloud, Hash, FileText, Target, Key, ScanLine, ArrowRight, Shield } from 'lucide-react';

export default function Upload({ onSubmit, loading }) {
  const navigate = useNavigate();
  const [rollNo, setRollNo] = useState('');
  const [file, setFile] = useState(null);
  const [answerKey, setAnswerKey] = useState(null);
  const [humanScore, setHumanScore] = useState('');
  const [sheetType, setSheetType] = useState('DESCRIPTIVE');

  const handleSubmit = async () => {
    const success = await onSubmit({ rollNo, file, answerKey, humanScore, sheetType });
    if (success) navigate('/audit'); // Redirect to Audit List on success
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-12">
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-4 text-indigo-600 shadow-sm border border-indigo-100">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Upload Answer Script</h2>
          <p className="text-slate-500 mt-2">Upload student scripts for AI-driven forensic analysis.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Form Section */}
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

            {/* Drag & Drop Areas */}
            <div className="space-y-4">
              <div className="relative group cursor-pointer">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-2xl transition-all ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
                  <div className={`p-3 rounded-xl mb-3 ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {file ? <FileText size={24}/> : <UploadCloud size={24}/>}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{file ? file.name : "Click to Upload Student Script"}</p>
                  {!file && <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG supported</p>}
                </div>
              </div>

              {sheetType === 'OMR' && (
                <div className="relative group cursor-pointer animate-fade-in">
                  <input type="file" onChange={(e) => setAnswerKey(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`flex items-center gap-4 px-6 py-4 border-2 border-dashed rounded-2xl transition-all ${answerKey ? 'border-blue-400 bg-blue-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
                    <div className={`p-2 rounded-lg ${answerKey ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}><Key size={20}/></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{answerKey ? answerKey.name : "Upload Answer Key"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Processing Analysis..." : <>Start Forensic Audit <ArrowRight size={20}/></>}
            </button>

          </div>
        </div>
      </div>
    </Layout>
  );
}