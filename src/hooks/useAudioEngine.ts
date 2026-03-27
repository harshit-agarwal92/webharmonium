'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';

interface AudioEngineProps {
  volume: number;
  reverbEnabled: boolean;
  sustainEnabled: boolean;
  octaveOffset: number;
}

export function useAudioEngine() {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const masterGainRef = useRef<Tone.Gain | null>(null);
  
  // Background Music Layer
  const bgPlayerRef = useRef<Tone.Player | null>(null);
  const bgGainRef = useRef<Tone.Gain | null>(null);
  
  // Rhythm Layer
  const beatPlayerRef = useRef<Tone.Player | null>(null);
  const beatGainRef = useRef<Tone.Gain | null>(null);
  const sustainRef = useRef<Set<string>>(new Set());

  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [sustain, setSustain] = useState(false);

  useEffect(() => {
    // AUDIO GRAPH - 3 Distinct Mixing Channels
    const limiter = new Tone.Limiter(-1).toDestination();
    
    // 1. Master Channel (Mixer with limited headroom to prevent clipping)
    const masterGain = new Tone.Gain(0.8).connect(limiter);
    const reverb = new Tone.Reverb({ decay: 3.0, wet: 0.35 }).connect(masterGain);
    const filter = new Tone.Filter(3200, "lowpass").connect(reverb);
    
    // 2. Background Track Channel (25% volume typical)
    const bgGain = new Tone.Gain(0.3).connect(masterGain);
    
    // 3. Rhythm Channel
    const beatGain = new Tone.Gain(0.4).connect(masterGain);

    // EMERGENCY FALLBACK ENGINE: Reedy FM Synthesis (always available)
    const fallbackSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2.5,
      modulationIndex: 8,
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.1, decay: 0.2, sustain: 1, release: 0.8 },
      modulation: { type: "square" }
    }).connect(filter);

    // REALISTIC INSTRUMENT: Multi-Sampled Hamonium Engine
    const sampler = new Tone.Sampler({
      urls: {
        "C4": "Sa.wav", "C#4": "re.wav", "D4": "Re.wav", "D#4": "ga.wav",
        "E4": "Ga.wav", "F4": "Ma.wav", "F#4": "ma.wav", "G4": "Pa.wav",
        "G#4": "dha.wav", "A4": "Dha.wav", "A#4": "ni.wav", "B4": "Ni.wav",
        "C5": "Sa_high.wav"
      },
      baseUrl: "/audio/", // User-defined file structure
      onload: () => setIsLoaded(true),
      onerror: () => {
        console.warn("Using high-fidelity synthesis fallback (samples missing)");
        setIsLoaded(true);
      }
    }).connect(filter);

    samplerRef.current = sampler;
    // @ts-ignore
    samplerRef.current.fallback = fallbackSynth;
    reverbRef.current = reverb;
    filterRef.current = filter;
    masterGainRef.current = masterGain;
    bgGainRef.current = bgGain;
    beatGainRef.current = beatGain;

    return () => {
      sampler.dispose();
      reverb.dispose();
      filter.dispose();
      masterGain.dispose();
      bgPlayerRef.current?.dispose();
      beatPlayerRef.current?.dispose();
    };
  }, []);

  const playBeat = useCallback(async (url: string) => {
    if (!beatGainRef.current) return;
    
    beatPlayerRef.current?.stop();
    beatPlayerRef.current?.dispose();

    const player = new Tone.Player({
      url,
      loop: true,
      autostart: true,
      fadeIn: 1,
      fadeOut: 1
    }).connect(beatGainRef.current);
    
    beatPlayerRef.current = player;
  }, []);

  const stopBeat = useCallback(() => {
    beatPlayerRef.current?.stop();
  }, []);

  const initAudio = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    setIsReady(true);
  }, []);

  // PLAYBACK CONTROLS
  const playNote = useCallback((note: string, velocity = 0.8) => {
    if (!samplerRef.current) return;
    const now = Tone.now();
    
    // EXPERT ARCHITECTURE: Reuse pre-decoded AudioBuffers for zero latency
    if (samplerRef.current.loaded) {
        samplerRef.current.triggerAttack(note, now, velocity);
    } else {
        // High-fidelity fallback synthesis if samples are not yet ready
        // @ts-ignore
        samplerRef.current.fallback?.triggerAttack(note, now, velocity);
    }
    
    setActiveNotes(prev => prev.includes(note) ? prev : [...prev, note]);
    sustainRef.current.add(note);
  }, []);

  const stopNote = useCallback((note: string) => {
    if (!samplerRef.current) return;
    const now = Tone.now();
    
    if (samplerRef.current.loaded) {
        if (!sustain) samplerRef.current.triggerRelease(note, now);
    } else {
        // @ts-ignore
        if (!sustain) samplerRef.current.fallback?.triggerRelease(note, now);
    }
    
    if (!sustain) setActiveNotes(prev => prev.filter(n => n !== note));
    sustainRef.current.delete(note);
  }, [sustain]);

  // BACKGROUND TRACKS
  const playBackgroundTrack = useCallback((url: string) => {
    if (!bgGainRef.current) return;
    try {
      bgPlayerRef.current?.stop();
      bgPlayerRef.current?.dispose();

      const player = new Tone.Player({
        url,
        loop: true,
        autostart: true,
        fadeIn: 2,
        onerror: (err) => console.warn("Background track failed to load, skipping...", err)
      }).connect(bgGainRef.current);
      bgPlayerRef.current = player;
    } catch (e) {
      console.warn("Could not play background track:", e);
    }
  }, []);

  const stopBackgroundTrack = useCallback(() => {
    bgPlayerRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!sustain && samplerRef.current) {
      const now = Tone.now();
      sustainRef.current.forEach(note => {
        if (!activeNotes.includes(note)) {
          samplerRef.current?.triggerRelease(note, now);
          sustainRef.current.delete(note);
        }
      });
    }
  }, [sustain, activeNotes]);

  const setAudioParam = useCallback((param: string, val: number | boolean) => {
    if (!isLoaded) return;
    switch(param) {
      case 'volume': masterGainRef.current?.gain.rampTo(Number(val), 0.1); break;
      case 'reverb': if (reverbRef.current) reverbRef.current.wet.rampTo(Number(val), 0.1); break;
      case 'octave': setOctaveOffset(Number(val)); break;
      case 'sustain': setSustain(Boolean(val)); break;
      case 'beatVolume': beatGainRef.current?.gain.rampTo(Number(val), 0.1); break;
      case 'bgVolume': bgGainRef.current?.gain.rampTo(Number(val), 0.1); break;
    }
  }, [isLoaded]);

  return { 
    isLoaded, 
    isReady, 
    initAudio, 
    playNote, 
    stopNote, 
    setAudioParam, 
    activeNotes,
    octaveOffset,
    sustain,
    playBeat,
    stopBeat,
    playBackgroundTrack,
    stopBackgroundTrack
  };
}

