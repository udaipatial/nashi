/**
 * Music Catalog Service for Nashi
 * Primary Provider: Jamendo API v3.0 (Full-length Creative Commons music streaming & downloads)
 * Fallback Provider: Apple iTunes Search API (Labelled ~30s preview streams)
 *
 * Implements real metadata mapping, actual durations, separate streaming & download
 * permissions, caching, and graceful failure handling.
 */

import { CategoryType, Track } from '../types';

// ─────────────────────────────────────────────
// Jamendo API Types (Official v3.0 Documentation)
// ─────────────────────────────────────────────

export interface JamendoTrackResult {
  id: string;
  name: string;
  duration: number; // Duration in seconds
  artist_id: string;
  artist_name: string;
  artist_idstr?: string;
  album_name: string;
  album_id?: string;
  license_ccurl?: string;
  position?: number;
  releasedate?: string;
  album_image?: string;
  image: string; // Artwork URL (typically 300x300 or 500x500)
  audio: string; // Direct full-length streaming URL
  audiodownload?: string; // Direct download URL (available when audiodownload_allowed is true)
  audiodownload_allowed: boolean;
  shorturl?: string;
  shareurl?: string;
}

export interface JamendoResponseHeader {
  status: 'success' | 'failed';
  code: number;
  error_message: string;
  warnings: string;
  results_count: number;
}

export interface JamendoResponse {
  headers: JamendoResponseHeader;
  results: JamendoTrackResult[];
}

// ─────────────────────────────────────────────
// iTunes Fallback Types
// ─────────────────────────────────────────────

interface ITunesTrackResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  releaseDate?: string;
}

interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesTrackResult[];
}

// ─────────────────────────────────────────────
// Cache & Query Management
// ─────────────────────────────────────────────

