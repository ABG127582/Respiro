import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Activity, Brain, Trash2 } from 'lucide-react';
import { getHistory, SavedSession } from '../services/storageService';

interface HistoryModalProps {
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    setSessions(getHistory());
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const clearHistory = () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
        localStorage.removeItem('respiro_sessions_v1');
        setSessions([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in slide-in-from-right duration-300 sm:items-end">
      <div className="w-full sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="text-cyan-400" size={20}/> Histórico
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <Activity size={48} className="mb-4" strokeWidth={1} />
              <p>Nenhuma sessão registrada.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{session.patternName}</h3>
                    <span className="text-xs text-slate-400">{formatDate(session.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-slate-700">
                    <Clock size={10} />
                    {formatDuration(session.durationSeconds)}
                  </div>
                </div>
                
                <div className="flex gap-4 mb-3">
                   <div className="flex items-center gap-1.5">
                      <Brain size={14} className="text-indigo-400" />
                      <span className="text-xs text-slate-300">Score: <b className="text-white">{Math.round(session.vagalScore)}</b></span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button onClick={clearHistory} className="w-full py-3 flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors text-sm">
                    <Trash2 size={16} /> Limpar Histórico
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;