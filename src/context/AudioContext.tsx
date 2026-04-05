'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

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
  playBackgroundTrack: (url: string, name?: string, artist?: string, onStateChange?: (playing: boolean) => void) => Promise<void>;
  stopBackgroundTrack: () => void;
  bgTime: number;
  bgDuration: number;
  playBeat: (url: string) => Promise<void>;
  stopBeat: () => void;
  currentTrack: any;
  setCurrentTrack: (track: any) => void;
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
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const engine = useAudioEngine();
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isBGActive, setIsBGActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  const addToRecentlyPlayed = (track: any) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.url !== track.url);
      return [track, ...filtered].slice(0, 10);
    });
  };

  const playNext = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id || t.url === currentTrack.url);
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextTrack = queue[nextIndex];
    if (nextTrack) {
        setCurrentTrack(nextTrack);
        engine.playBackgroundTrack(nextTrack.url, nextTrack.name, nextTrack.artist, setIsBGActive);
        addToRecentlyPlayed(nextTrack);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id || t.url === currentTrack.url);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
        setCurrentTrack(prevTrack);
        engine.playBackgroundTrack(prevTrack.url, prevTrack.name, prevTrack.artist, setIsBGActive);
        addToRecentlyPlayed(prevTrack);
    }
  };

  useEffect(() => {
    engine.setAudioParam('volume', isMuted ? 0 : volume);
  }, [isMuted, volume, engine.isLoaded]);

  const value = {
    ...engine,
    setAudioParam: (param: string, val: any) => {
      if (param === 'volume') {
        const v = Number(val);
        setVolume(v);
        if (v > 0) setIsMuted(false);
      }
      engine.setAudioParam(param, val);
    },
    currentTrack,
    setCurrentTrack,
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
    playPrevious
  };

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
