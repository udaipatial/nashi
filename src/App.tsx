/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageMode, TabType, Track, Language, UserProfile, AmbientSoundMixer } from './types';
import { SAMPLE_TRACKS, TRACK_ARTWORK } from './data/tracks';
import { audioEngine } from './utils/audioEngine';
import { TopNavigation } from './components/TopNavigation';
import { AuthView } from './components/AuthView';
import { MusicDashboard } from './components/MusicDashboard';
import { WebAudioPlayerBar } from './components/WebAudioPlayerBar';
import { NowPlayingModal } from './components/NowPlayingModal';

export default function App() {
  // Navigation & User State
  const [pageMode, setPageMode] = useState<PageMode>('app');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [language, setLanguage] = useState<Language>('en');

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('nashi_user');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      name: 'Arjun Tanaka',
      email: 'arjun@flow.io',
      initials: 'AJ',
      isGuest: false,
      rememberMe: true,
      personaTitle: 'Sanctuary Listener'
    };
  });

  // Track & Playback State
  const [currentTrack, setCurrentTrack] = useState<Track>(SAMPLE_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isNowPlayingExpanded, setIsNowPlayingExpanded] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Playback Queue & Listening History
  const [queue, setQueue] = useState<Track[]>(SAMPLE_TRACKS);
  const [history, setHistory] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('nashi_history');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return SAMPLE_TRACKS.slice(0, 4);
  });

  // Favorites / Liked Tracks Set
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('nashi_liked_tracks');
      if (saved) return new Set(JSON.parse(saved));
    } catch { /* ignore */ }
    return new Set(['track-1', 'track-2']);
  });

  // Ambient Sound Layers
  const [ambientLayers, setAmbientLayers] = useState<AmbientSoundMixer>({
    rain: 40,
    wind: 25,
    bell: 50,
    stream: 35,
    isPlaying: false
  });
  const [zenRestActive, setZenRestActive] = useState<boolean>(false);

  // Sync liked tracks to local storage
  useEffect(() => {
    try {
      localStorage.setItem('nashi_liked_tracks', JSON.stringify(Array.from(likedTrackIds)));
    } catch { /* ignore */ }
  }, [likedTrackIds]);

  // Sync user profile to local storage
  useEffect(() => {
    try {
      localStorage.setItem('nashi_user', JSON.stringify(user));
    } catch { /* ignore */ }
  }, [user]);

  // Real Audio Playback Event Subscriptions
  useEffect(() => {
    const unsubTime = audioEngine.onTimeUpdate((cur, dur) => {
      setCurrentTime(Math.floor(cur));
    });

    const unsubEnded = audioEngine.onEnded(() => {
      handleNextTrack();
    });

    return () => {
      unsubTime();
      unsubEnded();
    };
  }, [queue, currentTrack]);

  // Stream Playback Synchronization
  useEffect(() => {
    if (isPlaying) {
      audioEngine.playTrack(currentTrack.audioUrl, currentTime);
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, currentTrack.id]);

  // Update Ambient Soundscape in Audio Engine
  useEffect(() => {
    audioEngine.updateAmbientLayers({
      ...ambientLayers,
      active: zenRestActive || ambientLayers.isPlaying
    });
  }, [ambientLayers, zenRestActive]);

  // Handlers
  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.playTrack(currentTrack.audioUrl, currentTime);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    }

    setHistory((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('nashi_history', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });

    audioEngine.playTrack(track.audioUrl, 0);
  };

  const handleNextTrack = () => {
    const activeQueue = queue.length > 0 ? queue : SAMPLE_TRACKS;
    const currentIndex = activeQueue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % activeQueue.length;
    handleSelectTrack(activeQueue[nextIndex]);
  };

  const handlePrevTrack = () => {
    const activeQueue = queue.length > 0 ? queue : SAMPLE_TRACKS;
    const currentIndex = activeQueue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + activeQueue.length) % activeQueue.length;
    handleSelectTrack(activeQueue[prevIndex]);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const handleToggleZenRest = () => {
    const nextState = !zenRestActive;
    setZenRestActive(nextState);
    if (nextState) {
      audioEngine.playSingingBowl(432);
      setAmbientLayers((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    audioEngine.setMasterVolume(vol);
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleUpdateAmbientLayer = (key: keyof AmbientSoundMixer, value: number | boolean) => {
    setAmbientLayers((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAuthenticate = (newUser: UserProfile) => {
    setUser(newUser);
    setPageMode('app');
    audioEngine.playSingingBowl(528);
  };

  const handleContinueAsGuest = () => {
    setUser({
      name: 'Traveler',
      email: 'guest@nashi.zen',
      initials: 'TR',
      isGuest: true,
      rememberMe: false,
      personaTitle: language === 'jp' ? 'ゲスト訪問者' : 'Guest Traveler'
    });
    setPageMode('app');
    audioEngine.playSingingBowl(432);
  };

  const handleLogout = () => {
    setPageMode('auth');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF6F0] text-ink-900 font-sans flex flex-col overflow-x-hidden selection:bg-vermilion/20 selection:text-ink-900">
      
      {/* 1. Atmospheric Watercolor Mountain & Sun Background Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src="/assets/mountain_bg.jpg"
          alt="Japanese watercolor background with Mount Fuji, mist, lake, pine trees, and muted red sun"
          className="w-full h-full min-h-screen object-cover object-top animate-mountain-float will-change-transform opacity-75"
        />
        {/* Subtle translucent cream overlay across the central dashboard to keep text readable */}
        <div className="absolute inset-0 bg-[#FAF7F2]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/25 via-transparent to-[#FAF6F0]/70" />

        {/* Ambient Drifting Sakura / Ink Petals */}
        <div className="petal w-2.5 h-3.5 left-[12%]" style={{ animationDuration: '16s', animationDelay: '0s' }} />
        <div className="petal w-3 h-2 left-[38%]" style={{ animationDuration: '22s', animationDelay: '4s' }} />
        <div className="petal w-2 h-2.5 left-[68%]" style={{ animationDuration: '18s', animationDelay: '8s' }} />
        <div className="petal w-2.5 h-3 left-[88%]" style={{ animationDuration: '20s', animationDelay: '2s' }} />
      </div>

      {/* 2. Global Top Website Navigation Bar */}
      <TopNavigation
        pageMode={pageMode}
        setPageMode={setPageMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        zenRestActive={zenRestActive}
        onToggleZenRest={handleToggleZenRest}
        user={user}
        onLogout={handleLogout}
      />

      {/* 3. Main Views Router: Auth View vs Music Sanctuary Dashboard */}
      <main className="relative z-10 flex-1 flex flex-col">
        {pageMode === 'auth' ? (
          <AuthView
            language={language}
            onAuthenticate={handleAuthenticate}
            onContinueAsGuest={handleContinueAsGuest}
          />
        ) : (
          <MusicDashboard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectTrack={handleSelectTrack}
            onTogglePlay={handleTogglePlay}
            likedTrackIds={likedTrackIds}
            onToggleLike={handleToggleLike}
            language={language}
            user={user}
            history={history}
            ambientLayers={ambientLayers}
            onUpdateAmbientLayer={handleUpdateAmbientLayer}
          />
        )}
      </main>

      {/* 4. Bottom Floating Audio Player Bar (when in app mode) */}
      {pageMode === 'app' && (
        <WebAudioPlayerBar
          track={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          currentTime={currentTime}
          onSeek={handleSeek}
          isLiked={likedTrackIds.has(currentTrack.id)}
          onToggleLike={() => handleToggleLike(currentTrack.id)}
          onExpand={() => setIsNowPlayingExpanded(true)}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          language={language}
        />
      )}

      {/* 5. Mobile Bottom Tab Bar (on narrow screens for quick thumb switching) */}
      {pageMode === 'app' && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 dark-washi-bar py-2 px-6 flex items-center justify-between"
          aria-label="Mobile Navigation Tabs"
        >
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center transition-all ${
              activeTab === 'home' ? 'text-parchment-100' : 'text-parchment-300/60'
            }`}
          >
            <span className="text-[10px] font-semibold">{language === 'jp' ? '主頁' : 'Home'}</span>
            <span className={`w-1 h-1 rounded-full mt-0.5 ${activeTab === 'home' ? 'bg-vermilion' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center transition-all ${
              activeTab === 'search' ? 'text-parchment-100' : 'text-parchment-300/60'
            }`}
          >
            <span className="text-[10px] font-medium">{language === 'jp' ? '検索' : 'Search'}</span>
            <span className={`w-1 h-1 rounded-full mt-0.5 ${activeTab === 'search' ? 'bg-vermilion' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center transition-all ${
              activeTab === 'library' ? 'text-parchment-100' : 'text-parchment-300/60'
            }`}
          >
            <span className="text-[10px] font-medium">{language === 'jp' ? '文庫' : 'Library'}</span>
            <span className={`w-1 h-1 rounded-full mt-0.5 ${activeTab === 'library' ? 'bg-vermilion' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex flex-col items-center transition-all ${
              activeTab === 'liked' ? 'text-parchment-100' : 'text-parchment-300/60'
            }`}
          >
            <span className="text-[10px] font-medium">{language === 'jp' ? '愛聴' : 'Liked'}</span>
            <span className={`w-1 h-1 rounded-full mt-0.5 ${activeTab === 'liked' ? 'bg-vermilion' : 'bg-transparent'}`} />
          </button>

          <button
            onClick={() => setActiveTab('zen')}
            className={`flex flex-col items-center transition-all ${
              activeTab === 'zen' ? 'text-parchment-100' : 'text-parchment-300/60'
            }`}
          >
            <span className="font-jp text-[11px] font-bold text-vermilion">和</span>
            <span className={`w-1 h-1 rounded-full mt-0.5 ${activeTab === 'zen' ? 'bg-vermilion' : 'bg-transparent'}`} />
          </button>
        </nav>
      )}

      {/* 6. Expandable Full-Screen Now Playing Modal */}
      <NowPlayingModal
        isOpen={isNowPlayingExpanded}
        onClose={() => setIsNowPlayingExpanded(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        currentTime={currentTime}
        onSeek={handleSeek}
        isLiked={likedTrackIds.has(currentTrack.id)}
        onToggleLike={() => handleToggleLike(currentTrack.id)}
        language={language}
        ambientLayers={ambientLayers}
        onUpdateAmbientLayer={handleUpdateAmbientLayer}
      />
    </div>
  );
}
