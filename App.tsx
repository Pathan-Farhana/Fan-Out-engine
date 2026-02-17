
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Layout from './components/Layout';
import MetricCard from './components/MetricCard';
import SinkVisualizer from './components/SinkVisualizer';
import { SinkConfig, SinkType, DataFormat, EngineStats, LogEntry } from './types';
import { generateJavaImplementation, getArchitectureExplanation } from './services/geminiService';

const INITIAL_SINKS: SinkConfig[] = [
  { id: '1', type: SinkType.REST, format: DataFormat.JSON, rateLimit: 50, active: true, successCount: 0, failureCount: 0 },
  { id: '2', type: SinkType.GRPC, format: DataFormat.PROTOBUF, rateLimit: 200, active: true, successCount: 0, failureCount: 0 },
  { id: '3', type: SinkType.MQ, format: DataFormat.XML, rateLimit: 500, active: true, successCount: 0, failureCount: 0 },
  { id: '4', type: SinkType.WIDE_COLUMN, format: DataFormat.AVRO, rateLimit: 1200, active: true, successCount: 0, failureCount: 0 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'architecture' | 'code'>('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [sinks, setSinks] = useState<SinkConfig[]>(INITIAL_SINKS);
  const [stats, setStats] = useState<EngineStats>({
    totalProcessed: 0,
    currentThroughput: 0,
    bufferUsage: 0,
    startTime: Date.now(),
    uptime: 0
  });
  const [throughputHistory, setThroughputHistory] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiContent, setAiContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulation Logic
  useEffect(() => {
    // Fixed: Use 'any' type for interval to avoid NodeJS namespace issues in browser context
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setSinks(prevSinks => prevSinks.map(sink => {
          if (!sink.active) return sink;
          const processing = Math.floor(sink.rateLimit * (0.8 + Math.random() * 0.4));
          const failures = Math.random() < 0.01 ? Math.floor(processing * 0.05) : 0;
          return {
            ...sink,
            successCount: sink.successCount + (processing - failures),
            failureCount: sink.failureCount + failures
          };
        }));

        setStats(prev => {
          const totalInTick = sinks.reduce((acc, s) => acc + (s.active ? s.rateLimit : 0), 0);
          return {
            ...prev,
            totalProcessed: prev.totalProcessed + totalInTick,
            currentThroughput: totalInTick,
            bufferUsage: Math.min(100, 30 + Math.random() * 40), // Simulated backpressure
            uptime: Math.floor((Date.now() - prev.startTime) / 1000)
          };
        });

        setThroughputHistory(prev => {
          const newHistory = [...prev, { time: new Date().toLocaleTimeString(), val: stats.currentThroughput }];
          if (newHistory.length > 20) return newHistory.slice(1);
          return newHistory;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, sinks, stats.currentThroughput]);

  const addLog = useCallback((message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') => {
    setLogs(prev => [{ id: Math.random().toString(), timestamp: Date.now(), level, message }, ...prev].slice(0, 50));
  }, []);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
    addLog(isRunning ? 'Engine suspended by operator.' : 'Vortex engine initialization complete. Streaming 100GB source.', isRunning ? 'WARN' : 'INFO');
  };

  const loadImplementation = async (topic: string) => {
    setIsGenerating(true);
    const content = await generateJavaImplementation(topic);
    setAiContent(content);
    setIsGenerating(false);
    setActiveTab('code');
  };

  const loadArchitecture = async () => {
    setIsGenerating(true);
    const content = await getArchitectureExplanation();
    setAiContent(content);
    setIsGenerating(false);
    setActiveTab('architecture');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Controls & Main Stats */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
            >
              Control Dashboard
            </button>
            <button 
              onClick={loadArchitecture}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'architecture' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
            >
              Architecture Explainer
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
            >
              Code Lab
            </button>
          </div>

          <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-1.5 rounded-xl">
            <div className="px-3 flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono uppercase">Status:</span>
              <span className={`text-[10px] font-bold font-mono ${isRunning ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isRunning ? 'RUNNING' : 'IDLE'}
              </span>
            </div>
            <button 
              onClick={handleStartStop}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isRunning ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white shadow-md`}
            >
              {isRunning ? 'PAUSE ENGINE' : 'INITIATE ENGINE'}
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Stats Summary */}
            <div className="lg:col-span-1 space-y-4">
              <MetricCard label="Total Records Processed" value={stats.totalProcessed.toLocaleString()} subtext="AGGREGATED ACROSS ALL SINKS" trend="up" color="emerald" />
              <MetricCard label="System Throughput" value={`${stats.currentThroughput}/s`} subtext="RECORDS PER SECOND" trend={stats.currentThroughput > 1000 ? 'up' : 'neutral'} color="blue" />
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Buffer Pressure</p>
                <div className="relative h-4 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-1000 ${stats.bufferUsage > 80 ? 'bg-rose-500' : stats.bufferUsage > 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${stats.bufferUsage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-gray-500">
                  <span>{stats.bufferUsage.toFixed(1)}% CAPACITY</span>
                  <span>BACKPRESSURE: {stats.bufferUsage > 70 ? 'ACTIVE' : 'STABLE'}</span>
                </div>
              </div>
              <MetricCard label="Total Uptime" value={`${Math.floor(stats.uptime / 60)}m ${stats.uptime % 60}s`} subtext="SYSTEM STABILITY: 99.99%" color="purple" />
            </div>

            {/* Main Visualizer Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-[300px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    Real-time Throughput Analysis
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">SAMPLING RATE: 1000MS</span>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={throughputHistory}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sinks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sinks.map(sink => (
                  <SinkVisualizer key={sink.id} sink={sink} />
                ))}
              </div>

              {/* Logs */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Logs</span>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
                  </div>
                </div>
                <div className="h-40 overflow-y-auto p-4 font-mono text-[10px] space-y-1 scrollbar-hide">
                  {logs.length === 0 && <p className="text-gray-600">Waiting for engine start sequence...</p>}
                  {logs.map(log => (
                    <div key={log.id} className="flex gap-3">
                      <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={log.level === 'INFO' ? 'text-blue-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-rose-400'}>
                        [{log.level}]
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 min-h-[600px]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Architecture Blueprint</h2>
                <p className="text-gray-400 max-w-2xl">Visualizing the high-performance pipeline designed for the 100GB fan-out challenge.</p>
              </div>
              <button 
                disabled={isGenerating}
                onClick={loadArchitecture}
                className="px-4 py-2 bg-gray-800 rounded-lg text-xs hover:bg-gray-700 transition-colors"
              >
                {isGenerating ? 'ANALYZING...' : 'REFRESH ARCHITECTURE'}
              </button>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-mono animate-pulse">Gemini is synthesizing architectural insights...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono text-sm bg-black/40 p-6 rounded-xl border border-gray-800">
                      {aiContent || "Architecture details will appear here."}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-950 rounded-xl border border-gray-800 p-8 relative flex flex-col items-center justify-center gap-6 overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
                  </div>
                  
                  {/* Flow Diagram */}
                  <div className="z-10 w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-blue-600/20 border border-blue-500 text-blue-400 rounded-lg font-bold text-xs w-full text-center">
                        INGESTION LAYER (BufferedStream)
                      </div>
                      <div className="w-px h-8 bg-blue-500/50"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-emerald-600/20 border border-emerald-500 text-emerald-400 rounded-lg font-bold text-xs w-full text-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        TRANSFORMATION STRATEGIES (JSON, Proto, XML, Avro)
                      </div>
                      <div className="w-px h-8 bg-emerald-500/50"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-amber-600/20 border border-amber-500 text-amber-400 rounded-lg font-bold text-xs w-full text-center">
                        DISPATCHER (Virtual Threads + BlockingQueue)
                      </div>
                      <div className="w-px h-8 bg-amber-500/50"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-[10px] text-center">REST SINK</div>
                      <div className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-[10px] text-center">gRPC SINK</div>
                      <div className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-[10px] text-center">MQ SINK</div>
                      <div className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-[10px] text-center">CASSANDRA SINK</div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center text-[10px] text-gray-600 font-mono italic">
                    * Diagrams generated from engineering specifications.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl min-h-[600px] flex flex-col">
            <div className="border-b border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">Java Code Lab</h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => loadImplementation('Main Orchestrator with Virtual Threads')}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-xs font-mono hover:bg-blue-600/20 hover:border-blue-500 transition-all"
                >
                  Orchestrator.java
                </button>
                <button 
                  onClick={() => loadImplementation('Strategy Pattern for Format Transformers')}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-xs font-mono hover:bg-blue-600/20 hover:border-blue-500 transition-all"
                >
                  TransformerStrategies.java
                </button>
                <button 
                  onClick={() => loadImplementation('Throttling and Backpressure Logic')}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-xs font-mono hover:bg-blue-600/20 hover:border-blue-500 transition-all"
                >
                  FlowControl.java
                </button>
                <button 
                  onClick={() => loadImplementation('Retry Logic and Dead Letter Queue')}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-xs font-mono hover:bg-blue-600/20 hover:border-blue-500 transition-all"
                >
                  ResilienceManager.java
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-black/50 p-6 relative">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-mono text-gray-400">Compiling snippet with Gemini Intelligence...</p>
                  </div>
                </div>
              )}
              
              {!aiContent && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">Select a component to generate code</h3>
                  <p className="text-sm text-gray-600 max-w-sm mt-2">Get production-ready Java 21+ implementations using Gemini AI tailored for this challenge.</p>
                </div>
              ) : (
                <pre className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap select-all bg-gray-950 p-6 rounded-xl border border-gray-800">
                  <code>{aiContent}</code>
                </pre>
              )}
            </div>
            <div className="p-4 bg-gray-800/20 border-t border-gray-800 text-[10px] text-gray-600 flex justify-between items-center">
              <span>LANGUAGE: JAVA 21 (LONG-TERM SUPPORT)</span>
              <span>AI ASSISTANCE: GOOGLE GEMINI 3 PRO</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
