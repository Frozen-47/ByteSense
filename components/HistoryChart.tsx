import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryItem } from '../types';

interface HistoryChartProps {
  data: HistoryItem[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg">
            <p className="text-secondary text-xs font-bold uppercase tracking-widest">No history data</p>
        </div>
    );
  }

  const chartData = data.slice().reverse().map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    Download: item.download,
    Upload: item.upload,
    Ping: item.ping
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="0" stroke="#24273f" vertical={false} />
        <XAxis 
          dataKey="time" 
          stroke="#535568" 
          fontSize={10} 
          tickLine={false}
          axisLine={false}
          tick={{ fontWeight: 'bold' }}
          dy={10}
        />
        <YAxis 
          stroke="#535568" 
          fontSize={10} 
          tickLine={false}
          axisLine={false}
          tick={{ fontWeight: 'bold' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#0a0b12', 
            border: '1px solid #24273f', 
            borderRadius: '0px',
            fontSize: '12px', 
            color: '#ffffff'
          }}
          itemStyle={{ padding: '4px 0', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}
          cursor={{ stroke: '#535568', strokeWidth: 1 }}
        />
        <Line 
          type="monotone" 
          dataKey="Download" 
          stroke="#53f6ff" 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 4, fill: '#53f6ff', stroke: '#fff' }} 
          isAnimationActive={false}
        />
        <Line 
          type="monotone" 
          dataKey="Upload" 
          stroke="#b077ff" 
          strokeWidth={2} 
          dot={false} 
          activeDot={{ r: 4, fill: '#b077ff', stroke: '#fff' }} 
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;