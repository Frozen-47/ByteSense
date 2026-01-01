
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HistoryItem } from '../types';

interface HistoryChartProps {
  data: HistoryItem[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  const chartData = data.slice().reverse().map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    Download: item.download,
    Upload: item.upload,
    Ping: item.ping
  }));

  return (
    <div className="w-full h-64 bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Speed History</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
            itemStyle={{ padding: '2px 0' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="Download" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Upload" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
