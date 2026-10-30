export type TabType = 'home' | 'search' | 'library' | 'liked' | 'zen';
export type CategoryType = 'all' | 'chill' | 'lofi' | 'recent' | 'zen';
export type PageMode = 'auth' | 'app';
export type AuthMode = 'login' | 'signup';
export type Language = 'en' | 'jp';

/** Where this track's audio came from */
export type TrackSource = 'jamendo' | 'itunes_preview' | 'local' | 'sample';

export interface Track {
  id: string;
  title: string;
  artist: string;
  kanji: string;
  duration: number; // in seconds
  category: CategoryType;
  coverUrl: string;
  audioUrl?: string;
  album?: string;
  genre?: string;
  gradient?: string;
  kanjiMeaning?: string;
  poetry?: {
    jp: string;
    en: string;
    poet?: string;
  };
  lyrics?: Array<{
    time: number; // seconds when line appears
    text: string;
    subtext?: string;
  }>;
  mood: string;
  tags: string[];

  // ── Source & rights metadata ──
  /** Which provider supplied this track */
  source?: TrackSource;
  /** True when audioUrl is only a short preview (~30 s), not the full track */
  isPreviewOnly?: boolean;
  /** When true the Download button is shown; set only if provider explicitly allows it */
  downloadAllowed?: boolean;
  /** Direct URL for the downloadable file (may differ from the stream URL) */
  downloadUrl?: string;
  /** Creative Commons or other license string e.g. 'CC BY-SA 3.0' */
  license?: string;
}

export interface Playlist {
  id: string;
  title: string;
  titleJp: string;
  songCount: number;
  emoji: string;
  gradient: string;
  description: string;
  coverUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  isGuest: boolean;
  rememberMe: boolean;
  personaTitle: string;
}

export interface AmbientSoundMixer {
  rain: number;   // 0 - 100
  wind: number;   // 0 - 100
  bell: number;   // 0 - 100
  stream: number; // 0 - 100
  isPlaying: boolean;
}
