'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

interface CustomPlaylist {
  id: string;
  name: string;
  songs: any[];
}

interface AudioContextType {
  isLoaded: boolean;
  isReady: boolean;
  initAudio: () => Promise<void>;
  playNote: (note: string, velocity?: number, time?: number) => void;
  stopNote: (note: string, time?: number) => void;
  setAudioParam: (param: string, val: number | boolean | string) => void;
  activeNotes: string[];
  octaveOffset: number;
  sustain: boolean;
  playBackgroundTrack: (url: string | any, name?: string, artist?: string, onStateChange?: (playing: boolean) => void) => Promise<void>;
  stopBackgroundTrack: () => void;
  getBgAudio: () => HTMLAudioElement | null;
  playBeat: (url: string) => Promise<void>;
  stopBeat: () => void;
  currentTrack: any;
  setCurrentTrack: (track: any) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  playSong: (song: any, newQueue?: any[]) => void;
  isBGActive: boolean;
  setIsBGActive: (active: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  recentlyPlayed: any[];
  addToRecentlyPlayed: (track: any) => void;
  queue: any[];
  setQueue: (queue: any[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: (expanded: boolean) => void;

  // PRD v2.0 NEW FEATURES
  isShuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  cycleRepeatMode: () => void;
  likedSongs: any[];
  toggleLikedSong: (song: any) => void;
  isLiked: (song: any) => boolean;
  customPlaylists: CustomPlaylist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: any) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const engine = useAudioEngine();
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isBGActive, setIsBGActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // PRD v2.0 States
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>([]);
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);

  // Refs to always track the absolute latest queue, currentTrack, options and playNext
  const queueRef = React.useRef(queue);
  const currentTrackRef = React.useRef(currentTrack);
  const currentIndexRef = React.useRef(currentIndex);
  const isShuffleRef = React.useRef(isShuffle);
  const repeatModeRef = React.useRef(repeatMode);
  const playNextRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  React.useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  React.useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  React.useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Load Liked Songs & Custom Playlists from localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem('masti_liked_songs');
    if (savedLikes) {
      try { setLikedSongs(JSON.parse(savedLikes)); } catch (e) {}
    }
    const savedPlaylists = localStorage.getItem('masti_custom_playlists');
    if (savedPlaylists) {
      try { setCustomPlaylists(JSON.parse(savedPlaylists)); } catch (e) {}
    }
  }, []);

  // Sleep Timer interval countdown
  useEffect(() => {
    if (sleepTimer === null || sleepTimer <= 0) return;
    const interval = setInterval(() => {
      setSleepTimerState(prev => {
        if (prev === null || prev <= 1) {
          engine.stopBackgroundTrack();
          setIsBGActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimer, engine]);

  const setSleepTimer = React.useCallback((minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerState(null);
    } else {
      setSleepTimerState(minutes * 60);
    }
  }, []);

  const toggleShuffle = React.useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const cycleRepeatMode = React.useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleLikedSong = React.useCallback((song: any) => {
    if (!song) return;
    setLikedSongs(prev => {
      const exists = prev.some(s => (s.id && song.id ? s.id === song.id : s.name === song.name));
      let updated;
      if (exists) {
        updated = prev.filter(s => (s.id && song.id ? s.id !== song.id : s.name !== song.name));
      } else {
        updated = [song, ...prev];
      }
      localStorage.setItem('masti_liked_songs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isLiked = React.useCallback((song: any) => {
    if (!song) return false;
    return likedSongs.some(s => (s.id && song.id ? s.id === song.id : s.name === song.name));
  }, [likedSongs]);

  const createPlaylist = React.useCallback((name: string) => {
    if (!name.trim()) return;
    const newPl: CustomPlaylist = {
      id: `playlist-${Date.now()}`,
      name: name.trim(),
      songs: []
    };
    setCustomPlaylists(prev => {
      const updated = [...prev, newPl];
      localStorage.setItem('masti_custom_playlists', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addToPlaylist = React.useCallback((playlistId: string, song: any) => {
    if (!song) return;
    setCustomPlaylists(prev => {
      const updated = prev.map(pl => {
        if (pl.id === playlistId) {
          const exists = pl.songs.some(s => (s.id && song.id ? s.id === song.id : s.name === song.name));
          if (!exists) {
            return { ...pl, songs: [...pl.songs, song] };
          }
        }
        return pl;
      });
      localStorage.setItem('masti_custom_playlists', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromPlaylist = React.useCallback((playlistId: string, songId: string) => {
    setCustomPlaylists(prev => {
      const updated = prev.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, songs: pl.songs.filter(s => s.id !== songId) };
        }
        return pl;
      });
      localStorage.setItem('masti_custom_playlists', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addToRecentlyPlayed = React.useCallback((track: any) => {
    if (!track) return;
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => (t.id && track.id ? t.id !== track.id : t.url !== track.url));
      return [track, ...filtered].slice(0, 30);
    });
  }, []);

  const playNext = React.useCallback(() => {
    const activeQueue = queueRef.current;
    if (activeQueue.length === 0) return;

    const currentMode = repeatModeRef.current;
    const isShuf = isShuffleRef.current;

    setCurrentIndex(prevIdx => {
      if (currentMode === 'one' && prevIdx >= 0) {
        // Re-trigger same index
        return prevIdx;
      }

      if (isShuf && activeQueue.length > 1) {
        let randIdx = Math.floor(Math.random() * activeQueue.length);
        if (randIdx === prevIdx) randIdx = (randIdx + 1) % activeQueue.length;
        return randIdx;
      }

      if (currentMode === 'off') {
        if (prevIdx < activeQueue.length - 1) {
          return prevIdx + 1;
        }
        return prevIdx;
      }

      // Default repeat 'all'
      return prevIdx < 0 ? 0 : (prevIdx + 1) % activeQueue.length;
    });
  }, []);

  const playPrevious = React.useCallback(() => {
    const activeQueue = queueRef.current;
    if (activeQueue.length === 0) return;

    setCurrentIndex(prevIdx => {
      const prevIdxCalc = prevIdx <= 0 ? activeQueue.length - 1 : (prevIdx - 1) % activeQueue.length;
      return prevIdxCalc;
    });
  }, []);

  // Update playNextRef so onEnded listeners always invoke the latest playNext without stale closures
  React.useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const enginePlayBgTrackRef = React.useRef(engine.playBackgroundTrack);
  React.useEffect(() => {
    enginePlayBgTrackRef.current = engine.playBackgroundTrack;
  }, [engine.playBackgroundTrack]);

  // Effect to load and play audio source whenever currentIndex or active track in queue changes
  React.useEffect(() => {
    if (currentIndex >= 0 && queue.length > 0 && currentIndex < queue.length) {
      const targetTrack = queue[currentIndex];
      if (targetTrack) {
        console.log(`[AudioContext] Syncing track at currentIndex [${currentIndex}]:`, targetTrack);
        setCurrentTrack(targetTrack);
        addToRecentlyPlayed(targetTrack);

        enginePlayBgTrackRef.current(
          targetTrack.url || targetTrack,
          targetTrack.name,
          targetTrack.artist,
          setIsBGActive,
          () => {
            console.log('[AudioContext] Track ended natively -> triggering autoplay Next');
            if (playNextRef.current) {
              playNextRef.current();
            }
          }
        );
      }
    }
  }, [currentIndex, queue, addToRecentlyPlayed]);

  // Global Keyboard Shortcuts (Space = Play/Pause, ArrowRight = Next, ArrowLeft = Prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        const audio = engine.getBgAudio();
        if (audio && currentTrackRef.current) {
          if (audio.paused) {
            audio.play().catch(() => {});
            setIsBGActive(true);
          } else {
            audio.pause();
            setIsBGActive(false);
          }
        }
      } else if (e.code === 'ArrowRight') {
        playNext();
      } else if (e.code === 'ArrowLeft') {
        playPrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, playNext, playPrevious]);

  const playSong = React.useCallback((song: any, newQueue?: any[]) => {
    if (!song) return;
    console.log('[AudioContext] playSong requested for:', song);

    let targetQueue = newQueue && newQueue.length > 0 ? newQueue : queueRef.current;
    if (!targetQueue || targetQueue.length === 0) {
      targetQueue = [song];
    }

    setQueue(targetQueue);

    // Identify index using unique song.id primary check
    let foundIndex = targetQueue.findIndex(t => t.id && song.id && String(t.id) === String(song.id));
    if (foundIndex === -1 && song.url) {
      foundIndex = targetQueue.findIndex(t => t.url && String(t.url) === String(song.url));
    }
    if (foundIndex === -1 && song.name) {
      foundIndex = targetQueue.findIndex(t => t.name && String(t.name) === String(song.name));
    }

    if (foundIndex !== -1) {
      setCurrentIndex(foundIndex);
    } else {
      const updatedQueue = [...targetQueue, song];
      setQueue(updatedQueue);
      setCurrentIndex(updatedQueue.length - 1);
    }
  }, []);

  useEffect(() => {
    engine.setAudioParam('volume', isMuted ? 0 : volume);
  }, [isMuted, volume, engine.isLoaded]);

  const playBackgroundTrack = React.useCallback(async (urlOrTrack: any, songName?: string, artist?: string, onStateChange?: (playing: boolean) => void) => {
    const stateHandler = typeof songName === 'function' ? (songName as any) : (onStateChange || setIsBGActive);

    if (typeof urlOrTrack === 'object' && urlOrTrack !== null) {
      playSong(urlOrTrack);
      return;
    }

    return engine.playBackgroundTrack(urlOrTrack, songName, artist, stateHandler, () => {
      if (playNextRef.current) playNextRef.current();
    });
  }, [engine, playSong]);

  const setAudioParam = React.useCallback((param: string, val: any) => {
    if (param === 'volume') {
      const v = Number(val);
      setVolume(v);
      if (v > 0) setIsMuted(false);
    }
    engine.setAudioParam(param, val);
  }, [engine]);

  const value = React.useMemo(() => ({
    ...engine,
    playBackgroundTrack,
    setAudioParam,
    currentTrack,
    setCurrentTrack,
    currentIndex,
    setCurrentIndex,
    playSong,
    isBGActive,
    setIsBGActive,
    isMuted,
    setIsMuted,
    volume,
    recentlyPlayed,
    addToRecentlyPlayed,
    queue,
    setQueue,
    playNext,
    playPrevious,
    isPlayerExpanded,
    setIsPlayerExpanded,

    // PRD v2.0 NEW FEATURES
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    likedSongs,
    toggleLikedSong,
    isLiked,
    customPlaylists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    sleepTimer,
    setSleepTimer
  }), [
    engine,
    playBackgroundTrack,
    setAudioParam,
    currentTrack,
    currentIndex,
    playSong,
    isBGActive,
    isMuted,
    volume,
    recentlyPlayed,
    addToRecentlyPlayed,
    queue,
    playNext,
    playPrevious,
    isPlayerExpanded,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    likedSongs,
    toggleLikedSong,
    isLiked,
    customPlaylists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    sleepTimer,
    setSleepTimer
  ]);

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
