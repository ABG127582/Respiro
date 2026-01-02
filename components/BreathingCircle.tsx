import React, { useEffect, useState, useMemo } from 'react';
import { BreathingPhase, BreathingPattern } from '../types';

interface BreathingCircleProps {
  phase: BreathingPhase;
  pattern: BreathingPattern;
  duration: number; 
  progress: number;
  instructions: string;
  coherenceScore: number;
}

interface LotusPetalProps {
  angle: number;
  scale: number;
  color: string;
  delay: number;
  type: 'inner' | 'outer';
}

// Memoized Petal for performance
const LotusPetal: React.FC<LotusPetalProps> = React.memo(({ angle, scale, color, delay, type }) => {
  const petalPath = type === 'outer' 
    ? "M0,0 C10,-20 25,-40 0,-90 C-25,-40 -10,-20 0,0" 
    : "M0,0 C5,-15 15,-30 0,-60 C-15,-30 -5,-15 0,0"; 

  return (
    <g transform={`rotate(${angle})`}>
      <path
        d={petalPath}
        fill={color}
        fillOpacity={type === 'outer' ? 0.3 : 0.6}
        stroke={color}
        strokeWidth={0.5}
        strokeOpacity={0.6}
        className="transition-all ease-in-out"
        style={{
          transformOrigin: '0 0',
          transform: `scale(${scale})`,
          transitionDuration: `${delay}s`,
          mixBlendMode: 'plus-lighter'
        }}
      />
    </g>
  );
});

const BreathingCircle: React.FC<BreathingCircleProps> = ({ 
  phase, 
  pattern, 
  duration, 
  instructions,
  coherenceScore 
}) => {
  
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    setCountdown(Math.ceil(duration));
  }, [phase, duration]);

  useEffect(() => {
      if (duration < 2) return;
      const interval = setInterval(() => {
          setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
  }, [phase, duration]);

  const isHighCoherence = coherenceScore > 10;
  const isHold = phase === BreathingPhase.HOLD_IN || phase === BreathingPhase.HOLD_OUT;
  
  const primaryColor = isHighCoherence ? '#fcd34d' : pattern.color; // Amber 300
  const secondaryColor = isHighCoherence ? '#fbbf24' : pattern.color;

  const getLotusState = () => {
    switch (phase) {
      case BreathingPhase.INHALE: return { scale: 1, rotation: 0 };
      case BreathingPhase.HOLD_IN: return { scale: 1.08, rotation: 15 }; 
      case BreathingPhase.EXHALE: return { scale: 0.3, rotation: 0 };
      case BreathingPhase.HOLD_OUT: return { scale: 0.3, rotation: 0 };
      default: return { scale: 0.5, rotation: 0 };
    }
  };

  const lotusState = getLotusState();

  const getLabel = () => {
    switch(phase) {
      case BreathingPhase.INHALE: return "Inspirar";
      case BreathingPhase.HOLD_IN: return "Segurar";
      case BreathingPhase.EXHALE: return "Soltar";
      case BreathingPhase.HOLD_OUT: return "Relaxar";
      default: return "Pronto";
    }
  };

  const petals = useMemo(() => {
    const outerPetals = [];
    const innerPetals = [];
    const numOuter = 12;
    const numInner = 8;

    for (let i = 0; i < numOuter; i++) {
      outerPetals.push({ angle: (360 / numOuter) * i, type: 'outer' as const });
    }
    for (let i = 0; i < numInner; i++) {
      innerPetals.push({ angle: (360 / numInner) * i + (360/numInner/2), type: 'inner' as const });
    }
    return { outerPetals, innerPetals };
  }, []);

  return (
    <div className="relative flex items-center justify-center w-[90vw] h-[90vw] max-w-[400px] max-h-[400px] sm:w-[450px] sm:h-[450px]">
      
      {/* LAYER 0: Ambient Aura (Diffused) */}
      <div 
        className="absolute w-2/3 h-2/3 rounded-full transition-all ease-in-out opacity-20 blur-[70px] mix-blend-screen"
        style={{ 
            backgroundColor: primaryColor,
            transitionDuration: `${duration}s`,
            transform: phase === BreathingPhase.INHALE || phase === BreathingPhase.HOLD_IN ? 'scale(1.4)' : 'scale(0.7)'
        }}
      />

      {/* LAYER 1: SVG Lotus */}
      <svg 
        className="absolute w-full h-full overflow-visible z-0 opacity-90" 
        viewBox="-100 -100 200 200"
        style={{ animation: 'spin-slow 120s linear infinite' }} 
      >
        <style>{`@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        
        <g className="transition-all ease-in-out" style={{ 
            transitionDuration: `${duration}s`,
            transform: `scale(${lotusState.scale}) rotate(${lotusState.rotation}deg)` 
        }}>
           {petals.outerPetals.map((p, i) => (
             <LotusPetal key={`outer-${i}`} angle={p.angle} scale={1} color={primaryColor} delay={duration} type="outer" />
           ))}
        </g>

        <g className="transition-all ease-in-out" style={{ 
            transitionDuration: `${duration + 0.3}s`,
            transform: `scale(${lotusState.scale * 0.7}) rotate(-${lotusState.rotation * 1.5}deg)` 
        }}>
           {petals.innerPetals.map((p, i) => (
             <LotusPetal key={`inner-${i}`} angle={p.angle} scale={0.9} color={secondaryColor} delay={duration + 0.3} type="inner" />
           ))}
        </g>
      </svg>

      {/* LAYER 2: Core Text (Minimalist) */}
      <div className="z-20 flex flex-col items-center justify-center drop-shadow-2xl">
        <span 
          className="block text-4xl sm:text-5xl font-extralight tracking-[0.05em] text-white transition-all duration-500"
          style={{ 
              opacity: isHold ? 1 : 0.8,
              transform: isHold ? 'scale(1.05)' : 'scale(1)'
          }}
        >
           {isHold && duration > 2 ? countdown : getLabel()}
        </span>

        <span 
          className="block text-[10px] uppercase tracking-[0.3em] font-medium mt-3 transition-opacity duration-500 text-slate-300"
          style={{ 
              opacity: isHold ? 0 : 0.8 
          }}
        >
           {instructions}
        </span>
      </div>
    </div>
  );
};

// CRITICAL: Memoize to prevent re-renders on every biofeedback tick
export default React.memo(BreathingCircle);