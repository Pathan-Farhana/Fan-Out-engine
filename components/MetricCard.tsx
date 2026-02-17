
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, trend, color = "blue" }) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
    purple: "text-purple-400",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm hover:border-gray-700 transition-colors">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <h3 className={`text-2xl font-bold font-mono ${colorMap[color] || "text-white"}`}>{value}</h3>
        {trend && (
          <span className={`text-xs mb-1 ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend === 'up' ? '▲' : '▼'}
          </span>
        )}
      </div>
      {subtext && <p className="text-[10px] text-gray-600 font-mono mt-1">{subtext}</p>}
    </div>
  );
};

export default MetricCard;
