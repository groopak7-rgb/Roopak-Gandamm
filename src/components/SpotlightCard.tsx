import React, { useRef } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: 'teal' | 'gold';
}

export function SpotlightCard({
  children,
  className = '',
  accent = 'teal',
}: SpotlightCardProps) {
  const glowRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const glow = glowRef.current;
    if (!glow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color =
      accent === 'gold'
        ? 'rgba(251, 191, 36, 0.11)'
        : 'rgba(20, 184, 166, 0.12)';
    glow.style.background = `radial-gradient(320px circle at ${x}px ${y}px, ${color}, transparent 70%)`;
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`group/spot relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1216]/85 backdrop-blur-md transition-colors duration-200 ${className}`}
    >
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/spot:opacity-100"
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
