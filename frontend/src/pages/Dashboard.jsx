import React from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { AlertOctagon, Ghost, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Dashboard({ data }) {
  const critical = data.filter(i => i.status === 'CRITICAL_MISMATCH').length;
  const ghost = data.filter(i => i.status === 'GHOST_ERROR').length;
  const clean = data.filter(i => i.status === 'CLEAN' || i.status === 'RESOLVED').length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Integrity Overview</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time analysis of examination integrity.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12}/> System Active
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Critical Discrepancies" value={critical} color="rose" icon={AlertOctagon} subtext="Requires immediate review" />
          <StatCard title="Ghost Pages Detected" value={ghost} color="violet" icon={Ghost} subtext="Ungraded content found" />
          <StatCard title="Verified Clean" value={clean} color="emerald" icon={CheckCircle2} subtext="Passed AI & Human checks" />
        </div>

        {/* Charts Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
           {data.length > 0 ? (
             <AnalyticsCharts data={data} />
           ) : (
             <div className="text-center py-20 text-slate-400 italic">Run a Global Audit or Upload Data to see analytics.</div>
           )}
        </div>

      </div>
    </Layout>
  );
}