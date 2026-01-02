import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Wind, ShieldAlert, Waves, CheckSquare, History, Info, Mic, Sliders } from 'lucide-react';
import { BreathingPhase, PatternId, UserState } from './types';
import BreathingCircle from './components/BreathingCircle';
import Dashboard from './components/Dashboard';
import SessionReport from './components/SessionReport';
import ParticleCanvas from './components/ParticleCanvas';
import SOSModal from './components/SOSModal';
import HistoryModal from './components/HistoryModal';
import PatternSelector from './components/PatternSelector';
import PatternInfoModal from './components/PatternInfoModal';
import * as TTSService from './services/ttsService';
import { useBreathingEngine } from './hooks/useBreathingEngine';
import { useWakeLock } from './hooks/useWakeLock';
import { useZenMode } from './hooks/useZenMode';
import { useSettings } from './contexts/SettingsContext';
import { usePatternManager } from './hooks/usePatternManager';

const App: React.FC = () => {
  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPatternInfo, setShowPatternInfo] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showTuner, setShowTuner] = useState(false); // Novo controle de simulação
  
  // Logic
  const settings = useSettings();
  const patternManager = usePatternManager();

  const { 
    phase, 
    phaseDuration, 
    biofeedbackHistory, 
    startMetrics, 
    sessionStartTime,
    resetSession
  } = useBreathingEngine({
    isPlaying,
    currentPattern: patternManager.currentPattern,
    isAdaptive: settings.isAdaptive,
    breathCycleDuration: settings.breathCycleDuration,
    simulatedStress: settings.simulatedStress,
    isAudioEnabled: settings.isAudioEnabled,
    isVoiceEnabled: settings.isVoiceEnabled,
    isHapticsEnabled: settings.isHapticsEnabled,
    soundType: settings.soundType
  });

  useWakeLock(isPlaying);
  const isUiVisible = useZenMode(isPlaying, 4000);

  useEffect(() => {
    TTSService.initTTS();
  }, []);

  const handleFinishSession = () => { 
    setIsPlaying(false); 
    setShowReport(true); 
  };

  const handleCloseReport = () => {
    setShowReport(false);
    resetSession();
  };

  const getInstructions = () => {
    if (!isPlaying) return "Toque para iniciar";
    if (phase === BreathingPhase.INHALE) return `Inspirar`; // Simplificado
    if (phase === BreathingPhase.HOLD_IN) return "Segurar";
    if (phase === BreathingPhase.EXHALE) return `Soltar`;
    if (phase === BreathingPhase.HOLD_OUT) return "Pausa";
    return "";
  };

  const latestCoherence = biofeedbackHistory.length > 0 ? biofeedbackHistory[biofeedbackHistory.length-1].rsaAmplitude : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter relative flex flex-col overflow-hidden selection:bg-cyan-500/30">
      
      {/* Background Deep Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-950 to-slate-950 z-0"></div>
      
      <ParticleCanvas phase={isPlaying ? phase : BreathingPhase.HOLD_OUT} color={patternManager.currentPattern.color} intensity={Math.min(latestCoherence / 15, 1)} />

      {/* Header Floating */}
      <header className={`px-6 pt-6 flex justify-between items-center z-20 transition-all duration-700 ${isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
        <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity cursor-default">
          <Wind className="text-cyan-400 w-5 h-5" />
          <h1 className="text-lg font-light tracking-wide">Respiro</h1>
        </div>
        
        {/* Top Controls Group */}
        <div className="flex items-center space-x-3">
           <button onClick={() => { setIsPlaying(false); setShowSOSModal(true); }} className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 border border-rose-500/20">
              <ShieldAlert size={18} />
           </button>
           
           <button onClick={() => setShowHistoryModal(true)} className="p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300 backdrop-blur-md">
              <History size={18} />
           </button>

           <div className="flex items-center space-x-1 bg-slate-800/30 p-1.5 rounded-full backdrop-blur-md border border-white/5">
              <button onClick={settings.toggleVoice} className={`p-2 rounded-full transition-all ${settings.isVoiceEnabled ? 'text-amber-300 bg-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}><Mic size={16} /></button>
              <button onClick={settings.toggleHaptics} className={`p-2 rounded-full transition-all ${settings.isHapticsEnabled ? 'text-emerald-300 bg-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}><Waves size={16} /></button>
              <button onClick={settings.toggleAudio} className={`p-2 rounded-full transition-all ${settings.isAudioEnabled ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}>{settings.isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
           </div>
        </div>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-lg mx-auto">
        
        <div className="relative flex items-center justify-center mb-10 sm:mb-0">
           <BreathingCircle 
              phase={isPlaying ? phase : BreathingPhase.INHALE} 
              pattern={patternManager.currentPattern} 
              duration={phaseDuration / 1000} 
              progress={0} 
              instructions={getInstructions()} 
              coherenceScore={latestCoherence} 
           />
           
           {!isPlaying && (
             <button onClick={() => setIsPlaying(true)} className="absolute w-20 h-20 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-2xl hover:bg-white/10 hover:scale-110 transition-all duration-500 group z-30">
                <Play fill="currentColor" size={32} className="ml-1 opacity-90" />
             </button>
           )}
        </div>

        {/* Bottom Floating Controls */}
        <div className={`absolute bottom-8 left-4 right-4 transition-all duration-700 ease-out ${isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            
            {/* Tuner / Settings Toggle */}
            <div className="flex justify-center mb-4">
               {isPlaying && (
                 <button 
                  onClick={() => setShowTuner(!showTuner)} 
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors border ${showTuner ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}
                 >
                   <Sliders size={12} /> Sintonia
                 </button>
               )}
            </div>

            {/* Simulation Tuner Panel */}
            {showTuner && isPlaying && (
               <div className="mb-4 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-700/50 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Nível de Estresse Simulado</span>
                    <span className="text-xs font-mono text-indigo-300">{(settings.simulatedStress * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={settings.simulatedStress} 
                    onChange={(e) => settings.setSimulatedStress(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                  <p className="text-[10px] text-slate-500 mt-2 text-center">Ajuste para testar como o app reage a diferentes estados fisiológicos.</p>
               </div>
            )}

            {/* Pattern Controls (Coherent only) */}
            {!isPlaying && patternManager.currentPatternId === PatternId.COHERENT && (
              <div className="mb-4 flex justify-center">
                 <div className="bg-slate-800/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center space-x-3">
                    <span className="text-xs text-slate-400">Ritmo</span>
                    <input 
                      type="range" min="8" max="14" step="0.5" 
                      value={settings.breathCycleDuration} 
                      onChange={(e) => settings.setBreathCycleDuration(parseFloat(e.target.value))} 
                      className="w-24 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                    />
                    <span className="text-xs font-mono text-cyan-300 w-8 text-right">{settings.breathCycleDuration}s</span>
                 </div>
              </div>
            )}

            {/* Pattern Selector */}
            {!isPlaying && (
              <PatternSelector 
                  currentPatternId={patternManager.currentPatternId}
                  onSelect={patternManager.setCurrentPatternId}
                  onOpenInfo={() => setShowPatternInfo(true)}
              />
            )}

            {/* Active Controls */}
            {isPlaying ? (
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-xs font-medium text-slate-300">Sessão Ativa</span>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => setIsPlaying(false)} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"><Pause size={18} /></button>
                           <button onClick={handleFinishSession} className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors"><CheckSquare size={18} /></button>
                        </div>
                    </div>
                    <Dashboard data={biofeedbackHistory} currentState={biofeedbackHistory.length > 0 ? biofeedbackHistory[biofeedbackHistory.length-1].state : UserState.BALANCED} />
                </div>
            ) : (
                 <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 p-4 shadow-2xl">
                    <div className="text-center mb-2">
                       <span className="text-[10px] uppercase tracking-widest text-slate-500">Última leitura</span>
                    </div>
                    <Dashboard data={biofeedbackHistory} currentState={UserState.BALANCED} />
                 </div>
            )}
        </div>

        {/* Modals */}
        {showReport && (
          <SessionReport 
            initialData={startMetrics || biofeedbackHistory[0]} 
            finalData={biofeedbackHistory[biofeedbackHistory.length - 1]} 
            durationSeconds={Math.floor((Date.now() - (sessionStartTime || 0)) / 1000)} 
            patternName={patternManager.currentPattern.name} 
            onClose={handleCloseReport} 
          />
        )}

        {showSOSModal && <SOSModal onClose={() => setShowSOSModal(false)} />}
        {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} />}
        {showPatternInfo && <PatternInfoModal pattern={patternManager.currentPattern} onClose={() => setShowPatternInfo(false)} />}
      </main>
    </div>
  );
};

export default App;