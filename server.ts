import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_DIR = path.join(__dirname, '.data');
const STORE_PATH = path.join(DATA_DIR, 'portfolio-store.json');

interface StoredMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface PortfolioStoreData {
  content: Record<string, unknown> | null;
  images: Record<string, string>;
  messages: StoredMessage[];
  updatedAt: string | null;
}

const DEFAULT_STORE: PortfolioStoreData = {
  content: null,
  images: {},
  messages: [],
  updatedAt: null,
};

let memoryFallbackStore: PortfolioStoreData = { ...DEFAULT_STORE };

async function readStore(): Promise<PortfolioStoreData> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PortfolioStoreData>;
    return {
      content: parsed.content ?? null,
      images: parsed.images && typeof parsed.images === 'object' ? parsed.images : {},
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch {
    return memoryFallbackStore;
  }
}

async function writeStore(next: PortfolioStoreData): Promise<void> {
  memoryFallbackStore = next;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(next, null, 2), 'utf8');
  } catch {
    // Keep memory store active if filesystem is read-only
  }
}

interface GitHubCacheEntry {
  username: string;
  fetchedAt: number;
  data: {
    profile: {
      login: string;
      name: string;
      bio: string | null;
      avatarUrl: string;
      htmlUrl: string;
      publicRepos: number;
      followers: number;
      following: number;
    } | null;
    repos: Array<{
      id: number;
      name: string;
      description: string | null;
      htmlUrl: string;
      homepage: string | null;
      language: string | null;
      stargazersCount: number;
      forksCount: number;
      updatedAt: string;
    }>;
    source: 'live' | 'fallback';
  };
}

let githubCache: GitHubCacheEntry | null = null;
const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchGitHubData(username: string): Promise<GitHubCacheEntry['data']> {
  const safeUser = username.replace(/[^a-zA-Z0-9-]/g, '') || 'groopak7-rgb';
  const now = Date.now();
  if (githubCache && githubCache.username === safeUser && now - githubCache.fetchedAt < GITHUB_CACHE_TTL_MS) {
    return githubCache.data;
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Roopak-Portfolio-App',
  };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(safeUser)}`, { headers }),
      fetch(`https://api.github.com/users/${encodeURIComponent(safeUser)}/repos?sort=updated&per_page=8`, {
        headers,
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      throw new Error(`GitHub API responded with ${userRes.status}/${reposRes.status}`);
    }

    const userJson = (await userRes.json()) as Record<string, unknown>;
    const reposJson = (await reposRes.json()) as Array<Record<string, unknown>>;

    const data: GitHubCacheEntry['data'] = {
      profile: {
        login: String(userJson.login || safeUser),
        name: String(userJson.name || 'Roopak Gandamm'),
        bio: typeof userJson.bio === 'string' ? userJson.bio : null,
        avatarUrl: typeof userJson.avatar_url === 'string' ? userJson.avatar_url : '',
        htmlUrl: String(userJson.html_url || `https://github.com/${safeUser}`),
        publicRepos: Number(userJson.public_repos || 0),
        followers: Number(userJson.followers || 0),
        following: Number(userJson.following || 0),
      },
      repos: Array.isArray(reposJson)
        ? reposJson
            .filter((repo) => !repo.fork)
            .slice(0, 6)
            .map((repo) => ({
              id: Number(repo.id || 0),
              name: String(repo.name || 'repository'),
              description: typeof repo.description === 'string' ? repo.description : null,
              htmlUrl: String(repo.html_url || `https://github.com/${safeUser}`),
              homepage: typeof repo.homepage === 'string' && repo.homepage.trim() ? repo.homepage : null,
              language: typeof repo.language === 'string' ? repo.language : null,
              stargazersCount: Number(repo.stargazers_count || 0),
              forksCount: Number(repo.forks_count || 0),
              updatedAt: String(repo.updated_at || new Date().toISOString()),
            }))
        : [],
      source: 'live',
    };

    githubCache = { username: safeUser, fetchedAt: now, data };
    return data;
  } catch {
    return {
      profile: {
        login: safeUser,
        name: 'Roopak Gandamm',
        bio: 'Aspiring Professional Full-Stack Developer building VidyaMarg, Hiisaab, and Eazy Talk.',
        avatarUrl: '',
        htmlUrl: `https://github.com/${safeUser}`,
        publicRepos: 0,
        followers: 0,
        following: 0,
      },
      repos: [],
      source: 'fallback',
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/portfolio', async (_req, res) => {
    const store = await readStore();
    res.json({
      content: store.content,
      images: store.images,
      updatedAt: store.updatedAt,
    });
  });

  app.put('/api/portfolio', async (req, res) => {
    const body = req.body as {
      content?: Record<string, unknown> | null;
      images?: Record<string, string>;
    };
    const current = await readStore();
    const next: PortfolioStoreData = {
      content: body.content !== undefined ? body.content : current.content,
      images: body.images !== undefined && typeof body.images === 'object' ? body.images : current.images,
      messages: current.messages,
      updatedAt: new Date().toISOString(),
    };
    await writeStore(next);
    res.json({ ok: true, updatedAt: next.updatedAt });
  });

  app.get('/api/contact', async (_req, res) => {
    const store = await readStore();
    const sorted = [...store.messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ messages: sorted });
  });

  app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = (req.body ?? {}) as Record<string, unknown>;
    const cleanName = typeof name === 'string' ? name.trim().slice(0, 120) : '';
    const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 160) : '';
    const cleanSubject = typeof subject === 'string' ? subject.trim().slice(0, 180) : '';
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2500) : '';

    if (!cleanName || !cleanEmail || !cleanMessage) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    const store = await readStore();
    const newMessage: StoredMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject || 'General Inquiry',
      message: cleanMessage,
      createdAt: new Date().toISOString(),
      read: false,
    };

    await writeStore({
      ...store,
      messages: [newMessage, ...store.messages].slice(0, 200),
    });

    res.status(201).json({ ok: true, message: newMessage });
  });

  app.patch('/api/contact/:id', async (req, res) => {
    const { id } = req.params;
    const { read } = (req.body ?? {}) as { read?: boolean };
    const store = await readStore();
    const updatedMessages = store.messages.map((msg) =>
      msg.id === id ? { ...msg, read: typeof read === 'boolean' ? read : !msg.read } : msg
    );
    await writeStore({ ...store, messages: updatedMessages });
    res.json({ ok: true });
  });

  app.delete('/api/contact/:id', async (req, res) => {
    const { id } = req.params;
    const store = await readStore();
    const updatedMessages = store.messages.filter((msg) => msg.id !== id);
    await writeStore({ ...store, messages: updatedMessages });
    res.json({ ok: true });
  });

  app.get('/api/github', async (req, res) => {
    const username = typeof req.query.username === 'string' ? req.query.username : 'groopak7-rgb';
    const data = await fetchGitHubData(username);
    res.json(data);
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
