
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">VORTEX <span className="text-blue-500 font-normal">ENGINE</span></h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">High-Throughput Distribution</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYSTEM ONLINE
            </span>
            <div className="h-6 w-[1px] bg-gray-800"></div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-mono">NODE_ID</p>
              <p className="text-xs font-mono">VX-PRIME-001</p>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <footer className="border-t border-gray-900 bg-black/50 p-4 text-center">
        <p className="text-xs text-gray-600 font-mono">VORTEX SYSTEM v1.2.4 // POWERED BY GEMINI PRO // ZERO DATA LOSS PROTOCOL ACTIVE</p>
      </footer>
    </div>
  );
};

export default Layout;
