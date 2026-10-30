import { Playlist, Track } from '../types';

export const TRACK_ARTWORK = '/assets/mountain_bg.jpg';

export const SAMPLE_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Move like water, keep the fire quiet.',
    artist: 'Kohäku',
    kanji: '琥珀',
    kanjiMeaning: 'Amber Glow',
    duration: 256, // 4:16
    category: 'chill',
    coverUrl: TRACK_ARTWORK,
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0c/00/a0/0c00a0f6-6ea5-1770-aac2-0eb8f5e26161/mzaf_16816660350896864471.plus.aac.p.m4a',
    mood: 'Contemplative & Flowing',
    tags: ['Water', 'Bamboo', 'Chill', 'Lo-Fi', 'Night'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '水のように流れ、静寂の炎を灯す',
      en: 'Move like water across river stones, undisturbed. Keep the inner fire gentle.',
      poet: 'Matsuo Bashō Inspiration'
    },
    lyrics: [
      { time: 0, text: 'Clear ripples dance across ancient smooth stones', subtext: '清らかなせせらぎが古の石を撫でる' },
      { time: 25, text: 'The evening mountain mist descends upon Lake Kawaguchi', subtext: '河口湖の夕霧が静かに降り立つ' },
      { time: 60, text: 'In every slow breath, finding stillness amidst the drift', subtext: '息を吸うたびに、心の静寂を見出す' },
      { time: 95, text: 'No rush in the bamboo grove, only the wind passing through', subtext: '竹林を吹き抜ける風に急ぐ気配はない' },
      { time: 140, text: 'Move like water, let the heavy embers settle into peace', subtext: '水のように流れ、穏やかな眠りへと誘う' },
      { time: 190, text: 'The moon watches quietly over the dreaming mountain', subtext: '月は静かに眠る山々を見守りつづける' }
    ]
  },
  {
    id: 'track-2',
    title: 'Same moon, different nights.',
    artist: 'Tsuki • 月',
    kanji: '月夜',
    kanjiMeaning: 'Moonlit Night',
    duration: 228, // 3:48
    category: 'zen',
    coverUrl: '/assets/cover_moon.svg',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6c/21/fe/6c21fe59-d1b5-457c-1fd2-c6475107cf27/mzaf_1742732144361176660.plus.aac.p.m4a',
    gradient: 'from-[#1E252B] via-[#2A2B33] to-[#121417]',
    mood: 'Dreamy & Solitary',
    tags: ['Moon', 'Zen', 'Acoustic', 'Night'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '月影はひとつ、めぐる夜は幾千',
      en: 'A solitary moon illuminates all rivers; differing nights, yet one eternal light.',
      poet: 'Ancient Zen Verse'
    },
    lyrics: [
      { time: 0, text: 'Silver reflections cast upon the silent pond', subtext: '静まりかえった水面に映る銀の光' },
      { time: 35, text: 'The tea has cooled, the evening settles in', subtext: '茶は冷め、静かな夜の帳が下りる' },
      { time: 80, text: 'Same moon shining bright above distant shores', subtext: '遠く離れた岸辺にも同じ月が輝いている' },
      { time: 130, text: 'Thoughts release like smoke into the midnight sky', subtext: '思いは煙のように夜空へ溶けてゆく' },
      { time: 175, text: 'Until only stillness remains', subtext: 'やがて静けさだけがそこに残る' }
    ]
  },
  {
    id: 'track-3',
    title: 'Find peace in the noise.',
    artist: 'Yōgen • 幽玄',
    kanji: '幽玄',
    kanjiMeaning: 'Subtle Grace',
    duration: 274, // 4:34
    category: 'lofi',
    coverUrl: '/assets/cover_rain.svg',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/96/59/ed/9659ed24-d658-53ae-971c-83b1f10ad023/mzaf_10374275233276498509.plus.aac.p.m4a',
    gradient: 'from-[#2B231D] via-[#4A3B31] to-[#181412]',
    mood: 'Grounding & Deep',
    tags: ['Focus', 'Study', 'Rain', 'Lo-Fi'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '雑踏の中にこそ、揺るがぬ静寂がある',
      en: 'To watch the sun sink behind a flower-clad hill; finding the quiet core within.',
      poet: 'Zeami Motokiyo'
    },
    lyrics: [
      { time: 0, text: 'Gentle raindrops tap upon paper shoji screens', subtext: '障子を叩く柔らかな雨音' },
      { time: 40, text: 'Streetcars humming gently in the distant rain', subtext: '遠くの雨に溶け込む市電の響き' },
      { time: 90, text: 'Your breath is the sanctuary nothing can disturb', subtext: '呼吸こそが誰にも乱されぬ聖域' },
      { time: 150, text: 'Steady rhythm, deep focus, quiet mind', subtext: '確かなリズム、深い集中、澄んだ心' },
      { time: 210, text: 'The noise softens into gentle white waves', subtext: '喧騒はやわらかな白い波へと還る' }
    ]
  },
  {
    id: 'track-4',
    title: 'Raat Ki Baat',
    artist: 'Arijit Singh',
    kanji: '夜',
    kanjiMeaning: 'Night Conversation',
    duration: 222, // 3:42
    category: 'recent',
    coverUrl: '/assets/cover_lantern.svg',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/57/b2/12/57b21239-49d1-6e47-f8ae-ed314be32175/mzaf_13533428324217024511.plus.aac.p.m4a',
    gradient: 'from-[#38261F] via-[#654321] to-[#D79A58]',
    mood: 'Warm Nostalgia',
    tags: ['Acoustic', 'Vocal', 'Nostalgic', 'Evening'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '夜の語らい、胸に染み入る温もり',
      en: 'Quiet whispers of the night that lingeringly comfort the soul.',
      poet: 'Modern Melodic Poetry'
    },
    lyrics: [
      { time: 0, text: 'When the city rests and only stars listen', subtext: '街が眠り、星だけが耳を澄ます刻' },
      { time: 30, text: 'Words left unsaid whisper through the breeze', subtext: '言えなかった言葉が風に乗って漂う' },
      { time: 75, text: 'Every note touches an old memory tenderly', subtext: 'どの旋律も懐かしい記憶を優しくなでる' },
      { time: 135, text: 'Night weaves a blanket of peace around the room', subtext: '夜が部屋全体を穏やかな安らぎで包む' }
    ]
  },
  {
    id: 'track-5',
    title: 'Sajni',
    artist: 'Arijit Singh',
    kanji: '月',
    kanjiMeaning: 'Beloved Moon',
    duration: 258, // 4:18
    category: 'recent',
    coverUrl: '/assets/cover_lotus.svg',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/0e/5f/a4/0e5fa4f9-c67b-31f1-1d1e-4c3e0f86e233/mzaf_15112412104812626230.plus.aac.p.m4a',
    gradient: 'from-[#1E272C] via-[#334652] to-[#7B95A2]',
    mood: 'Soulful & Melodic',
    tags: ['Acoustic', 'Soul', 'Strings', 'Warm'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '心に寄り添う、懐かしき調べ',
      en: 'A beloved tune softly echoing through the chambers of the heart.',
      poet: 'Harmonic Reflection'
    },
    lyrics: [
      { time: 0, text: 'Gentle acoustic strings reverberating softly', subtext: '優しく響き渡るアコースティックの弦' },
      { time: 45, text: 'Underneath the indigo twilight sky', subtext: '藍色の黄昏の空の下で' },
      { time: 100, text: 'A yearning that turns into quiet gratefulness', subtext: '切なさはやがて静かな感謝へと変わる' },
      { time: 160, text: 'Stay in this cadence, unhurried', subtext: 'この調べの中に、急ぐことなく留まる' }
    ]
  },
  {
    id: 'track-6',
    title: 'Calm Evenings',
    artist: 'Prateek Kuhad',
    kanji: '夕',
    kanjiMeaning: 'Twilight Serenity',
    duration: 191, // 3:11
    category: 'chill',
    coverUrl: '/assets/cover_sunset.svg',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c6/34/7f/c6347fe4-d2a8-bf5e-2ca5-7438cce63f93/mzaf_585381111877766094.plus.aac.p.m4a',
    gradient: 'from-[#3D2C24] via-[#754E3C] to-[#E59866]',
    mood: 'Intimate Acoustic',
    tags: ['Acoustic', 'Guitar', 'Warmth', 'Sunset'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '茜差す夕暮れ、心の荷を下ろす',
      en: 'The crimson sun sets, laying down all weary burdens.',
      poet: 'Twilight Reflection'
    },
    lyrics: [
      { time: 0, text: 'Soft golden sunlight spilling across wooden floorboards', subtext: '木漏れ日のような夕陽が床に広がる' },
      { time: 35, text: 'A single guitar chord echoing peacefully', subtext: 'ひとつのコードが穏やかに響く' },
      { time: 80, text: 'The simple joy of being present right here', subtext: '今ここに生きるというささやかな歓び' },
      { time: 130, text: 'As daylight gives way to gentle shadows', subtext: '昼の光はやがて柔らかな影へと移ろう' }
    ]
  },
  {
    id: 'track-7',
    title: 'Phir Milenge',
    artist: 'Talha Anjum',
    kanji: '山',
    kanjiMeaning: 'Mountain Hope',
    duration: 302, // 5:02
    category: 'lofi',
    coverUrl: '/assets/cover_valley.svg',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7f/ae/54/7fae542f-e72a-5311-b3cd-0545b1f8f51b/mzaf_3803327232855867334.plus.aac.p.m4a',
    gradient: 'from-[#2F3931] via-[#4D5E51] to-[#A3B899]',
    mood: 'Poetic & Reflective',
    tags: ['Lo-Fi', 'Poetry', 'Rhythm', 'Focus'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '幾度すれ違おうとも、山河は巡り逢う',
      en: 'Mountains and rivers part only to meet again in the wider ocean.',
      poet: 'Sufi Zen Melodic Thought'
    },
    lyrics: [
      { time: 0, text: 'Rhythmic beats meeting traditional wooden flute tones', subtext: '伝統の横笛と心地よいリズムが溶け合う' },
      { time: 45, text: 'Journeys traveled across misty valleys', subtext: '霧深い谷を越えて歩んできた道のり' },
      { time: 110, text: 'Every ending holds the seed of return', subtext: 'すべての終わりは再会の種を宿している' },
      { time: 180, text: 'Walk forward with calm in your chest', subtext: '胸に静けさを抱き、前へと歩む' }
    ]
  },
  {
    id: 'track-8',
    title: 'Tea Garden Whispers',
    artist: 'Sen no Rikyū Ensemble',
    kanji: '茶',
    kanjiMeaning: 'Way of Tea',
    duration: 240, // 4:00
    category: 'zen',
    coverUrl: '/assets/cover_tea.svg',
    audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/96/59/ed/9659ed24-d658-53ae-971c-83b1f10ad023/mzaf_10374275233276498509.plus.aac.p.m4a',
    gradient: 'from-[#222E26] via-[#3E5244] to-[#7D9484]',
    mood: 'Deep Zen Meditation',
    tags: ['Tea', 'Zen', 'Koto', 'Bells'],
    source: 'sample',
    isPreviewOnly: true,
    downloadAllowed: false,
    poetry: {
      jp: '一期一会、一服の茶に宇宙を見る',
      en: 'Treasure every unrepeatable encounter; within a single bowl of green tea rests the universe.',
      poet: 'Tea Philosophy'
    },
    lyrics: [
      { time: 0, text: 'Water boils gently in the iron kettle like wind in pine needles', subtext: '松風の如く沸き立つ釜の湯の音' },
      { time: 40, text: 'The bamboo whisk blends stillness with emerald froth', subtext: '茶筅が静寂と緑の泡をかき立てる' },
      { time: 100, text: 'Simplicity is the truest refinement of existence', subtext: '簡素こそが存在の至高の洗練' },
      { time: 160, text: 'Empty the mind and taste the essence of this hour', subtext: '心を空にして、この瞬間の妙味を味わう' }
    ]
  }
];

