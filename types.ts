export enum BreathingPhase {
  INHALE = 'INHALE',
  HOLD_IN = 'HOLD_IN',
  EXHALE = 'EXHALE',
  HOLD_OUT = 'HOLD_OUT',
}

export enum PatternId {
  COHERENT = 'coherent',
  BOX = 'box',
  RELAX_478 = 'relax_478',
  SOLDIER = 'soldier',
  PERFORMANCE = 'performance',
  PANIC_RESCUE = 'panic_rescue'
}

export enum UserState {
  HYPER_AROUSAL = 'Hiper-excitação',
  BALANCED = 'Equilibrado',
  HYPO_AROUSAL = 'Hipo-ativação',
  DISENGAGED = 'Desengajado'
}

export interface BreathingPattern {
  id: PatternId;
  name: string;
  description: string;
  color: string; // Tailwind color class or hex
  mechanism: string; // "Vagal", "Sympathetic", etc.
  baseTiming: {
    [BreathingPhase.INHALE]: number; // seconds
    [BreathingPhase.HOLD_IN]: number;
    [BreathingPhase.EXHALE]: number;
    [BreathingPhase.HOLD_OUT]: number;
  };
}

export interface BiofeedbackData {
  timestamp: number;
  heartRate: number;
  hrv: number; // rMSSD simulated
  rsaAmplitude: number; // Diferença Max-Min BPM no último ciclo (Novo)
  state: UserState;
}

export interface SessionStats {
  duration: number; // seconds
  avgCoherence: number;
  initialState: UserState;
  finalState: UserState;
}