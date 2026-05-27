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
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: (expanded: boolean) => void;
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
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // Refs to always track the absolute latest queue and currentTrack to prevent stale closure bugs in native onended callbacks
  const queueRef = React.useRef(queue);
  const currentTrackRef = React.useRef(currentTrack);

  React.useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  React.useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const addToRecentlyPlayed = React.useCallback((track: any) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.url !== track.url);
      return [track, ...filtered].slice(0, 10);
    });
  }, []);

  const playNext = React.useCallback(() => {
    const latestQueue = queueRef.current;
    const latestTrack = currentTrackRef.current;
    if (latestQueue.length === 0) return;
    
    let nextTrack;
    if (latestQueue.length === 1) {
      nextTrack = latestQueue[0];
    } else {
      // Pick a random track from the queue that is NOT the current track (premium shuffle logic)
      const otherTracks = latestQueue.filter(t => !latestTrack || (t.id !== latestTrack.id && t.url !== latestTrack.url));
      const randomIndex = Math.floor(Math.random() * (otherTracks.length > 0 ? otherTracks.length : latestQueue.length));
      nextTrack = otherTracks.length > 0 ? otherTracks[randomIndex] : latestQueue[randomIndex];
    }

    if (nextTrack) {
        setCurrentTrack(nextTrack);
        
        addToRecentlyPlayed(nextTrack);
    }
  }, [engine, addToRecentlyPlayed]);

  const playPrevious = React.useCallback(() => {
    const latestQueue = queueRef.current;
    const latestTrack = currentTrackRef.current;
    if (latestQueue.length === 0) return;
    
    // Check if we have history in recentlyPlayed, otherwise fall back sequentially
    let prevTrack = null;
    if (recentlyPlayed.length > 1) {
      // recentlyPlayed[0] is the current track, recentlyPlayed[1] is the one played before
      prevTrack = recentlyPlayed[1];
    } else if (latestTrack) {
      const currentIndex = latestQueue.findIndex(t => t.id === latestTrack.id || t.url === latestTrack.url);
      const prevIndex = (currentIndex - 1 + latestQueue.length) % latestQueue.length;
      prevTrack = latestQueue[prevIndex];
    } else {
      prevTrack = latestQueue[0];
    }

    if (prevTrack) {
        setCurrentTrack(prevTrack);
        engine.playBackgroundTrack(prevTrack.url, prevTrack.name, prevTrack.artist, setIsBGActive); // removed playNext to avoid TDZ
        
        // Push to top of recently played
        setRecentlyPlayed(prev => {
          const filtered = prev.filter(t => t.url !== prevTrack.url);
          return [prevTrack, ...filtered];
        });
    }
  }, [engine, recentlyPlayed, playNext]);

  useEffect(() => {
    engine.setAudioParam('volume', isMuted ? 0 : volume);
  }, [isMuted, volume, engine.isLoaded]);

  const value = {
    ...engine,
    playBackgroundTrack: async (url: string, songName?: string, artist?: string, onStateChange?: (playing: boolean) => void) => {
      const stateHandler = onStateChange || setIsBGActive;
      return engine.playBackgroundTrack(url, songName, artist, stateHandler, playNext);
    },
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
    playPrevious,
    isPlayerExpanded,
    setIsPlayerExpanded
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
