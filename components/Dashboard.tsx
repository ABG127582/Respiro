import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { BiofeedbackData, UserState } from '../types';
import { Activity, Heart, Brain, Waves } from 'lucide-react';

interface DashboardProps {
  data: BiofeedbackData[];
  currentState: UserState;
}

const Dashboard: React.FC<DashboardProps> = ({ data, currentState }) => {
  // Mais dados para um gráfico mais suave, mas apenas renderiza se houver dados
  const displayData = data.slice(-60); // Otimização: Reduzido de 80 para 60 pontos
  const latest = data[data.length - 1] || { heartRate: '--', hrv: '--', rsaAmplitude: '--' };
  
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const checkWidth = () => setShowChart(window.innerWidth >= 350); 
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Metrics Cards - Floating Glass */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        
        {/* Metric 1 */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
          <Heart size={18} className="text-rose-300 mb-2 opacity-80" />
          <span className="text-2xl font-light text-white tracking-tight">{latest.heartRate}</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400">BPM</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
           <Brain size={18} className="text-emerald-300 mb-2 opacity-80" />
           <span className="text-2xl font-light text-white tracking-tight">{latest.hrv}</span>
           <span className="text-[10px] uppercase tracking-widest text-slate-400">VFC</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
           <Waves size={18} className="text-cyan-300 mb-2 opacity-80" />
           <span className="text-2xl font-light text-white tracking-tight">{latest.rsaAmplitude}</span>
           <span className="text-[10px] uppercase tracking-widest text-slate-400">Amp</span>
        </div>

        {/* Metric 4 (State) */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
           <Activity size={18} className="text-indigo-300 mb-2 opacity-80" />
           <span className="text-xs font-bold text-white text-center leading-tight mb-1">{currentState}</span>
           <span className="text-[10px] uppercase tracking-widest text-slate-400">Estado</span>
        </div>
      </div>

      {/* Chart Area - Minimalist */}
      {showChart && displayData.length > 5 && (
        <div className="h-48 w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-4 relative overflow-hidden">
             {/* Subtle Label */}
            <div className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 z-10">
                Coerência em Tempo Real
            </div>

            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
                <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={['auto', 'auto']} hide width={0} />
                <Area 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#fb7185" // Rose 400
                    strokeWidth={2} 
                    fill="url(#colorHr)" 
                    isAnimationActive={false}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// CRITICAL: Memoize to prevent high-frequency re-renders from Recharts
export default React.memo(Dashboard);