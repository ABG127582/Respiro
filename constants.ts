import { BreathingPattern, PatternId, BreathingPhase } from './types';

// Palette mapping for visual feedback - Premium/Ethereal Colors
export const PHASE_COLORS = {
  [BreathingPhase.INHALE]: 'bg-cyan-400',
  [BreathingPhase.HOLD_IN]: 'bg-cyan-300',
  [BreathingPhase.EXHALE]: 'bg-blue-500', 
  [BreathingPhase.HOLD_OUT]: 'bg-slate-700',
};

export const BREATHING_PATTERNS: Record<PatternId, BreathingPattern> = {
  [PatternId.COHERENT]: {
    id: PatternId.COHERENT,
    name: "Coerência (5:5)",
    description: "Equilibra o sistema nervoso autônomo. Padrão ouro para VFC.",
    mechanism: "Equilíbrio",
    color: "#22d3ee", // Cyan 400 (Mais suave)
    baseTiming: {
      [BreathingPhase.INHALE]: 5,
      [BreathingPhase.HOLD_IN]: 0,
      [BreathingPhase.EXHALE]: 5,
      [BreathingPhase.HOLD_OUT]: 0,
    },
  },
  [PatternId.BOX]: {
    id: PatternId.BOX,
    name: "Respiração Quadrada (4:4:4:4)",
    description: "Usada pelos Navy SEALs para foco e controle de estresse.",
    mechanism: "Foco",
    color: "#a78bfa", // Violet 400
    baseTiming: {
      [BreathingPhase.INHALE]: 4,
      [BreathingPhase.HOLD_IN]: 4,
      [BreathingPhase.EXHALE]: 4,
      [BreathingPhase.HOLD_OUT]: 4,
    },
  },
  [PatternId.RELAX_478]: {
    id: PatternId.RELAX_478,
    name: "Sono Profundo (4-7-8)",
    description: "Expiração estendida para forte resposta parassimpática.",
    mechanism: "Sedação",
    color: "#60a5fa", // Blue 400
    baseTiming: {
      [BreathingPhase.INHALE]: 4,
      [BreathingPhase.HOLD_IN]: 7,
      [BreathingPhase.EXHALE]: 8,
      [BreathingPhase.HOLD_OUT]: 0,
    },
  },
  [PatternId.SOLDIER]: {
    id: PatternId.SOLDIER,
    name: "Descanso do Soldado (4:8)",
    description: "Padrão de relaxamento progressivo simples.",
    mechanism: "Vagal",
    color: "#34d399", // Emerald 400
    baseTiming: {
      [BreathingPhase.INHALE]: 4,
      [BreathingPhase.HOLD_IN]: 0,
      [BreathingPhase.EXHALE]: 8,
      [BreathingPhase.HOLD_OUT]: 0,
    },
  },
  [PatternId.PERFORMANCE]: {
    id: PatternId.PERFORMANCE,
    name: "Ativação (2:2)",
    description: "Aumenta o estado de alerta e o tônus simpático.",
    mechanism: "Simpático",
    color: "#fb923c", // Orange 400
    baseTiming: {
      [BreathingPhase.INHALE]: 2,
      [BreathingPhase.HOLD_IN]: 0,
      [BreathingPhase.EXHALE]: 2,
      [BreathingPhase.HOLD_OUT]: 0,
    },
  },
  [PatternId.PANIC_RESCUE]: {
    id: PatternId.PANIC_RESCUE,
    name: "Resgate de Pânico (3:6)",
    description: "Reduz rapidamente a ansiedade aguda.",
    mechanism: "Resgate Agudo",
    color: "#f87171", // Red 400
    baseTiming: {
      [BreathingPhase.INHALE]: 3,
      [BreathingPhase.HOLD_IN]: 0,
      [BreathingPhase.EXHALE]: 6,
      [BreathingPhase.HOLD_OUT]: 1,
    },
  }
};