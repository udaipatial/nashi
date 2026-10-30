/**
 * Nashi Download Service
 * Handles fetching authorized downloadable audio files, persisting them in IndexedDB
 * for offline playback, and managing per-track download state.
 *
 * Requirements:
 * - Downloads are enabled ONLY when track.downloadAllowed === true and track.downloadUrl exists.
 * - Streaming URLs are never conflated with download URLs.
 * - Files are saved with genuine extensions (.mp3, .m4a, .ogg) matching their actual format.
 */

import { Track } from '../types';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error' | 'unavailable';

export interface DownloadState {
  trackId: string;
  status: DownloadStatus;
  /** 0–100 */
  progress: number;
  errorMessage?: string;
  /** Blob URL for the locally cached audio (success only) */
  localUrl?: string;
  /** ISO timestamp when the download completed */
  downloadedAt?: string;
  /** File size in bytes */
  fileSizeBytes?: number;
  /** Actual audio format extension */
  extension?: string;
}

export interface DownloadedTrackRecord {
  trackId: string;
  title: string;
  artist: string;
  coverUrl: string;
  kanji: string;
  duration: number;
  downloadedAt: string;
  fileSizeBytes: number;
  mimeType: string;
  extension: string;
  source?: string;
  license?: string;
}

// ─────────────────────────────────────────────
// IndexedDB helpers
// ─────────────────────────────────────────────

const DB_NAME = 'nashi_downloads';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';
const META_STORE = 'track_meta';

let _db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (_db) return _db;

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME); // key = trackId
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE); // key = trackId
      }
    };

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

async function saveBlob(trackId: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, trackId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadBlob(trackId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(trackId);
    req.onsuccess = () => resolve((req.result as Blob) || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteBlob(trackId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(trackId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function saveMeta(record: DownloadedTrackRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).put(record, record.trackId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteMeta(trackId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).delete(trackId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAllMeta(): Promise<DownloadedTrackRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).getAll();
      req.onsuccess = () => resolve((req.result as DownloadedTrackRecord[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Blob URL cache (avoids recreating them every render)
// ─────────────────────────────────────────────

const blobUrlCache = new Map<string, string>();

export async function getLocalUrl(trackId: string): Promise<string | null> {
  if (blobUrlCache.has(trackId)) return blobUrlCache.get(trackId)!;
  try {
    const blob = await loadBlob(trackId);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    blobUrlCache.set(trackId, url);
    return url;
  } catch {
    return null;
  }
}

export function revokeBlobUrl(trackId: string) {
  const url = blobUrlCache.get(trackId);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(trackId);
  }
}

// ─────────────────────────────────────────────
// Format & Permission Helpers
// ─────────────────────────────────────────────

/**
 * Determine whether a track is legally authorized and available for download.
 * Requires track.downloadAllowed === true and a dedicated downloadUrl.
 */
export function isDownloadableTrack(track: Track): boolean {
  return Boolean(track.downloadAllowed && track.downloadUrl);
}

/**
 * Detect correct file extension based on MIME type and URL.
 * Preserves genuine format (.mp3, .m4a, .ogg) without false renaming.
 */
export function detectAudioExtension(mimeType: string, url: string): string {
  const cleanMime = mimeType.toLowerCase();
  const cleanUrl = url.toLowerCase();

  if (cleanMime.includes('mpeg') || cleanMime.includes('mp3') || cleanUrl.includes('.mp3')) {
    return 'mp3';
  }
  if (cleanMime.includes('mp4') || cleanMime.includes('m4a') || cleanUrl.includes('.m4a')) {
    return 'm4a';
  }
  if (cleanMime.includes('ogg') || cleanUrl.includes('.ogg')) {
    return 'ogg';
  }
  if (cleanMime.includes('flac') || cleanUrl.includes('.flac')) {
    return 'flac';
  }
  if (cleanMime.includes('wav') || cleanUrl.includes('.wav')) {
    return 'wav';
  }
  if (cleanMime.includes('aac') || cleanUrl.includes('.aac')) {
    return 'aac';
  }
  return 'mp3';
}

// ─────────────────────────────────────────────
// Download a track
// ─────────────────────────────────────────────

type ProgressCallback = (progress: number) => void;

/**
 * Downloads the authorized audio file for `track`, stores it in IndexedDB,
 * and returns a local Blob URL suitable for offline <audio src>.
 */
export async function downloadTrack(
  track: Track,
  onProgress: ProgressCallback
): Promise<{ localUrl: string; fileSizeBytes: number; mimeType: string; extension: string }> {
  const targetUrl = track.downloadUrl;

  if (!targetUrl || !track.downloadAllowed) {
    throw new Error('This track is stream-only and does not permit file downloading.');
  }

  // Use fetch with ReadableStream to report download progress
  const response = await fetch(targetUrl, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Audio download server returned status ${response.status}`);
  }

  const contentLength = Number(response.headers.get('Content-Length') || 0);
  const mimeType = response.headers.get('Content-Type') || 'audio/mpeg';
  const extension = detectAudioExtension(mimeType, targetUrl);
  const reader = response.body?.getReader();

  if (!reader) {
    // Fallback: read body at once
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: mimeType });
    await saveBlob(track.id, blob);
    await saveMeta({
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      kanji: track.kanji,
      duration: track.duration,
      downloadedAt: new Date().toISOString(),
      fileSizeBytes: blob.size,
      mimeType,
      extension,
      source: track.source,
      license: track.license,
    });
    onProgress(100);
    const localUrl = URL.createObjectURL(blob);
    blobUrlCache.set(track.id, localUrl);
    return { localUrl, fileSizeBytes: blob.size, mimeType, extension };
  }

  // Stream with progress feedback
  const chunks: ArrayBuffer[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer);
    received += value.length;
    if (contentLength > 0) {
      onProgress(Math.min(99, Math.round((received / contentLength) * 100)));
    } else {
      onProgress(Math.min(90, Math.max(10, Math.round((received / 1024_000) * 90))));
    }
  }

  const blob = new Blob(chunks, { type: mimeType });
  await saveBlob(track.id, blob);
  await saveMeta({
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    coverUrl: track.coverUrl,
    kanji: track.kanji,
    duration: track.duration,
    downloadedAt: new Date().toISOString(),
    fileSizeBytes: blob.size,
    mimeType,
    extension,
    source: track.source,
    license: track.license,
  });

  onProgress(100);
  const localUrl = URL.createObjectURL(blob);
  blobUrlCache.set(track.id, localUrl);
  return { localUrl, fileSizeBytes: blob.size, mimeType, extension };
}

// ─────────────────────────────────────────────
// Delete a downloaded track
// ─────────────────────────────────────────────

export async function deleteDownload(trackId: string): Promise<void> {
  revokeBlobUrl(trackId);
  await deleteBlob(trackId);
  await deleteMeta(trackId);
}

// ─────────────────────────────────────────────
// Browser "Save As" helper (triggers native download dialog)
// ─────────────────────────────────────────────

export function triggerBrowserDownload(localUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = localUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 1000);
}

// ─────────────────────────────────────────────
// Utility: human-readable file size
// ─────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
