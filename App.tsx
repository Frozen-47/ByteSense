import React, { useState, useCallback, useEffect } from 'react';
import { Activity, Download, Upload, RotateCcw, Zap, Globe, Wifi } from 'lucide-react';
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
      case TestPhase.PING: return 'PING';
      case TestPhase.DOWNLOAD: return 'DOWNLOAD';
      case TestPhase.UPLOAD: return 'UPLOAD';
      case TestPhase.COMPLETED: return 'FINISHED';
      default: return 'IDLE';
    }
  };

  const getGaugeColor = () => {
    switch (phase) {
      case TestPhase.PING: return 'var(--ping)';
      case TestPhase.DOWNLOAD: return 'var(--accent)';
      case TestPhase.UPLOAD: return 'var(--upload)';
      default: return 'var(--accent)';
    }
  };

  const gaugeValue = () => {
    if (phase === TestPhase.DOWNLOAD || phase === TestPhase.UPLOAD) return currentSpeed;
    if (phase === TestPhase.COMPLETED && results) return results.download;
    return 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-primary font-sans selection:bg-accent selection:text-background">
      
      {/* 1. Navbar */}
      <nav className="w-full h-20 px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Zap className="text-white w-6 h-6 fill-white" />
          <span className="text-2xl font-black tracking-tighter text-white">VPNSPEED</span>
        </div>
        <div className="hidden md:flex gap-8 text-[11px] font-bold text-secondary uppercase tracking-widest">
          <span className="hover:text-white cursor-pointer transition-colors">Apps</span>
          <span className="hover:text-white cursor-pointer transition-colors">Analysis</span>
          <span className="hover:text-white cursor-pointer transition-colors">Network</span>
          <span className="hover:text-white cursor-pointer transition-colors">Developers</span>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-4 gap-8 mb-12">
        
        {/* UPPER SECTION: Gauge & GO Button */}
        <div className="relative w-full flex flex-col items-center justify-center min-h-[380px]">
          <Gauge 
            value={gaugeValue()} 
            max={500} 
            unit="Mbps" 
            label={getPhaseLabel()} 
            color={getGaugeColor()}
          />

          {/* Central GO Button Overlay */}
          {(phase === TestPhase.IDLE || phase === TestPhase.COMPLETED) && (
            <div className="absolute inset-0 flex items-center justify-center pt-6 z-10">
              <button
                onClick={startTest}
                className="w-24 h-24 rounded-full border-[3px] border-white/10 bg-transparent text-white 
                           hover:border-accent hover:text-accent transition-all duration-200 
                           flex items-center justify-center group"
              >
                <span className="text-2xl font-black tracking-tighter group-hover:scale-110 transition-transform">
                  {phase === TestPhase.COMPLETED ? <RotateCcw size={28} /> : 'GO'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* LOWER SECTION: Results Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Ping Card */}
          <div className="bg-card p-6 flex flex-col items-center justify-center border-t-2 border-ping shadow-lg min-h-[140px]">
            <div className="flex items-center gap-2 mb-2 text-secondary">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ping</span>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">
              {results?.ping ?? (phase === TestPhase.PING ? <span className="animate-pulse">...</span> : '-')}
              <span className="text-lg font-medium text-secondary ml-2">ms</span>
            </div>
          </div>

          {/* Download Card */}
          <div className="bg-card p-6 flex flex-col items-center justify-centerQB border-t-2 border-accent shadow-lg min-h-[140px]">
            <div className="flex items-center gap-2 mb-2 text-secondary">
              <Download className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Download</span>
            </div>
            <div className={`text-4xl font-black tracking-tight ${phase === TestPhase.DOWNLOAD ? 'text-accent' : 'text-white'}`}>
              {results?.download ?? (phase === TestPhase.DOWNLOAD ? currentSpeed.toFixed(1) : '-')}
              <span className="text-lg font-medium text-secondary ml-2">Mbps</span>
            </div>
          </div>

          {/* Upload Card */}
          <div className="bg-card p-6 flex flex-col items-center justify-center border-t-2 border-upload shadow-lg min-h-[140px]">
            <div className="flex items-center gap-2 mb-2 text-secondary">
              <Upload className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
            </div>
            <div className={`text-4xl font-black tracking-tight ${phase === TestPhase.UPLOAD ? 'text-upload' : 'text-white'}`}>
              {results?.upload ?? (phase === TestPhase.UPLOAD ? currentSpeed.toFixed(1) : '-')}
              <span className="text-lg font-medium text-secondary ml-2">Mbps</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Info & Graph */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
           
           {/* Connection Info */}
           <div className="bg-card p-6 shadow-lg border border-border/10 flex flex-col justify-between min-h-[250px]">
              <div>
                <h3 className="text-white text-[11px] font-bold uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                  Connection Details
                </h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-[10px] font-bold uppercase tracking-wider">Server</span>
                    <div className="flex items-center gap-2">
                       <Globe className="w-3 h-3 text-accent" />
                       <span className="text-white text-xs font-bold">Cloudflare Edge</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-[10px] font-bold uppercase tracking-wider">Status</span>
                    <div className="flex items-center gap-2">
                       <Wifi className="w-3 h-3 text-accent" />
                       <span className="text-accent text-xs font-bold">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-secondary/30 text-[10px] font-bold uppercase tracking-widest">
                ID: {results ? Math.random().toString(36).slice(2, 8).toUpperCase() : '---'}
              </div>
           </div>

           {/* History Graph */}
           <div className="lg:col-span-2 bg-card p-6 shadow-lg border border-border/10 min-h-[250px]">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-[11px] font-bold uppercase tracking-widest">History Chart</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-sm"></div>
                      <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">DL</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-upload rounded-sm"></div>
                      <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">UL</span>
                   </div>
                </div>
             </div>
             <div className="h-[200px] w-full">
               <HistoryChart data={history} />
             </div>
           </div>

        </div>
      </main>

    </div>
  );
};

export default App;