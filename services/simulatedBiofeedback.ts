import { BiofeedbackData, UserState, BreathingPhase } from '../types';

// O "Motor Fisiológico"
// Simula a resposta do nó sinusal ao estímulo vagal (expiração) e simpático (inspiração).

let currentHR = 75;
let baselineHR = 75;
let currentPhaseProgress = 0; // 0 a 1 (ciclo completo da onda)
let lastMaxHR = 75;
let lastMinHR = 75;

export const generateBiofeedbackSample = (
  phase: BreathingPhase, 
  userStressLevel: number, // 0 (Zen) a 1 (Pânico)
  cycleProgress: number // 0 a 1, onde estamos no ciclo respiratório atual
): BiofeedbackData => {
  
  // 1. Definir o Baseline baseado no estresse
  // Estresse alto = FC basal mais alta
  const targetBaseline = 60 + (userStressLevel * 40); // 60 a 100 bpm
  // Drift suave em direção ao target (inércia fisiológica)
  baselineHR = baselineHR + (targetBaseline - baselineHR) * 0.02;

  // 2. Simular RSA (Respiratory Sinus Arrhythmia)
  // A amplitude da RSA diminui com estresse (rigidez autonômica)
  // Pessoas relaxadas têm RSA alta (ex: FC varia de 60 a 80 em uma respiração)
  // Pessoas estressadas têm RSA baixa (ex: FC varia de 90 a 92)
  const rsaAmplitude = (1 - userStressLevel) * 15 + 2; // Varia de 2bpm (estresse) a 17bpm (relaxado)

  // Modulação Senoidal:
  // Inspiração: FC Sobe. Expiração: FC Desce.
  let modulation = 0;
  
  if (phase === BreathingPhase.INHALE || phase === BreathingPhase.HOLD_IN) {
    // Parte ascendente da onda
    modulation = Math.sin(cycleProgress * Math.PI / 2) * rsaAmplitude; 
  } else {
    // Parte descendente da onda (Vagal Brake)
    modulation = Math.cos(cycleProgress * Math.PI / 2) * rsaAmplitude;
  }
  
  // Ajuste de fase para a curva parecer natural (Inhale = subida, Exhale = descida)
  // Simplificação: Vamos forçar a subida no inhale e descida no exhale
  if (phase === BreathingPhase.INHALE) {
      currentHR = baselineHR + (cycleProgress * rsaAmplitude);
      lastMaxHR = currentHR;
  } else if (phase === BreathingPhase.EXHALE) {
      currentHR = lastMaxHR - (cycleProgress * rsaAmplitude);
      lastMinHR = currentHR;
  } else if (phase === BreathingPhase.HOLD_IN) {
      // Platô alto ou leve queda
      currentHR = lastMaxHR - (cycleProgress * 2); 
  } else if (phase === BreathingPhase.HOLD_OUT) {
      // Platô baixo ou leve subida (se fome de ar)
      currentHR = lastMinHR + (cycleProgress * 2);
  }

  // Adicionar ruído biológico natural (nada é perfeito)
  const noise = (Math.random() - 0.5) * 2;
  const finalHR = Math.round(currentHR + noise);

  // 3. Cálculo de HRV (rMSSD) derivado da RSA
  // RSA alta correlaciona fortemente com VFC alta
  const derivedHRV = Math.round(rsaAmplitude * 5 + (Math.random() * 10));

  // 4. Determinação de Estado
  let detectedState = UserState.BALANCED;
  if (userStressLevel > 0.7) detectedState = UserState.HYPER_AROUSAL;
  if (userStressLevel < 0.2 && rsaAmplitude < 5) detectedState = UserState.HYPO_AROUSAL; // Calmo mas "chato" (baixa variabilidade)
  if (userStressLevel < 0.4 && rsaAmplitude > 10) detectedState = UserState.BALANCED; // Estado de fluxo

  // Calcular Amplitude Real-time
  const currentAmplitude = Math.abs(lastMaxHR - lastMinHR);

  return {
    timestamp: Date.now(),
    heartRate: finalHR,
    hrv: derivedHRV,
    rsaAmplitude: parseFloat(currentAmplitude.toFixed(1)),
    state: detectedState
  };
};