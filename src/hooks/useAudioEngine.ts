'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import { PlaybackEngine } from '@/lib/playback/engine';
import { SaavnPlaybackProvider } from '@/lib/playback/providers/saavn';
import { DeezerPlaybackProvider } from '@/lib/playback/providers/deezer';
import { YouTubePlaybackProvider } from '@/lib/playback/providers/youtube';

export function useAudioEngine() {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const pianoSamplerRef = useRef<Tone.Sampler | null>(null);
  const customSamplerRef = useRef<Tone.Sampler | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const masterGainRef = useRef<Tone.Gain | null>(null);
  
  // HTML5 Audio Layer & Playback Engine
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgNodeRef = useRef<any>(null); 
  const bgGainRef = useRef<Tone.Gain | null>(null);
  const playbackEngineRef = useRef<PlaybackEngine | null>(null);

  // Rhythm Layer
  const beatPlayerRef = useRef<Tone.Player | null>(null);
  const kickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const beatGainRef = useRef<Tone.Gain | null>(null);
  const sustainRef = useRef<Set<string>>(new Set());

  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [sustain, setSustain] = useState(false);
  const [currentPreset, setCurrentPreset] = useState('classic');
  const [isSynthBeat, setIsSynthBeat] = useState(false);

  useEffect(() => {
    // AUDIO GRAPH - 3 Distinct Mixing Channels
    const limiter = new Tone.Limiter(-1).toDestination();
    
    const masterGain = new Tone.Gain(1.2).connect(limiter);
    const reverb = new Tone.Reverb({ decay: 3.0, wet: 0.35 }).connect(masterGain);
    const filter = new Tone.Filter(3200, "lowpass").connect(reverb);
    
    const bgGain = new Tone.Gain(0.6).connect(masterGain);
    const beatGain = new Tone.Gain(0.6).connect(masterGain);

    // Initialize HTML5 Audio Element and connect to Tone.js
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.volume = 1;
    bgAudioRef.current = audio;

    const ctx = Tone.getContext();
    const sourceNode = ctx.createMediaElementSource(audio);
    Tone.connect(sourceNode, bgGain);
    bgNodeRef.current = sourceNode;

    // Instantiate PlaybackEngine with Saavn, Deezer, and YouTube Providers
    const saavnProvider = new SaavnPlaybackProvider();
    const deezerProvider = new DeezerPlaybackProvider();
    const youtubeProvider = new YouTubePlaybackProvider();
    const playbackEngine = new PlaybackEngine(audio, [saavnProvider, deezerProvider, youtubeProvider]);
    playbackEngineRef.current = playbackEngine;

    const fallbackSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.08, decay: 0.1, sustain: 1, release: 0.4 }
    }).connect(filter);

    const sampler = new Tone.Sampler({
      urls: {
        "C2": "C2.wav", "C3": "C3.wav", "C4": "C4.wav", "C5": "C5.wav",
        "D#2": "Ds2.wav", "D#3": "Ds3.wav", "D#4": "Ds4.wav",
        "F#2": "Fs2.wav", "F#3": "Fs3.wav",
        "A2": "A2.wav", "A3": "A3.wav", "A4": "A4.wav"
      },
      baseUrl: "/harmonium/",
      onload: () => setIsLoaded(true),
      onerror: () => setIsLoaded(true)
    }).connect(filter);

    const pianoSampler = new Tone.Sampler({
      urls: {
        "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
        "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
        "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
        "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
        "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3"
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).connect(filter);

    const customSampler = new Tone.Sampler({
      urls: { "C4": "ishqa-ve-koshalworldcom_qBL8lWcB.mp3" },
      baseUrl: "/custom/",
      onload: () => setIsLoaded(true),
    }).connect(filter);

    samplerRef.current = sampler;
    pianoSamplerRef.current = pianoSampler;
    customSamplerRef.current = customSampler;
    // @ts-expect-error
    samplerRef.current.fallback = fallbackSynth;
    reverbRef.current = reverb;
    filterRef.current = filter;
    masterGainRef.current = masterGain;
    bgGainRef.current = bgGain;
    beatGainRef.current = beatGain;

    const kickSynth = new Tone.MembraneSynth({
      octaves: 4,
      pitchDecay: 0.1,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0 }
    }).connect(beatGain);
    kickSynthRef.current = kickSynth;

    return () => {
      sampler.dispose();
      reverb.dispose();
      filter.dispose();
      masterGain.dispose();
      
      if (playbackEngineRef.current) {
        playbackEngineRef.current.cleanup();
      }
      if (bgNodeRef.current) {
        bgNodeRef.current.disconnect();
      }
      beatPlayerRef.current?.dispose();
      customSampler.dispose();
    };
  }, []);

  const playBeat = useCallback(async (url: string) => {
    if (!beatGainRef.current) return;
    
    beatPlayerRef.current?.stop();
    beatPlayerRef.current?.dispose();
    Tone.getTransport().cancel();

     if (url === 'synth') {
        setIsSynthBeat(true);
        Tone.getTransport().scheduleRepeat((time) => {
          kickSynthRef.current?.triggerAttackRelease("C1", "8n", time);
        }, "4n");
        Tone.getTransport().start();
     } else {
        setIsSynthBeat(false);
        const player = new Tone.Player({
          url,
          loop: true,
          autostart: true,
          fadeIn: 1,
          fadeOut: 1
        }).connect(beatGainRef.current);
        beatPlayerRef.current = player;
     }
  }, []);

  const stopAll = useCallback(() => {
    samplerRef.current?.releaseAll();
    pianoSamplerRef.current?.releaseAll();
    // @ts-expect-error
    samplerRef.current?.fallback?.releaseAll();
    
    beatPlayerRef.current?.stop();
    if (playbackEngineRef.current) {
      playbackEngineRef.current.stop();
    }
    
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    Tone.getTransport().loop = false;
    setActiveNotes([]);
  }, []);

  const stopBeat = useCallback(() => {
    beatPlayerRef.current?.stop();
    if (isSynthBeat) {
       Tone.getTransport().stop();
       Tone.getTransport().cancel();
    }
  }, [isSynthBeat]);

  const initAudio = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    setIsReady(true);
  }, []);

  const playNote = useCallback((note: string, velocity = 0.8, time?: number) => {
    const now = time || Tone.now();
    const transposedNote = Tone.Frequency(note).transpose(octaveOffset * 12).toNote();
    
    let activeSampler = samplerRef.current;
    if (currentPreset === 'piano') activeSampler = pianoSamplerRef.current;
    if (currentPreset === 'custom') activeSampler = customSamplerRef.current;

    if (currentPreset === 'bass') {
      filterRef.current?.frequency.rampTo(800, 0.1);
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "sawtooth" } });
    } else if (currentPreset === 'bright' || currentPreset === 'stage') {
      filterRef.current?.frequency.rampTo(8000, 0.1);
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "sawtooth" } });
    } else if (currentPreset === 'soft') {
      filterRef.current?.frequency.rampTo(600, 0.1);
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "triangle" } });
    } else {
      filterRef.current?.frequency.rampTo(3200, 0.1);
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "sawtooth" } });
    }

    if (activeSampler && activeSampler.loaded) {
        activeSampler.triggerAttack(transposedNote, now, velocity);
    } else if (samplerRef.current) {
        // @ts-expect-error
        samplerRef.current.fallback?.triggerAttack(transposedNote, now, velocity);
    }
    
    setActiveNotes(prev => prev.includes(note) ? prev : [...prev, note]);
    sustainRef.current.add(note);
  }, [octaveOffset, currentPreset]);

  const stopNote = useCallback((note: string, time?: number) => {
    const now = time || Tone.now();
    const transposedNote = Tone.Frequency(note).transpose(octaveOffset * 12).toNote();

    let activeSampler = samplerRef.current;
    if (currentPreset === 'piano') activeSampler = pianoSamplerRef.current;
    if (currentPreset === 'custom') activeSampler = customSamplerRef.current;
    
    if (activeSampler && activeSampler.loaded) {
        if (!sustain) activeSampler.triggerRelease(transposedNote, now);
    } else if (samplerRef.current) {
        // @ts-expect-error
        if (!sustain) samplerRef.current.fallback?.triggerRelease(transposedNote, now);
    }
    
    if (!sustain) setActiveNotes(prev => prev.filter(n => n !== note));
    sustainRef.current.delete(note);
  }, [sustain, octaveOffset, currentPreset]);

  // BACKGROUND TRACKS
  const playBackgroundTrack = useCallback(async (trackOrUrl: any, songName?: string, artist?: string, onStateChange?: (playing: boolean) => void, onEnded?: () => void) => {
    let trackObj: any = {};
    let stateHandler = onStateChange;
    let endHandler = onEnded;

    if (typeof trackOrUrl === 'object' && trackOrUrl !== null) {
      trackObj = { ...trackOrUrl };
      // Handle optional function arguments when first arg is object
      if (typeof songName === 'function') {
        stateHandler = songName as any;
        endHandler = artist as any;
      }
    } else {
      trackObj = {
        url: trackOrUrl || '',
        name: songName || '',
        artist: artist || ''
      };
    }

    if (!trackObj.url && !trackObj.name && !trackObj.id) return;

    try {
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
        await Tone.getContext().resume();
      }

      if (playbackEngineRef.current) {
        await playbackEngineRef.current.play(trackObj, stateHandler, endHandler);
      }
    } catch (e) {
      console.warn("Could not start background track:", e);
    }
  }, []);

  const stopBackgroundTrack = useCallback(() => {
    if (playbackEngineRef.current) {
      playbackEngineRef.current.stop();
    }
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

  const setAudioParam = useCallback((param: string, val: number | boolean | string) => {
    if (!isLoaded) return;
    switch(param) {
      case 'volume': 
        masterGainRef.current?.gain.rampTo(Number(val), 0.1); 
        if (playbackEngineRef.current) {
          playbackEngineRef.current.setVolume(Number(val));
        }
        break;
      case 'reverb': if (reverbRef.current) reverbRef.current.wet.rampTo(Number(val), 0.1); break;
      case 'octave': setOctaveOffset(Number(val)); break;
      case 'sustain': setSustain(Boolean(val)); break;
      case 'preset': setCurrentPreset(String(val)); break;
      case 'beatVolume': beatGainRef.current?.gain.rampTo(Number(val), 0.1); break;
      case 'bgVolume': 
        bgGainRef.current?.gain.rampTo(Number(val), 0.1); 
        if (playbackEngineRef.current) {
          playbackEngineRef.current.setVolume(Number(val));
        }
        break;
      case 'bgRepeat': 
        if (bgAudioRef.current) bgAudioRef.current.loop = Boolean(val); 
        break;
      case 'seek': 
        if (playbackEngineRef.current) {
          playbackEngineRef.current.seek(Number(val));
        }
        break;
    }
  }, [isLoaded]);

  // Unified API for MiniPlayer to get time/duration across HTML5 and YouTube
  const getBgAudio = useCallback(() => {
    if (playbackEngineRef.current && playbackEngineRef.current.getCurrentProviderName() === 'youtube') {
      const ytProvider = playbackEngineRef.current.getCurrentProvider() as any;
      return {
        get currentTime() { return ytProvider ? ytProvider.getCurrentTime() : 0; },
        get duration() { return ytProvider ? ytProvider.getDuration() : 0.1; }
      } as any;
    }
    return bgAudioRef.current;
  }, []);

  return useMemo(() => ({ 
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
    stopAll,
    playBackgroundTrack,
    stopBackgroundTrack,
    getBgAudio
  }), [
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
    stopAll,
    playBackgroundTrack,
    stopBackgroundTrack,
    getBgAudio
  ]);
}
