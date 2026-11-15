import { motion } from 'motion/react';
import { Pencil } from 'lucide-react';
import { useOwnerMode } from '../context/OwnerModeContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { ENGINEERING_JOURNEY, SKILL_GROUPS, VALUE_PILLARS } from '../data/portfolioData';
import { ImageSlot } from './ImageSlot';
import { SpotlightCard } from './SpotlightCard';

interface AboutSectionProps {
  onOpenLightbox: (src: string, alt: string) => void;
  onEditProfile: () => void;
}

export function AboutSection({ onOpenLightbox, onEditProfile }: AboutSectionProps) {
  const { profile } = usePortfolioData();
  const { isOwnerMode } = useOwnerMode();

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'RG';

  return (
    <section id="about" className="border-b border-white/8 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium text-teal-400">About Me</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Driven by the goal of becoming a professional Full-Stack Developer
            </h2>
          </motion.div>

          {isOwnerMode && (
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-white/10 bg-[#0C1317] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 sm:self-auto whitespace-nowrap shrink-0"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit Details &amp; Bio</span>
            </button>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Smaller photo slot beside the bio with tilted offset accent frame behind it */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:col-span-4 lg:justify-start"
          >
            <div className="relative w-full max-w-[260px] sm:max-w-[280px]">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 -rotate-3 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-teal-500/15 to-amber-400/15"
              />
              <div className="relative rotate-1 rounded-2xl border border-white/10 bg-[#0C1418]/90 p-1.5 shadow-xl shadow-black/50 backdrop-blur-md transition-transform duration-300 hover:rotate-0">
                <ImageSlot
                  slotId="about-profile"
                  alt={`${profile.name} casual portrait photo`}
                  roundedClassName="rounded-xl"
                  className="aspect-[4/5] w-full"
                  hint="Add a second photo or reuse Home"
                  reuseFromSlotId="home-profile"
                  reuseLabel="Use Home photo"
                  variant="monogram"
                  monogramInitials={initials}
                  onImageClick={onOpenLightbox}
                />
              </div>
            </div>
          </motion.div>

          {/* Elongated bio paragraphs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 lg:col-span-8"
          >
            {profile.aboutBio.map((paragraph, idx) => (
              <p key={idx} className="text-base leading-relaxed text-slate-300 sm:text-[17px]">
                {paragraph}
              </p>
            ))}

            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <span>{profile.location}</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>Aspiring Full-Stack Developer</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <a
                href={`mailto:${profile.email}`}
                className="text-teal-300 transition-colors hover:text-teal-200"
              >
                {profile.email}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Full-Stack Developer Dream & Focus Points */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14"
        >
          <SpotlightCard accent="gold" className="p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-amber-300 uppercase">
                  My Career Vision
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-slate-50 sm:text-2xl">
                  What drives my path to Professional Full-Stack Development
                </h3>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-white/8 pt-6 sm:grid-cols-2">
              {profile.dreamPoints.map((point, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className="font-display text-base font-semibold text-slate-100">
                    <span className="mr-2 font-mono text-xs text-teal-300 tabular-nums">
                      0{idx + 1}.
                    </span>
                    {point.title}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-400">{point.detail}</p>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Engineering Journey Timeline */}
        <div className="mt-16 border-t border-white/8 pt-12">
          <div>
            <p className="text-xs font-semibold tracking-wider text-teal-400 uppercase">
              Progression
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-slate-100">
              Engineering Journey
            </h3>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {ENGINEERING_JOURNEY.map((step, idx) => (
              <motion.div
                key={step.period}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard accent={idx === 2 ? 'gold' : 'teal'} className="h-full p-6">
                  <p className="font-mono text-xs font-semibold text-amber-300 tabular-nums">
                    {step.period}
                  </p>
                  <h4 className="mt-2 font-display text-base font-semibold text-slate-100">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.detail}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Three value cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUE_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <SpotlightCard className="h-full p-6 hover:border-teal-400/35">
                <span className="font-mono text-xs font-medium text-amber-300 tabular-nums">
                  {pillar.index}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-slate-100">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{pillar.description}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Skills & Capabilities */}
        <div className="mt-16 border-t border-white/8 pt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold text-slate-100">
                Technical Capabilities
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Tools and technologies I reach for when shipping dependable web software.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {SKILL_GROUPS.map((group) => (
              <div key={group.category} className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wider text-teal-300 uppercase">
                  {group.category}
                </h4>
                <ul className="divide-y divide-white/8 border-t border-white/8">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="py-2 text-sm font-medium text-slate-200 transition-colors hover:text-teal-200"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
