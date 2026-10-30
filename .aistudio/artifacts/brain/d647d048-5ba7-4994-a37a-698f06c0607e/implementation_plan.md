# Nashi (なし) — Japanese Watercolor Music & Acoustic Sanctuary Website

Nashi is a full-featured desktop and mobile responsive web application inspired by traditional Japanese sumi-e brush paintings, washi paper textures, and contemporary lo-fi chill soundscapes. Designed as a rich website experience (matching the full-width desktop layouts shown in the authentication screens and adapting the mobile player UI into a responsive web dashboard), Nashi seamlessly unites contemplative authentication with an interactive music and meditation player.

## User Review & Critical Decisions

> [!IMPORTANT]
> In response to your clarification that **this is a website**, the architecture is structured as a full-width responsive web application:

- **Confirmed Decision 1: Full-Width Desktop Website Architecture**:
  - Rather than being constrained to a simulated phone mockup, Nashi is an expansive responsive website that fills desktop displays with high-fidelity visual presence (1440px baseline), incorporating the full watercolor landscape, flanking vertical calligraphy (`静寂の響き` & `風雅無常`), global top navigation, and comprehensive audio controls.
  - On mobile and tablet screens, the layout adapts with fluid touch ergonomics, responsive grids, and clean thumb navigation.
- **Confirmed Decision 2: Authentic Full-Screen Authentication Experience**:
  - Exact recreation of the full-screen desktop authentication website views (`image_99757ca9.png` and `image_9c2de057.png`):
    - **Log In ("Return to Stillness / ログイン")**: Centered washi card with `無我 SEAL`, email and cipher fields, password reveal toggle, "Remember me for 30 days", "Forgot Password?", "Log In →" CTA, Google sign-in, and one-click "Continue as Guest".
    - **Sign Up ("Begin Your Acoustic Journey / 新規登録")**: Full Name / Persona, Email, Master Cipher with live resilience meter, Confirm Cipher, Terms agreement, and account creation.
    - **Global Header**: Brand lockup (`波 なし NASHI`), "ZEN REST" ambient mode toggle, and "EN / 日本語" bilingual language selector.
    - **Ambient Footer**: `LOSSLESS SUMI AUDIO 24-BIT/96KHZ`, `LIVE SUMI ENGINE: LAKE KAWAGUCHI STREAM ACTIVE`, and copyright/privacy links.
- **Confirmed Decision 3: Expansive Web Music Dashboard & Player Bar**:
  - Seamlessly transition from Auth into the main Nashi Web Music Experience:
    - **Hero Landscape Banner**: Misty Mount Fuji panorama with breathing atmospheric float and drifting sakura/ink petals.
    - **Greeting & Zen Quote**: "Good Evening, Arjun", daily proverb, and red hanko stamp (`調和和音`).
    - **Category Filters**: "All Sounds", "Japanese Chill 🍵", "Lo-fi & Focus 🌧️", "Recently Added", "Zen Playlists".
    - **Featured for You Carousel**: Multi-item horizontal carousel with smooth navigation arrows (`‹` / `›`), sumi-e artwork cards, active equalizer frequencies, and instant play triggers.
    - **Recently Played Grid**: Multi-column web grid with duration counters and play buttons.
    - **Made for You Collections**: Playlists (Midnight Drive, Monsoon Feelings, Lo-fi Hindi, Soulful Punjabi, Focus & Flow).
    - **Bottom Audio Player Bar**: Docked playback bar spanning the viewport width with track thumbnail, title/artist, live time scrubber, interactive equalizer, volume slider, like/favorite button, and expandable full-screen Now Playing view with poetry and synchronized lyrics.
    - **Zen Sanctuary View**: Meditation timer and customizable ambient sound mixer (Rain, Mountain Wind, Temple Bell, River Stream).

---

## 1. Overview & Core Concept

- **What It Does**: Nashi provides a complete web platform for streaming Japanese-inspired ambient music, lo-fi beats, and meditation audio. Visitors can sign in, register a new account, or explore instantly as a guest to experience curated playlists, manage their library, and practice mindful focus.
- **Target Audience**: Desktop and mobile web users looking for deep work focus, relaxation, study music, or evening unwinding accompanied by traditional Japanese art.
- **Key Value**: A website with authentic wabi-sabi aesthetics, tactile washi paper textures, sumi-e watercolor scenery, and zero generic "AI slop."

---

## 2. User Experience & Visual Design

### Website Layout & Pages

1. **Top Website Navigation**:
   - Left Zone: Vermilion square seal (`波`) with `なし NASHI` wordmark.
   - Center Zone (in App view): Navigation links (`Home / ホーム`, `Search / 検索`, `Library / ライブラリ`, `Liked / お気に入り`, `Zen Sanctuary / 禅`).
   - Right Zone: "ZEN REST" toggle (ambient nature audio mode), "EN / 日本語" language selector, and User Profile avatar (`AJ` with status dot).

2. **Authentication Page (`/auth`)**:
   - Full desktop canvas with watercolor Mt. Fuji and lake landscape.
   - Left vertical calligraphy: `静寂の響き` (Harmonic Rest).
   - Right vertical calligraphy: `風雅無常` (Acoustic Soul).
   - Central Washi Card: Seamless toggle between "Return to Stillness" (Login) and "Begin Your Acoustic Journey" (Signup).
   - Working guest exploration button: "CONTINUE AS GUEST" immediately loads the music library.
   - Footer ticker: Live sumi audio engine stream indicator, audio resolution spec, and privacy/terms links.

