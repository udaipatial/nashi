/**
 * DownloadsPage – shown inside the Library tab.
 * Lists all tracks that have been downloaded to the device,
 * allows playback from local Blob URL, deletion, and re-download.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Language, Track } from '../types';
import {
  HardDrive,
  Play,
  Pause,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle2,
  WifiOff,
} from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import {
  loadAllMeta,
  DownloadedTrackRecord,
  getLocalUrl,
  deleteDownload,
  formatBytes,
} from '../services/downloadService';

interface DownloadsPageProps {
  language: Language;
  currentTrack: Track;
  isPlaying: boolean;
  onSelectTrack: (track: Track, queue?: Track[]) => void;
  onTogglePlay: () => void;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({
  language,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
}) => {
  const isJp = language === 'jp';
  const [records, setRecords] = useState<DownloadedTrackRecord[]>([]);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const metas = await loadAllMeta();
      setRecords(metas.sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt)));

      // Resolve blob URLs for all records
      const urlMap: Record<string, string> = {};
      await Promise.all(
        metas.map(async (m) => {
          const url = await getLocalUrl(m.trackId);
          if (url) urlMap[m.trackId] = url;
        })
      );
      setLocalUrls(urlMap);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (trackId: string) => {
    await deleteDownload(trackId);
    setRecords((prev) => prev.filter((r) => r.trackId !== trackId));
    setLocalUrls((prev) => {
      const next = { ...prev };
      delete next[trackId];
      return next;
    });
  };

  /** Build a minimal Track object from a DownloadedTrackRecord for playback */
  const recordToTrack = (r: DownloadedTrackRecord): Track => ({
    id: r.trackId,
    title: r.title,
    artist: r.artist,
    kanji: r.kanji,
    duration: r.duration,
    category: 'all',
    coverUrl: r.coverUrl,
    audioUrl: localUrls[r.trackId], // use local blob URL for offline playback
    mood: 'Offline',
    tags: ['Downloaded', 'Offline'],
    source: (r.source as Track['source']) || 'local',
    license: r.license,
    isPreviewOnly: false,
    downloadAllowed: false,
  });

  const handlePlay = (r: DownloadedTrackRecord) => {
    const track = recordToTrack(r);
    const isCurrent = currentTrack.id === r.trackId;
    if (isCurrent) {
      onTogglePlay();
    } else {
      const queue = records.map(recordToTrack);
      onSelectTrack(track, queue);
    }
  };

  const totalSize = records.reduce((sum, r) => sum + (r.fileSizeBytes || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="washi-card rounded-3xl p-6 sm:p-8 shadow-washi border border-parchment-300">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-ink-900/10 flex items-center justify-center text-ink-800">
                <HardDrive className="w-4 h-4" />
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
                {isJp ? 'ダウンロード済み' : 'Downloaded Files'}
              </h2>
            </div>
            <p className="text-xs text-ink-500 mt-1">
              {isJp
                ? `${records.length}曲をデバイスに保存済み`
                : `${records.length} track${records.length !== 1 ? 's' : ''} saved on this device for offline playback`}
            </p>
          </div>

          <div className="flex flex-col items-end space-y-1.5">
            {totalSize > 0 && (
              <span className="text-[11px] font-mono text-ink-500 bg-parchment-200/80 px-2 py-1 rounded-lg border border-parchment-300">
                {formatBytes(totalSize)}
              </span>
            )}
            <button
              onClick={reload}
              className="w-8 h-8 rounded-full border border-parchment-300 bg-white/70 flex items-center justify-center text-ink-600 hover:text-ink-900 hover:bg-white transition-all active:scale-90"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Offline badge */}
        <div className="mt-4 pt-3 border-t border-parchment-300/60 flex items-center space-x-1.5 text-xs text-ink-600">
          <WifiOff className="w-3 h-3 text-sage" />
          <span>
            {isJp
              ? 'オフライン再生対応 — インターネット接続なしで再生可能'
              : 'Offline playback enabled — these tracks play without internet'}
          </span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="washi-panel rounded-2xl p-10 text-center border border-parchment-300">
          <div className="w-6 h-6 border-2 border-vermilion/30 border-t-vermilion rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-500">
            {isJp ? '読み込み中...' : 'Loading downloads...'}
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="washi-panel rounded-2xl p-12 text-center border border-parchment-300">
          <HardDrive className="w-8 h-8 text-ink-300 mx-auto mb-3" />
          <p className="text-sm text-ink-700 font-serif">
            {isJp ? 'ダウンロード済みの楽曲がありません。' : 'No downloaded tracks yet.'}
          </p>
          <p className="text-xs text-ink-400 mt-1.5">
            {isJp
              ? '曲カードのダウンロードボタンを押してオフライン保存しましょう。'
              : 'Tap the Download button on any track card to save it here for offline listening.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {records.map((r) => {
            const isCurrent = currentTrack.id === r.trackId;
            const hasLocal = Boolean(localUrls[r.trackId]);
            const dl = new Date(r.downloadedAt);
            const dateStr = dl.toLocaleDateString(isJp ? 'ja-JP' : 'en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={r.trackId}
                className={`washi-card p-3 rounded-2xl border flex items-center space-x-3 group transition-all hover:shadow-md ${
                  isCurrent ? 'ring-2 ring-vermilion/40 border-vermilion/50' : 'border-parchment-300'
                }`}
              >
                {/* Artwork */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-ink-800 flex-shrink-0 relative">
                  <ArtworkImage
                    src={r.coverUrl}
                    alt={r.title}
                    fallbackSrc="/assets/mountain_bg.jpg"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-vermilion text-[8px] font-jp font-bold text-white flex items-center justify-center">
                    {r.kanji?.charAt(0) || '波'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-bold text-ink-900 truncate group-hover:text-vermilion transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-[11px] text-ink-500 truncate">{r.artist}</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] font-mono text-ink-400">
                      {formatBytes(r.fileSizeBytes)} • {dateStr}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {/* Stream from local blob */}
                  {hasLocal && (
                    <button
                      onClick={() => handlePlay(r)}
                      aria-label={isCurrent && isPlaying ? 'Pause' : 'Play (offline)'}
                      title="Play (offline)"
                      className="w-8 h-8 rounded-full bg-ink-900 text-parchment-100 flex items-center justify-center shadow-sm hover:scale-105 active:scale-90 transition-all"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(r.trackId)}
                    aria-label="Delete download"
                    title="Remove from device"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-ink-400 hover:text-vermilion transition-colors active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {records.length > 0 && (
        <p className="text-center text-[11px] text-ink-400 font-mono pt-1">
          <Download className="inline w-3 h-3 mr-0.5" />
          {isJp
            ? '音声は端末ブラウザのストレージに保存されています'
            : 'Audio stored in browser IndexedDB storage on this device'}
        </p>
      )}
    </div>
  );
};
