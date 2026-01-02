import { useState, useEffect, useRef, useCallback } from 'react';
import { BreathingPhase, BreathingPattern, BiofeedbackData, PatternId } from '../types';
import { generateBiofeedbackSample } from '../services/simulatedBiofeedback';
import * as AudioService from '../services/audioService';
import * as HapticService from '../services/hapticService';
import * as TTSService from '../services/ttsService';

interface UseBreathingEngineProps {
  isPlaying: boolean;
  currentPattern: BreathingPattern;
  isAdaptive: boolean;
  breathCycleDuration: number;
  simulatedStress: number;
  isAudioEnabled: boolean;
  isVoiceEnabled: boolean;
  isHapticsEnabled: boolean;
  soundType: AudioService.SoundType;
}

export const useBreathingEngine = ({
  isPlaying,
  currentPattern,
  isAdaptive,
  breathCycleDuration,
  simulatedStress,
  isAudioEnabled,
  isVoiceEnabled,
  isHapticsEnabled,
  soundType
}: UseBreathingEngineProps) => {
  
  // State
  const [phase, setPhase] = useState<BreathingPhase>(BreathingPhase.INHALE);
  const [biofeedbackHistory, setBiofeedbackHistory] = useState<BiofeedbackData[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [startMetrics, setStartMetrics] = useState<BiofeedbackData | null>(null);

  // Refs for timing loop
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseDurationRef = useRef<number>(5000); 
  const phaseStartTimeRef = useRef<number>(0);

  // -- Helpers --

  const getAdaptiveDuration = useCallback((baseDuration: number, currentPhase: BreathingPhase) => {
    // Coherence pattern override
    if (currentPattern.id === PatternId.COHERENT) return (breathCycleDuration * 1000) / 2;
    
    // Adaptive Logic
    if (!isAdaptive || baseDuration === 0) return baseDuration * 1000;
    
    const latestData = biofeedbackHistory[biofeedbackHistory.length - 1];
    const latestHR = latestData?.heartRate || 70;
    const rsaAmp = latestData?.rsaAmplitude || 0;

    // Se usuário está muito ansioso (HR alto, RSA baixo), mantém ritmo fixo para não desorientar
    if (latestHR > 95 && rsaAmp < 3) return baseDuration * 1000; 
    
    // Se está relaxando (Exhale), alonga levemente
    if (currentPhase === BreathingPhase.EXHALE && latestHR > 75) return (baseDuration + 0.5) * 1000;
    
    // Se está precisando de ar (Inhale), alonga levemente
    if (currentPhase === BreathingPhase.INHALE && latestHR < 55) return (baseDuration + 0.5) * 1000;
    
    return baseDuration * 1000;
  }, [biofeedbackHistory, isAdaptive, currentPattern.id, breathCycleDuration]);

  const triggerEffects = useCallback((nextPhase: BreathingPhase) => {
    // Haptics
    if (isHapticsEnabled) {
      const hapticType = nextPhase === BreathingPhase.INHALE ? 'inhale' : nextPhase === BreathingPhase.EXHALE ? 'exhale' : 'hold';
      HapticService.triggerHaptic(hapticType);
    }
    
    // TTS
    if (isVoiceEnabled) {
      const text = nextPhase === BreathingPhase.INHALE ? 'Inspire' : nextPhase === BreathingPhase.EXHALE ? 'Solte o ar' : 'Segure';
      TTSService.speak(text);
    }
  }, [isHapticsEnabled, isVoiceEnabled]);

  // -- Phase Switching Logic --

  const switchPhase = useCallback(() => {
    setPhase(prevPhase => {
      let nextPhase: BreathingPhase;
      // Determine next phase based on current pattern timing
      switch (prevPhase) {
        case BreathingPhase.INHALE:
          nextPhase = currentPattern.baseTiming[BreathingPhase.HOLD_IN] > 0 ? BreathingPhase.HOLD_IN : BreathingPhase.EXHALE; break;
        case BreathingPhase.HOLD_IN:
          nextPhase = BreathingPhase.EXHALE; break;
        case BreathingPhase.EXHALE:
          nextPhase = currentPattern.baseTiming[BreathingPhase.HOLD_OUT] > 0 ? BreathingPhase.HOLD_OUT : BreathingPhase.INHALE; break;
        case BreathingPhase.HOLD_OUT:
          nextPhase = BreathingPhase.INHALE; break;
        default: nextPhase = BreathingPhase.INHALE;
      }
      
      triggerEffects(nextPhase);

      const nextDurationMs = getAdaptiveDuration(currentPattern.baseTiming[nextPhase], nextPhase);
      phaseDurationRef.current = nextDurationMs;
      phaseStartTimeRef.current = Date.now();
      
      // Schedule next switch
      timerRef.current = setTimeout(switchPhase, nextDurationMs);
      return nextPhase;
    });
  }, [currentPattern, getAdaptiveDuration, triggerEffects]);

  // -- Main Lifecycle Effects --

  // 1. Audio Management
  useEffect(() => {
    if (isPlaying && isAudioEnabled) AudioService.startSound(soundType, currentPattern.id);
    else AudioService.stopSound();
    return () => AudioService.stopSound();
  }, [isPlaying, isAudioEnabled, currentPattern.id]); // Added currentPattern.id dependency

  useEffect(() => {
    if (isPlaying && isAudioEnabled) AudioService.updateSoundType(soundType);
  }, [soundType]);

  useEffect(() => {
    if (isPlaying && isAudioEnabled) {
      // Passa a FASE exata para o serviço de áudio criar o efeito correto (Inspirar vs Expirar vs Pausa)
      AudioService.modulateSound(phase, phaseDurationRef.current / 1000);
    }
  }, [phase, isPlaying, isAudioEnabled]);

  // 2. Data Generation Loop (The "Heartbeat" of the app)
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - phaseStartTimeRef.current;
      const progress = Math.min(elapsed / phaseDurationRef.current, 1);

      setBiofeedbackHistory(prev => {
        const newData = generateBiofeedbackSample(phase, simulatedStress, progress);
        
        // Capture start metrics
        if (prev.length === 5 && !startMetrics) setStartMetrics(newData);
        
        // Keep buffer size manageable (last 120 points = ~6 seconds at 50ms)
        // Dashboard uses last 60, but we keep a bit more for calculations
        if (prev.length > 120) return [...prev.slice(1), newData];
        return [...prev, newData];
      });
    }, 50); // 20Hz update rate

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, phase, simulatedStress, startMetrics]);

  // 3. Start/Stop Logic
  useEffect(() => {
    if (isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      if (!sessionStartTime) setSessionStartTime(Date.now());
      
      setPhase(BreathingPhase.INHALE);
      triggerEffects(BreathingPhase.INHALE);
      
      const initialDuration = getAdaptiveDuration(currentPattern.baseTiming[BreathingPhase.INHALE], BreathingPhase.INHALE);
      phaseDurationRef.current = initialDuration;
      phaseStartTimeRef.current = Date.now();
      
      timerRef.current = setTimeout(switchPhase, initialDuration);
    } else {
      TTSService.cancelSpeech();
      if (timerRef.current) clearTimeout(timerRef.current);
      setSessionStartTime(null);
      setBiofeedbackHistory([]); // Optional: clear on stop or keep? Keeping allows report generation.
    }
    return () => { 
      if (timerRef.current) clearTimeout(timerRef.current); 
      TTSService.cancelSpeech(); 
    };
  }, [isPlaying, currentPattern.id, breathCycleDuration]);

  const resetSession = () => {
    setBiofeedbackHistory([]);
    setStartMetrics(null);
    setSessionStartTime(null);
  };

  return {
    phase,
    phaseDuration: phaseDurationRef.current,
    biofeedbackHistory,
    startMetrics,
    sessionStartTime,
    resetSession
  };
};