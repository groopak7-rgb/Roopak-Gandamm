import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ContactMessage } from '../types/portfolio';

const OWNER_SESSION_KEY = 'roopak_owner_mode_v1';

interface OwnerModeContextValue {
  isOwnerMode: boolean;
  setOwnerMode: (enabled: boolean) => void;
  toggleOwnerMode: () => void;
  messages: ContactMessage[];
  unreadCount: number;
  isLoadingMessages: boolean;
  refreshMessages: () => Promise<void>;
  toggleMessageRead: (id: string, read: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  lastSyncedAt: string | null;
  setLastSyncedAt: (iso: string | null) => void;
}

const OwnerModeContext = createContext<OwnerModeContextValue | null>(null);

function getInitialOwnerMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('owner') === '1') {
      window.sessionStorage.setItem(OWNER_SESSION_KEY, '1');
      return true;
    }
    return window.sessionStorage.getItem(OWNER_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

const LOCAL_INBOX_KEY = 'roopak_local_inbox_v1';

function readLocalInbox(): ContactMessage[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_INBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContactMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalInbox(items: ContactMessage[]): void {
  try {
    window.localStorage.setItem(LOCAL_INBOX_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function OwnerModeProvider({ children }: { children: React.ReactNode }) {
  const [isOwnerMode, setIsOwnerModeState] = useState<boolean>(getInitialOwnerMode);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const setOwnerMode = useCallback((enabled: boolean) => {
    setIsOwnerModeState(enabled);
    try {
      if (enabled) {
        window.sessionStorage.setItem(OWNER_SESSION_KEY, '1');
      } else {
        window.sessionStorage.removeItem(OWNER_SESSION_KEY);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const toggleOwnerMode = useCallback(() => {
    setOwnerMode(!isOwnerMode);
  }, [isOwnerMode, setOwnerMode]);

  const refreshMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch('/api/contact');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = (await res.json()) as { messages?: ContactMessage[] };
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
          return;
        }
      }
      setMessages(readLocalInbox());
    } catch {
      setMessages(readLocalInbox());
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (isOwnerMode) {
      void refreshMessages();
    }
  }, [isOwnerMode, refreshMessages]);

  const toggleMessageRead = useCallback(async (id: string, read: boolean) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, read } : m));
      writeLocalInbox(next.filter((m) => m.id.startsWith('local-')));
      return next;
    });
    try {
      await fetch(`/api/contact/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
      });
    } catch {
      // Keep optimistic state
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    setMessages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      writeLocalInbox(next.filter((m) => m.id.startsWith('local-')));
      return next;
    });
    try {
      await fetch(`/api/contact/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      // Keep optimistic state
    }
  }, []);

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <OwnerModeContext.Provider
      value={{
        isOwnerMode,
        setOwnerMode,
        toggleOwnerMode,
        messages,
        unreadCount,
        isLoadingMessages,
        refreshMessages,
        toggleMessageRead,
        deleteMessage,
        lastSyncedAt,
        setLastSyncedAt,
      }}
    >
      {children}
    </OwnerModeContext.Provider>
  );
}

export function useOwnerMode() {
  const ctx = useContext(OwnerModeContext);
  if (!ctx) {
    throw new Error('useOwnerMode must be used within an OwnerModeProvider');
  }
  return ctx;
}
