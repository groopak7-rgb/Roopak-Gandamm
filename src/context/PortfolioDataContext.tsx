import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ACHIEVEMENTS, DEFAULT_ACHIEVEMENT_CREST_URL, PROFILE_DETAILS, PROJECTS } from '../data/portfolioData';
import type { AchievementItem, ProfileDetails, ProjectItem } from '../types/portfolio';
import { idbDelete, idbGet, idbSet } from '../utils/storage';

const DATA_STORAGE_KEY = 'roopak_portfolio_content_v7';
const V6_CONTENT_KEY = 'roopak_portfolio_content_v6';
const V5_CONTENT_KEY = 'roopak_portfolio_content_v5';
const V4_CONTENT_KEY = 'roopak_portfolio_content_v4';
const V3_CONTENT_KEY = 'roopak_portfolio_content_v3';
const PREV_CONTENT_KEY = 'roopak_portfolio_content_v2';
const LEGACY_PROJECT_KEY = 'roopak_portfolio_project_edits_v1';

export interface StoredPortfolioContent {
  profile: ProfileDetails;
  projects: ProjectItem[];
  achievements: AchievementItem[];
}

interface PortfolioDataContextValue {
  profile: ProfileDetails;
  projects: ProjectItem[];
  achievements: AchievementItem[];
  updateProfile: (nextProfile: ProfileDetails) => void;
  updateProject: (projectId: string, patch: Partial<ProjectItem>) => void;
  resetProject: (projectId: string) => void;
  updateAchievement: (achievementId: string, patch: Partial<AchievementItem>) => void;
  addAchievement: (item: Omit<AchievementItem, 'id' | 'slotId'>) => void;
  deleteAchievement: (achievementId: string) => void;
  resetAchievement: (achievementId: string) => void;
  replaceAllContent: (content: Partial<StoredPortfolioContent>) => void;
  resetAllContent: () => void;
  syncContentToServer: (overrideContent?: StoredPortfolioContent) => Promise<boolean>;
}

const DEFAULT_CONTENT: StoredPortfolioContent = {
  profile: PROFILE_DETAILS,
  projects: PROJECTS,
  achievements: ACHIEVEMENTS,
};

const PortfolioDataContext = createContext<PortfolioDataContextValue | null>(null);

function attachDefaultProjectArtwork(projects: ProjectItem[]): ProjectItem[] {
  return projects.map((proj) => {
    const builtin = PROJECTS.find((p) => p.id === proj.id);
    const hasRawSrcPath = proj.defaultImageUrl?.startsWith('/src/assets/');
    return {
      ...proj,
      domainLabel: proj.domainLabel ?? builtin?.domainLabel,
      role: proj.role ?? builtin?.role,
      problem: proj.problem ?? builtin?.problem,
      solution: proj.solution ?? builtin?.solution,
      codeUrl: proj.codeUrl ?? builtin?.codeUrl,
      defaultImageUrl: (!hasRawSrcPath ? proj.defaultImageUrl : undefined) ?? builtin?.defaultImageUrl,
    };
  });
}

function attachDefaultAchievementArtwork(achievements: AchievementItem[]): AchievementItem[] {
  return achievements.map((ach) => {
    const builtin = ACHIEVEMENTS.find((a) => a.id === ach.id);
    const hasRawSrcPath = ach.defaultImageUrl?.startsWith('/src/assets/');
    return {
      ...ach,
      defaultImageUrl:
        (!hasRawSrcPath ? ach.defaultImageUrl : undefined) ??
        builtin?.defaultImageUrl ??
        DEFAULT_ACHIEVEMENT_CREST_URL,
    };
  });
}

function normalizeContent(raw?: Partial<StoredPortfolioContent> | null): StoredPortfolioContent {
  if (!raw) return DEFAULT_CONTENT;
  return {
    profile: raw.profile ? { ...PROFILE_DETAILS, ...raw.profile } : PROFILE_DETAILS,
    projects:
      Array.isArray(raw.projects) && raw.projects.length > 0
        ? attachDefaultProjectArtwork(raw.projects)
        : PROJECTS,
    achievements:
      Array.isArray(raw.achievements) && raw.achievements.length > 0
        ? attachDefaultAchievementArtwork(raw.achievements)
        : ACHIEVEMENTS,
  };
}

function migrateNameToRoopak(profile: ProfileDetails): ProfileDetails {
  return {
    ...PROFILE_DETAILS,
    ...profile,
    name: profile.name.replace(/\bHarsha\b/g, 'Roopak'),
    aboutBio: Array.isArray(profile.aboutBio)
      ? profile.aboutBio.map((p) => p.replace(/\bHarsha\b/g, 'Roopak'))
      : PROFILE_DETAILS.aboutBio,
  };
}

