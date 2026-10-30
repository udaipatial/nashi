import React, { useState, useEffect } from 'react';
import { AmbientSoundMixer, Language } from '../types';
import { CloudRain, Wind, Droplets, Bell, Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface ZenSanctuaryViewProps {
  language: Language;
  ambientLayers: AmbientSoundMixer;
  onUpdateAmbientLayer: (key: keyof AmbientSoundMixer, value: number | boolean) => void;
}

export const ZenSanctuaryView: React.FC<ZenSanctuaryViewProps> = ({
  language,
  ambientLayers,
  onUpdateAmbientLayer
}) => {
  const isJp = language === 'jp';

  // Breathing Guide State: 4s inhale, 4s hold, 6s exhale
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(true);

  // Meditation Session Timer
  const [sessionDuration, setSessionDuration] = useState<number>(15); // minutes
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isSessionRunning, setIsSessionRunning] = useState<boolean>(false);

  // Breathing pacing loop
  useEffect(() => {
    if (!isBreathingActive) return;

    let timer = breathTimer;
    let phase = breathPhase;

    const interval = setInterval(() => {
      timer -= 1;
      if (timer <= 0) {
        if (phase === 'inhale') {
          phase = 'hold';
          timer = 4;
        } else if (phase === 'hold') {
          phase = 'exhale';
          timer = 6;
        } else {
          phase = 'inhale';
          timer = 4;
        }
        setBreathPhase(phase);
      }
      setBreathTimer(timer);
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // Session timer loop
  useEffect(() => {
    if (!isSessionRunning || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsSessionRunning(false);
          audioEngine.playSingingBowl(528); // gentle completion chime
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionRunning, secondsRemaining]);

  const handleStartSession = (mins: number) => {
    setSessionDuration(mins);
    setSecondsRemaining(mins * 60);
    setIsSessionRunning(true);
    audioEngine.playSingingBowl(432);
  };

  const handleToggleSession = () => {
    if (!isSessionRunning && secondsRemaining === 0) {
      setSecondsRemaining(sessionDuration * 60);
    }
    setIsSessionRunning(!isSessionRunning);
    if (!isSessionRunning) {
      audioEngine.playSingingBowl(432);
    }
  };

  const handleResetSession = () => {
    setIsSessionRunning(false);
    setSecondsRemaining(sessionDuration * 60);
  };

  const formatSessionTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const phaseInstruction = {
    inhale: isJp ? '息を静かに吸い込む' : 'Inhale Calmness',
    hold: isJp ? '息を止め、心を保つ' : 'Hold & Settle',
    exhale: isJp ? '雑念をすべて吐き出す' : 'Exhale Release'
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="washi-panel rounded-3xl p-6 sm:p-8 shadow-washi border border-parchment-300 relative overflow-hidden text-center">
        <div className="w-9 h-9 mx-auto rounded-xl bg-vermilion/15 text-vermilion font-jp font-bold text-base flex items-center justify-center shadow-xs mb-3">
          禅
        </div>
        <span className="font-jp text-[11px] text-vermilion tracking-widest uppercase font-semibold">
          {isJp ? '和の調和 • 静寂と呼吸' : 'SANCTUARY OF THE BREATH • ZEN HARMONY'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight mt-1">
          {isJp ? '心の波立ちを鎮める' : 'Settle the Surface of the Mind'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 mt-2 max-w-lg mx-auto font-serif italic">
          {isJp
            ? '「水は方円の器に随う。心を空にして、自然の息吹と共鳴せよ。」'
            : '"Water shapes itself to the vessel. Empty your mind, be formless, shapeless — like water."'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breathing Visualizer Card */}
        <div className="washi-card rounded-3xl p-6 shadow-washi border border-parchment-300 flex flex-col items-center justify-between text-center min-h-[380px]">
          <div>
            <div className="flex items-center justify-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
              <h3 className="font-serif font-bold text-lg text-ink-900">
                {isJp ? '調息の円相' : 'Ensō Breathing Circle'}
              </h3>
            </div>
            <p className="text-xs text-ink-500 mt-1">
              {isJp ? '心拍を整える4-4-6リズム' : 'Harmonize your nervous system with 4-4-6 tempo'}
            </p>
          </div>

          {/* Animated Ensō Breathing Circle */}
          <div className="relative my-6 flex items-center justify-center">
            {/* Outer expanding ripple */}
            <div
              className={`w-48 h-48 rounded-full border-2 border-vermilion/30 transition-all duration-1000 ease-in-out flex items-center justify-center ${
                breathPhase === 'inhale'
                  ? 'scale-115 bg-vermilion/10'
                  : breathPhase === 'hold'
                  ? 'scale-115 bg-vermilion/15'
                  : 'scale-90 bg-parchment-200/40'
              }`}
            >
              {/* Inner core */}
              <div
                className={`w-36 h-36 rounded-full border border-ink-900/20 flex flex-col items-center justify-center shadow-inner transition-all duration-700 ${
                  breathPhase === 'inhale' ? 'bg-white/80' : 'bg-parchment-100/90'
                }`}
              >
                <span className="font-jp text-xs font-bold text-vermilion uppercase tracking-widest">
                  {phaseInstruction[breathPhase]}
                </span>
                <span className="font-mono text-3xl font-bold text-ink-900 mt-1">
                  {breathTimer}s
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="px-4 py-2 rounded-xl bg-ink-900 text-parchment-100 text-xs font-medium hover:bg-ink-800 transition-all active:scale-95 flex items-center space-x-1.5 shadow-sm"
            >
              {isBreathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isBreathingActive ? (isJp ? '一時停止' : 'Pause Guide') : (isJp ? '呼吸再開' : 'Resume Guide')}</span>
            </button>
            <button
              onClick={() => audioEngine.playSingingBowl(432)}
              className="px-3.5 py-2 rounded-xl bg-white/80 border border-parchment-300 text-ink-700 text-xs font-medium hover:bg-white active:scale-95 transition-all flex items-center space-x-1.5 shadow-xs"
              title="Ring Singing Bowl"
            >
              <Bell className="w-3.5 h-3.5 text-vermilion" />
              <span>{isJp ? '鈴を鳴らす' : 'Ring Bell'}</span>
            </button>
          </div>
        </div>

        {/* Meditation Session & Tea Timer Card */}
        <div className="washi-card rounded-3xl p-6 shadow-washi border border-parchment-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-ink-900">
                {isJp ? '座禅・茶道タイマー' : 'Meditation & Tea Timer'}
              </h3>
              <span className="text-[10px] font-mono text-vermilion bg-vermilion/10 px-2 py-0.5 rounded-full font-bold">
                {sessionDuration} MIN
              </span>
            </div>
            <p className="text-xs text-ink-500 mt-1">
              {isJp ? '一定の静寂を保つ集中タイマー' : 'Immerse in uninterrupted mindful stillness'}
            </p>

            {/* Countdown Display */}
            <div className="my-8 text-center">
              <div className="font-mono text-5xl font-bold text-ink-900 tracking-tight">
                {formatSessionTime(secondsRemaining)}
              </div>
              <p className="text-xs text-ink-400 font-mono mt-1 uppercase">
                {isSessionRunning ? (isJp ? '静寂セッション進行中' : 'Mindful Session in Progress') : (isJp ? '待機中' : 'Awaiting Stillness')}
              </p>
            </div>

            {/* Quick Timer Presets */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[5, 15, 25, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleStartSession(mins)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    sessionDuration === mins
                      ? 'bg-ink-900 text-parchment-50 shadow-sm'
                      : 'bg-white/80 border border-parchment-300 text-ink-700 hover:border-ink-500'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-parchment-300/60">
            <button
              onClick={handleToggleSession}
              className="flex-1 py-2.5 rounded-xl bg-ink-900 text-parchment-100 text-xs font-medium hover:bg-ink-800 transition-all active:scale-95 flex items-center justify-center space-x-1.5 shadow-md"
            >
              {isSessionRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSessionRunning ? (isJp ? 'タイマー停止' : 'Pause Timer') : (isJp ? 'セッション開始' : 'Begin Session')}</span>
            </button>
            <button
              onClick={handleResetSession}
              className="w-10 h-10 rounded-xl bg-white/80 border border-parchment-300 text-ink-700 hover:bg-white active:scale-90 transition-all flex items-center justify-center shadow-xs"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Channel Ambient Mixer Grid */}
      <div className="washi-card rounded-3xl p-6 sm:p-8 shadow-washi border border-parchment-300">
        <div className="flex items-center justify-between pb-4 border-b border-parchment-300/80">
          <div>
            <h3 className="font-serif font-bold text-xl text-ink-900">
              {isJp ? '和の環境音ミキサー' : 'Sumi Nature Sound Mixer'}
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              {isJp ? '雨、風、せせらぎを自由に重ね合わせる' : 'Layer natural organic frequencies to accompany your focus'}
            </p>
          </div>
          <button
            onClick={() => onUpdateAmbientLayer('isPlaying', !ambientLayers.isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center space-x-2 ${
              ambientLayers.isPlaying
                ? 'bg-sage text-white shadow-sm'
                : 'bg-white/90 border border-parchment-300 text-ink-700 hover:bg-white'
            }`}
          >
            <span>{ambientLayers.isPlaying ? (isJp ? '環境音：再生中' : 'Ambient: Active') : (isJp ? '環境音：停止' : 'Ambient: Muted')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          {/* Channel 1: Rain */}
          <div className="p-4 rounded-2xl bg-white/60 border border-parchment-300/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sage/15 text-sage flex items-center justify-center">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink-900">{isJp ? '雨の気配' : 'Tatami Rain'}</h4>
                  <span className="text-[10px] text-ink-400 font-jp">京都の夕立</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-ink-700">{ambientLayers.rain}%</span>
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

          {/* Channel 2: Stream */}
          <div className="p-4 rounded-2xl bg-white/60 border border-parchment-300/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sage/15 text-sage flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink-900">{isJp ? '渓流のせせらぎ' : 'Mountain Stream'}</h4>
                  <span className="text-[10px] text-ink-400 font-jp">富士の湧水</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-ink-700">{ambientLayers.stream}%</span>
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

          {/* Channel 3: Wind */}
          <div className="p-4 rounded-2xl bg-white/60 border border-parchment-300/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sage/15 text-sage flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink-900">{isJp ? '松風の息吹' : 'Pine Wind'}</h4>
                  <span className="text-[10px] text-ink-400 font-jp">嵯峨野竹林</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-ink-700">{ambientLayers.wind}%</span>
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
        </div>
      </div>
    </div>
  );
};
