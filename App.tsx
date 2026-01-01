import React, { useState, useCallback, useEffect } from 'react';
import { Activity, Download, Upload, RotateCcw, Zap, Info, ShieldCheck } from 'lucide-react';
import { SpeedResult, TestPhase, HistoryItem } from './types';
import { testPing, testDownload, testUpload } from './services/speedTestService';
import Gauge from './components/Gauge';
import HistoryChart from './components/HistoryChart';

const App: React.FC = () => {
  const [phase, setPhase] = useState<TestPhase>(TestPhase.IDLE);
  const [results, setResults] = useState<SpeedResult | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('speed_test_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveResult = (finalResult: SpeedResult) => {
    const newItem: HistoryItem = {
      ...finalResult,
      id: Math.random().toString(36).slice(2, 11)
    };
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('speed_test_history', JSON.stringify(newHistory));
  };

  const startTest = useCallback(async () => {
    if (phase !== TestPhase.IDLE && phase !== TestPhase.COMPLETED) return;

    setPhase(TestPhase.PING);
    setResults(null);
    setCurrentSpeed(0);

    const pingResult = await testPing();
    
    setPhase(TestPhase.DOWNLOAD);
    const dlResult = await testDownload((s) => setCurrentSpeed(s));
    
    setPhase(TestPhase.UPLOAD);
    setCurrentSpeed(0);
    const ulResult = await testUpload((s) => setCurrentSpeed(s));

    const finalResult: SpeedResult = {
      ping: pingResult,
      download: dlResult,
      upload: ulResult,
      timestamp: Date.now()
    };

    setResults(finalResult);
    setPhase(TestPhase.COMPLETED);
    setCurrentSpeed(0);
    saveResult(finalResult);
  }, [phase, history]);

  const getPhaseLabel = () => {
    switch (phase) {
      case TestPhase.PING: return 'Measuring Latency...';
      case TestPhase.DOWNLOAD: return 'Testing Download Speed...';
      case TestPhase.UPLOAD: return 'Testing Upload Speed...';
      case TestPhase.COMPLETED: return 'Test Complete';
      default: return 'Ready to test';
    }
  };

  const getProgressColor = () => {
    switch (phase) {
      case TestPhase.PING: return '#38bdf8'; // Sky-400
      case TestPhase.DOWNLOAD: return '#818cf8'; // Indigo-400
      case TestPhase.UPLOAD: return '#f472b6'; // Pink-400
      default: return '#38bdf8';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center py-12 px-4 bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full gradient-blur pointer-events-none opacity-40" />

      {/* Header */}
      <div className="max-w-4xl w-full flex flex-col items-center z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-surface p-2 rounded-xl border border-border shadow-lg">
            <Zap className="text-primary w-6 h-6 fill-current" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-primary">BYTESENSE</h1>
        </div>
        <p className="text-secondary text-sm font-medium mb-12">Next-Gen Internet Diagnostics</p>

        {/* Main Testing Area */}
        <div className="w-full bg-card/95 backdrop-blur-md border-2 border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-8 transition-all hover:border-primary/20">
          <div className="flex flex-col items-center">
            
            {/* Visual Gauge */}
            <div className="mb-8 scale-90 md:scale-100">
              <Gauge 
                value={phase === TestPhase.DOWNLOAD || phase === TestPhase.UPLOAD ? currentSpeed : (results ? (phase === TestPhase.COMPLETED ? results.download : 0) : 0)} 
                max={500} 
                unit="Mbps" 
                label={getPhaseLabel()} 
                color={getProgressColor()}
              />
            </div>

            {/* Test Controls */}
            <div className="w-full flex flex-col items-center">
              {phase === TestPhase.IDLE || phase === TestPhase.COMPLETED ? (
                <button
                  onClick={startTest}
                  className="group relative flex items-center gap-2 bg-surface hover:bg-border border border-border text-primary px-10 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                  {phase === TestPhase.COMPLETED ? (
                    <>
                      <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      Test Again
                    </>
                  ) : (
                    'Start Speed Test'
                  )}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            {/* Ping */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${phase === TestPhase.PING ? 'bg-surface border-primary/50' : 'bg-surface/30 border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-surface p-2 rounded-lg text-secondary border border-border">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-secondary font-bold text-xs uppercase tracking-widest">Ping</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">
                  {results?.ping ?? (phase === TestPhase.PING ? '-' : '0')}
                </span>
                <span className="text-muted text-sm font-medium">ms</span>
              </div>
            </div>

            {/* Download */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${phase === TestPhase.DOWNLOAD ? 'bg-surface border-primary/50' : 'bg-surface/30 border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-surface p-2 rounded-lg text-secondary border border-border">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-secondary font-bold text-xs uppercase tracking-widest">Download</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">
                  {results?.download ?? (phase === TestPhase.DOWNLOAD ? currentSpeed.toFixed(1) : '0')}
                </span>
                <span className="text-muted text-sm font-medium">Mbps</span>
              </div>
            </div>

            {/* Upload */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${phase === TestPhase.UPLOAD ? 'bg-surface border-primary/50' : 'bg-surface/30 border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-surface p-2 rounded-lg text-secondary border border-border">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-secondary font-bold text-xs uppercase tracking-widest">Upload</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">
                  {results?.upload ?? (phase === TestPhase.UPLOAD ? currentSpeed.toFixed(1) : '0')}
                </span>
                <span className="text-muted text-sm font-medium">Mbps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Meta Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <HistoryChart data={history} />
          
          <div className="bg-card border-2 border-border rounded-xl p-6 flex flex-col justify-between hover:border-primary/20 transition-colors">
             <div>
               <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-secondary" />
                  <h3 className="text-secondary text-xs font-bold uppercase tracking-wider">Connection Info</h3>
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-border pb-2">
                   <span className="text-muted text-xs font-medium">Server Location</span>
                   <span className="text-primary text-xs font-semibold">Cloudflare Edge (Global)</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-border pb-2">
                   <span className="text-muted text-xs font-medium">Network Protocol</span>
                   <span className="text-primary text-xs font-semibold">HTTPS / QUIC</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-muted text-xs font-medium">Status</span>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-successDot rounded-full animate-pulse" />
                     <span className="text-successDot text-xs font-semibold">Optimized</span>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="mt-6 flex items-center gap-2 text-[10px] text-muted uppercase tracking-widest">
               <ShieldCheck className="w-3 h-3" />
               SECURE ENCRYPTED MEASUREMENT
             </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-secondary text-[10px] uppercase tracking-[0.2em] font-bold">
            Powered by Bytesense Network Diagnostics Engine v3.0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;