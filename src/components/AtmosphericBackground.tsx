import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  depth: number;
  isGold: boolean;
  phase: number;
  baseAlpha: number;
}

export function AtmosphericBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const goldGridRef = useRef<HTMLDivElement>(null);
  const mouseHaloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = { x: width * 0.65, y: height * 0.35, targetX: width * 0.65, targetY: height * 0.35, active: false };
    let scrollY = window.scrollY || 0;
    let rafId = 0;

    const createParticles = (): Particle[] => {
      const count = width < 640 ? 34 : 68;
      const list: Particle[] = [];
      for (let i = 0; i < count; i++) {
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.24 - 0.06,
          radius: Math.random() * 1.6 + 0.8,
          depth: Math.random() * 0.65 + 0.35,
          isGold: i % 4 === 0,
          phase: Math.random() * Math.PI * 2,
          baseAlpha: Math.random() * 0.38 + 0.22,
        });
      }
      return list;
    };

    let particles = createParticles();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles();
    };

    resize();

    const updateSpotlightStyles = (px: number, py: number) => {
      const mask = `radial-gradient(380px circle at ${px}px ${py}px, rgba(0,0,0,0.85), transparent 72%)`;
      if (goldGridRef.current) {
        goldGridRef.current.style.maskImage = mask;
        goldGridRef.current.style.webkitMaskImage = mask;
      }
      if (mouseHaloRef.current) {
        mouseHaloRef.current.style.background = `radial-gradient(520px circle at ${px}px ${py}px, rgba(20, 184, 166, 0.11), rgba(245, 158, 11, 0.04) 40%, transparent 72%)`;
      }
    };

    updateSpotlightStyles(pointer.x, pointer.y);

    const onPointerMove = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    let time = 0;

    const renderFrame = (animate: boolean) => {
      if (document.hidden && animate) {
        rafId = window.requestAnimationFrame(() => renderFrame(true));
        return;
      }

      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      updateSpotlightStyles(pointer.x, pointer.y);

      if (animate) {
        time += 0.014;
      }

      const connectionDist = width < 640 ? 95 : 135;
      const pointerRadius = 170;

      // Update particle positions with subtle parallax
      const screenPoints: Array<{ x: number; y: number; p: Particle }> = [];
      for (const p of particles) {
        if (animate) {
          p.x += p.vx * p.depth;
          p.y += p.vy * p.depth;

          if (p.x < -16) p.x = width + 16;
          if (p.x > width + 16) p.x = -16;
          if (p.y < -16) p.y = height + 16;
          if (p.y > height + 16) p.y = -16;
        }

        const parallaxY = ((p.y - scrollY * 0.14 * p.depth) % (height + 32) + (height + 32)) % (height + 32) - 16;
        let renderX = p.x;
        let renderY = parallaxY;

        if (pointer.active) {
          const dx = renderX - pointer.x;
          const dy = renderY - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < pointerRadius) {
            const pull = (1 - dist / pointerRadius) * 8 * p.depth;
            renderX -= (dx / dist) * pull * 0.35;
            renderY -= (dy / dist) * pull * 0.35;
          }
        }

        screenPoints.push({ x: renderX, y: renderY, p });
      }

      // Draw crisp constellation lines between nearby particles
      for (let i = 0; i < screenPoints.length; i++) {
        const a = screenPoints[i];
        for (let j = i + 1; j < screenPoints.length; j++) {
          const b = screenPoints[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle =
              a.p.isGold || b.p.isGold
                ? `rgba(251, 191, 36, ${alpha * 0.9})`
                : `rgba(45, 212, 191, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // Subtle pointer filaments when hovering
        if (pointer.active) {
          const pdx = a.x - pointer.x;
          const pdy = a.y - pointer.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < pointerRadius) {
            const pAlpha = (1 - pdist / pointerRadius) * 0.28;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = a.p.isGold
              ? `rgba(251, 191, 36, ${pAlpha})`
              : `rgba(45, 212, 191, ${pAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw glowing particles
      for (const pt of screenPoints) {
        const twinkle = animate ? 0.72 + Math.sin(time * 1.4 + pt.p.phase) * 0.28 : 1;
        const alpha = pt.p.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.p.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.p.isGold
          ? `rgba(252, 211, 77, ${alpha})`
          : `rgba(94, 234, 212, ${alpha})`;
        ctx.fill();

        if (pt.p.radius > 1.7) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.p.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = pt.p.isGold
            ? `rgba(245, 158, 11, ${alpha * 0.14})`
            : `rgba(20, 184, 166, ${alpha * 0.14})`;
          ctx.fill();
        }
      }

      if (animate) {
        rafId = window.requestAnimationFrame(() => renderFrame(true));
      }
    };

    if (prefersReducedMotion) {
      renderFrame(false);
    } else {
      rafId = window.requestAnimationFrame(() => renderFrame(true));
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#060A0C]"
    >
      {/* Volumetric Aurora Glow Orbs */}
      <div
        className="animate-aurora-slow absolute -top-[18%] -right-[10%] h-[680px] w-[680px] rounded-full opacity-35 blur-[110px]"
        style={{
          background:
            'radial-gradient(circle at 45% 45%, rgba(20, 184, 166, 0.42), rgba(13, 148, 136, 0.14) 55%, transparent 78%)',
        }}
      />
      <div
        className="animate-aurora-counter absolute top-[28%] -left-[14%] h-[620px] w-[620px] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.28), rgba(20, 184, 166, 0.12) 55%, transparent 78%)',
        }}
      />
      <div
        className="animate-aurora-slow absolute -bottom-[20%] right-[12%] h-[580px] w-[580px] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(15, 118, 110, 0.34), rgba(217, 119, 6, 0.12) 55%, transparent 78%)',
        }}
      />

      {/* Architectural Hairline Grid */}
      <div
        className="editorial-grid-bg absolute inset-0 opacity-65"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 35%, transparent 100%)',
        }}
      />

      {/* Interactive Gold Grid Highlight Revealed Near Pointer */}
      <div ref={goldGridRef} className="editorial-grid-gold absolute inset-0 opacity-90" />

      {/* Pointer Atmospheric Halo */}
      <div ref={mouseHaloRef} className="absolute inset-0 transition-opacity duration-300" />

      {/* Constellation & Ember Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Subtle Vignette for Crisp Foreground Contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, transparent 45%, rgba(4, 7, 9, 0.72) 100%)',
        }}
      />
    </div>
  );
}
