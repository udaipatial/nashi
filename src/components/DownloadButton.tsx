/**
 * DownloadButton component
 * Shows a contextual download button with progress, success, error, and
 * "unavailable" states. Never combined with the Stream / Play button.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Download, CheckCircle2, XCircle, Loader2, WifiOff, HardDrive } from 'lucide-react';
import { Track } from '../types';
import {
  DownloadState,
  DownloadStatus,
  downloadTrack,
  deleteDownload,
  getLocalUrl,
  isDownloadableTrack,
  triggerBrowserDownload,
  formatBytes,
} from '../services/downloadService';

// Global in-memory store so button states survive across component remounts
const globalDownloadStates = new Map<string, DownloadState>();
const stateListeners = new Map<string, Set<(s: DownloadState) => void>>();

function getState(trackId: string): DownloadState {
  return globalDownloadStates.get(trackId) ?? { trackId, status: 'idle', progress: 0 };
}

function setState(trackId: string, patch: Partial<DownloadState>) {
  const current = getState(trackId);
  const next = { ...current, ...patch };
  globalDownloadStates.set(trackId, next);
  stateListeners.get(trackId)?.forEach((cb) => cb(next));
}

function subscribe(trackId: string, cb: (s: DownloadState) => void) {
  if (!stateListeners.has(trackId)) stateListeners.set(trackId, new Set());
  stateListeners.get(trackId)!.add(cb);
  return () => stateListeners.get(trackId)?.delete(cb);
}

// Initialise "already downloaded" state from IndexedDB on first mount
const initialised = new Set<string>();
async function initTrackState(track: Track) {
  if (initialised.has(track.id)) return;
  initialised.add(track.id);

  if (!isDownloadableTrack(track)) {
    setState(track.id, { status: 'unavailable', progress: 0 });
    return;
  }

  // Check if already saved
  const existing = await getLocalUrl(track.id);
  if (existing) {
    setState(track.id, { status: 'success', progress: 100, localUrl: existing });
  }
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface DownloadButtonProps {
  track: Track;
  /** 'icon' = compact icon-only, 'pill' = labelled pill button */
  variant?: 'icon' | 'pill';
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  track,
  variant = 'icon',
  className = '',
}) => {
  const [dlState, setDlState] = useState<DownloadState>(() => getState(track.id));

  // Subscribe to global state updates
  useEffect(() => {
    const unsub = subscribe(track.id, setDlState);
    initTrackState(track);
    return () => { unsub(); };
  }, [track.id]);

  // Re-check when track changes (different song card re-uses same component slot)
  useEffect(() => {
    setDlState(getState(track.id));
    initTrackState(track);
  }, [track.id]);

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      const current = getState(track.id);

      // Already downloaded → offer Save As again
      if (current.status === 'success' && current.localUrl) {
        const safeTitle = track.title.replace(/[^a-z0-9\s\-_.]/gi, '').trim() || 'track';
        const ext = current.extension || 'mp3';
        triggerBrowserDownload(current.localUrl, `${safeTitle}.${ext}`);
        return;
      }

      if (current.status === 'downloading') return;
      if (current.status === 'unavailable') return;

      setState(track.id, { status: 'downloading', progress: 0 });

      try {
        const { localUrl, fileSizeBytes, extension } = await downloadTrack(track, (progress) => {
          setState(track.id, { progress });
        });

        setState(track.id, {
          status: 'success',
          progress: 100,
          localUrl,
          fileSizeBytes,
          extension,
          downloadedAt: new Date().toISOString(),
        });

        // Also trigger native Save-As so the user gets the file in their Downloads folder
        const safeTitle = track.title.replace(/[^a-z0-9\s\-_.]/gi, '').trim() || 'track';
        triggerBrowserDownload(localUrl, `${safeTitle}.${extension}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Download failed';
        setState(track.id, { status: 'error', progress: 0, errorMessage: msg });
        // Auto-clear error after 4 s
        setTimeout(() => {
          const s = getState(track.id);
          if (s.status === 'error') setState(track.id, { status: 'idle', progress: 0 });
        }, 4000);
      }
    },
    [track]
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteDownload(track.id);
      initialised.delete(track.id);
      setState(track.id, { status: 'idle', progress: 0, localUrl: undefined });
    },
    [track.id]
  );

  // ── Render ────────────────────────────────────

  const { status, progress, errorMessage, fileSizeBytes } = dlState;

  if (variant === 'pill') {
    return (
      <PillButton
        status={status}
        progress={progress}
        errorMessage={errorMessage}
        fileSizeBytes={fileSizeBytes}
        onDownload={handleDownload}
        onDelete={handleDelete}
        trackTitle={track.title}
      />
    );
  }

  // Icon variant
  return (
    <IconButton
      status={status}
      progress={progress}
      errorMessage={errorMessage}
      onDownload={handleDownload}
      onDelete={handleDelete}
      className={className}
    />
  );
};

// ─────────────────────────────────────────────
// Icon button variant
// ─────────────────────────────────────────────

interface ButtonInternals {
  status: DownloadStatus;
  progress: number;
  errorMessage?: string;
  fileSizeBytes?: number;
  onDownload: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  className?: string;
  trackTitle?: string;
}

const IconButton: React.FC<ButtonInternals> = ({
  status,
  progress,
  errorMessage,
  onDownload,
  onDelete,
  className = '',
}) => {
  if (status === 'unavailable') {
    return (
      <button
        disabled
        title="Not available for download (streaming only)"
        className={`w-7 h-7 rounded-full flex items-center justify-center text-ink-300 cursor-not-allowed opacity-50 ${className}`}
        aria-label="Download unavailable"
        onClick={(e) => e.stopPropagation()}
      >
        <WifiOff className="w-3.5 h-3.5" />
      </button>
    );
  }

  if (status === 'downloading') {
    return (
      <div
        title={`Downloading… ${progress}%`}
        className={`w-7 h-7 rounded-full flex items-center justify-center relative ${className}`}
        aria-label={`Downloading ${progress}%`}
      >
        <svg className="absolute inset-0 w-7 h-7 -rotate-90" viewBox="0 0 28 28">
          <circle
            cx="14" cy="14" r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-parchment-300"
          />
          <circle
            cx="14" cy="14" r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 11}`}
            strokeDashoffset={`${2 * Math.PI * 11 * (1 - progress / 100)}`}
            className="text-vermilion transition-all duration-300"
          />
        </svg>
        <Loader2 className="w-3 h-3 animate-spin text-vermilion" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <button
        onClick={onDelete}
        title="Downloaded • Click to remove from device"
        className={`w-7 h-7 rounded-full flex items-center justify-center text-emerald-500 hover:text-vermilion transition-colors active:scale-90 ${className}`}
        aria-label="Downloaded — click to remove"
      >
        <HardDrive className="w-3.5 h-3.5 fill-current opacity-80" />
      </button>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={onDownload}
        title={`Download failed: ${errorMessage || 'Unknown error'} — Tap to retry`}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-vermilion hover:scale-110 active:scale-90 transition-all ${className}`}
        aria-label="Download failed — tap to retry"
      >
        <XCircle className="w-3.5 h-3.5" />
      </button>
    );
  }

  // idle
  return (
    <button
      onClick={onDownload}
      title="Download audio file to device"
      className={`w-7 h-7 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-700 hover:scale-110 active:scale-90 transition-all ${className}`}
      aria-label="Download track"
    >
      <Download className="w-3.5 h-3.5" />
    </button>
  );
};

// ─────────────────────────────────────────────
// Pill button variant (used in NowPlaying and Library)
// ─────────────────────────────────────────────

const PillButton: React.FC<ButtonInternals> = ({
  status,
  progress,
  errorMessage,
  fileSizeBytes,
  onDownload,
  onDelete,
  trackTitle,
}) => {
  if (status === 'unavailable') {
    return (
      <div
        title="Not available for download"
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-parchment-300 text-xs text-ink-400 cursor-not-allowed opacity-60"
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Stream Only</span>
      </div>
    );
  }

  if (status === 'downloading') {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-vermilion/30 bg-vermilion/5 text-xs text-vermilion">
        <div className="relative w-3.5 h-3.5">
          <svg className="absolute inset-0 w-3.5 h-3.5 -rotate-90" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30" />
            <circle
              cx="7" cy="7" r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray={`${2 * Math.PI * 5}`}
              strokeDashoffset={`${2 * Math.PI * 5 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
        </div>
        <span>{progress}%</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center space-x-1.5">
        <button
          onClick={onDownload}
          title="Re-download / Save As"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-emerald-400/40 bg-emerald-50/60 text-xs text-emerald-700 hover:bg-emerald-50 transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Saved{fileSizeBytes ? ` • ${formatBytes(fileSizeBytes)}` : ''}</span>
        </button>
        <button
          onClick={onDelete}
          title="Remove download"
          className="w-6 h-6 rounded-full flex items-center justify-center text-ink-400 hover:text-vermilion transition-colors"
          aria-label="Remove download"
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={onDownload}
        title={`Failed: ${errorMessage} — tap to retry`}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-vermilion/40 bg-vermilion/5 text-xs text-vermilion hover:bg-vermilion/10 transition-all"
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Retry</span>
      </button>
    );
  }

  // idle
  const label = trackTitle ? `Download "${trackTitle}"` : 'Download';
  return (
    <button
      onClick={onDownload}
      title={label}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-parchment-300 bg-white/80 text-xs text-ink-700 hover:border-vermilion hover:text-vermilion hover:bg-white transition-all active:scale-95 shadow-2xs"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Download</span>
    </button>
  );
};

// ─────────────────────────────────────────────
// Export state helpers for the Downloads page
// ─────────────────────────────────────────────

export { globalDownloadStates, subscribe as subscribeToDownloadState, getState as getDownloadState };