export const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    title: 'Midnight Drive',
    titleJp: '真夜中の道',
    songCount: 50,
    emoji: '🌙',
    gradient: 'from-[#121316] via-[#1D222A] to-[#3A4454]',
    description: 'Deep nocturnal synthwave and peaceful night highway frequencies.',
    coverUrl: '/assets/cover_moon.svg'
  },
  {
    id: 'pl-2',
    title: 'Monsoon Feelings',
    titleJp: '雨の気配',
    songCount: 34,
    emoji: '🏮',
    gradient: 'from-[#302B27] via-[#5C4D3C] to-[#C99C6A]',
    description: 'Warm petrichor, rhythmic downpours, and glowing paper lanterns.',
    coverUrl: '/assets/cover_rain.svg'
  },
  {
    id: 'pl-3',
    title: 'Lo-fi Hindi',
    titleJp: '静寂の音',
    songCount: 28,
    emoji: '🎧',
    gradient: 'from-[#212423] via-[#35433C] to-[#607D6D]',
    description: 'Chilled desi vinyl textures, gentle sitar, and slow study grooves.',
    coverUrl: '/assets/cover_lantern.svg'
  },
  {
    id: 'pl-4',
    title: 'Soulful Punjabi',
    titleJp: '情熱の詩',
    songCount: 41,
    emoji: '🌾',
    gradient: 'from-[#3D1E18] via-[#853428] to-[#D96B5B]',
    description: 'Acoustic sufi ballads, flute breezes, and rustic river reflections.',
    coverUrl: '/assets/cover_sunset.svg'
  },
  {
    id: 'pl-5',
    title: 'Focus & Flow',
    titleJp: '集中と呼吸',
    songCount: 60,
    emoji: '🎋',
    gradient: 'from-[#222120] via-[#48423B] to-[#998F82]',
    description: 'Binaural ambient washes and deep concentration soundscapes.',
    coverUrl: '/assets/cover_tea.svg'
  }
];
