import React from 'react';

export default function StatCard({ title, value, color }) {
  return (
    <div className={`p-6 rounded-xl shadow-sm bg-white border-l-4 ${color} transition hover:shadow-md`}>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-extrabold mt-2 text-gray-800">{value}</p>
    </div>
  );
}