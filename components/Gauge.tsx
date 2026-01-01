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
  const strokeDashoffset = circumference - (percentage * circumference * 0.75); 

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-64 h-64 transform -rotate-[225deg]">
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="rgb(var(--border))" 
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
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
        <span className="text-5xl font-extrabold text-primary tracking-tighter">
          {value.toFixed(1)}
        </span>
        <span className="text-secondary font-medium uppercase text-xs tracking-widest mt-1">
          {unit}
        </span>
        <span className="text-muted text-xs mt-4 font-semibold uppercase">
          {label}
        </span>
      </div>
    </div>
  );
};

export default Gauge;