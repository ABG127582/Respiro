import React, { useState, useEffect } from 'react';
import { X, Wind, Eye, FileText, Phone, ChevronRight, CheckCircle2, Lock, Unlock, AlertTriangle, MapPin, LifeBuoy, ExternalLink } from 'lucide-react';
import { saveCrisisPlan, getCrisisPlan } from '../services/storageService';

interface SOSModalProps {
  onClose: () => void;
}

type Tab = 'breath' | 'grounding' | 'plan' | 'resources';

const SOSModal: React.FC<SOSModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('breath');
  const [planText, setPlanText] = useState("");
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  
  // Location State
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  
  // Grounding State
  const [groundingStep, setGroundingStep] = useState(0);
  
  // Simple Breath Animation State
  const [breathState, setBreathState] = useState<'in' | 'out'>('in');
  
  useEffect(() => {
    setPlanText(getCrisisPlan());
  }, []);

  // Simple Breathing Loop for SOS (3s In, 6s Out)
  useEffect(() => {
    if (activeTab !== 'breath') return;
    
    let timeout: ReturnType<typeof setTimeout>;
    
    const runCycle = () => {
        setBreathState('in');
        timeout = setTimeout(() => {
            setBreathState('out');
            timeout = setTimeout(runCycle, 6000); // 6s Exhale
        }, 3000); // 3s Inhale
    };

    runCycle();
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const handleSavePlan = () => {
      saveCrisisPlan(planText);
      setIsEditingPlan(false);
  };

  const handleGetLocation = () => {
    setIsLoadingLoc(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoadingLoc(false);
      }, (error) => {
        console.error(error);
        setIsLoadingLoc(false);
        alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
      });
    } else {
      setIsLoadingLoc(false);
      alert('Geolocalização não suportada neste dispositivo.');
    }
  };

  const groundingSteps = [
      { count: 5, icon: <Eye size={24} />, text: "Coisas que você vê", hint: "Olhe ao redor e nomeie mentalmente." },
      { count: 4, icon: <Wind size={24} />, text: "Coisas que você toca", hint: "Sinta a textura da roupa, cadeira ou pele." },
      { count: 3, icon: <AlertTriangle size={24} />, text: "Sons que você ouve", hint: "Foque nos ruídos distantes ou próximos." },
      { count: 2, icon: <Wind size={24} />, text: "Cheiros que você sente", hint: "Ou suas fragrâncias favoritas imaginadas." },
      { count: 1, icon: <CheckCircle2 size={24} />, text: "Emoção boa", hint: "Uma coisa que você gosta em você." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in slide-in-from-bottom-10 duration-300">
      
      {/* Header SOS */}
      <div className="flex items-center justify-between p-4 bg-rose-900/20 border-b border-rose-500/30">
        <div className="flex items-center space-x-2 text-rose-500">
            <AlertTriangle className="animate-pulse" />
            <h2 className="font-bold text-lg tracking-wider">MODO SOS</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-slate-900 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('breath')} className={`flex-1 min-w-[80px] py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${activeTab === 'breath' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Wind size={18} /> Respirar
          </button>
          <button onClick={() => setActiveTab('grounding')} className={`flex-1 min-w-[80px] py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${activeTab === 'grounding' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Eye size={18} /> Aterrar
          </button>
          <button onClick={() => setActiveTab('plan')} className={`flex-1 min-w-[80px] py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${activeTab === 'plan' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <FileText size={18} /> Plano
          </button>
          <button onClick={() => setActiveTab('resources')} className={`flex-1 min-w-[80px] py-3 rounded-lg font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${activeTab === 'resources' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <LifeBuoy size={18} /> Ajuda
          </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative">
          
          {/* 1. BREATHING TAB */}
          {activeTab === 'breath' && (
              <div className="flex flex-col items-center w-full">
                  <div className="relative mb-12">
                      {/* Pulse Circle */}
                      <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-[3000ms] ease-in-out ${breathState === 'in' ? 'bg-rose-500/20 scale-100' : 'bg-rose-500/10 scale-50'}`}>
                          <div className={`w-48 h-48 rounded-full bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.5)] flex items-center justify-center transition-all duration-[6000ms] ease-out ${breathState === 'in' ? 'scale-100' : 'scale-50'}`}>
                              <span className="text-3xl font-bold text-white drop-shadow-md">
                                  {breathState === 'in' ? 'INSPIRAR' : 'SOLTAR'}
                              </span>
                          </div>
                      </div>
                  </div>
                  <p className="text-slate-400 text-center max-w-xs animate-pulse">
                      Siga o ritmo. Solte o ar devagar para acalmar seu sistema nervoso.
                  </p>
              </div>
          )}

          {/* 2. GROUNDING TAB */}
          {activeTab === 'grounding' && (
              <div className="w-full max-w-md h-full flex flex-col">
                  <h3 className="text-xl font-bold text-emerald-400 mb-6 text-center">Técnica 5-4-3-2-1</h3>
                  
                  {groundingStep < groundingSteps.length ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300" key={groundingStep}>
                          <div className="w-20 h-20 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 border border-emerald-500/50">
                             <span className="text-4xl font-bold">{groundingSteps[groundingStep].count}</span>
                          </div>
                          
                          <div className="text-center space-y-2">
                              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                                  {groundingSteps[groundingStep].icon}
                                  {groundingSteps[groundingStep].text}
                              </div>
                              <p className="text-slate-400">{groundingSteps[groundingStep].hint}</p>
                          </div>

                          <button 
                             onClick={() => setGroundingStep(prev => prev + 1)}
                             className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2"
                          >
                             Próximo <ChevronRight />
                          </button>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                          <CheckCircle2 size={64} className="text-emerald-400" />
                          <h3 className="text-2xl font-bold text-white">Excelente</h3>
                          <p className="text-slate-300">Você completou o ciclo de aterramento.</p>
                          <button onClick={() => setGroundingStep(0)} className="px-6 py-2 bg-slate-800 rounded-lg text-sm">Reiniciar</button>
                      </div>
                  )}
              </div>
          )}

          {/* 3. PLAN TAB */}
          {activeTab === 'plan' && (
              <div className="w-full max-w-md h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-indigo-400 font-bold flex items-center gap-2"><Phone size={18}/> Plano de Crise</h3>
                      <button onClick={() => isEditingPlan ? handleSavePlan() : setIsEditingPlan(true)} className="text-xs bg-slate-800 px-3 py-1 rounded-full flex items-center gap-1">
                          {isEditingPlan ? <><Unlock size={12}/> Salvar</> : <><Lock size={12}/> Editar</>}
                      </button>
                  </div>

                  {isEditingPlan ? (
                      <textarea 
                        value={planText}
                        onChange={(e) => setPlanText(e.target.value)}
                        placeholder="Escreva aqui:
- Contatos de emergência
- Lembretes (Isso vai passar)
- Remédios SOS
- Lugares seguros"
                        className="flex-1 w-full bg-slate-900/50 border border-indigo-500/50 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm leading-relaxed"
                      />
                  ) : (
                      <div className="flex-1 w-full bg-slate-800/30 border border-slate-700 rounded-xl p-6 overflow-y-auto">
                          {planText ? (
                              <pre className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed text-sm">
                                  {planText}
                              </pre>
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center opacity-60">
                                  <FileText size={48} className="mb-2" />
                                  <p>Nenhum plano salvo.</p>
                                  <p className="text-xs">Clique em "Editar" para adicionar contatos e instruções.</p>
                              </div>
                          )}
                      </div>
                  )}
                  
                  {!isEditingPlan && (
                     <div className="mt-4 p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 text-center">
                         Lembre-se: Você está seguro agora. Isso é temporário.
                     </div>
                  )}
              </div>
          )}

          {/* 4. RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="w-full max-w-md h-full flex flex-col space-y-4">
                
                {/* Emergency Numbers */}
                <div className="grid grid-cols-2 gap-4">
                    <a href="tel:188" className="bg-rose-900/30 border border-rose-500/30 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-rose-900/50 transition-colors group">
                        <span className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">188</span>
                        <span className="text-sm text-rose-300 uppercase tracking-wider font-bold mt-1">CVV</span>
                        <span className="text-[10px] text-rose-400/70">Apoio Emocional 24h</span>
                    </a>
                    <a href="tel:192" className="bg-rose-900/30 border border-rose-500/30 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-rose-900/50 transition-colors group">
                        <span className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">192</span>
                        <span className="text-sm text-rose-300 uppercase tracking-wider font-bold mt-1">SAMU</span>
                        <span className="text-[10px] text-rose-400/70">Emergência Médica</span>
                    </a>
                </div>

                {/* Location Finder */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                            <MapPin size={16} className="text-amber-400"/> Onde estou?
                        </span>
                        <button 
                            onClick={handleGetLocation} 
                            disabled={isLoadingLoc} 
                            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full text-white disabled:opacity-50 transition-colors"
                        >
                            {isLoadingLoc ? 'Buscando satélites...' : 'Ver Localização'}
                        </button>
                    </div>
                    
                    {location ? (
                        <div className="bg-slate-900/50 rounded-lg p-3 text-xs border border-slate-700/50">
                            <div className="grid grid-cols-2 gap-2 mb-2 font-mono text-slate-300">
                                <div>LAT: <span className="text-white">{location.lat.toFixed(6)}</span></div>
                                <div>LNG: <span className="text-white">{location.lng.toFixed(6)}</span></div>
                            </div>
                            <a 
                                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 underline"
                            >
                                Abrir no Google Maps <ExternalLink size={10} />
                            </a>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Clique no botão acima para obter suas coordenadas GPS exatas. Útil para informar serviços de emergência sobre sua posição.
                        </p>
                    )}
                </div>

                {/* Personal Anchor */}
                <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/20 p-6 rounded-xl border border-emerald-500/20 flex-1 flex flex-col justify-center text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30"></div>
                     <h4 className="text-emerald-400 font-bold mb-3 text-xs uppercase tracking-[0.2em] opacity-80">Lembrete Pessoal</h4>
                     <p className="text-lg text-slate-100 italic font-medium leading-relaxed drop-shadow-md">
                        "Isso é temporário. Eu já sobrevivi a dias difíceis antes. Eu estou seguro agora."
                     </p>
                </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default SOSModal;