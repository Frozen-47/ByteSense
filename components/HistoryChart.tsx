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
    // Changed h-64 to h-full min-h-[16rem] to match Grid items
    <div className="w-full h-full min-h-[16rem] bg-card border-2 border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
      <h3 className="text-secondary text-xs font-bold uppercase tracking-wider mb-4">Speed History</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 150, 160, 0.2)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgb(var(--surface))', 
              border: '1px solid rgb(var(--border))', 
              borderRadius: '8px', 
              fontSize: '12px', 
              color: 'rgb(var(--primary))' 
            }}
            itemStyle={{ padding: '2px 0' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="Download" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Upload" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;