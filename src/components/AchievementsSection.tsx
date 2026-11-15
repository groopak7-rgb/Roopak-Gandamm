import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import { useImageSlots } from '../context/ImageSlotsContext';
import { useOwnerMode } from '../context/OwnerModeContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import type { AchievementItem } from '../types/portfolio';
import { ImageSlot } from './ImageSlot';
import { SpotlightCard } from './SpotlightCard';

interface AchievementsSectionProps {
  onOpenLightbox: (src: string, alt: string) => void;
  onEditAchievement: (achievement: AchievementItem) => void;
  onAddAchievement: () => void;
}

export function AchievementsSection({
  onOpenLightbox,
  onEditAchievement,
  onAddAchievement,
}: AchievementsSectionProps) {
  const { getImage } = useImageSlots();
  const { isOwnerMode } = useOwnerMode();
  const { achievements } = usePortfolioData();
  const [hideEmptySlots, setHideEmptySlots] = useState(false);

  return (
    <section id="achievements" className="border-b border-white/8 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium text-amber-300">Milestones &amp; Credentials</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Achievements
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
              {isOwnerMode
                ? 'Certificates, recognitions, and community contributions. Edit any card manually, add new awards, or upload certificate images.'
                : 'Verified engineering milestones, builder showcases, and open-source recognitions.'}
            </p>
          </motion.div>

          {isOwnerMode && (
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={onAddAchievement}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Achievement</span>
              </button>

              <button
                type="button"
                onClick={() => setHideEmptySlots((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0C1317] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
              >
                {hideEmptySlots ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                    <span>Show empty image slots</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>Hide empty image slots</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {achievements.map((item, index) => {
            const hasImage = Boolean(getImage(item.slotId) || item.defaultImageUrl);
            const shouldShowImageSlot = hasImage || !hideEmptySlots;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard accent="gold" className="h-full p-6 hover:border-amber-400/35">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Award className="h-4 w-4 text-amber-300 shrink-0" aria-hidden="true" />
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{item.date}</span>
                        </div>

                        {isOwnerMode && (
                          <button
                            type="button"
                            onClick={() => onEditAchievement(item)}
                            aria-label={`Edit ${item.title}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-amber-400/40 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
                          >
                            <Pencil className="h-3 w-3" aria-hidden="true" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>

                      {shouldShowImageSlot && (
                        <div className="mt-4">
                          <ImageSlot
                            slotId={item.slotId}
                            alt={item.imageAlt}
                            fallbackUrl={item.defaultImageUrl}
                            roundedClassName="rounded-xl"
                            className="h-32 w-full"
                            compact
                            onImageClick={onOpenLightbox}
                          />
                        </div>
                      )}

                      <h3 className="mt-4 font-display text-lg font-semibold text-slate-100">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-teal-300">{item.issuer}</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
