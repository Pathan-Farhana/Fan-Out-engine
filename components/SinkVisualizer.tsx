
import React from 'react';
import { SinkConfig, SinkType } from '../types';

interface SinkVisualizerProps {
  sink: SinkConfig;
}

const SinkVisualizer: React.FC<SinkVisualizerProps> = ({ sink }) => {
  const isHealthy = sink.failureCount / (sink.successCount + sink.failureCount || 1) < 0.1;

  return (
    <div className={`p-4 rounded-xl border transition-all ${sink.active ? 'bg-gray-900 border-gray-700' : 'bg-gray-950 border-gray-800 opacity-50'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-sm">{sink.type}</h4>
          <p className="text-[10px] text-gray-500 font-mono">FORMAT: {sink.format}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${sink.active ? (isHealthy ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-gray-700'}`}></div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-500 uppercase">Load Balance</span>
            <span className="text-gray-400">{sink.rateLimit} req/s</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (sink.rateLimit / 2000) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/30 p-2 rounded-lg">
            <p className="text-[9px] text-gray-600 uppercase">Success</p>
            <p className="text-xs font-mono text-emerald-400">{sink.successCount.toLocaleString()}</p>
          </div>
          <div className="bg-black/30 p-2 rounded-lg">
            <p className="text-[9px] text-gray-600 uppercase">Retries/Fail</p>
            <p className="text-xs font-mono text-rose-400">{sink.failureCount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinkVisualizer;
