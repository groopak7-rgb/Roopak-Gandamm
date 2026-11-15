import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Clock, Code2, Globe, Maximize2, Pencil } from 'lucide-react';
import { useOwnerMode } from '../context/OwnerModeContext';
import { usePortfolioData } from '../context/PortfolioDataContext';
import type { ProjectItem } from '../types/portfolio';
import { ImageSlot } from './ImageSlot';
import { SpotlightCard } from './SpotlightCard';

interface ProjectsSectionProps {
  onOpenLightbox: (src: string, alt: string) => void;
  onSelectProject: (project: ProjectItem, startInEditMode?: boolean) => void;
}

type FilterStatus = 'All' | 'Live' | 'Coming Soon';

function getDisplayHost(project: ProjectItem): string {
  if (project.domainLabel) return project.domainLabel;
  if (project.demoUrl) {
    try {
      return new URL(project.demoUrl).host;
    } catch {
      return project.demoUrl;
    }
  }
  return `${project.title.toLowerCase().replace(/\s+/g, '')} · upcoming`;
}

export function ProjectsSection({ onOpenLightbox, onSelectProject }: ProjectsSectionProps) {
  const { projects } = usePortfolioData();
  const { isOwnerMode } = useOwnerMode();
  const [filter, setFilter] = useState<FilterStatus>('All');

  const filteredProjects =
    filter === 'All'
      ? projects
      : filter === 'Live'
        ? projects.filter((project) => project.status === 'Live')
        : projects.filter((project) => project.status !== 'Live');

  return (
    <section id="projects" className="border-b border-white/8 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium text-teal-400">Selected Work</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Projects
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
              {isOwnerMode
                ? 'Explore live builds and upcoming web apps. Click any screenshot slot to upload a custom preview.'
                : 'Explore live full-stack web applications and upcoming releases engineered from front to back.'}
            </p>
          </motion.div>

          {/* Interactive Filter Controls */}
          <div
            role="group"
            aria-label="Filter projects by status"
            className="inline-flex items-center gap-1 self-start rounded-xl border border-white/10 bg-[#0B1317]/90 p-1 backdrop-blur-md sm:self-auto"
          >
            {(['All', 'Live', 'Coming Soon'] as FilterStatus[]).map((status) => {
              const active = filter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    active
                      ? 'bg-teal-500 text-[#061210] font-semibold'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => {
            const isLive = project.status === 'Live';
            const hasExternalDemo = Boolean(project.demoUrl && project.demoUrl.startsWith('http'));
            const hostLabel = getDisplayHost(project);

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard
                  accent={isLive ? 'teal' : 'gold'}
                  className="h-full p-4 hover:border-teal-400/35"
                >
                  <div className="flex h-full flex-col">
                    {/* Browser-framed 16:9 showcase visual */}
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#070B0D]">
                      <div className="flex items-center justify-between gap-2 border-b border-white/8 bg-[#0D1519] px-3 py-2 text-[11px]">
                        <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-slate-400">
                          <Globe className="h-3 w-3 shrink-0 text-teal-400/80" aria-hidden="true" />
                          <span className="truncate">{hostLabel}</span>
                        </span>
                        {hasExternalDemo && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visit ${project.title} live web app`}
                            className="inline-flex items-center gap-0.5 font-medium text-teal-300 transition-colors hover:text-teal-200 whitespace-nowrap shrink-0"
                          >
                            <span>Visit</span>
                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                      <ImageSlot
                        slotId={project.slotId}
                        alt={project.imageAlt}
                        fallbackUrl={project.defaultImageUrl}
                        roundedClassName="rounded-none"
                        className="aspect-video w-full"
                        hint={
                          project.id === 'vidyamarg'
                            ? 'Upload VidyaMarg app screenshot'
                            : `Upload ${project.title} screenshot (16:9)`
                        }
                        onImageClick={onOpenLightbox}
                      />
                    </div>

                    <div className="mt-5 flex flex-1 flex-col px-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-xl font-semibold text-slate-50">
                          {hasExternalDemo ? (
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-colors hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded"
                            >
                              {project.title}
                            </a>
                          ) : (
                            project.title
                          )}
                        </h3>
                        <span
                          className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                            isLive ? 'text-teal-300' : 'text-amber-300'
                          }`}
                        >
                          {project.status} · <span className="tabular-nums">{project.year}</span>
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-400">{project.subtitle}</p>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">
                        {project.description}
                      </p>

                      <p className="mt-4 border-t border-white/8 pt-3 text-xs text-slate-400">
                        {project.stack.join(' · ')}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectProject(project, false)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
                        >
                          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{hasExternalDemo ? 'Preview & Details' : 'Overview'}</span>
                        </button>

                        <div className="flex items-center gap-3 text-xs font-medium">
                          {isOwnerMode && (
                            <button
                              type="button"
                              onClick={() => onSelectProject(project, true)}
                              className="inline-flex items-center gap-1 text-amber-300 transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded whitespace-nowrap shrink-0"
                            >
                              <Pencil className="h-3 w-3" aria-hidden="true" />
                              <span>Edit</span>
                            </button>
                          )}

                          {hasExternalDemo ? (
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-teal-300 transition-colors hover:text-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded whitespace-nowrap shrink-0"
                            >
                              <span>Live Demo</span>
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectProject(project, false)}
                              className="inline-flex items-center gap-1 text-amber-300/90 transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded whitespace-nowrap shrink-0"
                            >
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <span>Coming Soon</span>
                            </button>
                          )}

                          {project.codeUrl && (
                            <a
                              href={project.codeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded whitespace-nowrap shrink-0"
                            >
                              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Code</span>
                            </a>
                          )}
                        </div>
                      </div>
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
