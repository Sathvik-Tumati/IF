import React from 'react';
import Layout from '../components/Layout';
import AuditTable from '../components/AuditTable';
import { Search } from 'lucide-react';

export default function AuditList({ data, onResolve }) {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Live Audit Queue</h2>
            <p className="text-slate-500 text-sm">Review and resolve flagged discrepancies.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
            <Search size={16} className="text-slate-400"/>
            <span className="text-xs font-medium text-slate-500">{data.length} Records Loaded</span>
          </div>
        </div>

        <AuditTable data={data} onResolve={onResolve} />
      </div>
    </Layout>
  );
}