3. **Music Sanctuary Dashboard (`/app`)**:
   - **Hero Greeting Area**: Wide atmospheric panel with personalized welcome, zen haiku quote, and hanko badge.
   - **Filter Strip**: Interactive category tabs with active state indicators.
   - **Featured Carousel**: Responsive multi-card slider showcasing top curated tracks.
   - **Recently Played & Made for You**: Responsive 4-to-6 column web grid on desktop, scaling to 2 columns on mobile.
   - **Dedicated Tab Views**:
     - *Search*: Live query filter, search suggestions, instrument tags (Koto, Shakuhachi, Biwa, Lo-Fi).
     - *Library & Liked*: Saved tracks with duration, date added, and playback controls.
     - *Zen Sanctuary*: Meditation timer (5m, 15m, 25m, 45m), breath pacing visualizer, and 4-channel ambient sound mixer.

4. **Web Audio Player Bar**:
   - Anchored at the bottom of the screen with a dark washi backdrop blur.
   - Left: Album cover art, title, artist, kanji seal, and duration badge.
   - Center: Scrubber progress bar with hover timestamp preview, playback controls (Shuffle, Prev, Play/Pause, Next, Repeat).
   - Right: Heart like toggle, volume slider with mute, mini equalizer frequency bars, and Expand button (opens full-screen lyrics/poetry modal).

### Visual Tokens & Typographic Hierarchy

- **Color Tokens**:
  - Neutral Canvas: `#FAF6F0` (light parchment) / `#0D0C0B` (rich ink night).
  - Washi Cards: `rgba(246, 241, 233, 0.90)` with `backdrop-filter: blur(16px)` and subtle borders.
  - Accent Vermilion (`#C24D3D`): Hanko seals, active indicators, scrubber progress head, and focus rings.
  - Forest Sage (`#526E58`): Secondary badges and natural accents.
- **Typography Pairing**:
  - Display: `Cormorant Garamond` (editorial serif with poetic warmth).
  - Japanese / Kanji: `Noto Serif JP`.
  - UI Controls & Metadata: `Plus Jakarta Sans` with `tabular-nums` for timers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Width Responsive Website Layout**:
  - *Chosen Approach*: Build a true website that spans the desktop browser width with a max-width container (`max-w-7xl` or full viewport) while gracefully adapting to mobile.
  - *Why*: Directly aligns with your specification ("its a website") and matches the widescreen aspect ratio of the desktop authentication designs.
  - *Alternatives Considered*: Restricting to a 375px phone frame on desktop (rejected as it does not fulfill the website requirement).

- **Decision 2: Synthesized Web Audio Engine with Ambient Layers**:
  - *Chosen Approach*: Use Web Audio API synthesis for calming soundscapes (gentle flowing stream, soft rain, resonant singing bowl bells) and audio playback simulation.
  - *Why*: Guarantees reliable, uninterrupted sound without dead links, external CORS hurdles, or silent buttons.

- **Decision 3: Seamless Client-Side Navigation & Session Persistence**:
  - *Chosen Approach*: Single Page Application routing between Auth and Dashboard with `localStorage` persistence for user credentials, guest sessions, liked songs, and recent plays.
  - *Why*: Instant transitions with zero page-reload flicker.

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Global Background: Mt. Fuji Sumi-e Landscape + Drifting Petals   │  │
│  │                                                                  │  │
│  │ Global Top Bar: Brand Wordmark (波 なし) | Zen Rest | EN/JP      │  │
│  │                                                                  │  │
│  │  [Conditional Route State: page = 'auth' | 'dashboard']          │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ 1. Authentication View (Widescreen Website Layout)         │  │  │
│  │  │  • Vertical Calligraphy: 静寂の響き & 風雅無常             │  │  │
│  │  │  • Log In Card ("Return to Stillness")                     │  │  │
│  │  │  • Sign Up Card ("Begin Your Acoustic Journey")            │  │  │
│  │  │  • Continue as Guest -> Immediately opens Dashboard        │  │  │
│  │  │  • Live Sumi Engine status footer                          │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ 2. Music Dashboard View (Responsive Web Interface)         │  │  │
│  │  │  • Hero Banner & Personalized Greeting ("Good Evening...") │  │  │
│  │  │  • Category Filter Pills & Search Bar                      │  │  │
│  │  │  • Featured for You Carousel (Multi-card with arrows)      │  │  │
│  │  │  • Recently Played & Made for You Grids                    │  │  │
│  │  │  • Zen Sanctuary Tab (Meditation timer & ambient mixer)    │  │  │
│  │  │  • Liked & Library Views                                   │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │ Bottom Audio Player Bar (Pinned across website bottom)           │  │
│  │  • Track Info, Scrubber, Controls, Visualizer, Volume, Expand   │  │
│  │                                                                  │  │
│  │ Expandable Full-Screen Now Playing Modal (Poetry & Lyrics)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│          ▲                              ▲                              │
│  ┌──────────────┐              ┌─────────────────┐                     │
│  │ Audio Engine │              │ Storage Context │                     │
│  │ (Web Audio)  │              │ (User & Tracks) │                     │
│  └──────────────┘              └─────────────────┘                     │
└────────────────────────────────────────────────────────────────────────┘
```