const memoryCache = new Map<string, { data: Track[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

let activeSearchAbortController: AbortController | null = null;

// Japanese kanji mappings preserving Nashi's sumi-e aesthetic
const KANJI_MAP: Record<string, { kanji: string; meaning: string; mood: string }> = {
  bollywood: { kanji: '恋', meaning: 'Heartfelt Melody', mood: 'Warm & Romantic' },
  indian: { kanji: '音', meaning: 'Soulful Raga', mood: 'Acoustic & Deep' },
  punjabi: { kanji: '風', meaning: 'River Wind', mood: 'Rhythmic & Soulful' },
  hindi: { kanji: '夜', meaning: 'Night Whisper', mood: 'Intimate Vocal' },
  japanese: { kanji: '和', meaning: 'Harmonic Peace', mood: 'Zen & Contemplative' },
  jpop: { kanji: '桜', meaning: 'Sakura Petals', mood: 'Lively & Melodic' },
  soundtrack: { kanji: '夢', meaning: 'Cinematic Dream', mood: 'Ethereal & Moving' },
  lofi: { kanji: '雨', meaning: 'Shoji Rain', mood: 'Focus & Study' },
  instrumental: { kanji: '琴', meaning: 'Koto Strings', mood: 'Pure Stillness' },
  ambient: { kanji: '幽', meaning: 'Subtle Grace', mood: 'Deep Meditation' },
  acoustic: { kanji: '木', meaning: 'Wood & Strings', mood: 'Organic Resonance' },
  piano: { kanji: '鍵', meaning: 'Ivory Silence', mood: 'Delicate Reflection' },
  electronic: { kanji: '光', meaning: 'Nocturnal Glow', mood: 'Futuristic Drift' },
  default: { kanji: '波', meaning: 'Gentle Ripple', mood: 'Tranquil Flow' },
};

function getKanjiForTrack(genre?: string, title?: string, artist?: string): { kanji: string; meaning: string; mood: string } {
  const text = `${genre || ''} ${title || ''} ${artist || ''}`.toLowerCase();
  if (text.includes('punjabi') || text.includes('diljit') || text.includes('ap dhillon')) return KANJI_MAP.punjabi;
  if (text.includes('arijit') || text.includes('bollywood') || text.includes('hindi')) return KANJI_MAP.hindi;
  if (text.includes('piano') || text.includes('keys')) return KANJI_MAP.piano;
  if (text.includes('lofi') || text.includes('lo-fi') || text.includes('chillhop')) return KANJI_MAP.lofi;
  if (text.includes('zen') || text.includes('meditation') || text.includes('sleep') || text.includes('flute')) return KANJI_MAP.ambient;
  if (text.includes('japan') || text.includes('hisaishi') || text.includes('koto') || text.includes('shakuhachi')) return KANJI_MAP.japanese;
  if (text.includes('acoustic') || text.includes('guitar')) return KANJI_MAP.acoustic;
  if (text.includes('synth') || text.includes('electronic') || text.includes('chillout')) return KANJI_MAP.electronic;
  if (text.includes('instrumental')) return KANJI_MAP.instrumental;
  return KANJI_MAP.default;
}

// ─────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────

/**
 * Format a Jamendo API track into Nashi's Track model.
 * Full-length track streaming, real duration, and verified download permission.
 */
export function formatJamendoTrack(item: JamendoTrackResult, category: CategoryType = 'all'): Track {
  const kanjiInfo = getKanjiForTrack(item.album_name, item.name, item.artist_name);

  // High-resolution artwork from Jamendo (usually 300px, replaces with 600px if supported)
  const coverUrl = item.image
    ? item.image.replace(/1\.300\.jpg$/, '1.600.jpg')
    : item.album_image || '/assets/mountain_bg.jpg';

  // Duration in real seconds from Jamendo
  const durationSec = Math.max(1, Math.round(Number(item.duration) || 0));

  // Direct download is strictly conditional on Jamendo's audiodownload_allowed
  const canDownload = Boolean(item.audiodownload_allowed && item.audiodownload);
  const downloadUrl = canDownload ? item.audiodownload : undefined;

  // Clean human-readable license
  const licenseName = item.license_ccurl
    ? item.license_ccurl.includes('by-nc')
      ? 'CC BY-NC'
      : item.license_ccurl.includes('by-sa')
      ? 'CC BY-SA'
      : item.license_ccurl.includes('by')
      ? 'CC BY'
      : 'Creative Commons'
    : 'Creative Commons (CC)';

  return {
    id: `jamendo-${item.id}`,
    title: item.name || 'Untitled Track',
    artist: item.artist_name || 'Unknown Artist',
    album: item.album_name || 'Jamendo Release',
    genre: 'Creative Commons',
    kanji: kanjiInfo.kanji,
    kanjiMeaning: kanjiInfo.meaning,
    duration: durationSec,
    category,
    coverUrl,
    audioUrl: item.audio,
    mood: kanjiInfo.mood,
    tags: [
      'Jamendo',
      'Full Track',
      licenseName,
      kanjiInfo.meaning,
      'Lossless Sumi',
    ],
    poetry: {
      jp: '静寂の中に響く、一筋の清らかな旋律',
      en: 'A clear stream of melody resounding quietly within the inner sanctuary.',
      poet: 'Nashi Resonance',
    },
    source: 'jamendo',
    isPreviewOnly: false,
    downloadAllowed: canDownload,
    downloadUrl,
    license: licenseName,
  };
}

/**
 * Format an Apple iTunes Search API track as a clearly-labelled fallback.
 * Strictly preview-only (~30s duration), never disguised as full length.
 */
export function formatITunesTrack(item: ITunesTrackResult, category: CategoryType = 'all'): Track {
  const kanjiInfo = getKanjiForTrack(item.primaryGenreName, item.trackName, item.artistName);

  // High-resolution artwork
  const coverUrl = item.artworkUrl100
    ? item.artworkUrl100.replace('100x100bb', '600x600bb')
    : '/assets/mountain_bg.jpg';

  // Explicitly cap duration to actual preview length (~30 seconds)
  const previewDurationSec = 30;

  return {
    id: `itunes-${item.trackId}`,
    title: item.trackName || 'Untitled Track',
    artist: item.artistName || 'Unknown Artist',
    album: item.collectionName || 'Single',
    genre: item.primaryGenreName || 'Acoustic',
    kanji: kanjiInfo.kanji,
    kanjiMeaning: kanjiInfo.meaning,
    duration: previewDurationSec,
    category,
    coverUrl,
    audioUrl: item.previewUrl,
    mood: kanjiInfo.mood,
    tags: [
      item.primaryGenreName || 'Music',
      'Preview (~30s)',
      'Fallback Catalog',
      kanjiInfo.meaning,
    ],
    poetry: {
      jp: '夕暮れの風、短き調べに宿る情景',
      en: 'A brief melody caught on the evening breeze, lingering like warm memory.',
      poet: 'iTunes Preview Excerpt',
    },
    source: 'itunes_preview',
    isPreviewOnly: true, // Clearly marked preview
    downloadAllowed: false, // Stream only; no full download
    downloadUrl: undefined,
    license: 'Preview Rights (Apple Inc.)',
  };
}

// ─────────────────────────────────────────────
// Jamendo API Fetcher
// ─────────────────────────────────────────────

/**
 * Search the official Jamendo API for full-length tracks.
 * Returns empty array if credentials missing, rate-limited, or failed.
 */
export async function searchJamendo(
  query: string,
  limit: number = 20,
  offset: number = 0,
  signal?: AbortSignal
): Promise<Track[]> {
  const clientId = (import.meta as unknown as { env?: { VITE_JAMENDO_CLIENT_ID?: string } }).env?.VITE_JAMENDO_CLIENT_ID;

  if (!clientId || clientId === 'YOUR_JAMENDO_CLIENT_ID') {
    // Actionable guidance for user without printing credentials or throwing fatal error
    return [];
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=${limit}&offset=${offset}&audioformat=mp32&search=${encoded}&include=licenses`;

    const res = await fetch(url, { method: 'GET', signal });
    if (!res.ok) {
      console.warn(`[Nashi Music] Jamendo API HTTP ${res.status}`);
      return [];
    }

    const data: JamendoResponse = await res.json();

    if (data.headers?.status === 'failed') {
      console.warn('[Nashi Music] Jamendo API response error:', data.headers.error_message);
      return [];
    }

    if (!Array.isArray(data.results)) {
      return [];
    }

    // Filter valid tracks with audio streaming URL
    return data.results
      .filter((item) => Boolean(item.id && item.audio && item.name))
      .map((item) => formatJamendoTrack(item));
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return [];
    }
    console.warn('[Nashi Music] Jamendo search encountered an error:', err);
    return [];
  }
}

/**
 * Fetch tracks from Jamendo by genre/mood tags.
 */
export async function fetchJamendoByTags(
  tags: string,
  limit: number = 15,
  order: string = 'popularity_month'
): Promise<Track[]> {
  const clientId = (import.meta as unknown as { env?: { VITE_JAMENDO_CLIENT_ID?: string } }).env?.VITE_JAMENDO_CLIENT_ID;

  if (!clientId || clientId === 'YOUR_JAMENDO_CLIENT_ID') {
    return [];
  }

  try {
    const encodedTags = encodeURIComponent(tags);
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=${limit}&audioformat=mp32&fuzzytags=${encodedTags}&order=${order}&include=licenses`;

    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return [];

    const data: JamendoResponse = await res.json();
    if (data.headers?.status === 'failed' || !Array.isArray(data.results)) return [];

    return data.results
      .filter((item) => Boolean(item.id && item.audio && item.name))
      .map((item) => formatJamendoTrack(item));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// iTunes Search API (Fallback)
// ─────────────────────────────────────────────

async function searchITunesFallback(
  query: string,
  limit: number = 20,
  offset: number = 0,
  signal?: AbortSignal
): Promise<Track[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const baseUrl = (import.meta as unknown as { env?: { VITE_MUSIC_API_URL?: string } }).env?.VITE_MUSIC_API_URL || 'https://itunes.apple.com';
    const url = `${baseUrl}/search?term=${encoded}&entity=song&limit=${limit}&offset=${offset}`;

    const res = await fetch(url, { method: 'GET', signal });
    if (!res.ok) return [];

    const data: ITunesSearchResponse = await res.json();
    return (data.results || [])
      .filter((item) => Boolean(item.previewUrl && item.trackId))
      .map((item) => formatITunesTrack(item));
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return [];
    return [];
  }
}

// ─────────────────────────────────────────────
// Public Dual-Source Search API
// ─────────────────────────────────────────────

/**
 * Searches the music catalog.
 * Priority: Jamendo (full-length tracks).
 * Fallback: iTunes Preview API (clearly labelled as preview).
 */
export async function searchMusicCatalog(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<Track[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheKey = `search:${trimmed.toLowerCase()}:${limit}:${offset}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Cancel prior in-flight search to prevent race conditions
  if (activeSearchAbortController) {
    activeSearchAbortController.abort();
  }
  activeSearchAbortController = new AbortController();
  const signal = activeSearchAbortController.signal;

  try {
    // 1. Try Jamendo first
    let tracks = await searchJamendo(trimmed, limit, offset, signal);

    // 2. If Jamendo returns no results, fall back to iTunes Preview
    if (tracks.length === 0) {
      tracks = await searchITunesFallback(trimmed, limit, offset, signal);
    }

    // Deduplicate by track ID
    const uniqueMap = new Map<string, Track>();
    tracks.forEach((t) => {
      if (!uniqueMap.has(t.id)) uniqueMap.set(t.id, t);
    });

    const uniqueTracks = Array.from(uniqueMap.values());
    memoryCache.set(cacheKey, { data: uniqueTracks, timestamp: Date.now() });
    return uniqueTracks;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return [];
    }
    console.warn('[Nashi Music] Catalog search error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────
// Curated Categories & Recommendations
// ─────────────────────────────────────────────

/**
 * Fetch curated category tracks with full-length streaming audio
 */
export async function fetchCategoryCatalog(category: CategoryType, limit: number = 15): Promise<Track[]> {
  const cacheKey = `category:${category}:${limit}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Jamendo tag mapping for Japanese-aesthetic categories
  const jamendoTagMap: Record<CategoryType, string> = {
    chill: 'chillout+ambient+acoustic',
    lofi: 'lofi+chillhop+beats',
    recent: 'acoustic+vocal+melodic',
    zen: 'meditation+zen+ambient+relaxing',
    all: 'ambient+acoustic+instrumental',
  };

  // iTunes fallback queries for regional & acoustic authenticity
  const iTunesFallbackMap: Record<CategoryType, string> = {
    chill: 'japanese chill instrumental koto shakuhachi',
    lofi: 'lofi chill beats study rain',
    recent: 'arijit singh diljit dosanjh acoustic',
    zen: 'zen meditation singing bowl flute peace',
    all: 'joe hisaishi arijit singh lofi chill acoustic',
  };

  try {
    // Attempt Jamendo tags first
    let tracks = await fetchJamendoByTags(jamendoTagMap[category], limit);

    // If Jamendo returns empty (e.g. no client ID configured or rate-limited), fallback to iTunes
    if (tracks.length === 0) {
      tracks = await searchITunesFallback(iTunesFallbackMap[category], limit);
    }

    const categorized = tracks.map((t) => ({ ...t, category }));
    memoryCache.set(cacheKey, { data: categorized, timestamp: Date.now() });
    return categorized;
  } catch {
    return [];
  }
}

/**
 * Fetch personalized recommendations based on user liked tracks and listening history
 */
export async function fetchRecommendations(
  likedTrackIds: Set<string>,
  recentTracks: Track[],
  limit: number = 8
): Promise<Track[]> {
  const artists = new Set<string>();
  recentTracks.forEach((t) => {
    if (t.artist && t.artist !== 'Unknown Artist') artists.add(t.artist);
  });

  const preferredArtist = Array.from(artists)[0] || 'ambient chill acoustic';
  const query = `${preferredArtist} acoustic`;

  try {
    const results = await searchMusicCatalog(query, limit);
    return results.filter((r) => !likedTrackIds.has(r.id)).slice(0, limit);
  } catch {
    return [];
  }
}
