import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Inbox,
  Mail,
  MonitorPlay,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useImageSlots } from '../context/ImageSlotsContext';
import { useOwnerMode } from '../context/OwnerModeContext';
import { PROFILE_DETAILS } from '../data/portfolioData';
import type { AchievementItem, ContactMessage, ProfileDetails, ProjectItem } from '../types/portfolio';
import { ImageSlot } from './ImageSlot';

interface LightboxProps {
  image: { src: string; alt: string } | null;
  onClose: () => void;
}

export function ImageLightbox({ image, onClose }: LightboxProps) {
  useEffect(() => {
    if (!image) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#0C1317] text-slate-200 transition-colors hover:border-teal-400 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0B1216] p-2 shadow-2xl"
      >
        <img
          src={image.src}
          alt={image.alt}
          referrerPolicy="no-referrer"
          className="max-h-[78vh] w-auto rounded-xl object-contain"
        />
        <p className="px-3 py-2 text-xs text-slate-400">{image.alt}</p>
      </div>
    </div>
  );
}

interface ProjectModalProps {
  project: ProjectItem | null;
  initialEditMode?: boolean;
  onClose: () => void;
  onOpenLightbox: (src: string, alt: string) => void;
  onSaveProject: (projectId: string, patch: Partial<ProjectItem>) => void;
  onResetProject: (projectId: string) => void;
}

export function ProjectDetailModal({
  project,
  initialEditMode = false,
  onClose,
  onOpenLightbox,
  onSaveProject,
  onResetProject,
}: ProjectModalProps) {
  const { getImage } = useImageSlots();
  const { isOwnerMode } = useOwnerMode();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [activeTab, setActiveTab] = useState<'overview' | 'preview'>('overview');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState<'Live' | 'Coming Soon' | 'In Development'>('Coming Soon');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [stackInput, setStackInput] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [codeUrl, setCodeUrl] = useState('');

  useEffect(() => {
    if (!project) return;
    setIsEditing(isOwnerMode && initialEditMode);
    setActiveTab('overview');
    setTitle(project.title);
    setSubtitle(project.subtitle);
    setStatus(project.status);
    setYear(project.year);
    setDescription(project.description);
    setHighlightsInput(project.highlights.join('\n'));
    setStackInput(project.stack.join(', '));
    setDemoUrl(project.demoUrl ?? '');
    setCodeUrl(project.codeUrl ?? '');
  }, [project, initialEditMode, isOwnerMode]);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const hasScreenshot = Boolean(getImage(project.slotId) || project.defaultImageUrl);
  const hasExternalDemo = Boolean(project.demoUrl && project.demoUrl.startsWith('http'));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedStack = stackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedHighlights = highlightsInput
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    onSaveProject(project.id, {
      title: title.trim() || project.title,
      subtitle: subtitle.trim() || project.subtitle,
      status,
      year: year.trim() || project.year,
      description: description.trim() || project.description,
      highlights: parsedHighlights.length > 0 ? parsedHighlights : project.highlights,
      stack: parsedStack.length > 0 ? parsedStack : project.stack,
      demoUrl: demoUrl.trim() || undefined,
      codeUrl: codeUrl.trim() || undefined,
    });
    setIsEditing(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1216] p-6 shadow-2xl sm:p-8 ${
          activeTab === 'preview' && !isEditing ? 'max-w-4xl' : 'max-w-2xl'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-teal-300">
              {project.status} · <span className="tabular-nums">{project.year}</span>
            </p>
            <h3
              id="project-modal-title"
              className="mt-1 font-display text-2xl font-bold text-slate-50"
            >
              {project.title}
            </h3>
            <p className="text-sm text-slate-400">{project.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwnerMode && (
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-slate-200 transition-colors hover:border-amber-400/50 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Info'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isEditing && hasExternalDemo && (
          <div className="mt-5 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
            <div
              role="tablist"
              aria-label="Project view mode"
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#080E11] p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-teal-500 text-[#061210] font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Overview</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'preview'}
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'preview'
                    ? 'bg-teal-500 text-[#061210] font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <MonitorPlay className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Live App Preview</span>
              </button>
            </div>

            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-300 transition-colors hover:text-teal-200 whitespace-nowrap shrink-0"
            >
              <span>Open Full Tab</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        )}

        {activeTab === 'preview' && !isEditing && hasExternalDemo ? (
          <div className="mt-5">
            <div className="overflow-hidden rounded-xl border border-white/12 bg-[#070B0D]">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-[#0C1418] px-4 py-2.5 text-xs">
                <span className="truncate font-mono text-slate-400">{project.demoUrl}</span>
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-teal-300 hover:text-teal-200 whitespace-nowrap shrink-0"
                >
                  <span>Launch External</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
              <iframe
                src={project.demoUrl}
                title={`${project.title} interactive live preview`}
                className="h-[460px] w-full bg-white"
                loading="lazy"
              />
            </div>
            <p className="mt-2.5 text-xs text-slate-400">
              If your browser restricts embedded previews for this host, use{' '}
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 underline underline-offset-4"
              >
                Launch External
              </a>{' '}
              to interact with the full web application.
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <ImageSlot
              slotId={project.slotId}
              alt={project.imageAlt}
              fallbackUrl={project.defaultImageUrl}
              roundedClassName="rounded-xl"
              className="aspect-video w-full"
              hint={
                hasScreenshot
                  ? undefined
                  : 'Add your 16:9 screenshot right here or on the project card'
              }
              onImageClick={onOpenLightbox}
            />
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4 border-t border-white/8 pt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-proj-title" className="block text-xs font-medium text-slate-300">
                  Project Title
                </label>
                <input
                  id="edit-proj-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-proj-subtitle"
                  className="block text-xs font-medium text-slate-300"
                >
                  Short Tagline
                </label>
                <input
                  id="edit-proj-subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-proj-status"
                  className="block text-xs font-medium text-slate-300"
                >
                  Status
                </label>
                <select
                  id="edit-proj-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'Live' | 'Coming Soon' | 'In Development')
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
                >
                  <option value="Live">Live</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="In Development">In Development</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-proj-year" className="block text-xs font-medium text-slate-300">
                  Year
                </label>
                <input
                  id="edit-proj-year"
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-proj-desc" className="block text-xs font-medium text-slate-300">
                Project Description
              </label>
              <textarea
                id="edit-proj-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="edit-proj-highlights"
                className="block text-xs font-medium text-slate-300"
              >
                Key Highlights (one per line)
              </label>
              <textarea
                id="edit-proj-highlights"
                rows={3}
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-proj-demo" className="block text-xs font-medium text-slate-300">
                  Live Demo URL (optional)
                </label>
                <input
                  id="edit-proj-demo"
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-proj-code" className="block text-xs font-medium text-slate-300">
                  Code / Repo URL (optional)
                </label>
                <input
                  id="edit-proj-code"
                  type="url"
                  value={codeUrl}
                  onChange={(e) => setCodeUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-proj-stack" className="block text-xs font-medium text-slate-300">
                Tech Stack (comma separated)
              </label>
              <input
                id="edit-proj-stack"
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                placeholder="React, TypeScript, Node.js"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onResetProject(project.id);
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-rose-400/40 hover:text-rose-300"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Restore Default</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2 text-sm font-semibold text-[#061210] transition-colors hover:bg-teal-400"
              >
                <span>Save Project</span>
              </button>
            </div>
          </form>
        ) : (
          activeTab === 'overview' && (
            <>
              {project.role && (
                <p className="mt-5 text-xs font-medium text-slate-400">
                  Role: <span className="text-slate-200">{project.role}</span>
                </p>
              )}

              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                {project.description}
              </p>

              {(project.problem || project.solution) && (
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/8 pt-5 sm:grid-cols-2">
                  {project.problem && (
                    <div>
                      <h4 className="text-xs font-semibold tracking-wider text-amber-300 uppercase">
                        The Challenge
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                        {project.problem}
                      </p>
                    </div>
                  )}
                  {project.solution && (
                    <div>
                      <h4 className="text-xs font-semibold tracking-wider text-teal-300 uppercase">
                        Engineering Approach
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                        {project.solution}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 border-t border-white/8 pt-5">
                <h4 className="text-xs font-semibold tracking-wider text-amber-300 uppercase">
                  Key Highlights
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 text-teal-400 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-5">
                <p className="text-xs font-medium text-slate-400">
                  Stack: <span className="text-slate-200">{project.stack.join(' · ')}</span>
                </p>

                <div className="flex items-center gap-3">
                  {hasExternalDemo ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-[#061210] transition-colors hover:bg-teal-400"
                    >
                      <span>Open Live Demo</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-amber-300">
                      Coming soon to live action
                    </span>
                  )}
                  {project.codeUrl && (
                    <a
                      href={project.codeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-teal-400/40 hover:text-teal-300"
                    >
                      <span>View Code</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

interface ProfileEditModalProps {
  isOpen: boolean;
  profile: ProfileDetails;
  onClose: () => void;
  onSaveProfile: (nextProfile: ProfileDetails) => void;
}

export function ProfileEditModal({
  isOpen,
  profile,
  onClose,
  onSaveProfile,
}: ProfileEditModalProps) {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [headline, setHeadline] = useState(profile.headline);
  const [heroIntro, setHeroIntro] = useState(profile.heroIntro);
  const [currentlyBuildingLabel, setCurrentlyBuildingLabel] = useState(
    profile.currentlyBuildingLabel
  );
  const [aboutText, setAboutText] = useState(profile.aboutBio.join('\n\n'));
  const [dreamText, setDreamText] = useState(
    profile.dreamPoints.map((d) => `${d.title} :: ${d.detail}`).join('\n')
  );
  const [location, setLocation] = useState(profile.location);
  const [email, setEmail] = useState(profile.email);
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl);

  useEffect(() => {
    if (!isOpen) return;
    setName(profile.name);
    setRole(profile.role);
    setHeadline(profile.headline);
    setHeroIntro(profile.heroIntro);
    setCurrentlyBuildingLabel(profile.currentlyBuildingLabel);
    setAboutText(profile.aboutBio.join('\n\n'));
    setDreamText(profile.dreamPoints.map((d) => `${d.title} :: ${d.detail}`).join('\n'));
    setLocation(profile.location);
    setEmail(profile.email);
    setGithubUrl(profile.githubUrl);
    setLinkedinUrl(profile.linkedinUrl);
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paragraphs = aboutText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const parsedDreamPoints = dreamText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [titlePart, ...rest] = line.split('::');
        return {
          title: titlePart.trim(),
          detail: rest.join('::').trim(),
        };
      })
      .filter((item) => item.title.length > 0);

    onSaveProfile({
      ...profile,
      name: name.trim() || profile.name,
      role: role.trim() || profile.role,
      headline: headline.trim() || profile.headline,
      heroIntro: heroIntro.trim() || profile.heroIntro,
      currentlyBuildingLabel:
        currentlyBuildingLabel.trim() || profile.currentlyBuildingLabel,
      aboutBio: paragraphs.length > 0 ? paragraphs : profile.aboutBio,
      dreamPoints: parsedDreamPoints.length > 0 ? parsedDreamPoints : profile.dreamPoints,
      location: location.trim() || profile.location,
      email: email.trim() || profile.email,
      githubUrl: githubUrl.trim() || profile.githubUrl,
      linkedinUrl: linkedinUrl.trim() || profile.linkedinUrl,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={onClose}
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1216] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-teal-300">Personal Details</p>
            <h3
              id="profile-modal-title"
              className="mt-1 font-display text-2xl font-bold text-slate-50"
            >
              Edit Profile, Bio &amp; Links
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile editor"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prof-name" className="block text-xs font-medium text-slate-300">
                Full Name
              </label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-role" className="block text-xs font-medium text-slate-300">
                Role / Title
              </label>
              <input
                id="prof-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="prof-building" className="block text-xs font-medium text-slate-300">
              Currently Building Label
            </label>
            <input
              id="prof-building"
              type="text"
              value={currentlyBuildingLabel}
              onChange={(e) => setCurrentlyBuildingLabel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="prof-headline" className="block text-xs font-medium text-slate-300">
              Hero Headline
            </label>
            <input
              id="prof-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="prof-intro" className="block text-xs font-medium text-slate-300">
              Hero Intro Paragraph
            </label>
            <textarea
              id="prof-intro"
              rows={2}
              value={heroIntro}
              onChange={(e) => setHeroIntro(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="prof-bio" className="block text-xs font-medium text-slate-300">
              About Me Bio (separate paragraphs with a blank line)
            </label>
            <textarea
              id="prof-bio"
              rows={5}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="prof-dream" className="block text-xs font-medium text-slate-300">
              Career Vision Points (one per line: Title :: Description)
            </label>
            <textarea
              id="prof-dream"
              rows={4}
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prof-email" className="block text-xs font-medium text-slate-300">
                Contact Email
              </label>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-location" className="block text-xs font-medium text-slate-300">
                Location
              </label>
              <input
                id="prof-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prof-github" className="block text-xs font-medium text-slate-300">
                GitHub URL
              </label>
              <input
                id="prof-github"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-linkedin" className="block text-xs font-medium text-slate-300">
                LinkedIn URL
              </label>
              <input
                id="prof-linkedin"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            <button
              type="button"
              onClick={() => {
                onSaveProfile(PROFILE_DETAILS);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-rose-400/40 hover:text-rose-300"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Restore Default</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2 text-sm font-semibold text-[#061210] transition-colors hover:bg-teal-400"
            >
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AchievementEditModalProps {
  isOpen: boolean;
  achievement: AchievementItem | null;
  onClose: () => void;
  onSaveAchievement: (achievementId: string, patch: Partial<AchievementItem>) => void;
  onAddAchievement: (item: Omit<AchievementItem, 'id' | 'slotId'>) => void;
  onDeleteAchievement: (achievementId: string) => void;
  onResetAchievement: (achievementId: string) => void;
}

export function AchievementEditModal({
  isOpen,
  achievement,
  onClose,
  onSaveAchievement,
  onAddAchievement,
  onDeleteAchievement,
  onResetAchievement,
}: AchievementEditModalProps) {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (achievement) {
      setTitle(achievement.title);
      setIssuer(achievement.issuer);
      setDate(achievement.date);
      setCategory(achievement.category);
      setDescription(achievement.description);
    } else {
      setTitle('');
      setIssuer('');
      setDate('2026');
      setCategory('Certification');
      setDescription('');
    }
  }, [isOpen, achievement]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBuiltin = achievement ? ['ach-1', 'ach-2', 'ach-3'].includes(achievement.id) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim() || 'New Achievement';
    if (achievement) {
      onSaveAchievement(achievement.id, {
        title: cleanTitle,
        issuer: issuer.trim() || achievement.issuer,
        date: date.trim() || achievement.date,
        category: category.trim() || achievement.category,
        description: description.trim() || achievement.description,
      });
    } else {
      onAddAchievement({
        title: cleanTitle,
        issuer: issuer.trim() || 'Independent Milestone',
        date: date.trim() || '2026',
        category: category.trim() || 'Certification',
        description: description.trim() || 'Completed milestone and verification.',
        imageAlt: `${cleanTitle} certificate`,
      });
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ach-modal-title"
      onClick={onClose}
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1216] p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-amber-300">Achievement Card</p>
            <h3 id="ach-modal-title" className="mt-1 font-display text-xl font-bold text-slate-50">
              {achievement ? 'Edit Achievement Details' : 'Add New Achievement'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close achievement editor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="ach-title" className="block text-xs font-medium text-slate-300">
              Title
            </label>
            <input
              id="ach-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Full-Stack Cloud Architecture Certificate"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="ach-issuer" className="block text-xs font-medium text-slate-300">
              Issuer / Organization
            </label>
            <input
              id="ach-issuer"
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="e.g., Coursera, University, Hackathon"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ach-category" className="block text-xs font-medium text-slate-300">
                Category
              </label>
              <input
                id="ach-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Certification, Award..."
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="ach-date" className="block text-xs font-medium text-slate-300">
                Year / Date
              </label>
              <input
                id="ach-date"
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 focus:border-teal-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ach-desc" className="block text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              id="ach-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write what you learned or accomplished..."
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080E11] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            {achievement ? (
              isBuiltin ? (
                <button
                  type="button"
                  onClick={() => {
                    onResetAchievement(achievement.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-rose-400/40 hover:text-rose-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Restore Default</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteAchievement(achievement.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:border-rose-400/50 hover:bg-rose-500/10"
                >
                  <span>Delete Card</span>
                </button>
              )
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2 text-sm font-semibold text-[#061210] transition-colors hover:bg-teal-400"
            >
              <span>{achievement ? 'Save Achievement' : 'Add Achievement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ContactMessage[];
  isLoading: boolean;
  onRefresh: () => void;
  onToggleRead: (id: string, read: boolean) => void;
  onDelete: (id: string) => void;
}

export function InboxModal({
  isOpen,
  onClose,
  messages,
  isLoading,
  onRefresh,
  onToggleRead,
  onDelete,
}: InboxModalProps) {
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
      aria-labelledby="inbox-modal-title"
      onClick={onClose}
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0B1216] p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="inbox-modal-title" className="font-display text-xl font-bold text-slate-50">
                Visitor Messages Inbox
              </h3>
              <p className="text-xs text-slate-400">
                Messages submitted through your live portfolio contact form
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/40 hover:text-teal-300"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close message inbox"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:border-teal-400/50 hover:text-teal-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-[#080D10] p-8 text-center">
              <Mail className="mx-auto h-7 w-7 text-slate-500" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-slate-200">No visitor messages yet</p>
              <p className="mt-1 text-xs text-slate-400">
                When someone reaches out using your Contact form, their inquiry will appear here.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 transition-colors ${
                  msg.read
                    ? 'border-white/8 bg-[#090F12]/70'
                    : 'border-teal-400/35 bg-[#0C181C]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-semibold text-slate-100">
                      {msg.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      From <span className="text-slate-200">{msg.name}</span> ({msg.email}) ·{' '}
                      <span className="font-mono tabular-nums">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`text-xs font-medium ${
                      msg.read ? 'text-slate-500' : 'text-teal-300'
                    }`}
                  >
                    {msg.read ? 'Read' : 'Unread'}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {msg.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs">
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                    className="inline-flex items-center gap-1.5 font-medium text-teal-300 hover:text-teal-200"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Reply via Email</span>
                  </a>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleRead(msg.id, !msg.read)}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-300"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{msg.read ? 'Mark Unread' : 'Mark Read'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(msg.id)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
