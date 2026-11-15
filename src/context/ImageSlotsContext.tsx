import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ImageSlotId } from '../types/portfolio';
import { idbDelete, idbGet, idbSet, requestPersistentStorage } from '../utils/storage';

const STORAGE_KEY = 'roopak_portfolio_images_v1';

export type ImageMap = Partial<Record<ImageSlotId, string>>;

interface ImageSlotsContextValue {
  images: ImageMap;
  isHydrated: boolean;
  getImage: (slotId: ImageSlotId) => string | undefined;
  uploadFileToSlot: (slotId: ImageSlotId, file: File) => Promise<void>;
  copySlotImage: (fromSlotId: ImageSlotId, toSlotId: ImageSlotId) => void;
  replaceAllImages: (nextImages: ImageMap) => void;
  removeImage: (slotId: ImageSlotId) => void;
  resetAllImages: () => void;
  syncImagesToServer: (overrideImages?: ImageMap) => Promise<boolean>;
  uploadedCount: number;
  uploadError: string | null;
  clearUploadError: () => void;
}

const ImageSlotsContext = createContext<ImageSlotsContextValue | null>(null);

function compressImageToDataUrl(file: File, maxDimension = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Invalid file data.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported or corrupted image format.'));
      img.onload = () => {
        const { width, height } = img;
        if (width <= maxDimension && height <= maxDimension && file.size <= 1.2 * 1024 * 1024) {
          resolve(result);
          return;
        }

        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, 0.88);
        resolve(dataUrl);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

function readLegacyLocalStorage(): ImageMap {
  if (typeof window === 'undefined') return {};
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved) as ImageMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function ImageSlotsProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<ImageMap>(() => readLegacyLocalStorage());
  const [isHydrated, setIsHydrated] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const syncImagesToServer = useCallback(
    async (overrideImages?: ImageMap): Promise<boolean> => {
      try {
        const res = await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: overrideImages ?? images }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [images]
  );

  const persistImages = useCallback(
    async (nextImages: ImageMap) => {
      const savedToIdb = await idbSet(STORAGE_KEY, nextImages);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextImages));
      } catch {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore cleanup failure
        }
        if (!savedToIdb) {
          setUploadError(
            'Storage limit reached in this browser. Try removing unused photos or exporting a backup.'
          );
        }
      }
      void syncImagesToServer(nextImages);
    },
    [syncImagesToServer]
  );

  useEffect(() => {
    let active = true;

    async function hydrate() {
      await requestPersistentStorage();
      const stored = await idbGet<ImageMap>(STORAGE_KEY);
      if (!active) return;

      if (stored && typeof stored === 'object') {
        setImages(stored);
      } else {
        const legacy = readLegacyLocalStorage();
        if (Object.keys(legacy).length > 0) {
          await idbSet(STORAGE_KEY, legacy);
        }
      }

      // If no local images exist yet, pull shared photos from live server store
      const hasLocal =
        (stored && Object.keys(stored).length > 0) ||
        Object.keys(readLegacyLocalStorage()).length > 0;

      if (!hasLocal) {
        try {
          const res = await fetch('/api/portfolio');
          if (res.ok && active) {
            const remote = (await res.json()) as { images?: ImageMap };
            if (remote.images && typeof remote.images === 'object' && Object.keys(remote.images).length > 0) {
              setImages(remote.images);
              void idbSet(STORAGE_KEY, remote.images);
            }
          }
        } catch {
          // Ignore offline error
        }
      }

      if (active) setIsHydrated(true);
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const getImage = useCallback((slotId: ImageSlotId) => images[slotId], [images]);

  const uploadFileToSlot = useCallback(
    async (slotId: ImageSlotId, file: File) => {
      setUploadError(null);
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file (PNG, JPG, WebP, or GIF).');
        return;
      }

      try {
        const dataUrl = await compressImageToDataUrl(file);
        setImages((prev) => {
          const next = { ...prev, [slotId]: dataUrl };
          void persistImages(next);
          return next;
        });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Unable to process image.');
      }
    },
    [persistImages]
  );

  const copySlotImage = useCallback(
    (fromSlotId: ImageSlotId, toSlotId: ImageSlotId) => {
      setUploadError(null);
      setImages((prev) => {
        const source = prev[fromSlotId];
        if (!source) return prev;
        const next = { ...prev, [toSlotId]: source };
        void persistImages(next);
        return next;
      });
    },
    [persistImages]
  );

  const replaceAllImages = useCallback(
    (nextImages: ImageMap) => {
      setUploadError(null);
      setImages(nextImages);
      void persistImages(nextImages);
    },
    [persistImages]
  );

  const removeImage = useCallback(
    (slotId: ImageSlotId) => {
      setUploadError(null);
      setImages((prev) => {
        const next = { ...prev };
        delete next[slotId];
        void persistImages(next);
        return next;
      });
    },
    [persistImages]
  );

  const resetAllImages = useCallback(() => {
    setUploadError(null);
    setImages({});
    void idbDelete(STORAGE_KEY);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage removal errors
    }
    void syncImagesToServer({});
  }, [syncImagesToServer]);

  const clearUploadError = useCallback(() => setUploadError(null), []);

  const uploadedCount = Object.values(images).filter(Boolean).length;

  return (
    <ImageSlotsContext.Provider
      value={{
        images,
        isHydrated,
        getImage,
        uploadFileToSlot,
        copySlotImage,
        replaceAllImages,
        removeImage,
        resetAllImages,
        syncImagesToServer,
        uploadedCount,
        uploadError,
        clearUploadError,
      }}
    >
      {children}
    </ImageSlotsContext.Provider>
  );
}

export function useImageSlots() {
  const ctx = useContext(ImageSlotsContext);
  if (!ctx) {
    throw new Error('useImageSlots must be used within an ImageSlotsProvider');
  }
  return ctx;
}
