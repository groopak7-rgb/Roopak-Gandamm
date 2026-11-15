import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useImageSlots } from '../context/ImageSlotsContext';
import { useOwnerMode } from '../context/OwnerModeContext';
import type { ImageSlotId } from '../types/portfolio';

interface ImageSlotProps {
  slotId: ImageSlotId;
  alt: string;
  className?: string;
  roundedClassName?: string;
  hint?: string;
  compact?: boolean;
  reuseFromSlotId?: ImageSlotId;
  reuseLabel?: string;
  fallbackUrl?: string;
  variant?: 'default' | 'monogram';
  monogramInitials?: string;
  onImageClick?: (src: string, alt: string) => void;
}

export function ImageSlot({
  slotId,
  alt,
  className = '',
  roundedClassName = 'rounded-2xl',
  hint,
  compact = false,
  reuseFromSlotId,
  reuseLabel = 'Use Home photo',
  fallbackUrl,
  variant = 'default',
  monogramInitials = 'RG',
  onImageClick,
}: ImageSlotProps) {
  const { getImage, uploadFileToSlot, removeImage, copySlotImage } = useImageSlots();
  const { isOwnerMode } = useOwnerMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const customImageSrc = getImage(slotId);
  const displaySrc = customImageSrc ?? (!isOwnerMode ? fallbackUrl : fallbackUrl);
  const hasUploadedCustom = Boolean(customImageSrc);
  const reusableSrc = reuseFromSlotId ? getImage(reuseFromSlotId) : undefined;

  const openFilePicker = () => {
    if (!isOwnerMode) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFileToSlot(slotId, file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isOwnerMode) return;
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isOwnerMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (!isOwnerMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFileToSlot(slotId, file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (displaySrc && onImageClick) {
        onImageClick(displaySrc, alt);
      } else if (isOwnerMode) {
        openFilePicker();
      }
    }
  };

  return (
    <div
      className={`group relative overflow-hidden select-none ${roundedClassName} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isOwnerMode && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          aria-label={`Upload image for ${alt}`}
        />
      )}

      {displaySrc ? (
        <div
          role={onImageClick ? 'button' : undefined}
          tabIndex={onImageClick ? 0 : undefined}
          onClick={() => onImageClick?.(displaySrc, alt)}
          onKeyDown={onImageClick ? handleKeyDown : undefined}
          className={`relative h-full w-full ${onImageClick ? 'cursor-zoom-in' : ''}`}
        >
         

            <img src={profile} alt="Profile" />

          {isOwnerMode && (
            <>
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-200 ${
                  isDragging
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                }`}
              />

              <div
                className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 transition-all duration-200 ${
                  isDragging
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFilePicker();
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B1114]/90 font-medium text-slate-100 backdrop-blur-md transition-colors hover:border-teal-400/50 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 whitespace-nowrap shrink-0 ${
                    compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{hasUploadedCustom ? 'Replace' : 'Upload Custom'}</span>
                </button>

                {!compact && hasUploadedCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(slotId);
                    }}
                    aria-label={`Remove ${alt}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-[#0B1114]/90 px-2.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:border-rose-400/50 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : isOwnerMode ? (
        <div
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={handleKeyDown}
          aria-label={`Add photo here for ${alt}`}
          className={`relative flex h-full w-full cursor-pointer flex-col items-center justify-center border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${roundedClassName} ${
            isDragging
              ? 'border-teal-400 bg-gradient-to-br from-teal-950/80 via-[#0F1B20] to-amber-950/40'
              : 'border-dashed border-white/15 bg-gradient-to-br from-[#0F191E] via-[#10181D] to-[#171611] hover:border-teal-400/50 hover:from-[#122026] hover:to-[#1D1A12]'
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.16), transparent 55%), radial-gradient(circle at 80% 80%, rgba(234, 179, 8, 0.12), transparent 55%)',
            }}
          />

          <div
            className={`relative z-10 flex flex-col items-center justify-center text-center ${
              compact ? 'gap-1 p-2' : 'gap-2.5 p-5'
            }`}
          >
            <div
              className={`flex items-center justify-center rounded-xl border border-teal-400/20 bg-teal-500/10 text-teal-300 transition-transform duration-200 group-hover:scale-105 ${
                compact ? 'h-8 w-8' : 'h-12 w-12'
              }`}
            >
              {isDragging ? (
                <Upload className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
              ) : (
                <Camera className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
              )}
            </div>

            <div className="space-y-0.5">
              <p
                className={`font-medium text-slate-200 ${
                  compact ? 'text-[10px] leading-tight' : 'text-sm'
                }`}
              >
                {isDragging ? 'Drop photo' : 'Add photo here'}
              </p>
              {!compact && hint && (
                <p className="max-w-[20ch] text-xs text-slate-400">{hint}</p>
              )}
            </div>

            {!compact && reusableSrc && reuseFromSlotId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copySlotImage(reuseFromSlotId, slotId);
                }}
                className="mt-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-200 transition-colors hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
              >
                {reuseLabel}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Visitor-ready Architectural Monogram Frame when no personal photo is uploaded */
        <div
          className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B171B] via-[#091014] to-[#16140D] ${roundedClassName}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-75"
            style={{
              background:
                'radial-gradient(circle at 30% 25%, rgba(20, 184, 166, 0.2), transparent 58%), radial-gradient(circle at 78% 78%, rgba(245, 158, 11, 0.16), transparent 58%)',
            }}
          />
          <div
            aria-hidden="true"
            className={`animate-ring-slow pointer-events-none absolute rounded-full border border-dashed border-teal-400/20 ${
              compact ? 'h-16 w-16' : 'h-56 w-56'
            }`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute rounded-full border border-amber-400/15 ${
              compact ? 'h-12 w-12' : 'h-40 w-40'
            }`}
          />
          <div className="relative z-10 flex flex-col items-center text-center">
            <span
              className={`font-display font-bold tracking-tight bg-gradient-to-br from-teal-200 via-slate-100 to-amber-300 bg-clip-text text-transparent ${
                compact ? 'text-xl' : variant === 'monogram' ? 'text-6xl sm:text-7xl' : 'text-4xl'
              }`}
            >
              {monogramInitials}
            </span>
            {!compact && (
              <span className="mt-2 font-mono text-[11px] tracking-[0.22em] text-slate-400 uppercase">
                Full-Stack Builder
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
