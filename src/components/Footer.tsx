import React, { useRef, useState } from 'react';
import { CloudUpload, Download, Inbox, Lock, RotateCcw, Unlock, Upload } from 'lucide-react';
import { useImageSlots, type ImageMap } from '../context/ImageSlotsContext';
import { useOwnerMode } from '../context/OwnerModeContext';
import { usePortfolioData, type StoredPortfolioContent } from '../context/PortfolioDataContext';
import { NAV_ITEMS } from '../data/portfolioData';

interface FooterProps {
  onOpenInbox: () => void;
}

export function Footer({ onOpenInbox }: FooterProps) {
  const { images, uploadedCount, replaceAllImages, resetAllImages, syncImagesToServer } =
    useImageSlots();
  const { profile, projects, achievements, replaceAllContent, syncContentToServer } =
    usePortfolioData();
  const { isOwnerMode, toggleOwnerMode, unreadCount, setLastSyncedAt } = useOwnerMode();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleExportBackup = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      content: { profile, projects, achievements },
      images,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'roopak-portfolio-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        content?: Partial<StoredPortfolioContent>;
        images?: ImageMap;
      };
      if (parsed.content) {
        replaceAllContent(parsed.content);
      }
      if (parsed.images && typeof parsed.images === 'object') {
        replaceAllImages(parsed.images);
      }
    } catch {
      // Ignore malformed backup JSON
    } finally {
      e.target.value = '';
    }
  };

  const handleSyncToLive = async () => {
    setSyncNotice('Syncing...');
    const [okContent, okImages] = await Promise.all([
      syncContentToServer({ profile, projects, achievements }),
      syncImagesToServer(images),
    ]);
    if (okContent && okImages) {
      setLastSyncedAt(new Date().toISOString());
      setSyncNotice('Synced to live server');
    } else {
      setSyncNotice('Saved locally (server offline)');
    }
    window.setTimeout(() => setSyncNotice(null), 2600);
  };

  return (
    <footer className="no-print border-t border-white/8 bg-[#05080A]/90 py-10 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-400">
          <span className="font-display font-medium text-slate-200">{profile.name}</span>
          <span aria-hidden="true" className="mx-2 text-slate-600">
            ·
          </span>
          <span>© 2026 All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-5 text-xs text-slate-400"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="transition-colors hover:text-teal-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {isOwnerMode && (
            <>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportBackup}
                className="sr-only"
                aria-label="Import portfolio backup JSON"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncToLive}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/30 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-200 transition-colors hover:bg-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
                >
                  <CloudUpload className="h-3 w-3" aria-hidden="true" />
                  <span>{syncNotice || 'Sync Live'}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenInbox}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
                >
                  <Inbox className="h-3 w-3" aria-hidden="true" />
                  <span>Inbox{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
                >
                  <Download className="h-3 w-3" aria-hidden="true" />
                  <span>Export Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-teal-400/40 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0"
                >
                  <Upload className="h-3 w-3" aria-hidden="true" />
                  <span>Import</span>
                </button>

                {uploadedCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllImages}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-400 transition-colors hover:border-rose-400/40 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>
                      Reset {uploadedCount} {uploadedCount === 1 ? 'photo' : 'photos'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={toggleOwnerMode}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0 ${
              isOwnerMode
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20'
                : 'border-white/10 text-slate-400 hover:border-teal-400/40 hover:text-teal-300'
            }`}
          >
            {isOwnerMode ? (
              <>
                <Unlock className="h-3 w-3" aria-hidden="true" />
                <span>Visitor Preview</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" aria-hidden="true" />
                <span>Owner Studio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
