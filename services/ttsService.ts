// Serviço de Text-to-Speech (Sintetizador de Voz)
// Permite acessibilidade e prática de olhos fechados

let synth: SpeechSynthesis | null = null;
let voice: SpeechSynthesisVoice | null = null;

export const initTTS = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synth = window.speechSynthesis;
    // Tenta carregar vozes (pode ser assíncrono em alguns navegadores)
    const loadVoices = () => {
      const voices = synth?.getVoices() || [];
      // Tenta achar uma voz feminina em português ou inglês suave, ou a padrão
      voice = voices.find(v => v.lang.includes('pt-BR') && v.name.includes('Google')) 
           || voices.find(v => v.lang.includes('pt-BR'))
           || voices.find(v => v.lang.includes('en-US'))
           || null;
    };
    
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }
};

export const speak = (text: string, volume: number = 0.5) => {
  if (!synth || !text) return;

  // Cancela falas anteriores para não encavalar (ex: troca rápida de fase)
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  
  utterance.volume = volume; // 0 a 1
  utterance.rate = 0.9; // Um pouco mais lento para ser relaxante
  utterance.pitch = 1.0; 

  synth.speak(utterance);
};

export const cancelSpeech = () => {
  if (synth) synth.cancel();
};