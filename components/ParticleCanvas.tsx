import React, { useRef, useEffect } from 'react';
import { BreathingPhase } from '../types';

interface ParticleCanvasProps {
  phase: BreathingPhase;
  color: string;
  intensity: number; // 0 to 1 based on coherence/stress
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ phase, color, intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameIdRef = useRef<number>(0);

  // Helper to get RGB from hex for alpha manipulation
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 100, g: 100, b: 100 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Init particles based on screen size (Performance Optimization)
    particlesRef.current = [];
    const isSmallScreen = window.innerWidth < 600;
    // 30 particles for watch/mobile (saves battery), 100 for desktop
    const particleCount = isSmallScreen ? 35 : 100; 

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5,
        life: Math.random() * 100
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const rgb = hexToRgb(color);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Logic per phase
      let speedMultiplier = 1;
      let direction = 0; // 0 = random, 1 = out, -1 = in
      
      if (phase === BreathingPhase.INHALE) {
          direction = 1; // Expand
          speedMultiplier = 1.5;
      } else if (phase === BreathingPhase.EXHALE) {
          direction = -1; // Contract/Calm
          speedMultiplier = 0.5;
      } else if (phase === BreathingPhase.HOLD_IN || phase === BreathingPhase.HOLD_OUT) {
          speedMultiplier = 0.2; // Stillness
      }

      // Add coherence boost
      speedMultiplier += intensity * 0.5;

      particlesRef.current.forEach(p => {
        // Movement Logic
        if (direction !== 0) {
            // Vector from center
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Normalize
            const ndx = dx / (dist || 1);
            const ndy = dy / (dist || 1);

            p.x += ndx * direction * speedMultiplier * 0.8;
            p.y += ndy * direction * speedMultiplier * 0.8;
        }

        // Natural drift
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + intensity), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
        ctx.fill();
      });

      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [color, phase, intensity]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    />
  );
};

export default React.memo(ParticleCanvas);