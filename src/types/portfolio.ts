export type ImageSlotId =
  | 'home-profile'
  | 'about-profile'
  | 'project-vidyamarg'
  | 'project-2'
  | 'project-3'
  | 'achievement-1'
  | 'achievement-2'
  | 'achievement-3'
  | 'contact-avatar'
  | (string & {});

export type NavSectionId = 'home' | 'about' | 'projects' | 'achievements' | 'contact';

export interface DreamPoint {
  title: string;
  detail: string;
}

export interface ProfileDetails {
  name: string;
  role: string;
  headline: string;
  heroIntro: string;
  currentlyBuildingLabel: string;
  aboutBio: string[];
  dreamPoints: DreamPoint[];
  location: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface ProjectItem {
  id: string;
  slotId: ImageSlotId;
  title: string;
  subtitle: string;
  status: 'Live' | 'Coming Soon' | 'In Development';
  year: string;
  domainLabel?: string;
  role?: string;
  problem?: string;
  solution?: string;
  description: string;
  highlights: string[];
  stack: string[];
  imageAlt: string;
  defaultImageUrl?: string;
  demoUrl?: string;
  codeUrl?: string;
}

export interface JourneyItem {
  period: string;
  title: string;
  detail: string;
}

export interface AchievementItem {
  id: string;
  slotId: ImageSlotId;
  title: string;
  issuer: string;
  date: string;
  category: string;
  description: string;
  imageAlt: string;
  defaultImageUrl?: string;
  credentialUrl?: string;
}

export interface ValuePillar {
  id: string;
  index: string;
  title: string;
  description: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface GitHubProfile {
  login: string;
  name: string;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  updatedAt: string;
}
