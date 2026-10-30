import React from 'react';
import { Track, Language } from '../types';
import { Play, Pause, SkipForward, SkipBack, Heart, Maximize2, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import { DownloadButton } from './DownloadButton';

interface WebAudioPlayerBarProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  currentTime: number;
  onSeek: (seconds: number) => void;
  isLiked: boolean;
  onToggleLike: () => void;
  onExpand: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  language: Language;
}

export const WebAudioPlayerBar: React.FC<WebAudioPlayerBarProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  currentTime,
  onSeek,
  isLiked,
  onToggleLike,
  onExpand,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  language
}) => {
  const isJp = language === 'jp';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / track.duration) * 100));

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 sm:px-6 pb-3 pt-1 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div className="bg-[#1C1A18]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border border-white/10 text-parchment-100 shadow-floating flex flex-col relative overflow-hidden transition-all duration-300">
          
          {/* Top Scrubber Progress Bar */}
          <div
            className="w-full px-2 py-1 cursor-pointer -mt-1 group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(Math.floor(pct * track.duration));
            }}
          >
            <div className="w-full h-1 group-hover:h-1.5 bg-white/20 rounded-full overflow-hidden relative transition-all">
              <div
                className="h-full bg-vermilion rounded-full relative transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-90" />
              </div>
            </div>
          </div>

          {/* Main Controls Grid */}
          <div className="flex items-center justify-between mt-1 px-1 sm:px-2 gap-3">
            
            {/* Left: Thumbnail & Track Metadata */}
            <div
              className="flex items-center space-x-3 overflow-hidden flex-1 sm:flex-initial cursor-pointer group"
              onClick={onExpand}
              title="Click to expand Now Playing lyrics & poetry"
            >
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-ink-800 border border-white/10 shadow-sm">
                <ArtworkImage
                  src={track.coverUrl}
                  alt={track.title}
                  fallbackSrc="/assets/mountain_bg.jpg"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-vermilion rounded-tl text-[8px] font-jp font-bold text-white flex items-center justify-center">
                  {track.kanji.charAt(0) || '波'}
                </span>
              </div>

              <div className="overflow-hidden">
                <h4 className="text-xs sm:text-sm font-semibold text-parchment-50 truncate tracking-tight group-hover:text-vermilion transition-colors">
                  {track.title}
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="text-[11px] text-parchment-300/70 truncate">{track.artist}</p>
                  
                  {/* Live Equalizer Visualizer & Timer badge */}
                  <div className="hidden xs:flex items-center space-x-1 px-1.5 py-0.5 rounded bg-vermilion/20 border border-vermilion/30">
                    <div className={`flex items-end space-x-[2px] h-2.5 w-2.5 pb-0.5 mr-0.5 ${isPlaying ? '' : 'paused'}`}>
                      <span className="w-[1.5px] bg-vermilion-light rounded-full eq-bar-1" />
                      <span className="w-[1.5px] bg-vermilion-light rounded-full eq-bar-2" />
                      <span className="w-[1.5px] bg-vermilion-light rounded-full eq-bar-3" />
                    </div>
                    <span className="text-[9px] text-vermilion-light font-mono font-medium">
                      {formatTime(currentTime)} / {formatTime(track.duration)}
                      {track.isPreviewOnly && ' • Preview'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Playback Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={onPrevTrack}
                aria-label="Previous Track"
                className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-parchment-300 hover:text-white active:scale-90 transition-all"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Play / Pause Toggle Circle */}
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-parchment-100 text-ink-900 flex items-center justify-center shadow-lg active:scale-90 hover:scale-105 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNextTrack}
                aria-label="Next Track"
                className="w-8 h-8 rounded-full flex items-center justify-center text-parchment-300 hover:text-white active:scale-90 transition-all"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Right: Like, Download, Volume, and Expand Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2.5 flex-shrink-0">
              {/* Like Button */}
              <button
                onClick={onToggleLike}
                aria-label="Favorite"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-75 ${
                  isLiked ? 'text-emerald-400' : 'text-parchment-400 hover:text-parchment-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current animate-heart-pop' : ''}`} />
              </button>

              {/* Download Button — separate from Stream/Play */}
              <div className="hidden sm:block">
                <DownloadButton
                  track={track}
                  variant="icon"
                  className="text-parchment-400 hover:text-parchment-100"
                />
              </div>

              {/* Desktop Volume Slider */}
              <div className="hidden md:flex items-center space-x-1.5 pl-2">
                <button
                  onClick={onToggleMute}
                  className="text-parchment-300 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-16 lg:w-20 accent-vermilion h-1 bg-white/20 rounded-full cursor-pointer"
                />
              </div>

              {/* Expand Sheet Modal Trigger */}
              <button
                onClick={onExpand}
                aria-label="Expand Now Playing"
                className="w-8 h-8 rounded-full flex items-center justify-center text-parchment-300 hover:text-white active:scale-90 transition-all"
                title="Expand lyrics & poetry view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
