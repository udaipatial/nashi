import React, { useState } from 'react';
import { TabType, Language, UserProfile, PageMode } from '../types';
import { Volume2, VolumeX, Sparkles, User, LogOut, Check, Search, Bell } from 'lucide-react';

interface TopNavigationProps {
  pageMode: PageMode;
  setPageMode: (mode: PageMode) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  zenRestActive: boolean;
  onToggleZenRest: () => void;
  user: UserProfile;
  onLogout: () => void;
  unreadCount?: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  pageMode,
  setPageMode,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  zenRestActive,
  onToggleZenRest,
  user,
  onLogout,
  unreadCount = 1
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const isJp = language === 'jp';

  const navLinks: { id: TabType; labelEn: string; labelJp: string }[] = [
    { id: 'home', labelEn: 'Home', labelJp: 'ホーム' },
    { id: 'search', labelEn: 'Search', labelJp: '検索' },
    { id: 'library', labelEn: 'Library', labelJp: 'ライブラリ' },
    { id: 'liked', labelEn: 'Liked Tracks', labelJp: 'お気に入り' },
    { id: 'zen', labelEn: 'Zen Sanctuary', labelJp: '禅・瞑想' },
  ];

  return (
    <header className="relative z-30 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-parchment-300/40 bg-parchment-50/70 backdrop-blur-md">
      {/* Brand Zone */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setPageMode('app')}>
        <div className="w-9 h-9 rounded-xl bg-ink-900 text-[#FAF6F0] flex items-center justify-center shadow-md relative overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95">
          <svg className="w-5 h-5 text-parchment-200 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 9c2.5-3 5.5-3 8 0s5.5 3 10 0M3 15c2.5-3 5.5-3 8 0s5.5 3 10 0" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-ink-900 leading-none">Nashi</span>
            {/* Hanko Seal Badge */}
            <span className="w-4 h-4 rounded bg-vermilion text-[10px] text-white font-jp flex items-center justify-center font-bold shadow-hanko transition-transform duration-300 hover:rotate-6">
              波
            </span>
          </div>
          <span className="font-jp text-[10px] text-ink-500 tracking-wider">なし • 和モダン音響</span>
        </div>
      </div>

      {/* Center Nav Zone (Desktop Dashboard) */}
      {pageMode === 'app' && (
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-ink-900 text-parchment-50 shadow-sm'
                    : 'text-ink-700 hover:text-ink-900 hover:bg-parchment-200/60'
                }`}
              >
                {link.id === 'zen' && <span className="font-jp font-bold text-vermilion">和</span>}
                <span>{isJp ? link.labelJp : link.labelEn}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-vermilion" />}
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Controls Zone */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* ZEN REST mode trigger button */}
        <button
          onClick={onToggleZenRest}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 active:scale-95 ${
            zenRestActive
              ? 'bg-sage text-white border-sage shadow-sm'
              : 'bg-white/80 border-parchment-300 text-ink-700 hover:border-ink-500 hover:bg-white'
          }`}
          title="Toggle ambient nature soundscape"
        >
          <span className="text-sm">🍃</span>
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase">
            {isJp ? '禅レスト' : 'ZEN REST'}
          </span>
          {zenRestActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />}
        </button>

        {/* Bilingual Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'jp' : 'en')}
          className="px-2.5 py-1.5 rounded-full bg-white/80 border border-parchment-300 text-ink-700 text-xs font-mono font-medium hover:border-ink-500 hover:bg-white transition-all active:scale-95 shadow-sm"
          title="Switch language between English & Japanese"
        >
          {language === 'en' ? 'EN / 日本語' : '日本語 / EN'}
        </button>

        {/* Search quick button */}
        {pageMode === 'app' && (
          <button
            onClick={() => setActiveTab('search')}
            aria-label="Search"
            className="w-8 h-8 rounded-full bg-white/80 border border-parchment-300 flex items-center justify-center text-ink-700 hover:bg-white hover:text-ink-900 active:scale-90 transition-all shadow-sm"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            aria-label="Notifications"
            className="w-8 h-8 rounded-full bg-white/80 border border-parchment-300 flex items-center justify-center text-ink-700 hover:bg-white hover:text-ink-900 active:scale-90 transition-all shadow-sm relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-vermilion" />
            )}
          </button>

          {showNotificationToast && (
            <div className="absolute right-0 mt-2 w-72 washi-card rounded-xl p-3 shadow-floating border border-parchment-300 z-50 text-xs text-ink-800">
              <div className="flex items-center justify-between pb-2 border-b border-parchment-300/60">
                <span className="font-serif font-bold text-sm text-ink-900">
                  {isJp ? '静寂の通知' : 'Quiet Harmony'}
                </span>
                <span className="text-[10px] text-vermilion font-jp">新着</span>
              </div>
              <p className="mt-2 text-ink-700 leading-relaxed">
                {isJp
                  ? '夕暮れ限定プレイリスト「湖畔の調べ」が追加されました。'
                  : 'New tranquil soundscape "Lakeside Reverie" has been added to your evening stream.'}
              </p>
            </div>
          )}
        </div>

        {/* User Persona Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative flex items-center space-x-1.5 pl-1 cursor-pointer transition-transform active:scale-95 focus:outline-none"
            title="User Profile & Settings"
          >
            <div className="w-8 h-8 rounded-full ring-2 ring-vermilion/30 overflow-hidden bg-ink-800 flex items-center justify-center text-xs font-serif font-bold text-parchment-100 shadow-sm">
              <span>{user.initials}</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white animate-pulse" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 washi-card rounded-2xl p-3 shadow-floating border border-parchment-300 z-50 animate-fadeIn">
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-parchment-300/60">
                <div className="w-9 h-9 rounded-full bg-ink-900 text-parchment-100 font-serif font-bold flex items-center justify-center text-sm shadow">
                  {user.initials}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-ink-900 truncate">{user.name}</h4>
                  <p className="text-[11px] text-ink-500 truncate">{user.email}</p>
                  <span className="text-[10px] text-sage font-medium">
                    {user.isGuest ? (isJp ? 'ゲスト訪問者' : 'Guest Traveler') : (isJp ? '同期会員' : 'Sanctuary Member')}
                  </span>
                </div>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setPageMode(pageMode === 'app' ? 'auth' : 'app');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-ink-700 hover:bg-parchment-200/70 hover:text-ink-900 transition-colors flex items-center justify-between"
                >
                  <span>{pageMode === 'app' ? (isJp ? '認証ページを開く' : 'Go to Auth View') : (isJp ? 'プレイヤーへ戻る' : 'Return to Player')}</span>
                  <span className="text-[10px] text-vermilion font-mono">⌘A</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('liked');
                    setPageMode('app');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-ink-700 hover:bg-parchment-200/70 hover:text-ink-900 transition-colors"
                >
                  {isJp ? 'お気に入り曲一覧' : 'Your Liked Frequencies'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('zen');
                    setPageMode('app');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-ink-700 hover:bg-parchment-200/70 hover:text-ink-900 transition-colors"
                >
                  {isJp ? '瞑想・タイマー設定' : 'Zen Meditation Settings'}
                </button>
              </div>

              <div className="pt-2 border-t border-parchment-300/60">
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs text-vermilion hover:bg-vermilion/10 font-medium transition-colors flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isJp ? 'ログアウトして認証へ' : 'Sign Out & Return to Stillness'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
