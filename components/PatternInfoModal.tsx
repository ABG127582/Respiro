import React from 'react';
import { X, Clock, Zap, Activity, BookOpen } from 'lucide-react';
import { BreathingPattern, BreathingPhase } from '../types';

interface PatternInfoModalProps {
  pattern: BreathingPattern;
  onClose: () => void;
}

const PatternInfoModal: React.FC<PatternInfoModalProps> = ({ pattern, onClose }) => {
  const timing = pattern.baseTiming;
  const cycleTime = timing[BreathingPhase.INHALE] + timing[BreathingPhase.HOLD_IN] + timing[BreathingPhase.EXHALE] + timing[BreathingPhase.HOLD_OUT];
  const breathsPerMinute = (60 / cycleTime).toFixed(1);

  // Helper para desenhar a barra de visualização do ciclo
  const getTotal = () => cycleTime;
  const getWidth = (time: number) => `${(time / getTotal()) * 100}%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header com Cor do Padrão */}
        <div className="relative p-6 pb-8" style={{ backgroundColor: `${pattern.color}20` }}>
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors">
                <X size={16} />
            </button>
            <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg" style={{ backgroundColor: pattern.color }}>
                    <BookOpen size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{pattern.name}</h2>
                <span className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: pattern.color }}>
                    {pattern.mechanism}
                </span>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
            
            {/* Visualização do Ciclo */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><Clock size={12}/> Ciclo Respiratório ({cycleTime}s)</h3>
                <div className="h-4 w-full flex rounded-full overflow-hidden bg-slate-800">
                    {timing[BreathingPhase.INHALE] > 0 && (
                        <div style={{ width: getWidth(timing[BreathingPhase.INHALE]) }} className="bg-cyan-500/80 border-r border-black/20" title="Inspire"/>
                    )}
                    {timing[BreathingPhase.HOLD_IN] > 0 && (
                        <div style={{ width: getWidth(timing[BreathingPhase.HOLD_IN]) }} className="bg-cyan-300/80 border-r border-black/20" title="Segure"/>
                    )}
                    {timing[BreathingPhase.EXHALE] > 0 && (
                        <div style={{ width: getWidth(timing[BreathingPhase.EXHALE]) }} className="bg-blue-500/80 border-r border-black/20" title="Expire"/>
                    )}
                    {timing[BreathingPhase.HOLD_OUT] > 0 && (
                        <div style={{ width: getWidth(timing[BreathingPhase.HOLD_OUT]) }} className="bg-slate-600/80" title="Pausa"/>
                    )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1 font-mono">
                    <span>Inspirar</span>
                    <span>Expirar</span>
                </div>
            </div>

            {/* Descrição */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-slate-300 leading-relaxed">
                    {pattern.description}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center">
                    <Zap size={18} className="text-amber-400 mb-1"/>
                    <span className="text-lg font-bold text-white">{breathsPerMinute}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Respirações/Min</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center">
                    <Activity size={18} className="text-emerald-400 mb-1"/>
                    <span className="text-lg font-bold text-white truncate w-full px-1">{pattern.mechanism}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Foco Fisiológico</span>
                </div>
            </div>

            <button onClick={onClose} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors text-sm">
                Entendi, vamos começar
            </button>
        </div>
      </div>
    </div>
  );
};

export default PatternInfoModal;