import { BreathingPhase, PatternId } from '../types';

// Advanced Neuro-acoustic Engine 2.1
// Features: Pink Noise Breath + DYNAMIC Binaural Beats + Spatial Delay

let audioCtx: AudioContext | null = null;

// Nodes
let leftOsc: OscillatorNode | null = null;
let rightOsc: OscillatorNode | null = null;
let binauralGain: GainNode | null = null;

// Breath Synth
let breathNoiseNode: AudioBufferSourceNode | null = null;
let breathFilter: BiquadFilterNode | null = null;
let breathGain: GainNode | null = null;
let breathPanner: StereoPannerNode | null = null;

// FX Bus (Spatial)
let delayNode: DelayNode | null = null;
let feedbackGain: GainNode | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;

const BASE_FREQ = 110; // A2 (Deep resonance)

export type SoundType = 'pink' | 'white' | 'brown';

// Mapeamento de Frequências Cerebrais por Padrão
const getBinauralFreq = (patternId: PatternId): number => {
    switch (patternId) {
        case PatternId.RELAX_478: return 3;   // Delta (Sono profundo)
        case PatternId.BOX: return 10;        // Alpha (Foco calmo)
        case PatternId.PERFORMANCE: return 15;// Beta (Alerta)
        case PatternId.COHERENT: 
        default: return 5.5;                  // Theta (Hipnótico/Meditativo)
    }
};

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

const createNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    const bufferSize = 2 * ctx.sampleRate; // 2 segundos
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pink Noise Algorithm
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; 
        b6 = white * 0.115926;
    }
    return buffer;
}

export const startSound = (soundType: SoundType = 'pink', patternId: PatternId = PatternId.COHERENT) => {
  if (!audioCtx) initAudio();
  if (audioCtx?.state === 'suspended') audioCtx.resume();
  
  stopSound(); // Limpa anteriores

  const now = audioCtx!.currentTime;
  const binauralBeat = getBinauralFreq(patternId);

  // --- MASTER BUS ---
  masterCompressor = audioCtx!.createDynamicsCompressor();
  masterCompressor.threshold.value = -24;
  masterCompressor.knee.value = 30;
  masterCompressor.ratio.value = 12;
  masterCompressor.attack.value = 0.003;
  masterCompressor.release.value = 0.25;
  masterCompressor.connect(audioCtx!.destination);

  // --- FX BUS (Spatial Delay) ---
  delayNode = audioCtx!.createDelay();
  delayNode.delayTime.value = 0.45; // 450ms delay (Large Hall)
  
  feedbackGain = audioCtx!.createGain();
  feedbackGain.gain.value = 0.25;

  // Delay Loop
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);
  delayNode.connect(masterCompressor); 

  // --- LAYER 1: BINAURAL DRONE ---
  binauralGain = audioCtx!.createGain();
  binauralGain.gain.setValueAtTime(0, now);
  binauralGain.gain.linearRampToValueAtTime(0.06, now + 4); // Fade in suave
  binauralGain.connect(masterCompressor);

  leftOsc = audioCtx!.createOscillator();
  const leftPan = audioCtx!.createStereoPanner();
  leftOsc.type = 'sine';
  leftOsc.frequency.setValueAtTime(BASE_FREQ, now);
  leftPan.pan.value = -0.8; // Wide separation
  leftOsc.connect(leftPan).connect(binauralGain);

  rightOsc = audioCtx!.createOscillator();
  const rightPan = audioCtx!.createStereoPanner();
  rightOsc.type = 'sine';
  rightOsc.frequency.setValueAtTime(BASE_FREQ + binauralBeat, now);
  rightPan.pan.value = 0.8;
  rightOsc.connect(rightPan).connect(binauralGain);

  leftOsc.start();
  rightOsc.start();

  // --- LAYER 2: BREATH SYNTH ---
  const buffer = createNoiseBuffer(audioCtx!);
  breathNoiseNode = audioCtx!.createBufferSource();
  breathNoiseNode.buffer = buffer;
  breathNoiseNode.loop = true;

  breathFilter = audioCtx!.createBiquadFilter();
  breathFilter.type = 'lowpass';
  breathFilter.frequency.setValueAtTime(120, now); 
  breathFilter.Q.value = 0.8;

  breathGain = audioCtx!.createGain();
  breathGain.gain.setValueAtTime(0, now);

  breathPanner = audioCtx!.createStereoPanner();
  breathPanner.pan.value = 0;

  // Roteamento
  breathNoiseNode
    .connect(breathFilter)
    .connect(breathGain)
    .connect(breathPanner);
  
  breathPanner.connect(masterCompressor); // Dry
  breathPanner.connect(delayNode); // Wet

  breathNoiseNode.start();
};

export const updateSoundType = (soundType: SoundType) => {};

export const stopSound = () => {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Fade out elegante para evitar 'pop'
  if (binauralGain) binauralGain.gain.setTargetAtTime(0, now, 0.3);
  if (breathGain) breathGain.gain.setTargetAtTime(0, now, 0.3);

  setTimeout(() => {
    leftOsc?.stop(); rightOsc?.stop(); breathNoiseNode?.stop();
    leftOsc = null; rightOsc = null; breathNoiseNode = null; 
    breathFilter = null; breathGain = null; binauralGain = null;
    delayNode = null;
  }, 1000);
};

export const modulateSound = (phase: BreathingPhase, duration: number) => {
  if (!breathFilter || !breathGain || !audioCtx) return;
  const now = audioCtx.currentTime;

  breathFilter.frequency.cancelScheduledValues(now);
  breathGain.gain.cancelScheduledValues(now);
  if (breathPanner) breathPanner.pan.cancelScheduledValues(now);

  if (phase === BreathingPhase.INHALE) {
      // INHALE: Som abre e se expande
      breathGain.gain.setTargetAtTime(0.4, now, duration * 0.25);
      
      breathFilter.frequency.setValueAtTime(breathFilter.frequency.value, now);
      breathFilter.frequency.exponentialRampToValueAtTime(750, now + duration);

      // Sutil movimento estéreo
      if (breathPanner) {
        breathPanner.pan.setValueAtTime(0, now);
        breathPanner.pan.linearRampToValueAtTime(0.15, now + duration);
      }

  } else if (phase === BreathingPhase.EXHALE) {
      // EXHALE: Som fecha e relaxa
      breathGain.gain.setValueAtTime(breathGain.gain.value, now);
      breathGain.gain.setTargetAtTime(0, now + duration * 0.7, 0.25); 
      
      breathFilter.frequency.setValueAtTime(breathFilter.frequency.value, now);
      breathFilter.frequency.exponentialRampToValueAtTime(80, now + duration);

      if (breathPanner) {
        breathPanner.pan.linearRampToValueAtTime(-0.15, now + duration);
      }

  } else {
      // HOLD
      breathGain.gain.setTargetAtTime(0, now, 0.1);
  }
};