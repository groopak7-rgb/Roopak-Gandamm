import { useMemo, useState } from 'react';
import { Eye, Inbox, X } from 'lucide-react';
import { AboutSection } from './components/AboutSection';
import { AchievementsSection } from './components/AchievementsSection';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { ContactSection } from './components/ContactSection';
import { CursorEffect } from './components/CursorEffect';
import { Footer } from './components/Footer';
import { GitHubSection } from './components/GitHubSection';
import { HeroSection } from './components/HeroSection';
import {
  AchievementEditModal,
  ImageLightbox,
  InboxModal,
  ProfileEditModal,
  ProjectDetailModal,
} from './components/Modals';
import { Navbar } from './components/Navbar';
import { ProjectsSection } from './components/ProjectsSection';
import { ResumeModal } from './components/ResumeModal';
import { ImageSlotsProvider, useImageSlots } from './context/ImageSlotsContext';
import { OwnerModeProvider, useOwnerMode } from './context/OwnerModeContext';
import { PortfolioDataProvider, usePortfolioData } from './context/PortfolioDataContext';
import { NAV_ITEMS } from './data/portfolioData';
import { useActiveSection } from './hooks/useActiveSection';
import type { AchievementItem, ProjectItem } from './types/portfolio';

function PortfolioShell() {
  const sectionIds = useMemo(() => NAV_ITEMS.map((item) => item.id), []);
  const activeSection = useActiveSection(sectionIds);
  const { uploadError, clearUploadError } = useImageSlots();
  const {
    isOwnerMode,
    setOwnerMode,
    messages,
    unreadCount,
    isLoadingMessages,
    refreshMessages,
    toggleMessageRead,
    deleteMessage,
  } = useOwnerMode();
  const {
    profile,
    projects,
    achievements,
    updateProfile,
    updateProject,
    resetProject,
    updateAchievement,
    addAchievement,
    deleteAchievement,
    resetAchievement,
  } = usePortfolioData();

  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [startProjectEdit, setStartProjectEdit] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  const selectedProject: ProjectItem | null =
    projects.find((p) => p.id === selectedProjectId) ?? null;

  const editingAchievement: AchievementItem | null =
    achievements.find((a) => a.id === editingAchievementId) ?? null;

  const handleOpenLightbox = (src: string, alt: string) => {
    setLightboxImage({ src, alt });
  };

  const handleSelectProject = (project: ProjectItem, editMode = false) => {
    setSelectedProjectId(project.id);
    setStartProjectEdit(editMode);
  };

  return (
    <div className="relative min-h-screen bg-[#060A0C] text-[#F1F5F9]">
      <AtmosphericBackground />
      <CursorEffect />

      <div className="relative z-10">
        <Navbar activeSection={activeSection} />

        {uploadError && (
          <div
            role="alert"
            className="no-print fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-rose-400/30 bg-[#160D10] p-4 text-xs text-rose-200 shadow-xl"
          >
            <p className="flex-1 leading-relaxed">{uploadError}</p>
            <button
              type="button"
              onClick={clearUploadError}
              aria-label="Dismiss error"
              className="rounded p-0.5 text-rose-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isOwnerMode && (
          <div className="no-print fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl border border-amber-400/35 bg-[#0C1418]/95 px-3.5 py-2 text-xs shadow-2xl backdrop-blur-md">
            <span className="font-semibold text-amber-300">Owner Studio</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <button
              type="button"
              onClick={() => setIsInboxOpen(true)}
              className="inline-flex items-center gap-1 text-slate-200 transition-colors hover:text-teal-300 whitespace-nowrap"
            >
              <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Inbox{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
            </button>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <button
              type="button"
              onClick={() => setOwnerMode(false)}
              className="inline-flex items-center gap-1 text-teal-300 transition-colors hover:text-teal-200 whitespace-nowrap"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Visitor View</span>
            </button>
          </div>
        )}

        <main className="no-print">
          <HeroSection
            onOpenLightbox={handleOpenLightbox}
            onEditProfile={() => setIsEditingProfile(true)}
            onOpenResume={() => setIsResumeOpen(true)}
          />
          <AboutSection
            onOpenLightbox={handleOpenLightbox}
            onEditProfile={() => setIsEditingProfile(true)}
          />
          <ProjectsSection
            onOpenLightbox={handleOpenLightbox}
            onSelectProject={handleSelectProject}
          />
          <GitHubSection />
          <AchievementsSection
            onOpenLightbox={handleOpenLightbox}
            onEditAchievement={(ach) => {
              setEditingAchievementId(ach.id);
              setIsAchievementModalOpen(true);
            }}
            onAddAchievement={() => {
              setEditingAchievementId(null);
              setIsAchievementModalOpen(true);
            }}
          />
          <ContactSection
            onOpenLightbox={handleOpenLightbox}
            onEditProfile={() => setIsEditingProfile(true)}
            onOpenInbox={() => setIsInboxOpen(true)}
          />
        </main>

        <Footer onOpenInbox={() => setIsInboxOpen(true)} />
      </div>

      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      <ProjectDetailModal
        project={selectedProject}
        initialEditMode={startProjectEdit}
        onClose={() => {
          setSelectedProjectId(null);
          setStartProjectEdit(false);
        }}
        onOpenLightbox={handleOpenLightbox}
        onSaveProject={updateProject}
        onResetProject={resetProject}
      />
      <ProfileEditModal
        isOpen={isEditingProfile}
        profile={profile}
        onClose={() => setIsEditingProfile(false)}
        onSaveProfile={updateProfile}
      />
      <AchievementEditModal
        isOpen={isAchievementModalOpen}
        achievement={editingAchievement}
        onClose={() => {
          setIsAchievementModalOpen(false);
          setEditingAchievementId(null);
        }}
        onSaveAchievement={updateAchievement}
        onAddAchievement={addAchievement}
        onDeleteAchievement={deleteAchievement}
        onResetAchievement={resetAchievement}
      />
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
      <InboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        messages={messages}
        isLoading={isLoadingMessages}
        onRefresh={() => void refreshMessages()}
        onToggleRead={(id, read) => void toggleMessageRead(id, read)}
        onDelete={(id) => void deleteMessage(id)}
      />
    </div>
  );
}

export default function App() {
  return (
    <OwnerModeProvider>
      <PortfolioDataProvider>
        <ImageSlotsProvider>
          <PortfolioShell />
        </ImageSlotsProvider>
      </PortfolioDataProvider>
    </OwnerModeProvider>
  );
}
