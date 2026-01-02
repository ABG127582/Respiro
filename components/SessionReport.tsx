import React, { useState } from 'react';
import { BiofeedbackData, UserState } from '../types';
import { ArrowDown, ArrowUp, CheckCircle, Activity, Brain } from 'lucide-react';
import { saveSession } from '../services/storageService';

interface SessionReportProps {
  initialData: BiofeedbackData | null;
  finalData: BiofeedbackData | null;
  durationSeconds: number;
  patternName: string;
  onClose: () => void;
}

const SessionReport: React.FC<SessionReportProps> = ({ initialData, finalData, durationSeconds, patternName, onClose }) => {
  const [isSaved, setIsSaved] = useState(false);
  
  // Calculate stats
  const hrDiff = (finalData?.heartRate || 0) - (initialData?.heartRate || 0);
  const hrvDiff = (finalData?.hrv || 0) - (initialData?.hrv || 0);
  
  // Vagal Score
  const vagalScore = Math.min(100, Math.max(0, 
    50 + (hrvDiff * 2) - (hrDiff * 2)
  ));

  const handleClose = () => {
      // Save to local storage before closing
      if (!isSaved) {
          saveSession({
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              durationSeconds,
              patternName,
              vagalScore
          });
          setIsSaved(true);
      }
      onClose();
  };

  if (!initialData || !finalData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-800 border border-slate-600 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 ring-1 ring-emerald-500/50">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Sessão Concluída</h2>
          <p className="text-slate-400 text-sm mt-1">{Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s de prática neuro-acústica</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Freq. Cardíaca</span>
              <Activity size={14} className="text-rose-400" />
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-2xl font-mono text-white">{finalData.heartRate}</span>
              <span className={`text-xs font-bold mb-1 flex items-center ${hrDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {hrDiff <= 0 ? <ArrowDown size={12}/> : <ArrowUp size={12}/>}
                {Math.abs(hrDiff)} bpm
              </span>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
             <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Coerência VFC</span>
              <Brain size={14} className="text-indigo-400" />
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-2xl font-mono text-white">{finalData.hrv}</span>
              <span className={`text-xs font-bold mb-1 flex items-center ${hrvDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hrvDiff >= 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                {Math.abs(hrvDiff)} ms
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleClose}
          className="w-full py-4 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors"
        >
          Salvar no Histórico e Fechar
        </button>

      </div>
    </div>
  );
};

export default SessionReport;