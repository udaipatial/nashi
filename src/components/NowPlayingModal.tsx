import React, { useState, useEffect } from 'react';
import { Track, Language, AmbientSoundMixer } from '../types';
import {
  ChevronDown,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Sparkles,
  CloudRain,
  Wind,
  Droplets
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { ArtworkImage } from './ArtworkImage';
import { DownloadButton } from './DownloadButton';

interface NowPlayingModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  currentTime: number;
  onSeek: (seconds: number) => void;
  isLiked: boolean;
  onToggleLike: () => void;
  language: Language;
  ambientLayers: AmbientSoundMixer;
  onUpdateAmbientLayer: (key: keyof AmbientSoundMixer, value: number | boolean) => void;
}

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentTime,
  onSeek,
  isLiked,
  onToggleLike,
  language,
  ambientLayers,
  onUpdateAmbientLayer
}) => {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'ambient' | 'poetry'>('lyrics');
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isShuffled, setIsShuffled] = useState(false);
  const [zenTimerMinutes, setZenTimerMinutes] = useState<number | null>(null);
  const [zenTimerSecondsLeft, setZenTimerSecondsLeft] = useState<number | null>(null);

  const isJp = language === 'jp';

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Zen sleep/tea timer countdown
  useEffect(() => {
    if (zenTimerSecondsLeft === null || zenTimerSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setZenTimerSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          audioEngine.playSingingBowl(528); // gentle completion bell chime
          if (isPlaying) onTogglePlay();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [zenTimerSecondsLeft, isPlaying, onTogglePlay]);

  const handleStartTimer = (mins: number) => {
    if (zenTimerMinutes === mins && zenTimerSecondsLeft !== null) {
      setZenTimerMinutes(null);
      setZenTimerSecondsLeft(null);
    } else {
      setZenTimerMinutes(mins);
      setZenTimerSecondsLeft(mins * 60);
      audioEngine.playSingingBowl(432);
    }
  };

  if (!isOpen) return null;

  const currentPercent = (currentTime / track.duration) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-ink-900/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-full sm:h-[92vh] sm:rounded-3xl washi-card shadow-2xl flex flex-col overflow-hidden relative border border-parchment-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-parchment-300/60 bg-white/40">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 border border-parchment-300 flex items-center justify-center text-ink-700 hover:bg-white active:scale-90 transition-all"
            aria-label="Collapse player"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-vermilion uppercase font-semibold">
              {isJp ? '演奏中 • 音響空間' : 'PLAYING SANCTUARY'}
            </span>
            <p className="font-serif font-bold text-base text-ink-900 leading-tight">
              {track.kanji} • {track.title}
            </p>
          </div>

          {/* Singing bowl bell trigger button */}
          <button
            onClick={() => audioEngine.playSingingBowl(432)}
            className="w-9 h-9 rounded-full bg-white/80 border border-parchment-300 flex items-center justify-center text-vermilion hover:bg-white active:scale-90 transition-all"
            title="Ring Japanese Temple Singing Bowl (鈴)"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col items-center">
          {/* Cover Art Centerpiece */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-floating border-2 border-white/60 group mt-2">
            <ArtworkImage
              src={track.coverUrl}
              alt={track.title}
              fallbackSrc="/assets/mountain_bg.jpg"
              className={`w-full h-full object-cover object-center filter saturate-[1.2] transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />

            {/* Red Hanko Seal Stamp */}
            <span className="absolute top-3.5 right-3.5 w-8 h-8 bg-vermilion rounded-lg flex items-center justify-center text-xs font-jp font-bold text-white shadow-hanko">
              {track.kanji}
            </span>

            {/* Now Playing visual equalizer badge */}
            <div className="absolute bottom-3 left-3 bg-ink-900/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-2 border border-white/20">
              <div className={`flex items-end space-x-0.5 h-3.5 w-4 pb-0.5 ${isPlaying ? '' : 'paused'}`}>
                <span className="w-[2px] bg-vermilion rounded-full eq-bar-1" />
                <span className="w-[2px] bg-vermilion rounded-full eq-bar-2" />
                <span className="w-[2px] bg-vermilion rounded-full eq-bar-3" />
                <span className="w-[2px] bg-vermilion rounded-full eq-bar-4" />
              </div>
              <span className="text-[10px] uppercase font-mono text-parchment-100 font-semibold tracking-wider">
                {isPlaying ? (isJp ? '再生中' : 'FLOWING') : (isJp ? '一時停止' : 'RESTING')}
              </span>
            </div>
          </div>

          {/* Track Details & Favorite + Download */}
          <div className="w-full mt-6 flex items-start justify-between">
            <div className="pr-4">
              <h2 className="font-serif text-2xl font-bold text-ink-900 tracking-tight leading-snug">
                {track.title}
              </h2>
              <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                <p className="text-sm text-ink-600 font-medium">{track.artist}</p>
                <span className="text-ink-300">•</span>
                <span className="text-xs text-sage font-mono bg-sage/10 px-2 py-0.5 rounded-full">
                  {track.mood}
                </span>
                {track.isPreviewOnly && (
                  <span className="text-[10px] text-amber-700 font-mono bg-amber-500/10 border border-amber-300/40 px-2 py-0.5 rounded-full">
                    Preview (~30s)
                  </span>
                )}
                {track.license && (
                  <span className="text-[10px] text-ink-500 font-mono bg-parchment-200/80 border border-parchment-300 px-2 py-0.5 rounded-full">
                    {track.license}
                  </span>
                )}
              </div>

              {/* Download pill — separate from stream controls */}
              <div className="mt-3">
                <DownloadButton track={track} variant="pill" />
              </div>
            </div>

            <button
              onClick={onToggleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-75 ${
                isLiked ? 'text-vermilion bg-vermilion/10' : 'text-ink-400 bg-white/70 hover:text-ink-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current animate-heart-pop' : ''}`} />
            </button>
          </div>

          {/* Interactive Scrubber Bar */}
          <div className="w-full mt-6">
            <div
              className="relative w-full h-2 bg-ink-900/10 rounded-full cursor-pointer overflow-hidden group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                onSeek(Math.floor(pct * track.duration));
              }}
            >
              <div
                className="h-full bg-vermilion rounded-full transition-all duration-300 relative"
                style={{ width: `${currentPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-vermilion opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs font-mono text-ink-500 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Playback Controls Row */}
          <div className="w-full mt-4 flex items-center justify-between px-4 sm:px-12">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isShuffled ? 'text-vermilion bg-vermilion/15' : 'text-ink-400 hover:text-ink-800'
              }`}
              title="Toggle Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrevTrack}
              className="w-10 h-10 rounded-full flex items-center justify-center text-ink-800 hover:bg-parchment-200/60 active:scale-90 transition-all"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Giant Play/Pause Circle */}
            <button
              onClick={onTogglePlay}
              className="w-16 h-16 rounded-full bg-ink-900 text-parchment-100 flex items-center justify-center shadow-floating hover:scale-105 active:scale-95 transition-all"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="w-10 h-10 rounded-full flex items-center justify-center text-ink-800 hover:bg-parchment-200/60 active:scale-90 transition-all"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => {
                const next = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
                setRepeatMode(next);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                repeatMode !== 'off' ? 'text-vermilion bg-vermilion/15' : 'text-ink-400 hover:text-ink-800'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Subview Tabs: Lyrics, Poetry, Ambient Layers */}
          <div className="w-full mt-8 border-t border-parchment-300/80 pt-5">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <button
                onClick={() => setActiveTab('lyrics')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'lyrics'
                    ? 'bg-ink-900 text-parchment-100 shadow-sm'
                    : 'text-ink-600 hover:bg-parchment-200'
                }`}
              >
                {isJp ? '詩と歌詞' : 'Synchronized Lyrics'}
              </button>
              <button
                onClick={() => setActiveTab('poetry')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'poetry'
                    ? 'bg-ink-900 text-parchment-100 shadow-sm'
                    : 'text-ink-600 hover:bg-parchment-200'
                }`}
              >
                {isJp ? '俳句・言霊' : 'Haiku & Verse'}
              </button>
              <button
                onClick={() => setActiveTab('ambient')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'ambient'
                    ? 'bg-ink-900 text-parchment-100 shadow-sm'
                    : 'text-ink-600 hover:bg-parchment-200'
                }`}
              >
                {isJp ? '自然音ミキサー' : 'Ambient Mixer'}
              </button>
            </div>

            {/* TAB CONTENT: Synchronized Lyrics */}
            {activeTab === 'lyrics' && (
              <div className="space-y-4 text-center max-w-lg mx-auto py-2">
                {track.lyrics && track.lyrics.length > 0 ? (
                  track.lyrics.map((line, idx) => {
                    const isActive =
                      currentTime >= line.time &&
                      (idx === (track.lyrics?.length ?? 1) - 1 || currentTime < (track.lyrics?.[idx + 1]?.time ?? Infinity));

                    return (
                      <div
                        key={idx}
                        onClick={() => onSeek(line.time)}
                        className={`cursor-pointer transition-all duration-300 p-2 rounded-xl ${
                          isActive
                            ? 'text-ink-900 font-serif font-bold text-lg sm:text-xl scale-105 bg-parchment-100/90 shadow-sm'
                            : 'text-ink-400 hover:text-ink-700 text-sm font-serif'
                        }`}
                      >
                        <p>{line.text}</p>
                        {line.subtext && (
                          <p className={`text-xs mt-0.5 font-jp ${isActive ? 'text-vermilion font-medium' : 'text-ink-400'}`}>
                            {line.subtext}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="washi-panel rounded-2xl p-6 text-center border border-parchment-300">
                    <p className="font-serif italic text-base text-ink-700">
                      {isJp
                        ? '「言葉なき旋律に耳を澄ませば、心に波紋が広がりゆく。」'
                        : '"Listen deeply to the wordless cadence as stillness settles upon the waters."'}
                    </p>
                    <p className="text-xs text-ink-400 mt-2 font-mono uppercase tracking-wider">
                      {track.album || track.genre || 'Acoustic Sanctuary'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Haiku & Poetry */}
            {activeTab === 'poetry' && (
              <div className="washi-panel rounded-2xl p-6 text-center max-w-md mx-auto my-2 border border-parchment-300">
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-vermilion/10 text-vermilion flex items-center justify-center font-jp font-bold">
                  {track.kanji}
                </div>
                <p className="font-jp text-xl font-bold text-ink-900 tracking-widest leading-loose">
                  {track.poetry?.jp || '水のように流れ、静寂の炎を灯す'}
                </p>
                <div className="w-12 h-[1px] bg-vermilion/40 mx-auto my-3" />
                <p className="font-serif italic text-base text-ink-700 leading-relaxed">
                  "{track.poetry?.en || 'Move like water across river stones, undisturbed. Keep the inner fire gentle.'}"
                </p>
                <p className="text-[11px] font-mono text-ink-400 mt-3 uppercase tracking-wider">
                  — {track.poetry?.poet || track.artist}
                </p>
              </div>
            )}

            {/* TAB CONTENT: Ambient Sound Mixer & Zen Timer */}
            {activeTab === 'ambient' && (
              <div className="washi-panel rounded-2xl p-5 max-w-md mx-auto space-y-4 border border-parchment-300">
                <div className="flex items-center justify-between pb-2 border-b border-parchment-300/60">
                  <span className="text-xs font-bold text-ink-800 uppercase tracking-wider font-mono">
                    {isJp ? '自然音の調合' : 'Ambient Layers'}
                  </span>
                  <label className="flex items-center space-x-2 text-xs text-ink-700 cursor-pointer">
                    <span>{isJp ? '有効化' : 'Active'}</span>
                    <input
                      type="checkbox"
                      checked={ambientLayers.isPlaying}
                      onChange={(e) => onUpdateAmbientLayer('isPlaying', e.target.checked)}
                      className="rounded border-parchment-300 text-sage focus:ring-sage"
                    />
                  </label>
                </div>

                {/* Rain */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-ink-700">
                    <span className="flex items-center space-x-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-sage" />
                      <span>{isJp ? '障子を濡らす雨' : 'Summer Rain'}</span>
                    </span>
                    <span className="font-mono text-[11px]">{ambientLayers.rain}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ambientLayers.rain}
                    onChange={(e) => onUpdateAmbientLayer('rain', Number(e.target.value))}
                    className="w-full accent-sage h-1.5 bg-parchment-300 rounded-full cursor-pointer"
                  />
                </div>

                {/* Stream */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-ink-700">
                    <span className="flex items-center space-x-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sage" />
                      <span>{isJp ? 'せせらぎの調べ' : 'Mountain Stream'}</span>
                    </span>
                    <span className="font-mono text-[11px]">{ambientLayers.stream}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ambientLayers.stream}
                    onChange={(e) => onUpdateAmbientLayer('stream', Number(e.target.value))}
                    className="w-full accent-sage h-1.5 bg-parchment-300 rounded-full cursor-pointer"
                  />
                </div>

                {/* Wind */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-ink-700">
                    <span className="flex items-center space-x-1.5">
                      <Wind className="w-3.5 h-3.5 text-sage" />
                      <span>{isJp ? '松風（竹林の風）' : 'Pine Needle Wind'}</span>
                    </span>
                    <span className="font-mono text-[11px]">{ambientLayers.wind}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ambientLayers.wind}
                    onChange={(e) => onUpdateAmbientLayer('wind', Number(e.target.value))}
                    className="w-full accent-sage h-1.5 bg-parchment-300 rounded-full cursor-pointer"
                  />
                </div>

                {/* Zen Timer Presets */}
                <div className="pt-3 border-t border-parchment-300/60">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-mono font-bold text-ink-700 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-vermilion" />
                      <span>{isJp ? '茶道・瞑想タイマー' : 'Zen Sleep & Tea Timer'}</span>
                    </span>
                    {zenTimerSecondsLeft !== null && (
                      <span className="font-mono text-vermilion font-bold">
                        {Math.floor(zenTimerSecondsLeft / 60)}:
                        {(zenTimerSecondsLeft % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 15, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleStartTimer(mins)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                          zenTimerMinutes === mins && zenTimerSecondsLeft !== null
                            ? 'bg-vermilion text-white shadow-sm'
                            : 'bg-white/80 border border-parchment-300 text-ink-700 hover:border-ink-500'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
