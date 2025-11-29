import React, { useState, useEffect } from 'react';
import StatCard from './components/StatCard';
import AuditTable from './components/AuditTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import Navbar from './components/Navbar';
import { CheckCircle2, X, UploadCloud, Hash, FileText, Target, Key } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [rollNo, setRollNo] = useState('');
  const [file, setFile] = useState(null);
  const [totalMarks, setTotalMarks] = useState('');
  const [sheetType, setSheetType] = useState('DESCRIPTIVE');
  const [answerKeyFile, setAnswerKeyFile] = useState(null);

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

  const openUploadDialog = () => setShowUploadDialog(true);

  const closeUploadDialog = () => {
    setShowUploadDialog(false);
    setRollNo('');
    setFile(null);
    setTotalMarks('');
    setSheetType('DESCRIPTIVE');
    setAnswerKeyFile(null);
  };

  const handleUploadSubmit = async () => {
    if (!file || !rollNo || !totalMarks) {
      alert('Please fill all required fields');
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheet_type", sheetType);
    if (answerKeyFile) {
      formData.append("answer_key", answerKeyFile);
    }
    // Additional fields can be appended if backend supports
    setLoading(true);
    try {
      await fetch(`${API_URL}/upload-sheet`, { method: "POST", body: formData });
      await fetchData();
      alert("File Uploaded & Audited Successfully!");
      closeUploadDialog();
    } catch (e) { alert("Upload Failed"); }
    setLoading(false);
  };

  const critical = data.filter(i => i.status === 'CRITICAL_MISMATCH').length;
  const ghost = data.filter(i => i.status === 'GHOST_ERROR').length;
  const clean = data.filter(i => i.status === 'CLEAN' || i.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-20">
      <Navbar onSimulate={handleSimulate} onUpload={openUploadDialog} loading={loading} />

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

      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <UploadCloud size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Answer Sheet</h3>
              </div>
              <button onClick={closeUploadDialog} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Hash size={16} className="text-indigo-500" />
                  SHEET ID
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter unique sheet ID"
                />
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText size={16} className="text-indigo-500" />
                  Answer Sheet
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors bg-gray-50 hover:bg-indigo-50">
                    <div className="text-center">
                      <UploadCloud size={20} className="mx-auto text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                    </div>
                  </div>
                </div>
                {file && <p className="text-xs text-green-600 mt-1">Selected: {file.name}</p>}
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Target size={16} className="text-indigo-500" />
                  Total Marks
                </label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter total marks"
                />
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText size={16} className="text-indigo-500" />
                  Sheet Type
                </label>
                <select
                  value={sheetType}
                  onChange={(e) => setSheetType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="DESCRIPTIVE">Descriptive</option>
                  <option value="OMR">OMR</option>
                  <option value="Partially OMR">Partially OMR</option>
                </select>
              </div>
              {(sheetType === 'OMR' || sheetType === 'Partially OMR') && (
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Key size={16} className="text-indigo-500" />
                    Answer Key
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setAnswerKeyFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors bg-gray-50 hover:bg-indigo-50">
                      <div className="text-center">
                        <Key size={20} className="mx-auto text-gray-400 mb-1" />
                        <span className="text-sm text-gray-600">Upload answer key file</span>
                      </div>
                    </div>
                  </div>
                  {answerKeyFile && <p className="text-xs text-green-600 mt-1">Selected: {answerKeyFile.name}</p>}
                </div>
              )}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={closeUploadDialog}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
                >
                  Upload Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;