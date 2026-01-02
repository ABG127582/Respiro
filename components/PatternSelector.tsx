import React from 'react';
import { Wind, Moon, Zap, ShieldAlert, Info } from 'lucide-react';
import { BreathingPattern, PatternId } from '../types';
import { BREATHING_PATTERNS } from '../constants';

interface PatternSelectorProps {
  currentPatternId: PatternId;
  onSelect: (id: PatternId) => void;
  onOpenInfo: () => void;
}

const PatternSelector: React.FC<PatternSelectorProps> = ({ currentPatternId, onSelect, onOpenInfo }) => {
  return (
    <div className="mb-4">
        {/* Header do Seletor com Botão de Info */}
        <div className="flex items-center justify-between px-6 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Padrão Selecionado</span>
            <button 
                onClick={onOpenInfo}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/30 px-2 py-1 rounded-full border border-cyan-900"
            >
                <Info size={12} />
                <span>Sobre este padrão</span>
            </button>
        </div>

        <div className="flex overflow-x-auto gap-3 px-6 pb-2 no-scrollbar snap-x snap-mandatory">
            {(Object.values(BREATHING_PATTERNS) as BreathingPattern[]).map((p) => {
                const isActive = currentPatternId === p.id;
                const Icon = p.id === PatternId.RELAX_478 ? Moon : p.id === PatternId.PERFORMANCE ? Zap : p.id === PatternId.PANIC_RESCUE ? ShieldAlert : Wind;
                
                return (
                <button 
                    key={p.id} 
                    onClick={() => onSelect(p.id)} 
                    className={`
                        relative flex-shrink-0 snap-center flex flex-col items-center justify-center 
                        w-24 h-20 rounded-xl border transition-all duration-300
                        ${isActive 
                            ? 'bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-105' 
                            : 'bg-slate-800/40 border-slate-700/50 opacity-60 hover:opacity-80 hover:bg-slate-800/60'
                        }
                    `}
                >
                    <Icon size={20} className={`mb-1 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className={`text-[10px] text-center leading-tight px-1 font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {p.name}
                    </span>
                    
                    {/* Indicador de Seleção Ativa */}
                    {isActive && (
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-500"></div>
                    )}
                </button>
                );
            })}
        </div>
    </div>
  );
};

export default PatternSelector;