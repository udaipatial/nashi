import React, { useEffect, useRef, useState } from 'react';
import { CategoryType, Language, TabType, Track, UserProfile } from '../types';
import { SAMPLE_PLAYLISTS, SAMPLE_TRACKS } from '../data/tracks';
import { Play, Pause, ChevronLeft, ChevronRight, Heart, Search, Sparkles, Loader2, Music, RefreshCw, HardDrive } from 'lucide-react';
import { ZenSanctuaryView } from './ZenSanctuaryView';
import { ArtworkImage } from './ArtworkImage';
import { fetchCategoryCatalog, searchMusicCatalog } from '../services/musicCatalog';
import { DownloadButton } from './DownloadButton';
import { DownloadsPage } from './DownloadsPage';

interface MusicDashboardProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentTrack: Track;
  isPlaying: boolean;
  onSelectTrack: (track: Track, newQueue?: Track[]) => void;
  onTogglePlay: () => void;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  language: Language;
  user: UserProfile;
  history?: Track[];
  ambientLayers: any;
  onUpdateAmbientLayer: (key: any, val: any) => void;
}

export const MusicDashboard: React.FC<MusicDashboardProps> = ({
  activeTab,
  setActiveTab,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  likedTrackIds,
  onToggleLike,
  language,
  user,
  history = [],
  ambientLayers,
  onUpdateAmbientLayer
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselTracks, setCarouselTracks] = useState<Track[]>(SAMPLE_TRACKS);
  const [isCategoryLoading, setIsCategoryLoading] = useState<boolean>(false);

  // Search State
  const [searchResults, setSearchResults] = useState<Track[]>(SAMPLE_TRACKS);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchOffset, setSearchOffset] = useState<number>(0);
  const [hasMoreSearch, setHasMoreSearch] = useState<boolean>(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Known tracks cache for liked tracks metadata persistence
  const [knownTracksMap, setKnownTracksMap] = useState<Map<string, Track>>(() => {
    const map = new Map<string, Track>();
    SAMPLE_TRACKS.forEach((t) => map.set(t.id, t));
    try {
      const saved = localStorage.getItem('nashi_known_tracks');
      if (saved) {
        const parsed: Track[] = JSON.parse(saved);
        parsed.forEach((t) => map.set(t.id, t));
      }
    } catch { /* ignore */ }
    return map;
  });

  const carouselRef = useRef<HTMLDivElement>(null);
  const isJp = language === 'jp';

  // Helper to register tracks into known cache
  const registerTracks = (tracks: Track[]) => {
    setKnownTracksMap((prev) => {
      const next = new Map(prev);
      let changed = false;
      tracks.forEach((t) => {
        if (!next.has(t.id)) {
          next.set(t.id, t);
          changed = true;
        }
      });
      if (changed) {
        try {
          localStorage.setItem('nashi_known_tracks', JSON.stringify(Array.from(next.values()).slice(-100)));
        } catch { /* ignore */ }
      }
      return next;
    });
  };

  // 1. Fetch category tracks dynamically
  useEffect(() => {
    let cancelled = false;
    setIsCategoryLoading(true);

    fetchCategoryCatalog(selectedCategory, 14)
      .then((tracks) => {
        if (cancelled) return;
        if (tracks && tracks.length > 0) {
          setCarouselTracks(tracks);
          registerTracks(tracks);
        } else {
          // Fallback to local sample tracks
          const fallback = SAMPLE_TRACKS.filter((track) => {
            if (selectedCategory === 'all') return true;
            if (selectedCategory === 'recent') return ['track-4', 'track-5', 'track-6', 'track-7'].includes(track.id);
            return track.category === selectedCategory;
          });
          setCarouselTracks(fallback);
        }
      })
      .catch(() => {
        if (!cancelled) setCarouselTracks(SAMPLE_TRACKS);
      })
      .finally(() => {
        if (!cancelled) setIsCategoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  // 2. Debounced Live Catalog Search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(SAMPLE_TRACKS);
      setIsSearching(false);
      setSearchError(null);
      setHasMoreSearch(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchOffset(0);

    const timer = setTimeout(() => {
      searchMusicCatalog(trimmed, 20, 0)
        .then((tracks) => {
          setSearchResults(tracks);
          registerTracks(tracks);
          setHasMoreSearch(tracks.length >= 20);
        })
        .catch((err) => {
          setSearchError(err instanceof Error ? err.message : 'Search error');
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 380);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Pagination for Search
  const handleLoadMoreSearch = async () => {
    if (isSearching || !searchQuery.trim()) return;
    const nextOffset = searchOffset + 20;
    setIsSearching(true);

    try {
      const moreTracks = await searchMusicCatalog(searchQuery.trim(), 20, nextOffset);
      if (moreTracks.length > 0) {
        setSearchResults((prev) => {
          const ids = new Set(prev.map((t) => t.id));
          const additions = moreTracks.filter((t) => !ids.has(t.id));
          return [...prev, ...additions];
        });
        registerTracks(moreTracks);
        setSearchOffset(nextOffset);
        setHasMoreSearch(moreTracks.length >= 20);
      } else {
        setHasMoreSearch(false);
      }
    } catch (err) {
      console.warn('Pagination load error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 4. Playlists click handler
  const handleSelectPlaylist = async (pl: (typeof SAMPLE_PLAYLISTS)[0]) => {
    try {
      const tracks = await searchMusicCatalog(pl.title + ' acoustic chill', 12);
      if (tracks && tracks.length > 0) {
        registerTracks(tracks);
        onSelectTrack(tracks[0], tracks);
      } else {
        onSelectTrack(SAMPLE_TRACKS[0], SAMPLE_TRACKS);
      }
    } catch {
      onSelectTrack(SAMPLE_TRACKS[0], SAMPLE_TRACKS);
    }
  };

  // Compile Liked Tracks
  const likedTracks: Track[] = Array.from(likedTrackIds)
    .map((id) => knownTracksMap.get(id))
    .filter((t): t is Track => Boolean(t));

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const categories: { id: CategoryType; labelEn: string; labelJp: string; emoji?: string }[] = [
    { id: 'all', labelEn: 'All Sounds', labelJp: 'すべての調べ' },
    { id: 'chill', labelEn: 'Japanese Chill', labelJp: '和風チル', emoji: '🍵' },
    { id: 'lofi', labelEn: 'Lo-fi & Focus', labelJp: 'ローファイと集中', emoji: '🌧️' },
    { id: 'recent', labelEn: 'Recently Added', labelJp: '最近追加' },
    { id: 'zen', labelEn: 'Zen Playlists', labelJp: '禅プレイリスト' },
  ];

  const searchTagPills = [
    'Arijit Singh',
    'Diljit Dosanjh',
    'Joe Hisaishi',
    'Lo-fi Study',
    'Rain on Shoji',
    'Acoustic Guitar',
    'Bamboo Flute',
    'Night Moon'
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-32">
      {/* 1. HOME TAB */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Personalized Welcome Greeting Card */}
          <section className="pt-2">
            <div className="washi-panel rounded-3xl p-5 sm:p-6 shadow-washi border border-parchment-300 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-jp text-[11px] text-vermilion tracking-widest uppercase font-semibold">
                    {isJp ? '夕暮れの調べ • CALM FLOW' : '夕暮れの調べ • CALM FLOW'}
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight mt-0.5 leading-snug">
                    {isJp ? `こんばんは、${user.name}さん` : `Good Evening, ${user.name.split(' ')[0]}`}
                  </h1>
                  <p className="text-xs text-ink-500 mt-1 font-normal">
                    {isJp ? '心を穏やかに、澄み渡るひとときを。' : 'Music for a calmer, brighter you.'}
                  </p>
                </div>

                {/* Hanko Seal: 調和和音 */}
                <div
                  className="border border-vermilion rounded-lg p-1.5 text-vermilion bg-vermilion/5 font-jp text-[11px] font-bold tracking-tighter leading-none shadow-sm transition-transform duration-300 hover:rotate-3 cursor-pointer"
                  title="Harmony & Chords Hanko Seal"
                >
                  調和
                  <br />
                  和音
                </div>
              </div>

              {/* Zen Quote Pill */}
              <div className="mt-4 pt-3 border-t border-parchment-300/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-700 gap-2">
                <span className="italic font-serif">
                  {isJp
                    ? '「清流の如く、川床の小石を越えて乱れず流れゆく。」'
                    : '"Like water flowing across river stones, undisturbed."'}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-parchment-200/80 text-ink-700 border border-parchment-300 shadow-2xs">
                  {isJp ? '静かな刻' : 'Quiet Time'}
                </span>
              </div>
            </div>
          </section>

          {/* Category Filter Strip */}
          <section className="pt-1">
            <div className="flex space-x-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-ink-900 text-parchment-100 shadow-md scale-102 font-semibold'
                        : 'bg-white/70 text-ink-700 border border-parchment-300/90 hover:bg-white hover:border-vermilion/50 hover:text-vermilion'
                    }`}
                  >
                    {cat.emoji && <span>{cat.emoji}</span>}
                    <span>{isJp ? cat.labelJp : cat.labelEn}</span>
                    {isActive && isCategoryLoading && (
                      <Loader2 className="w-3 h-3 animate-spin ml-1 text-vermilion" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Featured for You Horizontal Carousel */}
          <section className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline space-x-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
                  {isJp ? '厳選楽曲' : 'Featured for You'}
                </h2>
                <span className="font-jp text-xs text-ink-400">厳選楽曲</span>
              </div>

              {/* Slider Arrows */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="w-7 h-7 rounded-full bg-white/80 border border-parchment-300 flex items-center justify-center text-ink-700 hover:bg-white hover:text-vermilion transition-colors shadow-2xs active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="w-7 h-7 rounded-full bg-white/80 border border-parchment-300 flex items-center justify-center text-ink-700 hover:bg-white hover:text-vermilion transition-colors shadow-2xs active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="flex space-x-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2 scroll-smooth"
            >
              {carouselTracks.map((track) => {
                const isCurrent = currentTrack.id === track.id;
                const isTrackLiked = likedTrackIds.has(track.id);

                return (
                  <article
                    key={track.id}
                    onClick={() => {
                      if (isCurrent) {
                        onTogglePlay();
                      } else {
                        onSelectTrack(track, carouselTracks);
                      }
                    }}
                    className={`w-[230px] sm:w-[260px] flex-shrink-0 washi-card rounded-2xl overflow-hidden shadow-washi border group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                      isCurrent ? 'ring-2 ring-vermilion/40 border-vermilion/50' : 'border-parchment-300'
                    }`}
                  >
                    <div className="relative h-40 bg-[#2B2724] overflow-hidden">
                      <ArtworkImage
                        src={track.coverUrl}
                        alt={track.title}
                        fallbackSrc="/assets/mountain_bg.jpg"
                        className="w-full h-full object-cover object-center filter saturate-[1.15] group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />

                      {/* Hanko Seal Stamp */}
                      <span className="absolute top-2.5 right-2.5 w-7 h-7 bg-vermilion rounded-lg flex items-center justify-center text-[11px] font-jp font-bold text-white shadow-hanko group-hover:rotate-6 transition-transform">
                        {track.kanji}
                      </span>

                      {/* Now Playing Visualizer pill */}
                      {isCurrent && (
                        <div className="absolute bottom-2.5 left-2.5 bg-ink-900/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-white/20 shadow-md">
                          <div className={`flex items-end space-x-0.5 h-3 w-3.5 pb-0.5 ${isPlaying ? '' : 'paused'}`}>
                            <span className="w-[2px] bg-vermilion rounded-full eq-bar-1" />
                            <span className="w-[2px] bg-vermilion rounded-full eq-bar-2" />
                            <span className="w-[2px] bg-vermilion rounded-full eq-bar-3" />
                            <span className="w-[2px] bg-vermilion rounded-full eq-bar-4" />
                          </div>
                          <span className="text-[9px] uppercase tracking-wider text-parchment-100 font-semibold font-mono">
                            {isPlaying ? (isJp ? '再生中' : 'Now Playing') : (isJp ? '一時停止' : 'Paused')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5">
                      <h3 className="font-serif text-base font-bold text-ink-900 leading-snug line-clamp-1 group-hover:text-vermilion transition-colors">
                        {track.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center space-x-1.5 overflow-hidden pr-2">
                          <p className="text-xs text-ink-500 font-medium truncate">{track.artist}</p>
                          {track.isPreviewOnly && (
                            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded border border-amber-300/40 shrink-0">
                              Preview ~30s
                            </span>
                          )}
                          {track.source === 'jamendo' && (
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-300/40 shrink-0">
                              Jamendo (Full)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              registerTracks([track]);
                              onToggleLike(track.id);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isTrackLiked ? 'text-vermilion' : 'text-ink-400 hover:text-ink-700'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isTrackLiked ? 'fill-current' : ''}`} />
                          </button>

                          {/* Download button — separate from Stream/Play */}
                          <DownloadButton track={track} variant="icon" />

                          <button
                            aria-label="Stream song"
                            className="w-7 h-7 rounded-full bg-ink-900 text-parchment-100 flex items-center justify-center shadow-md group-hover:scale-110 active:scale-90 transition-all"
                          >
                            {isCurrent && isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Recently Played 2-to-4 Column Grid */}
          <section className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline space-x-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
                  {isJp ? '最近の再生履歴' : 'Recently Played'}
                </h2>
                <span className="font-jp text-xs text-ink-400">再生履歴</span>
              </div>
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs font-semibold text-vermilion hover:underline"
              >
                {isJp ? 'すべて見る' : 'See all'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {(history.length > 0 ? history.slice(0, 4) : SAMPLE_TRACKS.slice(0, 4)).map((track) => {
                const isCurrent = currentTrack.id === track.id;
                const m = Math.floor(track.duration / 60);
                const s = Math.floor(track.duration % 60);

                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      if (isCurrent) onTogglePlay();
                      else onSelectTrack(track, history);
                    }}
                    className={`washi-card p-3 rounded-2xl flex flex-col justify-between border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer group ${
                      isCurrent ? 'ring-2 ring-vermilion/40 border-vermilion/50' : 'border-parchment-300'
                    }`}
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-ink-800 mb-2.5">
                      <ArtworkImage
                        src={track.coverUrl}
                        alt={track.title}
                        fallbackSrc="/assets/mountain_bg.jpg"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />

                      {/* Hanko Kanji badge */}
                      <span className="absolute top-1.5 right-1.5 w-6 h-6 bg-vermilion rounded text-[9px] font-jp font-bold text-white flex items-center justify-center shadow-sm">
                        {track.kanji.charAt(0)}
                      </span>

                      {/* Duration stamp */}
                      <span className="absolute bottom-1.5 right-1.5 bg-ink-900/80 text-[10px] text-parchment-100 px-1.5 py-0.5 rounded font-mono">
                        {m}:{s < 10 ? '0' : ''}{s}
                      </span>

                      {/* Play Action button */}
                      <button
                        aria-label="Play Track"
                        className="absolute bottom-1.5 left-1.5 w-7 h-7 rounded-full bg-white/90 text-ink-900 flex items-center justify-center shadow-md group-hover:scale-110 active:scale-90 transition-transform"
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-ink-900 truncate group-hover:text-vermilion transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-ink-500 truncate">{track.artist}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Made for You Playlists Horizontal Row */}
          <section className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline space-x-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
                  {isJp ? 'あなたに贈る響き' : 'Made for You'}
                </h2>
                <span className="font-jp text-xs text-ink-400">あなたへ</span>
              </div>
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs font-semibold text-vermilion hover:underline"
              >
                {isJp ? 'すべて見る' : 'See all'}
              </button>
            </div>

            <div className="flex space-x-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              {SAMPLE_PLAYLISTS.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl)}
                  className="w-36 flex-shrink-0 cursor-pointer group"
                >
                  <div className="w-36 h-36 rounded-2xl bg-ink-900 overflow-hidden shadow-md relative border border-parchment-300 transition-transform duration-300 group-hover:scale-105">
                    {pl.coverUrl ? (
                      <>
                        <ArtworkImage
                          src={pl.coverUrl}
                          alt={pl.title}
                          fallbackSrc="/assets/mountain_bg.jpg"
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent flex flex-col items-center justify-end p-2.5 text-center">
                          <span className="text-2xl mb-1 drop-shadow-md group-hover:scale-110 transition-transform">
                            {pl.emoji}
                          </span>
                          <span className="text-[11px] text-parchment-100 font-jp font-semibold drop-shadow-md">
                            {pl.titleJp}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${pl.gradient} flex flex-col items-center justify-center p-2 text-center group-hover:brightness-110 transition-all`}
                      >
                        <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                          {pl.emoji}
                        </span>
                        <span className="text-[11px] text-parchment-200 font-jp font-semibold">
                          {pl.titleJp}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ink-900 truncate group-hover:text-vermilion transition-colors">
                    {pl.title}
                  </p>
                  <p className="text-[10px] text-ink-500">{isJp ? `${pl.songCount}曲` : `Playlist • ${pl.songCount} songs`}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 2. SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="space-y-6 pt-2">
          <div className="washi-card rounded-3xl p-6 sm:p-8 shadow-washi border border-parchment-300">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
              {isJp ? '音響と旋律の検索' : 'Search Frequencies & Tracks'}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              {isJp ? '世界中のアーティスト、アルバム、楽曲を検索' : 'Search millions of tracks across Hindi, Punjabi, Japanese, Lo-Fi, and Instrumental'}
            </p>

            {/* Search Input */}
            <div className="relative mt-4 flex items-center">
              {isSearching ? (
                <Loader2 className="absolute left-3.5 w-4 h-4 text-vermilion animate-spin" />
              ) : (
                <Search className="absolute left-3.5 w-4 h-4 text-ink-400" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isJp ? '楽曲、アーティスト、または気分を入力...' : 'Search for a title, artist, or meditative mood...'}
                className="w-full pl-10 pr-16 py-3 bg-white/90 border border-parchment-300 rounded-2xl text-xs sm:text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-xs text-ink-400 hover:text-ink-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick search tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTagPills.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 rounded-full text-xs bg-parchment-100/90 border border-parchment-300 text-ink-700 hover:border-vermilion hover:text-vermilion transition-all shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Search Error State */}
          {searchError && (
            <div className="washi-panel rounded-2xl p-4 text-xs text-vermilion border border-vermilion/30 flex items-center justify-between">
              <span>{searchError}</span>
              <button
                onClick={() => setSearchQuery(searchQuery)}
                className="flex items-center space-x-1 underline hover:no-underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-ink-900">
                {isJp ? `検索結果 (${searchResults.length}曲)` : `Results (${searchResults.length} tracks)`}
              </h3>
              {searchQuery && (
                <span className="text-[11px] font-mono text-ink-500">
                  {searchResults.some((t) => t.source === 'jamendo')
                    ? 'Jamendo Creative Commons (Full Tracks)'
                    : 'Audio Preview Streams (~30s fallback)'}
                </span>
              )}
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="washi-panel rounded-2xl p-10 text-center border border-parchment-300">
                <Music className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                <p className="text-sm text-ink-700 font-serif">
                  {isJp ? '一致する楽曲が見つかりませんでした。' : 'No matching tracks found.'}
                </p>
                <p className="text-xs text-ink-400 mt-1 max-w-md mx-auto">
                  {isJp
                    ? '検索ワードを変えてお試しください（例: ambient, lofi, piano, acoustic）。'
                    : 'Try searching Jamendo tags or moods like "ambient", "lofi", "piano", "acoustic", or search an artist name.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map((track) => {
                  const isCurrent = currentTrack.id === track.id;
                  const isTrackLiked = likedTrackIds.has(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => onSelectTrack(track, searchResults)}
                      className={`washi-card p-3 rounded-2xl border flex items-center justify-between cursor-pointer group hover:-translate-y-0.5 hover:shadow-md transition-all ${
                        isCurrent ? 'ring-2 ring-vermilion/40 border-vermilion/50' : 'border-parchment-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-ink-800 flex-shrink-0 relative">
                          <ArtworkImage
                            src={track.coverUrl}
                            alt={track.title}
                            fallbackSrc="/assets/mountain_bg.jpg"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-vermilion text-[8px] font-jp font-bold text-white flex items-center justify-center">
                            {track.kanji.charAt(0)}
                          </span>
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-ink-900 truncate group-hover:text-vermilion">
                              {track.title}
                            </h4>
                            {track.isPreviewOnly && (
                              <span className="text-[8px] font-mono bg-amber-500/10 text-amber-700 px-1 py-0.2 rounded border border-amber-300/40 shrink-0">
                                Preview
                              </span>
                            )}
                            {track.source === 'jamendo' && (
                              <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-700 px-1 py-0.2 rounded border border-emerald-300/40 shrink-0">
                                Full (CC)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-500 truncate">
                            {track.artist} {track.album ? `• ${track.album}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            registerTracks([track]);
                            onToggleLike(track.id);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isTrackLiked ? 'text-vermilion' : 'text-ink-400 hover:text-ink-700'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isTrackLiked ? 'fill-current' : ''}`} />
                        </button>
                        {/* Download — separate from Stream */}
                        <DownloadButton track={track} variant="icon" />
                        <button
                          aria-label="Stream track"
                          className="w-8 h-8 rounded-full bg-ink-900 text-parchment-100 flex items-center justify-center group-hover:scale-105 active:scale-90 transition-transform">
                          {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More Pagination */}
            {hasMoreSearch && searchQuery.trim() && (
              <div className="pt-3 text-center">
                <button
                  onClick={handleLoadMoreSearch}
                  disabled={isSearching}
                  className="px-5 py-2 rounded-full border border-parchment-300 bg-white/80 hover:bg-white text-ink-800 text-xs font-semibold shadow-xs hover:border-vermilion transition-all disabled:opacity-50"
                >
                  {isSearching ? 'Loading more melodies...' : 'Load More Songs'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. LIBRARY TAB */}
      {activeTab === 'library' && (
        <div className="space-y-6 pt-2">
          <div className="washi-card rounded-3xl p-6 sm:p-8 shadow-washi border border-parchment-300">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
              {isJp ? 'あなたのライブラリ' : 'Your Acoustic Library'}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              {isJp ? '保存されたプレイリストと厳選アルバム' : 'Saved playlists, curated compilations, and personal listening history'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SAMPLE_PLAYLISTS.map((pl) => (
              <div
                key={pl.id}
                onClick={() => handleSelectPlaylist(pl)}
                className="washi-card p-4 rounded-2xl border border-parchment-300 flex items-center space-x-3.5 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pl.gradient} flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-xs overflow-hidden relative`}
                >
                  {pl.coverUrl ? (
                    <ArtworkImage src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover" />
                  ) : (
                    pl.emoji
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-ink-900 truncate group-hover:text-vermilion">
                    {pl.title}
                  </h3>
                  <p className="text-[11px] text-ink-500 truncate">{pl.titleJp}</p>
                  <span className="text-[10px] text-sage font-mono">{pl.songCount} {isJp ? '曲' : 'tracks'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Downloads Section ── */}
          <div className="pt-2">
            <div className="flex items-baseline space-x-2 mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
                {isJp ? 'ダウンロード済み楽曲' : 'Downloads'}
              </h2>
              <span className="font-jp text-xs text-ink-400">オフライン</span>
            </div>
            <DownloadsPage
              language={language}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onSelectTrack={onSelectTrack}
              onTogglePlay={onTogglePlay}
            />
          </div>
        </div>
      )}

      {/* 4. LIKED TRACKS TAB */}
      {activeTab === 'liked' && (
        <div className="space-y-6 pt-2">
          <div className="washi-card rounded-3xl p-6 sm:p-8 shadow-washi border border-parchment-300 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-full bg-vermilion/15 text-vermilion flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-current" />
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
                  {isJp ? 'お気に入り楽曲' : 'Liked Frequencies'}
                </h1>
              </div>
              <p className="text-xs text-ink-500 mt-1">
                {isJp ? `${likedTracks.length}曲が保存されています` : `${likedTracks.length} quiet melodies stored in your memory`}
              </p>
            </div>

            {likedTracks.length > 0 && (
              <button
                onClick={() => onSelectTrack(likedTracks[0], likedTracks)}
                className="px-4 py-2 rounded-xl bg-ink-900 text-parchment-100 text-xs font-serif font-bold shadow-md hover:bg-ink-800 transition-all flex items-center space-x-1.5 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isJp ? 'すべて再生' : 'Play All'}</span>
              </button>
            )}
          </div>

          {likedTracks.length === 0 ? (
            <div className="washi-panel rounded-2xl p-12 text-center border border-parchment-300">
              <Heart className="w-8 h-8 text-ink-300 mx-auto mb-2" />
              <p className="text-sm text-ink-700 font-serif">
                {isJp ? 'まだお気に入りの楽曲がありません。' : 'No liked tracks yet.'}
              </p>
              <p className="text-xs text-ink-400 mt-1">
                {isJp ? 'ハートマークを押して心に響く曲を保存しましょう。' : 'Tap the heart icon on any track to save it here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {likedTracks.map((track) => {
                const isCurrent = currentTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => onSelectTrack(track, likedTracks)}
                    className="washi-card p-3 rounded-2xl border border-parchment-300 flex items-center justify-between cursor-pointer group hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-ink-800 shrink-0 relative">
                        <ArtworkImage
                          src={track.coverUrl}
                          alt={track.title}
                          fallbackSrc="/assets/mountain_bg.jpg"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-vermilion text-[7px] font-jp font-bold text-white flex items-center justify-center">
                          {track.kanji.charAt(0)}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-ink-900 truncate group-hover:text-vermilion">
                            {track.title}
                          </h4>
                          {track.isPreviewOnly && (
                            <span className="text-[8px] font-mono bg-amber-500/10 text-amber-700 px-1 py-0.2 rounded border border-amber-300/40 shrink-0">
                              Preview
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-500 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(track.id);
                        }}
                        className="text-vermilion p-1.5 hover:scale-110 active:scale-90 transition-transform"
                        title="Remove from Liked"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                      {/* Download — separate from Stream */}
                      <DownloadButton track={track} variant="icon" />
                      <button
                        aria-label="Stream track"
                        className="w-7 h-7 rounded-full bg-ink-900 text-parchment-100 flex items-center justify-center active:scale-90 shadow-sm">
                        {isCurrent && isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. ZEN SANCTUARY TAB */}
      {activeTab === 'zen' && (
        <ZenSanctuaryView
          language={language}
          ambientLayers={ambientLayers}
          onUpdateAmbientLayer={onUpdateAmbientLayer}
        />
      )}
    </div>
  );
};
