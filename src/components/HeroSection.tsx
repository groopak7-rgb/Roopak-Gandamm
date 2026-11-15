import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, ArrowRight, FileText, Pencil } from 'lucide-react';
import { useOwnerMode } from '../context/OwnerModeContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { ImageSlot } from './ImageSlot';
 import profile from "../assets/images/profile.png";

interface HeroSectionProps {
  onOpenLightbox: (src: string, alt: string) => void;
  onEditProfile: () => void;
  onOpenResume: () => void;
}

function formatIndiaTime(): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return 'IST';
  }
}

export function HeroSection({
  onOpenLightbox,
  onEditProfile,
  onOpenResume,
}: HeroSectionProps) {
  const { profile } = usePortfolioData();
  const { isOwnerMode } = useOwnerMode();
  const [localTime, setLocalTime] = useState<string>(() => formatIndiaTime());

  useEffect(() => {
    const id = window.setInterval(() => {
      setLocalTime(formatIndiaTime());
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'RG';

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-white/8 pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
    >
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Profile photo slot: appears ABOVE text on mobile (order-1), RIGHT of text on desktop (lg:order-2) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 flex justify-center lg:order-2 lg:col-span-5 lg:justify-end"
          >
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px]">
              {/* Soft glowing border backdrop */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 rounded-[2.5rem] opacity-70 blur-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(20, 184, 166, 0.42), rgba(245, 158, 11, 0.28))',
                }}
              />

              <div className="animate-float-slow relative rounded-[2rem] border border-teal-400/25 bg-[#0B1317]/90 p-2 shadow-2xl shadow-black/60 backdrop-blur-md">
                <ImageSlot
                  slotId="home-profile"
                  alt={`${profile.name} profile photo`}
                  roundedClassName="rounded-[1.6rem]"
                  className="aspect-square w-full"
                  hint="Click or drop your portrait"
                  variant="monogram"
                  monogramInitials={initials}
                  onImageClick={onOpenLightbox}
                />
              </div>
            </div>
          </motion.div>

          {/* Intro text: appears BELOW photo on mobile (order-2), LEFT of photo on desktop (lg:order-1) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1 lg:col-span-7"
          >
            <p className="mb-4 text-sm font-medium tracking-wide text-amber-300">
              {profile.role}
            </p>

            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl lg:text-[3.75rem] lg:leading-[1.06]">
              {profile.name}
            </h1>

            <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-200 sm:text-xl">
              {profile.headline}
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
              {profile.heroIntro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-[#061210] transition-all duration-150 hover:bg-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 whitespace-nowrap shrink-0"
              >
                <span>Explore Projects</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-medium text-amber-200 transition-colors duration-150 hover:border-amber-400/50 hover:bg-amber-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
              >
                <FileText className="h-4 w-4 text-amber-300" aria-hidden="true" />
                <span>View Resume</span>
              </button>

              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-200 transition-colors duration-150 hover:border-teal-400/40 hover:text-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
              >
                <span>About Me</span>
                <ArrowDownRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </a>

              {isOwnerMode && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-xs font-medium text-slate-400 transition-colors duration-150 hover:border-amber-400/40 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Full-width summary strip below split */}
        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-white/8 pt-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-slate-400">Live Web Applications</p>
            <p className="mt-1 font-display text-base font-semibold text-slate-100">
              VidyaMarg · Eazy Talk
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Location &amp; Local Time</p>
            <p className="mt-1 font-display text-base font-semibold text-slate-100">
              {profile.location} · <span className="font-mono text-sm text-amber-300 tabular-nums">{localTime} IST</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Profiles &amp; Contact</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 font-display text-base font-semibold">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 transition-colors hover:text-teal-200"
              >
                GitHub
              </a>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 transition-colors hover:text-teal-200"
              >
                LinkedIn
              </a>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <a
                href={`mailto:${profile.email}`}
                className="text-amber-300 transition-colors hover:text-amber-200"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
