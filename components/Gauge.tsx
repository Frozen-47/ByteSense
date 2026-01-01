
import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, max, label, unit, color = '#6366f1' }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const strokeDashoffset = circumference - (percentage * circumference * 0.75); // 0.75 for semi-circle effect

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-64 h-64 transform -rotate-[225deg]">
        {/* Track */}
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center transform translate-y-2">
        <span className="text-5xl font-extrabold text-white tracking-tighter">
          {value.toFixed(1)}
        </span>
        <span className="text-slate-400 font-medium uppercase text-xs tracking-widest mt-1">
          {unit}
        </span>
        <span className="text-slate-500 text-xs mt-4 font-semibold uppercase">
          {label}
        </span>
      </div>
    </div>
  );
};

export default Gauge;
