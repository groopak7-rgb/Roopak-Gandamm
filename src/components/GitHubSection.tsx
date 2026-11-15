import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, GitBranch, Star } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import type { GitHubProfile, GitHubRepo } from '../types/portfolio';
import { SpotlightCard } from './SpotlightCard';

interface GitHubResponse {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
  source: 'live' | 'fallback';
}

function extractGitHubUsername(url: string): string {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split('/').filter(Boolean)[0];
    return segment || 'groopak7-rgb';
  } catch {
    return 'groopak7-rgb';
  }
}

export function GitHubSection() {
  const { profile } = usePortfolioData();
  const username = extractGitHubUsername(profile.githubUrl);

  const [data, setData] = useState<GitHubResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to load GitHub data');
        const json = (await res.json()) as GitHubResponse;
        if (active) setData(json);
      } catch {
        if (active) {
          setData({
            profile: null,
            repos: [],
            source: 'fallback',
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [username]);

  const ghProfile = data?.profile;
  const repos = data?.repos ?? [];

  return (
    <section aria-label="GitHub Engineering Activity" className="border-b border-white/8 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium text-teal-400">Open Source &amp; Repositories</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              Live GitHub Activity
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Recent public repositories and engineering activity synced from{' '}
              <span className="font-mono text-slate-200">@{username}</span>.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            {ghProfile && data?.source === 'live' && (
              <div className="flex items-center gap-3 font-mono tabular-nums text-slate-400">
                <span>
                  <strong className="text-slate-100">{ghProfile.publicRepos}</strong> public repos
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="text-slate-100">{ghProfile.followers}</strong> followers
                </span>
              </div>
            )}
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-teal-300 transition-colors hover:border-teal-400/40 hover:text-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
            >
              <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
              <span>View GitHub Profile</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-36 animate-pulse rounded-2xl border border-white/8 bg-[#0C1317]/70 p-5"
              />
            ))}
          </div>
        ) : repos.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, idx) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard className="h-full p-5 hover:border-teal-400/35">
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-base font-semibold text-slate-100 truncate transition-colors hover:text-teal-300"
                        >
                          {repo.name}
                        </a>
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${repo.name} on GitHub`}
                          className="text-slate-500 shrink-0 transition-colors hover:text-teal-300"
                        >
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {repo.description === 'webapplication'
                          ? 'Real-time web application built in TypeScript and deployed on Vercel.'
                          : repo.description ||
                            'Python problem-solving and engineering exercises repository on GitHub.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs text-slate-400">
                      <span className="font-medium text-amber-300">
                        {repo.language || (repo.name.includes('python') ? 'Python' : 'TypeScript')}
                      </span>
                      <div className="flex items-center gap-3 font-mono tabular-nums">
                        {repo.homepage && (
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans font-medium text-teal-300 transition-colors hover:text-teal-200"
                          >
                            Live App
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-300" aria-hidden="true" />
                          {repo.stargazersCount}
                        </span>
                        <span>
                          {new Date(repo.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <SpotlightCard className="mt-8 p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-base font-semibold text-slate-100">
                  GitHub Profile · @{username}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Public repositories and source code updates are hosted directly on GitHub.
                </p>
              </div>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 transition-colors hover:text-teal-200 whitespace-nowrap shrink-0"
              >
                <span>Explore @{username}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </SpotlightCard>
        )}
      </div>
    </section>
  );
}
