import { useEffect, useRef } from 'react';

interface TrailMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  isGold: boolean;
}

interface ClickWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}

export function CursorEffect() {
  const outerRingRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const outerRing = outerRingRef.current;
    const aura = auraRef.current;
    const canvas = canvasRef.current;
    if (!outerRing || !aura || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const pos = {
      targetX: -200,
      targetY: -200,
      ringX: -200,
      ringY: -200,
      lastSpawnX: -200,
      lastSpawnY: -200,
      visible: false,
      hoveringInteractive: false,
      pressed: false,
      scale: 1,
    };

    const motes: TrailMote[] = [];
    const waves: ClickWave[] = [];
    let rafId = 0;

    const isInteractiveElement = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest('a, button, [role="button"], input, textarea, select, [role="tab"]')
      );
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;

      const firstMove = !pos.visible;
      pos.targetX = e.clientX;
      pos.targetY = e.clientY;
      pos.visible = true;
      pos.hoveringInteractive = isInteractiveElement(e.target);

      if (firstMove) {
        pos.ringX = e.clientX;
        pos.ringY = e.clientY;
        pos.lastSpawnX = e.clientX;
        pos.lastSpawnY = e.clientY;
      }

      const dx = e.clientX - pos.lastSpawnX;
      const dy = e.clientY - pos.lastSpawnY;
      const moved = Math.hypot(dx, dy);

      if (moved > 10 && motes.length < 70) {
        pos.lastSpawnX = e.clientX;
        pos.lastSpawnY = e.clientY;
        const count = moved > 36 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          motes.push({
            x: e.clientX + (Math.random() - 0.5) * 6,
            y: e.clientY + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.8 - dx * 0.02,
            vy: (Math.random() - 0.5) * 0.8 - dy * 0.02 - 0.15,
            radius: Math.random() * 1.6 + 0.9,
            life: 0,
            maxLife: 24 + Math.random() * 16,
            isGold: Math.random() > 0.55 || pos.hoveringInteractive,
          });
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      pos.pressed = true;
      waves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 46,
        life: 0,
        maxLife: 24,
      });
    };

    const onPointerUp = () => {
      pos.pressed = false;
    };

    const onPointerLeave = () => {
      pos.visible = false;
      pos.hoveringInteractive = false;
      pos.pressed = false;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    const tick = () => {
      if (document.hidden) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      pos.ringX += (pos.targetX - pos.ringX) * 0.18;
      pos.ringY += (pos.targetY - pos.ringY) * 0.18;

      const targetScale = pos.pressed ? 0.82 : pos.hoveringInteractive ? 1.42 : 1;
      pos.scale += (targetScale - pos.scale) * 0.2;

      if (pos.visible) {
        outerRing.style.opacity = '1';
        aura.style.opacity = pos.hoveringInteractive ? '1' : '0.85';
        outerRing.style.transform = `translate3d(${pos.ringX}px, ${pos.ringY}px, 0) translate(-50%, -50%) scale(${pos.scale})`;
        aura.style.transform = `translate3d(${pos.targetX}px, ${pos.targetY}px, 0) translate(-50%, -50%)`;

        if (pos.hoveringInteractive) {
          outerRing.style.borderColor = 'rgba(251, 191, 36, 0.72)';
          outerRing.style.boxShadow =
            '0 0 22px rgba(251, 191, 36, 0.25), inset 0 0 12px rgba(20, 184, 166, 0.16)';
        } else {
          outerRing.style.borderColor = 'rgba(45, 212, 191, 0.5)';
          outerRing.style.boxShadow =
            '0 0 18px rgba(20, 184, 166, 0.2), inset 0 0 10px rgba(251, 191, 36, 0.08)';
        }
      } else {
        outerRing.style.opacity = '0';
        aura.style.opacity = '0';
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life += 1;
        if (m.life >= m.maxLife) {
          motes.splice(i, 1);
          continue;
        }
        m.x += m.vx;
        m.y += m.vy;
        const progress = m.life / m.maxLife;
        const alpha = (1 - progress) * 0.7;

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * (1 - progress * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = m.isGold
          ? `rgba(251, 191, 36, ${alpha})`
          : `rgba(45, 212, 191, ${alpha})`;
        ctx.fill();
      }

      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.life += 1;
        if (w.life >= w.maxLife) {
          waves.splice(i, 1);
          continue;
        }
        const progress = w.life / w.maxLife;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const r = w.radius + (w.maxRadius - w.radius) * easeOut;
        const alpha = (1 - progress) * 0.55;

        ctx.beginPath();
        ctx.arc(w.x, w.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(w.x, w.y, r * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.75})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="no-print pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Soft radial glow aura centered on cursor */}
      <div
        ref={auraRef}
        className="fixed top-0 left-0 h-44 w-44 rounded-full opacity-0 transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(circle, rgba(20, 184, 166, 0.16) 0%, rgba(251, 191, 36, 0.08) 38%, transparent 72%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Trailing magnetic orbital ring */}
      <div
        ref={outerRingRef}
        className="fixed top-0 left-0 h-9 w-9 rounded-full border opacity-0 transition-opacity duration-200"
        style={{
          willChange: 'transform, opacity',
        }}
      />

      {/* Particle spark trail & click ripple canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
    </div>
  );
}
