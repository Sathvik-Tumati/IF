import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsCharts({ data }) {
  const statusCounts = data.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'Clean', value: statusCounts['CLEAN'] || 0, color: '#10B981' }, 
    { name: 'Math Error', value: statusCounts['CRITICAL_MISMATCH'] || 0, color: '#EF4444' },
    { name: 'Ghost Page', value: statusCounts['GHOST_ERROR'] || 0, color: '#8B5CF6' },
    { name: 'Resolved', value: statusCounts['RESOLVED'] || 0, color: '#6B7280' }, 
  ].filter(i => i.value > 0);

  const typeStats = data.reduce((acc, curr) => {
    const t = curr.sheet_type || 'UNKNOWN';
    if (!acc[t]) acc[t] = { name: t, Total: 0, Errors: 0 };
    acc[t].Total += 1;
    if (curr.status !== 'CLEAN' && curr.status !== 'RESOLVED') acc[t].Errors += 1;
    return acc;
  }, {});
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-80">
        <h4 className="text-xs font-bold uppercase mb-6 text-gray-500">System Health</h4>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-80">
        <h4 className="text-xs font-bold uppercase mb-6 text-gray-500">Error Distribution by Type</h4>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={Object.values(typeStats)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: '#f1f5f9'}} />
            <Legend verticalAlign="bottom" height={36}/>
            <Bar dataKey="Total" fill="#E2E8F0" radius={[4,4,0,0]} barSize={40} />
            <Bar dataKey="Errors" fill="#F59E0B" radius={[4,4,0,0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}