'use client';

import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Flame, Sparkles, Play, Pause, Filter, ArrowLeft, Heart, 
  Compass, FolderHeart, Download, Monitor, LogIn, Volume2, VolumeX, 
  MoreHorizontal, User, Check, X, ChevronRight, Disc, Laptop, Info, 
  Headphones, RefreshCw, Star, Trash2, History, Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// LOCAL VAULT TRACKS MAP
const LOCAL_SONGS = [
  { id: 'local-kabhi-kabhi-aur', name: 'Kabhi Kabhi', artist: 'AUR', album: 'Midnight Memories', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop', url: '/AUR - Kabhi Kabhi.mp3', source: 'local' },
  { id: 'local-bairan', name: 'Sabat Batin', artist: 'Bairan', album: 'Public Vault', image: '/covers/sabat_batin.png', url: '/Bairan - NaaSongs.mp3', source: 'local' },
  { id: 'local-bekhayali-acoustic', name: 'Bekhayali (Acoustic - Female Version)', artist: 'Sachet-Parampara', album: 'Kabir Singh', image: '/covers/bekhayali_acoustic.png', url: '/Bekhayali Acoustic(KoshalWorld.Com).mp3', source: 'local' },
  { id: 'local-bekhayali-male', name: 'Bekhayali (Kabir Singh - Male Version)', artist: 'Sachet Tandon', album: 'Kabir Singh', image: '/covers/bekhayali_male.png', url: '/Bekhayali Kabir Singh 128 Kbps.mp3', source: 'local' },
  { id: 'local-gal-sun', name: 'Gal Sun', artist: 'Pritam', album: 'Public Vault', image: '/covers/gal_sun.png', url: '/Gal Sun - Djjohal.fm.mp3', source: 'local' },
  { id: 'local-ishqa-ve', name: 'Ishqa Ve', artist: 'Zeeshan Ali', album: 'Public Vault', image: '/covers/ishqa_ve.png', url: '/Ishqa-Ve-Mp3-Song-by-Zeeshan-Ali(PagalWorldi.com.co).mp3', source: 'local' },
  { id: 'local-bieber', name: 'Love Yourself', artist: 'Justin Bieber', album: 'Naa Songs', image: '/covers/justin_bieber.png', url: '/Justin Bieber - NaaSongs.mp3', source: 'local' },
  { id: 'local-khat', name: 'Khat', artist: 'Khat', album: 'Single', image: '/covers/khat.png', url: '/Khat - Khat (128 kbps).mp3', source: 'local' },
  { id: 'local-kitab', name: 'Kitab', artist: 'Kitab', album: 'Single', image: '/covers/kitab.png', url: '/Kitab - NaaSongs.mp3', source: 'local' },
  { id: 'local-not-guilty', name: 'Not Guilty', artist: 'Naa Songs', album: 'Single', image: '/covers/not_guilty.png', url: '/Not Guilty - NaaSongs.mp3', source: 'local' },
  { id: 'local-number-plate', name: 'Number Plate (Beretta Refix)', artist: 'Refixed', album: 'Single', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600', url: '/Number Plate - Refixed Beretta - NaaSongs.mp3', source: 'local' },
  { id: 'local-padhe', name: 'Padhe Padhe', artist: 'Rakasa Ost', album: 'Rakasa', image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600', url: '/Padhe Padhe (From "Rakasa") - NaaSongs.mp3', source: 'local' },
  { id: 'local-sheesha', name: 'Sheesha', artist: 'Jo Bairan', album: 'Single', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600', url: '/Sheesha (Aakhya Mai Aakh Ghali Jo Bairan) - NaaSongs.mp3', source: 'local' },
  { id: 'local-tere-liye', name: 'Tere Liye', artist: 'Koshal World', album: 'Single', image: '/covers/tere_liye.png', url: '/Tere Liye(KoshalWorld.Com).mp3', source: 'local' }
];

// PREDEFINED MOODS
const MOOD_PLAYLISTS = [
  { name: 'Late Night Drive', tag: 'Chill Synth', icon: '🌙', query: 'Night Drive', color: 'from-purple-900 to-indigo-950', glow: 'rgba(139, 92, 246, 0.4)' },
  { name: 'Cyberpunk Synth', tag: 'Neon Power', icon: '⚡', query: 'Synthwave', color: 'from-pink-900 to-rose-950', glow: 'rgba(236, 72, 153, 0.4)' },
  { name: 'Lofi Study', tag: 'Chill Beats', icon: '☕', query: 'Lofi Chill', color: 'from-cyan-900 to-teal-950', glow: 'rgba(6, 182, 212, 0.4)' },
  { name: 'Bollywood Hits', tag: 'Nonstop Party', icon: '🎵', query: 'Bollywood Hits', color: 'from-orange-950 to-red-950', glow: 'rgba(249, 115, 22, 0.4)' },
  { name: 'Rainy Day Session', tag: 'Acoustic Soul', icon: '🌧️', query: 'Rainy Acoustic', color: 'from-blue-900 to-slate-950', glow: 'rgba(59, 130, 246, 0.4)' }
];

// TOP ARTISTS
const TOP_ARTISTS = [
  { name: 'Arijit Singh', query: 'Arijit Singh', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&fit=crop', role: 'Vocal King' },
  { name: 'Justin Bieber', query: 'Justin Bieber', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&fit=crop', role: 'Pop Idol' },
  { name: 'The Weeknd', query: 'The Weeknd', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&fit=crop', role: 'R&B Master' },
  { name: 'Dua Lipa', query: 'Dua Lipa', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&fit=crop', role: 'Disco Queen' },
  { name: 'Diljit Dosanjh', query: 'Diljit Dosanjh', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&fit=crop', role: 'Urban Folk' },
  { name: 'Badshah', query: 'Badshah', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&fit=crop', role: 'Rap Legend' }
];

export default function FuturisticMusicPage() {
  const { 
    currentTrack, setCurrentTrack, isBGActive, setIsBGActive,
    volume, setAudioParam, isMuted, setIsMuted, recentlyPlayed,
    queue, setQueue, playNext, playPrevious, bgTime, bgDuration,
    stopBackgroundTrack, playBackgroundTrack
  } = useAudio();

  // DASHBOARD STATE
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'search' | 'favorites' | 'library' | 'downloads' | 'spotify'>('home');
  const [spotifyPlaylist, setSpotifyPlaylist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Late Night Drive', 'Kabir Singh', 'Arijit Singh', 'Midnight Memories 🌙']);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [aiVibeRecommendation, setAiVibeRecommendation] = useState('🔮 AI Vibe: Awaiting emotional frequency input...');
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [featuredCharts, setFeaturedCharts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [downloadQueue, setDownloadQueue] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // SPOTIFY SYNC STATES
  const [spotifySyncToken, setSpotifySyncToken] = useState('');
  const [isSyncingSpotify, setIsSyncingSpotify] = useState(false);
  const [spotifySyncStatus, setSpotifySyncStatus] = useState('');

  // AUTH MODALS
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<string>('Guest User');
  const [isAuthorized, setIsAuthorized] = useState(false);

  // MOCK INSTALL MODAL
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // INTERACTIVE GLOW COORDINATES
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dashboardRef = useRef<HTMLDivElement>(null);

  // CLIENT MOUNT STATE FOR HYDRATION GUARD
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // NEW: PARTICLES FOR CINEMATIC NEON FOG AND FLOATING PARTICLES
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; size: number; delay: number; duration: number }[]>([]);
  
  // NEW: INTELLIGENT AI TYPING SEARCH PLACEHOLDER
  const [typingPlaceholder, setTypingPlaceholder] = useState('');

  // NEW: AUDIO STATS FOR LIVE FEED ENGINE
  const [audioStats, setAudioStats] = useState({ latency: '1.2ms', kbps: '320kbps', db: '-14.2dB' });

  useEffect(() => {
    if (!mounted) return;

    // Generate random background particles
    const list = [...Array(18)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 1.2,
      delay: Math.random() * -30,
      duration: Math.random() * 18 + 18
    }));
    setParticles(list);

    // AI typing loop for search placeholder
    const placeholderPhrases = [
      "Search 'Midnight Memories 🌙'...",
      "Search 'Late Night Drive'...",
      "Search 'Cyberpunk Synthwave'...",
      "Search 'Dil Se Diaries 🖤'...",
      "Search 'Lofi Study Chill'...",
      "Search 'Arijit Singh'..."
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timer: NodeJS.Timeout;

    const tick = () => {
      const currentPhrase = placeholderPhrases[phraseIdx];
      if (!isDeleting) {
        setTypingPlaceholder(currentPhrase.substring(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentPhrase.length) {
          isDeleting = true;
          timer = setTimeout(tick, 2500); // Pause on complete word
        } else {
          timer = setTimeout(tick, 80);
        }
      } else {
        setTypingPlaceholder(currentPhrase.substring(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % placeholderPhrases.length;
          timer = setTimeout(tick, 400); // Pause before starting next word
        } else {
          timer = setTimeout(tick, 45);
        }
      }
    };

    timer = setTimeout(tick, 1000);

    // Audio Engine stats ticketing
    const statsInterval = setInterval(() => {
      const lat = (Math.random() * 0.3 + 1.1).toFixed(2);
      const db = (Math.random() * -2.4 - 13.8).toFixed(1);
      setAudioStats({
        latency: `${lat}ms`,
        kbps: isBGActive ? '320kbps' : '0kbps',
        db: isBGActive ? `${db}dB` : '-inf dB'
      });
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearInterval(statsInterval);
    };
  }, [mounted, isBGActive]);

  // LOAD INITAL SECTIONS
  useEffect(() => {
    fetchTrending();
    fetchFeatured();
    
    // Fetch Spotify collaborative playlist
    fetch('/spotify_playlist.json')
      .then(res => res.json())
      .then(data => setSpotifyPlaylist(data))
      .catch(e => console.error("Failed to load Spotify collaborative playlist:", e));

    // Load favorites from local storage
    const savedFavs = localStorage.getItem('masti_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {}
    }
  }, []);

  // LOAD DEBOUNCED SEARCH & DYNAMIC VIBE ANALYZER
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch(searchQuery);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // UPDATE AI RECOMMENDATION & AUTO SUGGESTIONS
  useEffect(() => {
    if (!searchQuery) {
      setSearchSuggestions([]);
      setAiVibeRecommendation('🔮 AI Vibe: Awaiting emotional frequency input to scan vibes...');
      return;
    }

    const q = searchQuery.toLowerCase();
    
    if (q.includes('sad') || q.includes('broken') || q.includes('pain') || q.includes('dard')) {
      setAiVibeRecommendation('🔮 AI Vibe: Melancholic & Deep Nostalgia. Match rate: 98% with cozy rain nights.');
    } else if (q.includes('love') || q.includes('romantic') || q.includes('ishq') || q.includes('dil')) {
      setAiVibeRecommendation('🔮 AI Vibe: Soulful Passion & Harmony. Match rate: 95% with late night drives.');
    } else if (q.includes('lofi') || q.includes('study') || q.includes('relax') || q.includes('chill')) {
      setAiVibeRecommendation('🔮 AI Vibe: Cyberpunk Study Beats. Highly effective for coding flow state.');
    } else if (q.includes('hype') || q.includes('gym') || q.includes('workout') || q.includes('club')) {
      setAiVibeRecommendation('🔮 AI Vibe: High-Voltage Electronic Euphoria. Flood rate: 100% endorphins.');
    } else if (q.includes('arijit') || q.includes('singh')) {
      setAiVibeRecommendation('🔮 AI Vibe: Raw Vocal Soul. Emotional connection optimized at 320kbps.');
    } else if (q.includes('bieber') || q.includes('pop')) {
      setAiVibeRecommendation('🔮 AI Vibe: Glossy Synthpop Nostalgia. Elevating positive vibration state.');
    } else {
      setAiVibeRecommendation(`🔮 AI Vibe: Custom aesthetic frequency mapped for "${searchQuery}". Optimizing neural filters...`);
    }

    // Curated dynamic matchers
    const libraryTracks = [
      'Midnight Memories 🌙',
      'Dil Se Diaries 🖤',
      'Broken Frequencies 🎧',
      'After Hours Feelings 🌌',
      'Sabat Batin (Mystic Folk)',
      'Bekhayali (Acoustic Dream)',
      'Love Yourself (Synthpop)',
      'Late Night Chill-out Lofi'
    ];
    const matches = libraryTracks.filter(t => t.toLowerCase().includes(q));
    setSearchSuggestions(matches);
  }, [searchQuery]);

  // SYSTEM NOTIFICATION HELPER
  const notify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // SPOTIFY SYNCHRONIZATION ENGINE
  const handleSpotifySync = async (pastedToken?: string) => {
    const tokenToUse = pastedToken || spotifySyncToken;
    setIsSyncingSpotify(true);
    setSpotifySyncStatus('Initiating resolution handshake...');
    notify("Initiating Spotify Sync & Resolution Engine... ⚡", "info");

    try {
      const url = `/api/fetch-spotify-new?token=${encodeURIComponent(tokenToUse || '')}&t=${Date.now()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setSpotifySyncStatus(`Successfully sync'd ${data.totalCompiled} tracks!`);
        notify(`Sync completed: compiled ${data.totalCompiled} tracks! 🎉`, "success");
        
        // Refresh playlist
        const freshRes = await fetch('/spotify_playlist.json?t=' + Date.now());
        const freshData = await freshRes.json();
        setSpotifyPlaylist(freshData);
      } else {
        if (data.error && data.error.includes("Failed to automatically acquire Spotify token")) {
          setSpotifySyncStatus("Cloud environment blocked auto-token. Please paste token manually below 👇");
        } else {
          setSpotifySyncStatus(`Sync failed: ${data.error || 'Server error'}`);
        }
        notify(`Sync failed: ${data.error || 'Check details'}`, "error");
      }
    } catch (e: any) {
      setSpotifySyncStatus(`Sync error: ${e.message}`);
      notify(`Sync error: ${e.message}`, "error");
    } finally {
      setIsSyncingSpotify(false);
    }
  };

  // LOAD TRENDING
  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/songs?query=@trending');
      const data = await res.json();
      const results = data.results || [];
      // Combine saavn results with local songs to feel rich
      const merged = [...LOCAL_SONGS.slice(0, 4), ...results].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
      setTrendingSongs(merged);
      if (queue.length === 0) setQueue(merged);
    } catch (e) {
      setTrendingSongs(LOCAL_SONGS.slice(0, 8));
      if (queue.length === 0) setQueue(LOCAL_SONGS);
    } finally {
      setLoading(false);
    }
  };

  // LOAD FEATURED CHARTS
  const fetchFeatured = async () => {
    try {
      const res = await fetch('/api/songs?query=latest%202026');
      const data = await res.json();
      const results = data.results || [];
      const merged = [...results, ...LOCAL_SONGS.slice(4, 9)].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
      setFeaturedCharts(merged.slice(0, 10));
    } catch (e) {
      setFeaturedCharts(LOCAL_SONGS.slice(3, 11));
    }
  };

  // EXECUTE SEARCH
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/songs?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      // Local fallback search
      const localFiltered = LOCAL_SONGS.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) || 
        s.artist.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(localFiltered);
    } finally {
      setLoading(false);
    }
  };

  // PLAY AUDIO
  const handlePlaySong = async (song: any, songListContext: any[]) => {
    setCurrentTrack(song);
    setQueue(songListContext);
    
    let playUrl = song.url;
    
    // If it's a saavn song and the URL might be expired (or we want to ensure it's fresh)
    if (song.source === 'saavn' && (!song.url || song.url.includes('Expires='))) {
      try {
        notify(`Resolving fresh audio stream... ⚡`);
        const res = await fetch(`/api/songs?query=${encodeURIComponent(song.name + ' ' + song.artist)}`);
        const data = await res.json();
        if (data.success && data.results && data.results.length > 0) {
          const freshSong = data.results.find((s: any) => s.source === 'saavn' || s.source === 'youtube') || data.results[0];
          playUrl = freshSong.url;
          song.url = playUrl; // Update song in-place
          setCurrentTrack({ ...song, url: playUrl }); // Ensure current track in state is updated
        }
      } catch (err) {
        console.error("Failed to dynamically resolve fresh audio URL:", err);
      }
    }
    
    playBackgroundTrack(playUrl, song.name, song.artist, setIsBGActive);
    notify(`Playing "${song.name}" ⚡`);
  };

  // TOGGLE PLAY/PAUSE
  const handleTogglePlay = () => {
    if (!currentTrack) {
      // Play first song in list
      const fallbackList = trendingSongs.length > 0 ? trendingSongs : LOCAL_SONGS;
      handlePlaySong(fallbackList[0], fallbackList);
      return;
    }
    if (isBGActive) {
      stopBackgroundTrack();
      setIsBGActive(false);
      notify("Audio Paused");
    } else {
      playBackgroundTrack(currentTrack.url, currentTrack.name, currentTrack.artist, setIsBGActive);
      setIsBGActive(true);
      notify("Audio Resumed");
    }
  };

  // SEEK BACKGROUND TRACK
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bgDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * bgDuration;
    setAudioParam('seek', seekTime);
  };

  // LIKE / FAVORITE TOGGLE
  const toggleFavorite = (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    const isFav = favorites.find(f => f.id === song.id || f.url === song.url);
    if (isFav) {
      updated = favorites.filter(f => f.id !== song.id && f.url !== song.url);
      notify("Removed from Favorites 💔", "info");
    } else {
      updated = [song, ...favorites];
      notify("Added to Favorites! 💜", "success");
    }
    setFavorites(updated);
    localStorage.setItem('masti_favorites', JSON.stringify(updated));
  };

  // MOCK DOWNLOAD SYSTEM WITH INTERACTIVE NEON NOTIFICATION
  const startDownload = (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDownloading = downloadQueue.find(d => d.id === song.id);
    if (isDownloading) {
      notify("Already in Download Queue", "info");
      return;
    }

    notify(`Downloading "${song.name}" offline... 📥`, "info");
    const newDownload = { ...song, progress: 0, status: 'downloading' };
    setDownloadQueue(prev => [newDownload, ...prev]);

    // Animate download progression
    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += Math.floor(Math.random() * 15) + 5;
      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(interval);
        setDownloadQueue(prev => 
          prev.map(d => d.id === song.id ? { ...d, progress: 100, status: 'completed' } : d)
        );
        notify(`"${song.name}" saved offline! ⚡ Check Downloads!`, "success");
      } else {
        setDownloadQueue(prev => 
          prev.map(d => d.id === song.id ? { ...d, progress: currentProg } : d)
        );
      }
    }, 400);
  };

  // AUTHENTICATE DJ SYSTEM
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      notify("Please enter a username", "error");
      return;
    }
    setCurrentUser(`DJ ${username.trim()} ⚡`);
    setIsAuthorized(true);
    setShowAuthModal(false);
    notify(`Authenticated as DJ ${username}! Welcome to premium!`, "success");
  };

  // SIMULATE APP INSTALLATION
  const handleInstall = () => {
    setIsInstalling(true);
    notify("Downloading local desktop framework client...", "info");
    setTimeout(() => {
      setIsInstalling(false);
      setIsInstalled(true);
      setShowInstallModal(false);
      notify("Masti Native Desktop Client installed successfully! 🎉", "success");
    }, 2500);
  };

  // TRACK CURSOR MOVEMENT FOR NEON HOVER AURA GLOW
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dashboardRef.current) return;
    const rect = dashboardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // GENRE CHILL CLICKS
  const handleGenreClick = (genre: string) => {
    setSearchQuery(genre);
    setActiveTab('search');
    handleSearch(genre);
    notify(`Exploring ${genre} vibes 🌟`);
  };

  // RENDER DURATION FORMAT
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // MOUSE HOVER BACKGROUND NOTES
  const backgroundNotes = ['🎵', '🎶', '🎷', '🎹', '🎸', '🌟', '💜', '⚡', '🔊'];

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center font-sans" style={{ background: 'radial-gradient(circle at bottom right, #1F083A 0%, #080112 50%, #000000 100%)' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-transparent border-b-purple-600 border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-b-pink-500 border-l-transparent border-t-purple-600 border-r-transparent animate-spin opacity-50" />
            <div className="absolute inset-4 rounded-full bg-[#0a0212] flex items-center justify-center border border-white/10">
              <span className="text-xl animate-pulse">🌙</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-black uppercase tracking-[0.25em] text-white/90">Midnight Memories</h1>
            <p className="text-[10px] text-pink-500 font-extrabold uppercase tracking-widest animate-pulse">Initializing Premium Frequencies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={dashboardRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-black text-white relative font-sans flex overflow-hidden select-none"
      style={{
        background: 'radial-gradient(circle at bottom right, #1F083A 0%, #080112 50%, #000000 100%)'
      }}
    >
      {/* HIGH-END GPU-ACCELERATED CUSTOM KEYFRAMES */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.1; }
          50% { opacity: 0.8; }
          100% { top: 100%; opacity: 0.1; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.4; }
          100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
        }
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 15px rgba(255,0,127,0.1); border-color: rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 25px rgba(255,0,127,0.25); border-color: rgba(255,0,127,0.3); }
          100% { box-shadow: 0 0 15px rgba(255,0,127,0.1); border-color: rgba(255,255,255,0.05); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        /* NEW HIGH-END CYBERPUNK KEYFRAMES */
        @keyframes bounce-eq {
          0% { height: 10%; }
          100% { height: 95%; }
        }
        @keyframes breath-eq {
          0% { height: 8px; }
          100% { height: 28px; }
        }
        @keyframes drift {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-120px) translateX(20px) scale(0.8); opacity: 0; }
        }
        @keyframes pulse-blob {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          33% { transform: translate(30px, -50px) scale(1.15); opacity: 0.45; }
          66% { transform: translate(-20px, 40px) scale(0.9); opacity: 0.25; }
        }
        .animate-pulse-blob {
          animation: pulse-blob 22s ease-in-out infinite;
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 8px rgba(255,0,127,0.25), 0 0 15px rgba(157,0,255,0.15); }
          50% { text-shadow: 0 0 18px rgba(255,0,127,0.7), 0 0 28px rgba(157,0,255,0.5); }
        }
        .animate-text-glow {
          animation: text-glow 4s ease-in-out infinite;
        }
        @keyframes pulse-neon-pink {
          0%, 100% { box-shadow: 0 0 15px rgba(255,0,127,0.15); border-color: rgba(255,0,127,0.15); }
          50% { box-shadow: 0 0 28px rgba(255,0,127,0.55); border-color: rgba(255,0,127,0.65); }
        }
        .animate-pulse-neon-pink {
          animation: pulse-neon-pink 3s ease-in-out infinite;
        }
        @keyframes pulse-neon-purple {
          0%, 100% { box-shadow: 0 0 15px rgba(157,0,255,0.15); border-color: rgba(157,0,255,0.15); }
          50% { box-shadow: 0 0 28px rgba(157,0,255,0.55); border-color: rgba(157,0,255,0.65); }
        }
        .animate-pulse-neon-purple {
          animation: pulse-neon-purple 3s ease-in-out infinite;
        }
        @keyframes shimmer-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-shimmer-flow {
          background-size: 200% auto;
          animation: shimmer-flow 3s linear infinite;
        }
        @keyframes beat-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,0,127,0.15)); }
          50% { transform: scale(1.025); filter: drop-shadow(0 0 22px rgba(255,0,127,0.45)); }
        }
        .animate-beat-pulse {
          animation: beat-pulse 2s ease-in-out infinite;
        }
        @keyframes glow-bar-pulse {
          0%, 100% { opacity: 0.25; filter: blur(4px); }
          50% { opacity: 0.65; filter: blur(7px); }
        }
        .animate-glow-bar-pulse {
          animation: glow-bar-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* CINEMATIC NEON FOG & GLOW BLOBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-float-slow animate-pulse-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-pink-600/10 blur-[150px] animate-float-slow animate-pulse-blob" style={{ animationDelay: '-5s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-cyan-600/10 blur-[130px] animate-float-slow animate-pulse-blob" style={{ animationDelay: '-10s' }} />
      </div>

      {/* NEW: TINY FLOATING PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-white rounded-full opacity-[0.18] blur-[0.4px]"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `drift ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.3)'
            }}
          />
        ))}
      </div>

      {/* INTERACTIVE NEON RADIAL MOUSE GLOW */}
      <div 
        className="absolute pointer-events-none w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.09] transition-all duration-300 z-0 bg-[radial-gradient(circle,_#FF007F_0%,_#9D00FF_50%,_transparent_100%)]"
        style={{
          left: `${mousePos.x - 300}px`,
          top: `${mousePos.y - 300}px`
        }}
      />

      {/* FLOATING NOTES / AMBIANCE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        {[...Array(6)].map((_, i) => (
          <span 
            key={i} 
            className="absolute text-xl animate-float select-none text-purple-400"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 13}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${7 + i * 2}s`
            }}
          >
            {backgroundNotes[i % backgroundNotes.length]}
          </span>
        ))}
      </div>

      {/* FIXED SIDEBAR ON LEFT */}
      <aside className="w-64 shrink-0 bg-[#07020d]/80 backdrop-blur-3xl border-r border-white/5 p-6 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 hidden lg:flex select-none">
        <div>
          {/* Logo / Header Brand */}
          <Link href="/" className="flex items-center gap-3 mb-10 group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 rounded-[18px] flex items-center justify-center shadow-[0_0_25px_rgba(157,0,255,0.4)] group-hover:shadow-[0_0_40px_rgba(255,0,127,0.7)] group-hover:scale-105 transition-all duration-500">
              <Disc className="w-7 h-7 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-400 group-hover:animate-pulse">
                MASTI<span className="text-pink-500 font-extrabold">UI</span>
              </h1>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 border-l border-pink-500/50 pl-1">Futuristic Vibe</p>
            </div>
          </Link>

          {/* Nav Categories */}
          <div className="space-y-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 mb-4 px-3">Main Portal</p>
              <nav className="space-y-1">
                <SidebarBtn icon={<Headphones className="w-5 h-5" />} label="Home Feed" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <SidebarBtn icon={<Compass className="w-5 h-5" />} label="Explore Vibes" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
                <SidebarBtn icon={<Search className="w-5 h-5" />} label="Search Music" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20 mb-4 px-3">Personal Vault</p>
              <nav className="space-y-1">
                <SidebarBtn icon={<Heart className="w-5 h-5" />} label="Favorites" active={activeTab === 'favorites'} count={favorites.length} onClick={() => setActiveTab('favorites')} />
                <SidebarBtn icon={<FolderHeart className="w-5 h-5" />} label="Studio Library" active={activeTab === 'library'} count={LOCAL_SONGS.length} onClick={() => setActiveTab('library')} />
                <SidebarBtn icon={<Music className="w-5 h-5 text-pink-500 animate-pulse" />} label="Midnight Memories 🌙" active={activeTab === 'spotify'} count={spotifyPlaylist.length} onClick={() => setActiveTab('spotify')} />
                <SidebarBtn icon={<Download className="w-5 h-5" />} label="Downloads" active={activeTab === 'downloads'} count={downloadQueue.length} onClick={() => setActiveTab('downloads')} />
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="space-y-3 pt-6 border-t border-white/5">
          <button 
            onClick={() => setShowInstallModal(true)}
            className="w-full py-3 px-4 rounded-2xl glass-card flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/5 hover:border-pink-500/30 transition-all duration-300"
          >
            <Monitor className="w-4 h-4 text-pink-500 animate-pulse" />
            Install App
          </button>
          
          <button 
            onClick={() => setShowAuthModal(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest text-black flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,0,127,0.5)] active:scale-98 transition-all duration-300"
          >
            <LogIn className="w-4 h-4" />
            {isAuthorized ? 'Authenticated' : 'Sign In'}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER TOP NAV */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-4 flex items-center justify-between z-40 select-none">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Disc className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <span className="text-md font-black tracking-tight">MASTI<span className="text-pink-500">UI</span></span>
        </Link>

        {/* Small Horizontal mobile tab selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          <MobileTabBtn active={activeTab === 'home'} icon={<Headphones className="w-4 h-4" />} onClick={() => setActiveTab('home')} />
          <MobileTabBtn active={activeTab === 'explore'} icon={<Compass className="w-4 h-4" />} onClick={() => setActiveTab('explore')} />
          <MobileTabBtn active={activeTab === 'search'} icon={<Search className="w-4 h-4" />} onClick={() => setActiveTab('search')} />
          <MobileTabBtn active={activeTab === 'favorites'} icon={<Heart className="w-4 h-4" />} onClick={() => setActiveTab('favorites')} />
          <MobileTabBtn active={activeTab === 'library'} icon={<FolderHeart className="w-4 h-4" />} onClick={() => setActiveTab('library')} />
          <MobileTabBtn active={activeTab === 'downloads'} icon={<Download className="w-4 h-4" />} onClick={() => setActiveTab('downloads')} />
        </div>
      </div>

      {/* MAIN VIEWPORT ON RIGHT */}
      <main className="flex-1 lg:pl-64 h-screen overflow-y-auto custom-scrollbar pb-[140px] pt-20 lg:pt-0 z-10 relative">
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* SEARCH BAR AT TOP RIGHT FOR DESKTOP */}
          <div className="hidden lg:flex items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold uppercase tracking-widest text-[9px]">Back to Reeds Studio</span>
              </Link>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-pink-500 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                Premium Active
              </div>
            </div>

            {/* Interactive glass Search block with intelligent dropdown */}
            <div className="relative z-50">
              <div className="w-96 glass p-1 rounded-2xl group flex items-center focus-within:border-pink-500/80 focus-within:shadow-[0_0_35px_rgba(255,0,127,0.45),_inset_0_0_20px_rgba(255,0,127,0.1)] transition-all duration-300">
                <Search className="ml-4 w-5 h-5 text-white/20 group-focus-within:text-pink-500 transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'search') setActiveTab('search');
                  }}
                  onFocus={() => {
                    setSearchFocused(true);
                    if (activeTab !== 'search') setActiveTab('search');
                  }}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                  placeholder={typingPlaceholder || "Search songs, artists, vibes, albums…"}
                  className="w-full bg-transparent border-none outline-none py-3 px-4 font-bold text-sm placeholder-white/25 text-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-2 hover:bg-white/5 rounded-xl mr-1 text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Glowing Dynamic Universal Dropdown Overlay */}
              <AnimatePresence>
                {searchFocused && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-3 p-5 rounded-3xl bg-[#090212]/95 backdrop-blur-3xl border border-pink-500/20 shadow-[0_20px_50px_rgba(255,0,127,0.25)] space-y-4 overflow-hidden"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-[8px]" />

                    {/* AI Smart Vibe Recommendation */}
                    <div className="p-3 bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-2xl text-[11px] font-bold text-pink-400 leading-normal flex items-start gap-2 shadow-[0_0_15px_rgba(255,0,127,0.05)]">
                      <span className="animate-pulse">✨</span>
                      <span>{aiVibeRecommendation}</span>
                    </div>

                    {/* Auto Suggestions dropdown */}
                    {searchQuery && searchSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Suggestions</p>
                        <div className="space-y-1">
                          {searchSuggestions.map((item, index) => (
                            <button
                              key={`sug-${index}`}
                              onClick={() => {
                                setSearchQuery(item);
                                handleSearch(item);
                                if (!recentSearches.includes(item)) {
                                  setRecentSearches(prev => [item, ...prev.slice(0, 4)]);
                                }
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl text-white/70 hover:text-white hover:bg-purple-950/40 border border-transparent hover:border-purple-500/20 transition-all flex items-center justify-between group"
                            >
                              <span>{item}</span>
                              <span className="text-[10px] text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">Select ⚡</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Recent Searches */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Recent</p>
                        <div className="space-y-1">
                          {recentSearches.map((item, index) => (
                            <div key={`rec-${index}`} className="flex items-center justify-between group">
                              <button
                                onClick={() => {
                                  setSearchQuery(item);
                                  handleSearch(item);
                                }}
                                className="flex-1 text-left px-2.5 py-1.5 text-xs font-bold truncate rounded-lg text-white/60 hover:text-pink-400 transition-colors"
                              >
                                {item}
                              </button>
                              <button
                                onClick={() => setRecentSearches(prev => prev.filter(x => x !== item))}
                                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-all mr-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trending Searches */}
                      <div className="space-y-2 border-l border-white/5 pl-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Trending 🔥</p>
                        <div className="space-y-1">
                          {['Midnight Memories 🌙', 'Slowed Lofi', 'Arijit Pain', 'Sabat Batin'].map((item, index) => (
                            <button
                              key={`trend-${index}`}
                              onClick={() => {
                                setSearchQuery(item);
                                handleSearch(item);
                                if (!recentSearches.includes(item)) {
                                  setRecentSearches(prev => [item, ...prev.slice(0, 4)]);
                                }
                              }}
                              className="w-full text-left px-2 py-1.5 text-xs font-bold text-white/60 hover:text-purple-400 truncate transition-colors flex items-center justify-between"
                            >
                              <span>{item}</span>
                              <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-black">HOT</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* DYNAMIC VIEW SWITCHER */}
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: HOME PANEL */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                {/* Greeting Hero with animated glassmorphism */}
                <div className="relative rounded-[40px] overflow-hidden p-8 md:p-12 border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] hover:shadow-[0_30px_100px_-20px_rgba(255,0,127,0.15)] hover:border-pink-500/20 transition-all duration-700 group/hero">
                  {/* Floating Glowing Aura */}
                  <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] bg-pink-600/25 pointer-events-none group-hover/hero:scale-110 duration-700" />
                  <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[100px] bg-purple-600/20 pointer-events-none group-hover/hero:scale-110 duration-700" />

                  {/* Top-Right Handshake resolved badge */}
                  <div className="absolute top-6 right-8 bg-[#0a0212]/80 backdrop-blur-md px-3 py-1.5 rounded-full text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest hidden md:flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    SYSTEM INTERFACE: RESOLVED
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 font-extrabold uppercase tracking-[0.4em] text-xs mb-3">
                        GEN-Z IMMERSIVE VAULT
                      </p>
                      <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight mb-4">
                        Good Evening, <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-400">{currentUser}</span>
                      </h2>
                      <p className="text-white/40 text-sm max-w-lg leading-relaxed">
                        Step into a highly responsive futuristic dashboard. Stream lightning-fast direct mirror networks, build beautiful collections, and practice alongside instruments.
                      </p>

                      <div className="flex items-center gap-4 mt-8 flex-wrap">
                        <button 
                          onClick={() => {
                            const list = trendingSongs.length > 0 ? trendingSongs : LOCAL_SONGS;
                            handlePlaySong(list[0], list);
                          }}
                          className="px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-wider text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_-5px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6),0_0_15px_rgba(255,0,127,0.3)] flex items-center gap-2 duration-300"
                        >
                          <Play className="w-4 h-4 fill-current animate-pulse" /> Play Live Feed
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('explore')}
                          className="px-6 py-4 glass-card hover:bg-white/10 rounded-full font-black uppercase tracking-wider text-xs text-white border border-white/10 hover:border-pink-500/40 hover:shadow-[0_0_25px_rgba(255,0,127,0.15)] transition-all flex items-center gap-2"
                        >
                          Discover Genres
                        </button>
                      </div>
                    </div>

                    {/* Glowing Equalizer Bar Widget */}
                    <div className="bg-[#0f041e]/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[32px] flex flex-col justify-between w-full md:w-64 h-48 relative overflow-hidden group/eq hover:border-pink-500/35 hover:shadow-[0_0_35px_rgba(157,0,255,0.2)] transition-all duration-500">
                      {/* Scanning neon laser line */}
                      <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent top-0 animate-scan z-10 pointer-events-none opacity-40 group-hover/eq:opacity-100" />
                      
                      {/* Cyberpunk digital grid pattern */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:8px_8px] opacity-25 pointer-events-none" />

                      <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[7px] font-black uppercase text-emerald-400 tracking-widest">LIVE</span>
                        </div>
                        <Headphones className="w-4 h-4 text-pink-500 animate-bounce" />
                      </div>
                      
                      <div className="relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-1.5">
                          <span>SYSTEM EQ</span>
                          <span className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
                          <span className="text-[7px] text-pink-400 font-extrabold">AI ENGINE ONLINE</span>
                        </p>
                        <h4 className="text-sm font-black uppercase tracking-tight text-white/70">Audio Feed Engine</h4>
                      </div>

                      {/* Moving equalizer bars (highly fluid dancing or breathing waves) */}
                      <div className="flex items-end gap-2.5 h-16 w-full px-2 relative z-10">
                        {[12, 28, 45, 18, 55, 32, 48, 15, 60, 22].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(255,0,127,0.3)]"
                            style={{ 
                              height: isBGActive ? `${h}%` : '10px',
                              animation: isBGActive 
                                ? `bounce-eq 0.8s ease-in-out infinite alternate` 
                                : `breath-eq 1.8s ease-in-out infinite alternate`,
                              animationDelay: `${i * 0.08}s`
                            }}
                          />
                        ))}
                      </div>

                      {/* Micro flickering terminal statuses (real-time ticketing statistics) */}
                      <div className="flex items-center justify-between text-[7px] font-bold text-white/30 uppercase tracking-widest mt-1 relative z-10 border-t border-white/5 pt-1.5">
                        <span className="animate-pulse">LATENCY: {audioStats.latency}</span>
                        <span>DB: {audioStats.db}</span>
                        <span>NET: {audioStats.kbps}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION: SAD COLLABORATIVE PLAYLIST (SPOTIFY IMPORTED) */}
                {spotifyPlaylist.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-[0_0_15px_rgba(255,0,127,0.3)] animate-pulse">
                          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white animate-text-glow">Midnight Memories 🌙</h3>
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-black font-extrabold uppercase tracking-widest animate-pulse-neon-pink shadow-[0_0_15px_rgba(255,0,127,0.4)]">Spotify Imported</span>
                      </div>
                      <button 
                        onClick={() => {
                          handlePlaySong(spotifyPlaylist[0], spotifyPlaylist);
                          notify("Playing Midnight Memories 🌙");
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-pink-500 hover:text-pink-400 flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Play All
                      </button>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
                      {spotifyPlaylist.map((song, i) => (
                        <MusicCard 
                          key={`spotify-home-${song.id || 'song'}-${i}`} 
                          song={song} 
                          onClick={() => handlePlaySong(song, spotifyPlaylist)} 
                          onFav={(e) => toggleFavorite(song, e)} 
                          onDl={(e) => startDownload(song, e)} 
                          isFav={favorites.some(f => f.id === song.id || f.url === song.url)} 
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION: TRENDING HITS (Horizontal slider) */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                        <Flame className="w-4 h-4 text-pink-500" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Trending Hits</h3>
                    </div>
                    <button onClick={fetchTrending} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white flex items-center gap-1.5 transition-colors">
                      <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} /> Reload feed
                    </button>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
                    {loading && trendingSongs.length === 0 ? (
                      [1, 2, 3, 4, 5].map(idx => (
                        <div key={`trending-skeleton-${idx}`} className="w-48 h-64 rounded-[32px] bg-white/5 animate-pulse shrink-0 border border-white/5" />
                      ))
                    ) : (
                      trendingSongs.map((song, i) => (
                        <MusicCard key={`trending-${song.id || 'song'}-${i}`} song={song} onClick={() => handlePlaySong(song, trendingSongs)} onFav={(e) => toggleFavorite(song, e)} onDl={(e) => startDownload(song, e)} isFav={favorites.some(f => f.id === song.id || f.url === song.url)} />
                      ))
                    )}
                  </div>
                </section>

                {/* SECTION: FEATURED CHARTS (Horizontal slider) */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <Star className="w-4 h-4 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Featured Charts</h3>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
                    {featuredCharts.map((song, i) => (
                      <MusicCard key={`featured-${song.id || 'song'}-${i}`} song={song} onClick={() => handlePlaySong(song, featuredCharts)} onFav={(e) => toggleFavorite(song, e)} onDl={(e) => startDownload(song, e)} isFav={favorites.some(f => f.id === song.id || f.url === song.url)} />
                    ))}
                  </div>
                </section>

                {/* SECTION: DYNAMIC RECENTLY PLAYED */}
                {recentlyPlayed.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <History className="w-4 h-4 text-indigo-500" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Recently Played</h3>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
                      {recentlyPlayed.map((song, i) => (
                        <MusicCard key={`recent-${song.id || 'song'}-${i}`} song={song} onClick={() => handlePlaySong(song, recentlyPlayed)} onFav={(e) => toggleFavorite(song, e)} onDl={(e) => startDownload(song, e)} isFav={favorites.some(f => f.id === song.id || f.url === song.url)} />
                      ))}
                    </div>
                  </section>
                )}

                {/* TWO COLUMN GRID FOR ARTISTS AND MOODS */}
                <div className="grid lg:grid-cols-2 gap-10">
                  {/* TOP ARTISTS PANEL */}
                  <section className="glass-card p-6 border border-white/5 rounded-[40px] hover:border-purple-500/20 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black uppercase tracking-tight px-2">Top Artists</h3>
                      <p className="text-[10px] text-pink-500 font-extrabold uppercase tracking-widest">Click to browse</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {TOP_ARTISTS.map((art, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleGenreClick(art.query)}
                          className="flex flex-col items-center text-center p-3 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 group cursor-pointer"
                        >
                          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 relative border-2 border-transparent group-hover:border-purple-500 shadow-md group-hover:shadow-[0_0_20px_rgba(157,0,255,0.4)] transition-all duration-500">
                            <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 duration-700" alt="" />
                          </div>
                          <h4 className="text-xs font-black uppercase truncate max-w-full leading-tight text-white group-hover:text-purple-400 transition-colors">{art.name}</h4>
                          <p className="text-[8px] text-white/30 uppercase font-black tracking-widest mt-1">{art.role}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* MOOD PLAYLIST FEED */}
                  <section className="glass-card p-6 border border-white/5 rounded-[40px] hover:border-pink-500/20 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black uppercase tracking-tight px-2">Mood Boosters</h3>
                      <p className="text-[10px] text-pink-500 font-extrabold uppercase tracking-widest">Tune vibes</p>
                    </div>

                    <div className="space-y-3">
                      {MOOD_PLAYLISTS.map((mood, i) => (
                        <div 
                          key={i}
                          onClick={() => handleGenreClick(mood.query)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-2xl glass-card border border-white/5 cursor-pointer relative overflow-hidden group active:scale-98"
                          )}
                          style={{
                            boxShadow: `inset 0 0 10px rgba(0,0,0,0.5)`
                          }}
                        >
                          {/* Inner gradient backglow */}
                          <div className={cn("absolute inset-0 bg-gradient-to-r opacity-[0.03] group-hover:opacity-[0.12] transition-opacity", mood.color)} />
                          
                          <div className="flex items-center gap-4 relative z-10">
                            <span className="text-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{mood.icon}</span>
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-pink-400 transition-colors">{mood.name}</h4>
                              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{mood.tag}</p>
                            </div>
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-pink-500 group-hover:translate-x-1 transition-all duration-300 relative z-10" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: EXPLORE VIBES */}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Explore Vibes</h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest border-l-2 border-pink-500 pl-2">Filter the cosmos of sound</p>
                </div>

                {/* Category Grid Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {MOOD_PLAYLISTS.map((cat, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleGenreClick(cat.query)}
                      className={cn(
                        "relative h-44 rounded-[32px] overflow-hidden p-6 glass-card group cursor-pointer border border-white/5",
                        "hover:scale-[1.03] active:scale-98 transition-all hover:border-pink-500/40"
                      )}
                      style={{
                        boxShadow: `0 0 30px rgba(0,0,0,0.4)`
                      }}
                    >
                      {/* Vibrant background glow */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.08] group-hover:opacity-[0.25] transition-opacity", cat.color)} />
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <span className="text-5xl opacity-40 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 leading-none">{cat.icon}</span>
                        <div>
                          <h4 className="text-lg font-black uppercase tracking-tighter text-white group-hover:text-pink-400 transition-colors">{cat.name}</h4>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">{cat.tag}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Extra custom vibes */}
                  <ExploreTile icon="🏋️" name="Workout Boost" query="Gym Music" tag="Pure Hype" color="from-red-950 to-orange-950" onClick={handleGenreClick} />
                  <ExploreTile icon="🎮" name="Gaming Arena" query="Gaming OST" tag="Cyberpunk Chill" color="from-purple-950 to-indigo-950" onClick={handleGenreClick} />
                  <ExploreTile icon="🌧️" name="Monsoon Mood" query="Rainy Day Bollywood" tag="Heavy Melodies" color="from-blue-950 to-cyan-950" onClick={handleGenreClick} />
                  <ExploreTile icon="🕊️" name="Pure Devotion" query="Bhajan Sufi" tag="Peace & Soul" color="from-yellow-950 to-amber-950" onClick={handleGenreClick} />
                </div>
              </motion.div>
            )}

            {/* VIEW 3: SEARCH MUSIC PAGE */}
            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Intelligent Search</h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest border-l-2 border-purple-500 pl-2">Universal multi-source vibe indexer</p>
                </div>

                {/* Mobile visible search input with intelligent dropdown */}
                <div className="lg:hidden w-full relative z-40 mb-6">
                  <div className="w-full glass p-1 rounded-2xl group flex items-center">
                    <Search className="ml-4 w-5 h-5 text-white/20" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                      placeholder="Search songs, artists, vibes, albums…"
                      className="w-full bg-transparent border-none outline-none py-3 px-4 font-bold text-sm text-white"
                    />
                  </div>
                  <AnimatePresence>
                    {searchFocused && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 p-4 rounded-3xl bg-[#090212]/95 border border-pink-500/20 shadow-[0_15px_40px_rgba(255,0,127,0.2)] space-y-4"
                      >
                        <div className="p-3 bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-2xl text-[10px] font-bold text-pink-400">
                          {aiVibeRecommendation}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[8px] font-black uppercase text-white/30 mb-2">Recent</p>
                            {recentSearches.slice(0, 3).map((item, idx) => (
                              <button key={idx} onClick={() => { setSearchQuery(item); handleSearch(item); }} className="block py-1 text-white/60 truncate w-full text-left">{item}</button>
                            ))}
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-white/30 mb-2">Trending</p>
                            {['Midnight Memories 🌙', 'Slowed Lofi', 'Arijit Pain'].map((item, idx) => (
                              <button key={idx} onClick={() => { setSearchQuery(item); handleSearch(item); }} className="block py-1 text-white/60 truncate w-full text-left">{item}</button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Live suggestions */}
                {!searchQuery && (
                  <div className="glass-card p-8 rounded-[40px] text-center border border-white/5 max-w-xl mx-auto py-16">
                    <Search className="w-16 h-16 text-white/10 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-white/60 mb-2">Awaiting Frequency</h3>
                    <p className="text-white/30 text-xs max-w-xs mx-auto leading-relaxed font-medium uppercase tracking-wider">
                      Search direct JioSaavn, public streaming mirrors, or local audio files by typing artist names or track keywords.
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap mt-8">
                      {['Zaalima', 'Bekhayali', 'Justin Bieber', 'Lofi'].map((w, idx) => (
                        <button key={idx} onClick={() => { setSearchQuery(w); handleSearch(w); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs font-black uppercase tracking-wider text-white/60 hover:text-white transition-all">
                          "{w}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* RESULTS GRID */}
                {searchQuery && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Disc className={cn("w-4 h-4 text-purple-500", loading && "animate-spin")} />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight">
                        {loading ? 'Interrogating Network...' : `Found ${searchResults.length} Matches`}
                      </h3>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="aspect-square bg-white/5 rounded-[32px] animate-pulse border border-white/5" />)}
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {searchResults.map((song, i) => (
                          <MusicCard key={`search-${song.id || 'song'}-${i}`} song={song} onClick={() => handlePlaySong(song, searchResults)} onFav={(e) => toggleFavorite(song, e)} onDl={(e) => startDownload(song, e)} isFav={favorites.some(f => f.id === song.id || f.url === song.url)} />
                        ))}
                      </div>
                    ) : (
                      <div className="glass-card p-12 rounded-[40px] text-center border border-white/5 opacity-50 py-16">
                        <Info className="w-10 h-10 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">No matching frequencies found.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 4: FAVORITES PANEL */}
            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">My Favorites</h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest border-l-2 border-pink-500 pl-2">Your collection of glowing frequencies</p>
                </div>

                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {favorites.map((song, i) => (
                      <MusicCard key={`fav-${song.id || 'song'}-${i}`} song={song} onClick={() => handlePlaySong(song, favorites)} onFav={(e) => toggleFavorite(song, e)} onDl={(e) => startDownload(song, e)} isFav={true} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-12 rounded-[40px] text-center border border-white/5 py-20 max-w-xl mx-auto">
                    <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-500/20">
                      <Heart className="w-8 h-8 text-pink-500 animate-pulse fill-pink-500" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white/70">Favorites Empty</h3>
                    <p className="text-white/30 text-xs max-w-xs mx-auto leading-relaxed font-medium uppercase tracking-wider mb-6">
                      Add some deep purple/neon pink glowing tracks to your favorites list by clicking the heart button on music cards.
                    </p>
                    <button onClick={() => setActiveTab('home')} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xs font-black uppercase tracking-widest text-black hover:scale-105 active:scale-95 transition-all">
                      Browse Trending
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 5: STUDIO LIBRARY */}
            {activeTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Studio Vault</h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest border-l-2 border-cyan-500 pl-2">High-fidelity public local music library</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="glass px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/5 flex items-center gap-2">
                      Tracks: <span className="text-cyan-500">{LOCAL_SONGS.length}</span>
                    </div>
                    <div className="glass px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/5 flex items-center gap-2">
                      Storage: <span className="text-pink-500">88.4 MB</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {LOCAL_SONGS.map((song, i) => (
                    <MusicCard key={`local-${song.id || 'song'}-${i}`} song={song} onClick={() => handlePlaySong(song, LOCAL_SONGS)} onFav={(e) => toggleFavorite(song, e)} onDl={(e) => startDownload(song, e)} isFav={favorites.some(f => f.id === song.id || f.url === song.url)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 5.5: SPOTIFY COLLABORATIVE PLAYLIST FULL VIEW */}
            {activeTab === 'spotify' && (
              <motion.div
                key="spotify"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="relative rounded-[40px] overflow-hidden p-8 border border-pink-500/20 bg-gradient-to-br from-[#1F083A]/30 to-black/50 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)]">
                  <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] bg-pink-600/30 pointer-events-none animate-pulse-slow" />
                  
                  <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Left Column: Playlist Cover & Meta */}
                    <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                      <div className="w-44 h-44 rounded-[32px] overflow-hidden shadow-2xl border-2 border-pink-500/30 relative shrink-0">
                        <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <Heart className="w-16 h-16 text-pink-500 animate-pulse fill-pink-500" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[9px] font-black uppercase tracking-widest text-pink-500 mb-3">
                          <Heart className="w-3 h-3 fill-current animate-ping" /> Premium Playlist
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 leading-none">Midnight Memories 🌙</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6">Premium Emotional Playlist • High-Fidelity Aesthetic Audio</p>
                        
                        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                          <button 
                            onClick={() => {
                              if (spotifyPlaylist.length > 0) {
                                handlePlaySong(spotifyPlaylist[0], spotifyPlaylist);
                                notify("Playing Midnight Memories 🌙");
                              } else {
                                notify("No songs loaded yet", "error");
                              }
                            }}
                            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-black rounded-full font-black uppercase tracking-wider text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,0,127,0.4)] flex items-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" /> Play Album
                          </button>
                          
                          <div className="glass px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/5 flex items-center gap-2">
                            Total Songs: <span className="text-pink-500">{spotifyPlaylist.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: DJ Synchronization Engine Console */}
                    <div className="lg:col-span-5 w-full bg-[#07020d]/70 backdrop-blur-2xl border border-white/5 hover:border-pink-500/20 duration-300 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-60 transition-opacity">
                        <RefreshCw className={cn("w-4 h-4 text-pink-500", isSyncingSpotify && "animate-spin")} />
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-pink-500 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                          Sync & Resolution Console
                        </h4>
                        <p className="text-[9px] text-white/40 uppercase font-black tracking-wider leading-relaxed">
                          Synchronize & resolve tracks to local CDN streams
                        </p>
                      </div>

                      {/* Display Current Handshake Status timeline */}
                      <div className="mb-4 p-3 bg-black/60 rounded-2xl border border-white/5 min-h-[50px] flex flex-col justify-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-pink-400/70 mb-1">Status Timeline</p>
                        <div className="text-[10px] font-black text-white/80 leading-relaxed font-mono truncate">
                          {isSyncingSpotify ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                              {spotifySyncStatus}
                            </span>
                          ) : (
                            spotifySyncStatus || "Awaiting frequency request..."
                          )}
                        </div>
                      </div>

                      {/* Input for Manual Token */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={spotifySyncToken}
                            onChange={(e) => setSpotifySyncToken(e.target.value)}
                            placeholder="Paste Spotify token (BQ...)"
                            className="flex-1 bg-white/5 border border-white/5 focus:border-pink-500/30 rounded-xl py-2.5 px-3.5 text-xs font-bold font-mono text-white outline-none placeholder-white/20"
                            disabled={isSyncingSpotify}
                          />
                          <button 
                            onClick={() => handleSpotifySync()}
                            disabled={isSyncingSpotify}
                            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-[10px] font-black uppercase tracking-wider text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,0,127,0.3)] disabled:opacity-50"
                          >
                            {isSyncingSpotify ? 'Syncing...' : 'Sync'}
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/30 px-1 pt-1">
                          <button 
                            onClick={() => handleSpotifySync()}
                            disabled={isSyncingSpotify}
                            className="hover:text-pink-500 transition-colors cursor-pointer"
                          >
                            ⚡ Try Auto Sync
                          </button>
                          
                          <a 
                            href="https://open.spotify.com/get_access_token?Reason=transport&productType=web_player" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-purple-400 transition-colors flex items-center gap-0.5"
                          >
                            🔑 Get Access Token ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {spotifyPlaylist.map((song, i) => (
                    <MusicCard 
                      key={`spotify-full-${song.id || 'song'}-${i}`} 
                      song={song} 
                      onClick={() => handlePlaySong(song, spotifyPlaylist)} 
                      onFav={(e) => toggleFavorite(song, e)} 
                      onDl={(e) => startDownload(song, e)} 
                      isFav={favorites.some(f => f.id === song.id || f.url === song.url)} 
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 6: DOWNLOADS QUEUE PANEL */}
            {activeTab === 'downloads' && (
              <motion.div
                key="downloads"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Offline Downloads</h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest border-l-2 border-pink-500 pl-2">High-speed simulated caching queue</p>
                  </div>
                  {downloadQueue.length > 0 && (
                    <button onClick={() => { setDownloadQueue([]); notify("Cleared offline cache", "info"); }} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors">
                      <Trash2 className="w-3 h-3" /> Clear Cached
                    </button>
                  )}
                </div>

                {downloadQueue.length > 0 ? (
                  <div className="space-y-3 max-w-3xl">
                    {downloadQueue.map((song, i) => (
                      <div key={i} className="glass-card p-4 rounded-3xl border border-white/5 flex items-center justify-between gap-4 hover:border-pink-500/20 duration-300 relative overflow-hidden">
                        {/* Progress slider bar inside */}
                        {song.status === 'downloading' && (
                          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300" style={{ width: `${song.progress}%` }} />
                        )}

                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-white/10 shrink-0">
                            <img src={song.image} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <h4 className="font-black uppercase tracking-tight text-sm text-white">{song.name}</h4>
                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-0.5">{song.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {song.status === 'downloading' ? (
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black tracking-widest text-pink-500 animate-pulse">{song.progress}%</span>
                              <div className="w-5 h-5 rounded-full border-2 border-t-pink-500 border-white/10 animate-spin" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Ready Offline</span>
                              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-emerald-500" />
                              </div>
                            </div>
                          )}

                          <button 
                            onClick={() => handlePlaySong(song, downloadQueue)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white active:scale-90 transition-all"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-12 rounded-[40px] text-center border border-white/5 py-20 max-w-xl mx-auto">
                    <Download className="w-16 h-16 text-white/10 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white/70">Downloads Active</h3>
                    <p className="text-white/30 text-xs max-w-xs mx-auto leading-relaxed font-medium uppercase tracking-wider">
                      No tracks are currently cached offline. Open options menus on music cards to save files onto simulated persistent memory blocks.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* STICKY FUTURISTIC BOTTOM MUSIC PLAYER */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-28 bg-[#090312]/75 backdrop-blur-3xl border-t border-white/5 px-4 md:px-8 py-3 flex flex-col justify-center select-none shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        
        {/* NEW: Subtle active beat sync lighting bar at top of footer */}
        {isBGActive && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60 blur-[3px] animate-glow-bar-pulse pointer-events-none" />
        )}

        {/* PROGRESS SEEKABLE BAR */}
        <div className="w-full flex items-center gap-3 mb-2 group px-1">
          <span className="text-[9px] font-bold tracking-widest text-white/30 w-10 text-right">{formatTime(bgTime)}</span>
          <div 
            onClick={handleSeek}
            className="flex-1 h-1.5 bg-white/5 hover:h-2 rounded-full relative cursor-pointer border border-white/[0.02] transition-all duration-300"
          >
            {/* Pulsing neon seeker bar with animated flowing shimmer */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(255,0,127,0.8)] animate-shimmer-flow"
              style={{ width: `${bgDuration ? (bgTime / bgDuration) * 100 : 0}%` }}
            />
            {/* Glowing seeker thumb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-opacity"
              style={{ left: `calc(${bgDuration ? (bgTime / bgDuration) * 100 : 0}% - 7px)` }}
            />
          </div>
          <span className="text-[9px] font-bold tracking-widest text-white/30 w-10">{formatTime(bgDuration)}</span>
        </div>

        {/* CONTROLS LAYOUT */}
        <div className="flex items-center justify-between gap-6 w-full">
          
          {/* TRACK METADATA AREA */}
          <div className="flex items-center gap-4 w-1/3 min-w-0">
            {currentTrack ? (
              <>
                <div className={cn(
                  "w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative group shadow-[0_0_15px_rgba(157,0,255,0.2)] transition-all duration-1000",
                  isBGActive ? "rounded-full animate-spin-slow shadow-[0_0_30px_rgba(255,0,127,0.5)] border-pink-500/50 animate-beat-pulse" : ""
                )}>
                  <img src={currentTrack.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  
                  {/* Subtle disc overlay rotation */}
                  {isBGActive && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Disc className="w-6 h-6 text-pink-500 animate-spin-slow" />
                    </div>
                  )}
                </div>
                
                <div className="min-w-0">
                  <h4 className="font-black uppercase tracking-tight text-sm text-white truncate max-w-[140px] hover:text-pink-400 transition-colors cursor-pointer" onClick={() => setActiveTab('library')}>{currentTrack.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest truncate mt-0.5 max-w-[110px]">{currentTrack.artist}</p>
                </div>

                {/* Micro streaming waveform indicator (fully fluid, glowing gradient bars) */}
                {isBGActive && (
                  <div className="hidden lg:flex items-center gap-[3.5px] h-3.5 px-2 shrink-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/25 rounded-full shadow-[0_0_15px_rgba(255,0,127,0.15)]">
                    {[8, 14, 6, 12, 9].map((h, i) => (
                      <div 
                        key={`mini-wave-${i}`} 
                        className="w-[2px] bg-gradient-to-t from-purple-500 to-pink-500 rounded-full shadow-[0_0_5px_rgba(255,0,127,0.5)]"
                        style={{ 
                          height: `${h}px`,
                          animation: `bounce-eq 0.6s ease-in-out infinite alternate`,
                          animationDelay: `${i * 0.08}s`
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={(e) => toggleFavorite(currentTrack, e)}
                    className={cn(
                      "p-2 rounded-xl bg-white/5 border border-white/5 active:scale-90 transition-all",
                      favorites.some(f => f.id === currentTrack.id || f.url === currentTrack.url)
                        ? "text-pink-500 hover:text-pink-400"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    <Heart className="w-4 h-4" fill={favorites.some(f => f.id === currentTrack.id || f.url === currentTrack.url) ? 'currentColor' : 'none'} />
                  </button>
                  
                  <button 
                    onClick={(e) => startDownload(currentTrack, e)}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white active:scale-90 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white/20" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-[10px] text-white/30">System Offline</h4>
                  <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-0.5">Select a feed track</p>
                </div>
              </div>
            )}
          </div>

          {/* MAIN PLAYER CONTROLS */}
          <div className="flex items-center justify-center gap-4 shrink-0">
            <button 
              onClick={playPrevious}
              className="p-3 text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-2xl active:scale-90 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 fill-current" />
            </button>

            <button 
              onClick={handleTogglePlay}
              className={cn(
                "w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-90 transition-all duration-300 relative group",
                isBGActive ? "shadow-[0_0_25px_rgba(255,0,127,0.5),0_0_12px_rgba(157,0,255,0.4)] animate-beat-pulse" : ""
              )}
            >
              <div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 pointer-events-none" />
              {isBGActive ? (
                <Pause className="w-6 h-6 fill-current relative z-10" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-1 relative z-10" />
              )}
            </button>

            <button 
              onClick={playNext}
              className="p-3 text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-2xl active:scale-90 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 text-white fill-current" />
            </button>
          </div>

          {/* VOLUME / UTILITY SLIDER */}
          <div className="flex items-center justify-end gap-3 w-1/3 shrink-0">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isMuted ? "bg-red-500/10 border border-red-500/20 text-red-500" : "bg-white/5 border border-white/5 text-white/60 hover:text-white"
              )}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="w-24 group relative py-2 hidden md:block">
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setAudioParam('volume', Number(e.target.value))}
                className="w-full h-1 bg-white/10 hover:h-1.5 rounded-full appearance-none outline-none accent-pink-500 hover:accent-pink-400 cursor-pointer shadow-[0_0_10px_rgba(255,0,127,0.2)] hover:shadow-[0_0_15px_rgba(255,0,127,0.5)] transition-all"
              />
            </div>

            <button 
              onClick={() => notify("Active Devices: 1 Local Browser Studio Engine", "info")}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hidden sm:block active:scale-90 transition-all"
            >
              <Laptop className="w-4 h-4 text-pink-500" />
            </button>
          </div>
        </div>
      </footer>

      {/* DYNAMIC SYSTEM POPUP NOTIFICATIONS */}
      <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none select-none max-w-sm">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="p-4 bg-[#0a0212]/90 backdrop-blur-3xl border border-pink-500/30 rounded-2xl flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-white/95">{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SIGN IN / AUTHENTICATION MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
            {/* Backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            {/* Dialog container */}
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0212]/90 border border-white/10 p-8 rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
              style={{
                boxShadow: '0 0 50px rgba(157,0,255,0.2)'
              }}
            >
              <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-[80px] bg-purple-600/30 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">Sign In</h3>
                  <p className="text-[10px] text-pink-500 font-extrabold uppercase tracking-widest mt-1">Unlock Gen-Z Dashboard Perks</p>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-white/5 rounded-2xl text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Username / DJ Handle</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter moniker (e.g. NeonBeat)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-pink-500/40 duration-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Atmospheric Key / Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-pink-500/40 duration-300"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-xs font-black uppercase tracking-widest text-black shadow-lg hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] active:scale-98 duration-300"
                  >
                    Authenticate Frequencies
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSTALL APP MODAL */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#08020f]/90 border border-white/10 p-6 rounded-[36px] text-center relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="w-16 h-16 rounded-3xl bg-pink-500/10 flex items-center justify-center mx-auto mb-4 border border-pink-500/20 shadow-inner">
                <Laptop className="w-8 h-8 text-pink-500 animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Native Client</h3>
              <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto mb-6 font-medium uppercase tracking-wider">
                Install Masti client container natively on your operating system for 0% buffer playback, zero key rotation latency, and advanced audio routing features.
              </p>

              <div className="flex gap-4">
                <button onClick={() => setShowInstallModal(false)} className="flex-1 py-3 px-4 glass-card hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/10 hover:border-white/20 transition-all">
                  Dismiss
                </button>
                <button 
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 duration-300 disabled:opacity-50"
                >
                  {isInstalling ? 'Installing...' : 'Install Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// SUBCOMPONENT: SIDEBAR BTN
function SidebarBtn({ 
  icon, label, active, count, onClick 
}: { 
  icon: React.ReactNode; label: string; active: boolean; count?: number; onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between py-3.5 px-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 border relative group overflow-hidden",
        active 
          ? "bg-gradient-to-r from-purple-500/25 via-purple-500/5 to-transparent text-white border-purple-500/50 shadow-[0_0_30px_rgba(157,0,255,0.25)] animate-pulse-neon-purple"
          : "text-white/40 border-transparent hover:text-white hover:bg-white/[0.03] hover:border-purple-500/25 hover:shadow-[0_0_20px_rgba(157,0,255,0.08)]"
      )}
    >
      {/* Premium Glass reflection shine on sidebar buttons */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {/* Side purple active line */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-md bg-purple-500 shadow-[0_0_20px_#9D00FF] animate-pulse" />
      )}
      
      <div className="flex items-center gap-3">
        <div className={cn(
          "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6",
          active ? "text-purple-400 text-glow" : "text-white/30 group-hover:text-pink-500 transition-colors"
        )}>
          {icon}
        </div>
        <span className="font-black text-[10px] tracking-[0.15em]">{label}</span>
      </div>

      {count !== undefined && count > 0 && (
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded-full font-bold transition-all duration-300",
          active ? "bg-purple-500 text-black shadow-[0_0_15px_rgba(157,0,255,0.6)]" : "bg-white/5 text-white/40 group-hover:bg-pink-500/10 group-hover:text-pink-400 group-hover:border-pink-500/20 group-hover:shadow-[0_0_10px_rgba(255,0,127,0.15)]"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// SUBCOMPONENT: MOBILE TOP BAR BTN
function MobileTabBtn({ active, icon, onClick }: { active: boolean; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-full transition-all active:scale-75",
        active ? "bg-pink-500 text-black shadow-[0_0_12px_rgba(255,0,127,0.5)]" : "text-white/40 hover:text-white"
      )}
    >
      {icon}
    </button>
  );
}

// SUBCOMPONENT: EXPLORE GENRE TILE
function ExploreTile({ 
  icon, name, query, tag, color, onClick 
}: { 
  icon: string; name: string; query: string; tag: string; color: string; onClick: (q: string) => void 
}) {
  return (
    <div 
      onClick={() => onClick(query)}
      className={cn(
        "relative h-44 rounded-[32px] overflow-hidden p-6 glass-card group cursor-pointer border border-white/5",
        "hover:scale-[1.03] active:scale-98 transition-all hover:border-pink-500/40"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.08] group-hover:opacity-[0.25] transition-opacity", color)} />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <span className="text-5xl opacity-40 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 leading-none">{icon}</span>
        <div>
          <h4 className="text-lg font-black uppercase tracking-tighter text-white group-hover:text-pink-400 transition-colors">{name}</h4>
          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">{tag}</p>
        </div>
      </div>
    </div>
  );
}

// SUBCOMPONENT: PREMIUM MUSIC CARD WITH HOVER LAYOUT
function MusicCard({ 
  song, onClick, onFav, onDl, isFav 
}: { 
  song: any; onClick: () => void; onFav: (e: React.MouseEvent) => void; onDl: (e: React.MouseEvent) => void; isFav: boolean 
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => !prev);
  };

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showMenu]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -10, 
        scale: 1.025,
        boxShadow: '0 25px 50px -12px rgba(255, 0, 127, 0.38), 0 0 20px rgba(157, 0, 255, 0.12)',
        borderColor: 'rgba(255, 0, 127, 0.55)'
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="w-48 p-4 rounded-[32px] glass-card border border-white/5 cursor-pointer relative shrink-0 group active:scale-98 select-none overflow-hidden transition-all duration-300"
      onClick={onClick}
    >
      {/* Premium Glass Reflection Sweep */}
      <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-10">
        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent transform rotate-45 translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[100%] group-hover:translate-y-[100%] transition-transform duration-[1100ms] ease-out" />
      </div>

      {/* Cover Artwork Container */}
      <div className="relative aspect-square w-full rounded-[24px] overflow-hidden mb-4 shadow-xl border border-white/10">
        <img 
          src={song.image} 
          alt={song.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        {/* Glassmorphism Dark Hover Overlay */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Button glows neon and triggers on hover */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black p-4.5 rounded-[20px] shadow-[0_0_25px_rgba(255,255,255,0.75),0_0_10px_rgba(255,0,127,0.35)] opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:scale-105 active:scale-90 duration-200">
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </div>

        {/* Like indicator badge */}
        {isFav && (
          <div className="absolute top-3 left-3 bg-[#0a0212]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-pink-500 border border-pink-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse-neon-pink">
            <Heart className="w-2.5 h-2.5 fill-current text-pink-500" /> Fav
          </div>
        )}
      </div>

      {/* Track info details */}
      <div className="px-1 min-w-0">
        <h4 className="text-xs font-black tracking-tight uppercase leading-snug truncate text-white group-hover:text-pink-400 transition-colors">
          {song.name}
        </h4>
        
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-[9px] text-white/30 truncate uppercase font-black tracking-widest max-w-[100px]">
            {song.artist}
          </p>
          
          {/* Options button */}
          <div className="relative shrink-0">
            <button 
              onClick={handleMenuClick}
              className="p-1 rounded-md text-white/20 hover:text-white hover:bg-white/5 active:scale-75 transition-all"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Float context menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 bottom-full mb-2 w-40 bg-[#0c0317] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-20 py-1"
                >
                  <button 
                    onClick={onFav}
                    className="w-full text-left py-2 px-3 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-pink-400 flex items-center gap-2"
                  >
                    <Heart className="w-3 h-3" /> {isFav ? 'Unlike' : 'Favorite'}
                  </button>
                  
                  <button 
                    onClick={onDl}
                    className="w-full text-left py-2 px-3 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" /> Caching Offline
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
