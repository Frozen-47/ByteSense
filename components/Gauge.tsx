import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, max, label, unit, color = '#53f6ff' }) => {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const strokeDashoffset = circumference - (percentage * circumference * 0.75); 

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* SVG Container */}
      <svg className="w-[320px] h-[320px] transform -rotate-[225deg]">
        
        {/* Track - Solid Dark Grey */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="#24273f" 
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="butt"
        />
        
        {/* Progress Value - Solid Color */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      
      {/* Labels below the gauge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-32">
        <div className="flex flex-col items-center">
           <span className="text-5xl font-black text-white tracking-tighter">
             {value.toFixed(1)}
           </span>
           <span className="text-secondary text-sm font-bold uppercase tracking-widest mt-1">
             {unit}
           </span>
        </div>
      </div>
      
      {/* Status Label Top */}
      <div className="absolute top-10 pointer-events-none">
         <span className="text-secondary text-xs font-bold uppercase tracking-[0.2em]">
           {label}
         </span>
      </div>
    </div>
  );
};

export default Gauge;