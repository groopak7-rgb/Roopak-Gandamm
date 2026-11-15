import { useEffect } from 'react';
import { ExternalLink, Printer, X } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { SKILL_GROUPS } from '../data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const { profile, projects, achievements } = usePortfolioData();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="print-only-sheet relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/12 bg-[#0B1216] p-6 shadow-2xl sm:p-10"
      >
        {/* Top Modal Bar (hidden during print) */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <p className="text-xs font-medium text-teal-300">Developer Resume · Live Synced</p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-[#061210] transition-colors hover:bg-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close resume"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Resume Header */}
        <header className="border-b border-white/10 pb-6 print:border-slate-300">
          <h2
            id="resume-modal-title"
            className="font-display text-3xl font-bold tracking-tight text-slate-50 print:text-slate-900"
          >
            {profile.name}
          </h2>
          <p className="mt-1 text-base font-medium text-amber-300 print:text-teal-700">
            {profile.role}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 print:text-slate-600">
            <span>{profile.location}</span>
            <span aria-hidden="true">·</span>
            <a href={`mailto:${profile.email}`} className="text-teal-300 print:text-slate-900">
              {profile.email}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-teal-300 print:text-slate-900"
            >
              <span>GitHub</span>
              <ExternalLink className="no-print h-3 w-3" aria-hidden="true" />
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-teal-300 print:text-slate-900"
            >
              <span>LinkedIn</span>
              <ExternalLink className="no-print h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </header>

        {/* Summary */}
        <section className="mt-6">
          <h3 className="text-xs font-semibold tracking-wider text-teal-300 uppercase print:text-teal-700">
            Professional Summary
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300 print:text-slate-700">
            {profile.headline} {profile.heroIntro}
          </p>
        </section>

        {/* Skills */}
        <section className="mt-6 border-t border-white/8 pt-5 print:border-slate-200">
          <h3 className="text-xs font-semibold tracking-wider text-teal-300 uppercase print:text-teal-700">
            Technical Skills
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SKILL_GROUPS.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold text-slate-100 print:text-slate-900">
                  {group.category}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400 print:text-slate-600">
                  {group.items.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mt-6 border-t border-white/8 pt-5 print:border-slate-200">
          <h3 className="text-xs font-semibold tracking-wider text-teal-300 uppercase print:text-teal-700">
            Full-Stack Projects
          </h3>
          <div className="mt-3 space-y-4">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-base font-semibold text-slate-100 print:text-slate-900">
                    {proj.title}{' '}
                    <span className="font-sans text-xs font-normal text-slate-400 print:text-slate-600">
                      — {proj.subtitle}
                    </span>
                  </p>
                  <span className="font-mono text-xs text-amber-300 tabular-nums print:text-slate-700">
                    {proj.status} · {proj.year}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 print:text-slate-700">
                  {proj.description}
                </p>
                <p className="mt-1 text-xs text-slate-400 print:text-slate-600">
                  Stack: {proj.stack.join(', ')}
                  {proj.demoUrl ? ` · Live: ${proj.demoUrl}` : ''}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="mt-6 border-t border-white/8 pt-5 print:border-slate-200">
          <h3 className="text-xs font-semibold tracking-wider text-teal-300 uppercase print:text-teal-700">
            Certifications &amp; Milestones
          </h3>
          <ul className="mt-3 space-y-2">
            {achievements.map((ach) => (
              <li key={ach.id} className="text-xs text-slate-300 print:text-slate-700">
                <span className="font-semibold text-slate-100 print:text-slate-900">
                  {ach.title}
                </span>{' '}
                — {ach.issuer} ({ach.date})
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
