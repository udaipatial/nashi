import React, { useState } from 'react';
import { AuthMode, Language, UserProfile } from '../types';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, User, ArrowRight, ExternalLink, Check, Shield } from 'lucide-react';

interface AuthViewProps {
  initialMode?: AuthMode;
  language: Language;
  onAuthenticate: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  language,
  onAuthenticate,
  onContinueAsGuest
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('arjun@flow.io');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Arjun Tanaka');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const isJp = language === 'jp';

  // Calculate password resilience
  const getPasswordStrength = (pass: string) => {
    if (!pass || pass === '••••••••••••') return { label: 'MINDFUL', percent: 80, color: 'text-sage bg-sage' };
    if (pass.length < 6) return { label: 'AWAITING KEY', percent: 25, color: 'text-vermilion bg-vermilion' };
    if (pass.length < 10) return { label: 'GENTLE', percent: 55, color: 'text-amber-600 bg-amber-600' };
    return { label: 'RESILIENT', percent: 100, color: 'text-sage bg-sage' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const nameToUse = mode === 'signup' && fullName ? fullName : 'Arjun Tanaka';
      const initials = nameToUse.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AJ';

      onAuthenticate({
        name: nameToUse,
        email: email || 'arjun@flow.io',
        initials: initials || 'AJ',
        isGuest: false,
        rememberMe: rememberMe,
        personaTitle: isJp ? '静寂の探求者' : 'Sanctuary Listener'
      });
    }, 450);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthenticate({
        name: 'Arjun Tanaka',
        email: 'arjun.tanaka@gmail.com',
        initials: 'AT',
        isGuest: false,
        rememberMe: true,
        personaTitle: isJp ? 'Google連携会員' : 'Google Connected Traveler'
      });
    }, 400);
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] w-full flex flex-col justify-between items-center py-6 px-4 overflow-hidden select-none">
      {/* Flanking Vertical Japanese Calligraphy (Desktop & Tablet) */}
      <aside aria-hidden="true" className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col items-center pointer-events-none z-10 opacity-75">
        <div className="vertical-calligraphy font-jp font-bold text-3xl xl:text-4xl text-ink-900 tracking-[0.4em] drop-shadow-sm">
          {mode === 'login' ? '静寂の響き' : '無我静寂の調'}
        </div>
        <div className="mt-4 flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-ink-500 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
          <span>{mode === 'login' ? 'HARMONIC REST' : 'ACOUSTICS'}</span>
        </div>
      </aside>

      <aside aria-hidden="true" className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col items-center pointer-events-none z-10 opacity-75">
        <div className="vertical-calligraphy font-jp font-bold text-3xl xl:text-4xl text-ink-900 tracking-[0.4em] drop-shadow-sm">
          {mode === 'login' ? '風雅無常' : '風雅の静寂'}
        </div>
        <div className="mt-4 flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-ink-500 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
          <span>{mode === 'login' ? 'ACOUSTIC SOUL' : 'SHIBUI PROTOCOL'}</span>
        </div>
      </aside>

      {/* Main Washi Auth Card */}
      <div className="relative z-20 w-full max-w-[480px] my-auto">
        <div className="washi-card rounded-3xl p-6 sm:p-8 shadow-floating border border-parchment-300 relative overflow-hidden backdrop-blur-xl">
          {/* Vermilion Stamp Badge on top right */}
          <div className="absolute top-5 right-5 sm:top-6 sm:right-6 flex flex-col items-center">
            <div className="w-7 h-7 rounded bg-vermilion text-[11px] font-jp font-bold text-white flex items-center justify-center shadow-hanko transform -rotate-3 transition-transform hover:rotate-0 cursor-default">
              {mode === 'login' ? '無我' : '印'}
            </div>
            <span className="text-[8px] font-mono text-ink-500 mt-0.5 tracking-tighter uppercase font-semibold">
              SEAL
            </span>
          </div>

          {/* Card Header & Kicker */}
          <div className="pr-10">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
              <p className="font-jp text-[11px] font-bold text-ink-700 tracking-wider uppercase">
                {mode === 'login'
                  ? (isJp ? 'ログイン • 帰還の調べ' : 'ログイン • RETURN TO STILLNESS')
                  : (isJp ? '新規登録 • 聖域の創造' : '新規登録 • CREATE YOUR SANCTUARY')}
              </p>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight leading-snug">
              {mode === 'login'
                ? (isJp ? 'Nashi へようこそ' : 'Welcome Back to Nashi')
                : (isJp ? '静かな音響の旅へ路を開く' : 'Begin Your Acoustic Journey')}
            </h1>
            <p className="text-xs text-ink-500 mt-1 leading-relaxed">
              {mode === 'login'
                ? (isJp
                    ? 'ライブラリやお気に入り曲、再生履歴を同期するためにログインしてください。'
                    : 'Log in to access your personal library, liked frequencies, and synchronized listening history.')
                : (isJp
                    ? 'アカウントを作成して、瞑想トラックを保存し、水彩の旅路を解き放ちましょう。'
                    : 'Create your account to save playlists, like meditative tracks, and unlock custom watercolor journals.')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {/* SIGNUP: Full Name Field */}
            {mode === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-ink-700 font-mono tracking-wider uppercase">
                    {isJp ? 'お名前' : 'FULL NAME'}
                  </label>
                  <span className="text-[9px] font-mono text-ink-400 uppercase">
                    {isJp ? 'リスナーの雅号' : 'YOUR LISTENER PERSONA'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Arjun Tanaka"
                    className="w-full pl-9 pr-3 py-2 text-xs text-ink-900 bg-white/90 border border-parchment-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion transition-all placeholder:text-ink-300 shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-ink-700 font-mono tracking-wider uppercase">
                  {isJp ? 'メールアドレス' : 'EMAIL ADDRESS'}
                </label>
                {mode === 'signup' && (
                  <span className="text-[9px] font-mono text-ink-400 uppercase">
                    {isJp ? '配信先' : 'AUDIO STREAM DISPATCH'}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-ink-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun@flow.io"
                  className="w-full pl-9 pr-3 py-2 text-xs text-ink-900 bg-white/90 border border-parchment-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion transition-all placeholder:text-ink-300 shadow-xs"
                />
              </div>
            </div>

            {/* Password / Master Cipher Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-ink-700 font-mono tracking-wider uppercase">
                  {mode === 'signup' ? (isJp ? 'マスター暗号（パスワード）' : 'MASTER CIPHER (PASSWORD)') : (isJp ? 'パスワード' : 'PASSWORD')}
                </label>
                <span className="text-[9px] font-mono text-ink-400">
                  {mode === 'signup' ? (isJp ? '暗号化済み' : 'ENCRYPTED') : '[Shift + Tab to rewind]'}
                </span>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-ink-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs text-ink-900 bg-white/90 border border-parchment-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-ink-400 hover:text-ink-700 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Resilience Bar (on signup) */}
              {mode === 'signup' && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-ink-500">Resilience:</span>
                    <span className={`font-bold ${strength.label === 'AWAITING KEY' ? 'text-vermilion' : 'text-sage'}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-parchment-300 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-ink-400 mt-1">
                    {isJp ? '8文字以上、数字と記号を含めてください。' : 'At least 8 characters, one number, and one glyph.'}
                  </p>
                </div>
              )}
            </div>

            {/* SIGNUP: Confirm Password Field */}
            {mode === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-ink-700 font-mono tracking-wider uppercase">
                    {isJp ? '暗号の確認' : 'CONFIRM CIPHER'}
                  </label>
                  <span className="text-[9px] font-mono text-ink-400 uppercase">
                    {isJp ? '身元確認' : 'VERIFY IDENTITY'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-3 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs text-ink-900 bg-white/90 border border-parchment-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-ink-400 hover:text-ink-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN: Remember Me & Forgot Password Row */}
            {mode === 'login' ? (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-ink-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-parchment-300 text-ink-900 focus:ring-vermilion/30 w-3.5 h-3.5"
                  />
                  <span className="text-[11px]">{isJp ? '30日間ログイン状態を保持' : 'Remember me for 30 days'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordMessage(isJp ? 'リセットリンクを送信しました（模擬）' : 'A tranquility reset link was sent to your email.')}
                  className="text-[10px] font-mono font-bold text-vermilion hover:underline tracking-tight"
                >
                  {isJp ? '暗号をお忘れですか？' : 'FORGOT PASSWORD?'}
                </button>
              </div>
            ) : (
              /* SIGNUP: Terms Agreement Checkbox */
              <label className="flex items-start space-x-2 text-[10px] text-ink-600 cursor-pointer pt-1 leading-snug">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-parchment-300 text-ink-900 focus:ring-vermilion/30 w-3.5 h-3.5 mt-0.5"
                />
                <span>
                  {isJp
                    ? 'Nashi音響利用規約およびプライバシー巻物に同意し、心静かなデータ取り扱いを確認します。'
                    : 'I agree to the Nashi Acoustic Terms of Service and Privacy Scroll, acknowledging mindful data practices.'}
                </span>
              </label>
            )}

            {forgotPasswordMessage && (
              <p className="text-[11px] text-sage font-medium bg-sage/10 p-2 rounded-lg text-center animate-fadeIn">
                {forgotPasswordMessage}
              </p>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-ink-900 hover:bg-ink-800 text-parchment-50 font-medium text-xs sm:text-sm tracking-wide shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
                  <span className="font-serif tracking-wider font-semibold">
                    {mode === 'login'
                      ? (isJp ? 'ログイン →' : 'LOG IN →')
                      : (isJp ? 'アカウントを作成 →' : 'CREATE ACCOUNT →')}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Security Note Pill */}
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-parchment-100/70 border border-parchment-300/60 flex items-center justify-center space-x-2 text-[10px] text-ink-500">
            <Shield className="w-3.5 h-3.5 text-sage shrink-0" />
            <span className="truncate">
              {mode === 'login'
                ? (isJp ? '暗号化トークン認証 & TLS 1.3 による保護' : 'Secure session with encrypted token auth & HTTPS TLS 1.3')
                : (isJp ? 'Argon2id 暗号化とステートレス JWT セッションにより保護' : 'Protected by Argon2id cipher & stateless JWT session tokens.')}
            </span>
          </div>

          {/* Divider: あるいは • OR */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-parchment-300/80" />
            <span className="absolute bg-[#FAF6F0] px-3 text-[10px] text-ink-400 font-jp">
              {isJp ? 'あるいは • または' : 'あるいは • OR'}
            </span>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2 px-4 rounded-xl bg-white/90 hover:bg-white border border-parchment-300 text-ink-800 font-medium text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            {/* Google G logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{mode === 'login' ? 'Continue with Google' : 'Sign Up with Google'}</span>
          </button>

          {/* Continue as Guest Button (from user's screen!) */}
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full mt-2.5 p-3 rounded-xl bg-parchment-100/60 hover:bg-parchment-200/80 border border-parchment-300 text-left transition-all active:scale-[0.99] flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <span className="text-base group-hover:scale-110 transition-transform">🍵</span>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-ink-900 font-mono tracking-wider uppercase">
                  {isJp ? 'ゲストとして体験する' : 'CONTINUE AS GUEST'}
                </p>
                <p className="text-[10px] text-ink-500 truncate">
                  {isJp
                    ? 'アカウント登録なしで選りすぐりの楽曲を視聴（同期機能は無効）'
                    : 'Explore curated playlists without signing in (offline sync disabled).'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-vermilion group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>

          {/* Bottom Card Footer: Switch Mode */}
          <div className="mt-5 pt-3.5 border-t border-parchment-300/80 flex items-center justify-between text-xs">
            {mode === 'login' ? (
              <>
                <div>
                  <p className="text-ink-700 font-medium">{isJp ? '初めてですか？' : 'New to Nashi?'}</p>
                  <p className="text-[9px] text-ink-400 font-mono uppercase">{isJp ? '広告なし・心の安らぎ' : 'YOUR MUSIC, YOUR MOOD, NO ADS.'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="px-3 py-1 rounded-lg bg-vermilion/15 hover:bg-vermilion/25 text-vermilion font-serif font-bold text-xs transition-colors flex items-center space-x-1"
                >
                  <span>{isJp ? 'アカウント作成' : 'CREATE AN ACCOUNT'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="w-full text-center">
                <p className="text-xs text-ink-700">
                  {isJp ? 'すでにアカウントをお持ちですか？' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-vermilion hover:underline ml-1"
                  >
                    {isJp ? 'ログイン' : 'Log In'}
                  </button>
                </p>
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-[10px] text-ink-500 hover:text-ink-800 mt-1 block w-full underline"
                >
                  {isJp
                    ? '登録せずに公開コレクションを試聴'
                    : 'Browsing without account? You can continue exploring public collections anytime.'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Sumi Stream Active badge (below card as seen in image) */}
        <div className="mt-3 flex items-center justify-center space-x-2 text-[10px] font-mono text-ink-500">
          <span className="w-2 h-2 rounded-full bg-vermilion animate-pulse" />
          <span className="tracking-wider uppercase">
            {isJp ? '河口湖ストリーム・生中継中' : 'LIVE SUMI ENGINE: LAKE KAWAGUCHI STREAM ACTIVE'}
          </span>
        </div>
      </div>

      {/* Page Footer Ticker */}
      <footer className="relative z-20 w-full max-w-7xl px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-500 font-mono border-t border-parchment-300/40 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-vermilion" />
          <span>LOSSLESS SUMI AUDIO 24-BIT/96KHZ</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>© 2025 Nashi</span>
          <button className="hover:text-ink-900 transition-colors">PRIVACY</button>
          <button className="hover:text-ink-900 transition-colors">TERMS</button>
        </div>
      </footer>
    </div>
  );
};
