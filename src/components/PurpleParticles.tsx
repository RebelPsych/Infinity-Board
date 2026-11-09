import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface PurpleParticlesRef {
  burst: (x?: number, y?: number, count?: number, isFirstChar?: boolean) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  shape: 'circle' | 'sparkle' | 'ring';
  rotation: number;
  vRot: number;
}

const PURPLE_PALETTE = [
  '#C084FC', // Light purple
  '#A855F7', // Vibrant purple
  '#E879F9', // Pinkish purple
  '#D8B4FE', // Pastel lavender
  '#9333EA', // Deep royal purple
  '#38BDF8', // Sky blue accent
  '#F472B6', // Rose accent
];

export const PurpleParticles = forwardRef<PurpleParticlesRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const burst = (x?: number, y?: number, count = 18, isFirstChar = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    const originX = x ?? width / 2;
    const originY = y ?? height / 2;
    const particleCount = isFirstChar ? Math.max(count, 45) : count;

    for (let i = 0; i < particleCount; i++) {
      const angle = isFirstChar
        ? Math.random() * Math.PI * 2
        : -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;

      const speed = isFirstChar
        ? Math.random() * 5.5 + 2.0
        : Math.random() * 4.0 + 1.2;

      const shapes: ('circle' | 'sparkle' | 'ring')[] = ['circle', 'sparkle', 'ring'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      particlesRef.current.push({
        x: isFirstChar ? originX + (Math.random() - 0.5) * (width * 0.7) : originX,
        y: isFirstChar ? originY + (Math.random() - 0.5) * (height * 0.5) : originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isFirstChar ? 0.8 : 1.2),
        size: isFirstChar ? Math.random() * 5 + 3 : Math.random() * 4 + 2,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.015,
        color: PURPLE_PALETTE[Math.floor(Math.random() * PURPLE_PALETTE.length)],
        shape,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(render);
    }
  };

  useImperativeHandle(ref, () => ({
    burst,
  }));

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      animFrameRef.current = null;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animFrameRef.current = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // Gentle gravity
      p.vx *= 0.98; // Drag
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'sparkle') {
        // Draw 4-point sparkle star
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const s = p.size * 1.5;
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else if (p.shape === 'ring') {
        // Glowing halo ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Soft glowing particle orb
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      animFrameRef.current = null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-40 w-full h-full overflow-hidden"
    />
  );
});

PurpleParticles.displayName = 'PurpleParticles';
