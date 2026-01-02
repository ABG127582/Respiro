// Serviço de Feedback Tátil (Haptics)
// Permite prática de olhos fechados através de dicas somáticas

const canVibrate = typeof navigator !== 'undefined' && !!navigator.vibrate;

export const triggerHaptic = (type: 'inhale' | 'exhale' | 'hold') => {
  if (!canVibrate) return;

  switch (type) {
    case 'inhale':
      // Padrão curto e nítido para iniciar ação
      navigator.vibrate([50]); 
      break;
    case 'hold':
      // Dois pulsos muito breves para indicar "parar"
      navigator.vibrate([30, 50, 30]);
      break;
    case 'exhale':
      // Pulso mais longo e suave para relaxamento
      navigator.vibrate([80]);
      break;
  }
};