function upgradeProjectsWithLiveEazyTalk(projects: ProjectItem[]): ProjectItem[] {
  const defaultEazyTalk = PROJECTS.find((p) => p.id === 'project-3');
  const upgraded = defaultEazyTalk
    ? projects.map((proj) => (proj.id === 'project-3' && !proj.demoUrl ? defaultEazyTalk : proj))
    : projects;
  return attachDefaultProjectArtwork(upgraded);
}

function readLocalContent(): StoredPortfolioContent {
  if (typeof window === 'undefined') return DEFAULT_CONTENT;
  try {
    const raw = window.localStorage.getItem(DATA_STORAGE_KEY);
    if (raw) {
      return normalizeContent(JSON.parse(raw) as Partial<StoredPortfolioContent>);
    }

    const v6Raw = window.localStorage.getItem(V6_CONTENT_KEY);
    if (v6Raw) {
      return normalizeContent(JSON.parse(v6Raw) as Partial<StoredPortfolioContent>);
    }

    for (const key of [V5_CONTENT_KEY, V4_CONTENT_KEY, V3_CONTENT_KEY]) {
      const priorRaw = window.localStorage.getItem(key);
      if (priorRaw) {
        const parsed = JSON.parse(priorRaw) as Partial<StoredPortfolioContent>;
        return {
          profile: parsed.profile ? migrateNameToRoopak(parsed.profile) : PROFILE_DETAILS,
          projects:
            Array.isArray(parsed.projects) && parsed.projects.length > 0
              ? upgradeProjectsWithLiveEazyTalk(parsed.projects)
              : PROJECTS,
          achievements:
            Array.isArray(parsed.achievements) && parsed.achievements.length > 0
              ? attachDefaultAchievementArtwork(parsed.achievements)
              : ACHIEVEMENTS,
        };
      }
    }

    const prevRaw = window.localStorage.getItem(PREV_CONTENT_KEY);
    if (prevRaw) {
      const parsedPrev = JSON.parse(prevRaw) as Partial<StoredPortfolioContent>;
      return {
        profile: parsedPrev.profile ? migrateNameToRoopak(parsedPrev.profile) : PROFILE_DETAILS,
        projects: PROJECTS,
        achievements:
          Array.isArray(parsedPrev.achievements) && parsedPrev.achievements.length > 0
            ? attachDefaultAchievementArtwork(parsedPrev.achievements)
            : ACHIEVEMENTS,
      };
    }

    const legacyProj = window.localStorage.getItem(LEGACY_PROJECT_KEY);
    if (legacyProj) {
      const overrides = JSON.parse(legacyProj) as Record<string, Partial<ProjectItem>>;
      const mergedProjects = PROJECTS.map((p) =>
        overrides[p.id] ? { ...p, ...overrides[p.id] } : p
      );
      return { ...DEFAULT_CONTENT, projects: mergedProjects };
    }
  } catch {
    // Ignore invalid JSON
  }
  return DEFAULT_CONTENT;
}

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<StoredPortfolioContent>(() => readLocalContent());

  const syncContentToServer = useCallback(
    async (overrideContent?: StoredPortfolioContent): Promise<boolean> => {
      const payload = overrideContent ?? content;
      try {
        const res = await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: payload }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [content]
  );

  const persistContent = useCallback(
    (next: StoredPortfolioContent) => {
      void idbSet(DATA_STORAGE_KEY, next);
      try {
        window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore localStorage quota failures; IndexedDB + server hold primary copy
      }
      void syncContentToServer(next);
    },
    [syncContentToServer]
  );

  useEffect(() => {
    let active = true;
    async function hydrate() {
      const stored = await idbGet<Partial<StoredPortfolioContent>>(DATA_STORAGE_KEY);
      if (!active) return;

      if (stored) {
        setContent(normalizeContent(stored));
      } else {
        const storedPrior =
          (await idbGet<Partial<StoredPortfolioContent>>(V6_CONTENT_KEY)) ??
          (await idbGet<Partial<StoredPortfolioContent>>(V5_CONTENT_KEY)) ??
          (await idbGet<Partial<StoredPortfolioContent>>(V4_CONTENT_KEY)) ??
          (await idbGet<Partial<StoredPortfolioContent>>(V3_CONTENT_KEY));
        if (active && storedPrior) {
          const migrated: StoredPortfolioContent = {
            profile: storedPrior.profile ? migrateNameToRoopak(storedPrior.profile) : PROFILE_DETAILS,
            projects:
              Array.isArray(storedPrior.projects) && storedPrior.projects.length > 0
                ? upgradeProjectsWithLiveEazyTalk(storedPrior.projects)
                : PROJECTS,
            achievements:
              Array.isArray(storedPrior.achievements) && storedPrior.achievements.length > 0
                ? attachDefaultAchievementArtwork(storedPrior.achievements)
                : ACHIEVEMENTS,
          };
          setContent(migrated);
          void idbSet(DATA_STORAGE_KEY, migrated);
        }
      }

      // Also check live server store for shared updates (if local IndexedDB had none)
      try {
        const res = await fetch('/api/portfolio');
        if (!res.ok || !active) return;
        const remote = (await res.json()) as { content?: Partial<StoredPortfolioContent> | null };
        if (remote.content && !stored) {
          const normalized = normalizeContent(remote.content);
          setContent(normalized);
          void idbSet(DATA_STORAGE_KEY, normalized);
        }
      } catch {
        // Ignore offline fetch failure
      }
    }
    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const updateProfile = useCallback(
    (nextProfile: ProfileDetails) => {
      setContent((prev) => {
        const next = { ...prev, profile: nextProfile };
        persistContent(next);
        return next;
      });
    },
    [persistContent]
  );

  const updateProject = useCallback(
    (projectId: string, patch: Partial<ProjectItem>) => {
      setContent((prev) => {
        const next: StoredPortfolioContent = {
          ...prev,
          projects: prev.projects.map((proj) =>
            proj.id === projectId ? { ...proj, ...patch } : proj
          ),
        };
        persistContent(next);
        return next;
      });
    },
    [persistContent]
  );

  const resetProject = useCallback(
    (projectId: string) => {
      const original = PROJECTS.find((p) => p.id === projectId);
      if (!original) return;
      setContent((prev) => {
        const next: StoredPortfolioContent = {
          ...prev,
          projects: prev.projects.map((proj) => (proj.id === projectId ? original : proj)),
        };
        persistContent(next);
        return next;
      });
    },
    [persistContent]
  );

  const updateAchievement = useCallback(
    (achievementId: string, patch: Partial<AchievementItem>) => {
      setContent((prev) => {
        const next: StoredPortfolioContent = {
          ...prev,
          achievements: prev.achievements.map((ach) =>
            ach.id === achievementId ? { ...ach, ...patch } : ach
          ),
        };
        persistContent(next);
        return next;
      });
    },
    [persistContent]
  );

  const addAchievement = useCallback(
    (item: Omit<AchievementItem, 'id' | 'slotId'>) => {
      const uid = `ach-${Date.now()}`;
      const newItem: AchievementItem = {
        ...item,
        id: uid,
        slotId: uid,
        defaultImageUrl: DEFAULT_ACHIEVEMENT_CREST_URL,
      };
      setContent((prev) => {
        const next: StoredPortfolioContent = {
          ...prev,
          achievements: [...prev.achievements, newItem],
        };
        persistContent(next);
        return next;
      });
    },
    [persistContent]
  );

  const deleteAchievement = useCallback(
    (achievementId: string) => {
      setContent((prev) => {
        const next: StoredPortfolioContent = {
          ...prev,
          achievements: prev.achievements.filter((ach) => ach.id !== achievementId),
        };
        persistContent(next);
        return next;
      });
    },
    [persistContent]
  );

  const resetAchievement = useCallback(
    (achievementId: string) => {
      const original = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!original) return;
      setContent((prev) => {
        const next: StoredPortfolioContent = {
          ...prev,
          achievements: prev.achievements.map((ach) => (ach.id === achievementId ? original : ach)),
        };
        persistContent(next);
        return next;
      });
    },
    [persistContent]
  );

  const replaceAllContent = useCallback(
    (incoming: Partial<StoredPortfolioContent>) => {
      const next = normalizeContent(incoming);
      setContent(next);
      persistContent(next);
    },
    [persistContent]
  );

  const resetAllContent = useCallback(() => {
    setContent(DEFAULT_CONTENT);
    void idbDelete(DATA_STORAGE_KEY);
    try {
      window.localStorage.removeItem(DATA_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_PROJECT_KEY);
    } catch {
      // Ignore errors
    }
    void syncContentToServer(DEFAULT_CONTENT);
  }, [syncContentToServer]);

  return (
    <PortfolioDataContext.Provider
      value={{
        profile: content.profile,
        projects: content.projects,
        achievements: content.achievements,
        updateProfile,
        updateProject,
        resetProject,
        updateAchievement,
        addAchievement,
        deleteAchievement,
        resetAchievement,
        replaceAllContent,
        resetAllContent,
        syncContentToServer,
      }}
    >
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const ctx = useContext(PortfolioDataContext);
  if (!ctx) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return ctx;
}
