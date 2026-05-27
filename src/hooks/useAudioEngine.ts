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
  const pianoSamplerRef = useRef<Tone.Sampler | null>(null);
  const customSamplerRef = useRef<Tone.Sampler | null>(null);
  const organSamplerRef = useRef<Tone.Sampler | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const masterGainRef = useRef<Tone.Gain | null>(null);
  
  // Background Music Layer
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgNodeRef = useRef<any>(null); // Using any to avoid TS/Lint issues with native nodes in some environments
  const bgGainRef = useRef<Tone.Gain | null>(null);
  
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
  const [bgTime, setBgTime] = useState(0);
  const [bgDuration, setBgDuration] = useState(0);

  useEffect(() => {
    // AUDIO GRAPH - 3 Distinct Mixing Channels
    const limiter = new Tone.Limiter(-1).toDestination();
    
    // 1. Master Channel (Mixer with limited headroom to prevent clipping)
    const masterGain = new Tone.Gain(1.2).connect(limiter);
    const reverb = new Tone.Reverb({ decay: 3.0, wet: 0.35 }).connect(masterGain);
    const filter = new Tone.Filter(3200, "lowpass").connect(reverb);
    
    // 2. Background Track Channel (Boosted default)
    const bgGain = new Tone.Gain(0.6).connect(masterGain);
    
    // 3. Rhythm Channel (Boosted default)
    const beatGain = new Tone.Gain(0.6).connect(masterGain);

    // CLASSIC REED SYNTHESIS (DUAL OSCILLATORS)
    const fallbackSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { 
        type: "fatcustom",
        partials: [1, 0.5, 0.3], // Simulating reed harmonics
        spread: 15,
        count: 2
      },
      envelope: { attack: 0.08, decay: 0.1, sustain: 1, release: 0.4 }
    }).connect(filter);

    // Fine-tune the fallback synth to match user's custom sawtooth/square blend
    fallbackSynth.set({
      oscillator: {
        type: "sawtooth"
      }
    });

    // REALISTIC INSTRUMENT: Multi-Sampled Harmonium Engine (Using Offline Local Samples)
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

    // GRAND PIANO ENGINE (Using Salamander Grand Piano Samples)
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

    // CUSTOM USER INSTRUMENT (Using User Uploaded MP3)
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
      bgAudioRef.current?.pause();
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
        // START SYNTHESIZED LOOP
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
    if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
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

  // PLAYBACK CONTROLS
  const playNote = useCallback((note: string, velocity = 0.8, time?: number) => {
    const now = time || Tone.now();
    const transposedNote = Tone.Frequency(note).transpose(octaveOffset * 12).toNote();
    
    // Select active instrument
    let activeSampler = samplerRef.current;
    if (currentPreset === 'piano') activeSampler = pianoSamplerRef.current;
    if (currentPreset === 'custom') activeSampler = customSamplerRef.current;

    // PRESET-SPECIFIC EFFECTS (SIMULATING REEDS/STOPS)
    if (currentPreset === 'bass') {
      filterRef.current?.frequency.rampTo(800, 0.1); // Male Reed (Deep)
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "sawtooth" } });
    } else if (currentPreset === 'bright' || currentPreset === 'stage') {
      filterRef.current?.frequency.rampTo(8000, 0.1); // Female Reed (Sharp)
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "sawtooth" } });
    } else if (currentPreset === 'soft') {
      filterRef.current?.frequency.rampTo(600, 0.1); // Muffled Wood
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "triangle" } });
    } else {
      filterRef.current?.frequency.rampTo(3200, 0.1); // Classic Balanced
      // @ts-expect-error
      samplerRef.current.fallback?.set({ oscillator: { type: "sawtooth" } });
    }

    if (activeSampler && activeSampler.loaded) {
        activeSampler.triggerAttack(transposedNote, now, velocity);
    } else if (samplerRef.current) {
        // Fallback to synthesis if primary sampler not ready
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
  const playBackgroundTrack = useCallback(async (url: string, songName?: string, artist?: string, onStateChange?: (playing: boolean) => void, onEnded?: () => void) => {
    if (!bgGainRef.current || !url) return;
    
    // RESET PLAYBACK TIMELINE STATE IMMEDIATELY TO PREVENT STUCK UI
    setBgTime(0);
    setBgDuration(0.1);

    try {
      // FORCE AUDIO RESUME
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
        await Tone.getContext().resume();
      }

      let finalUrl = url;
      
      // Check if JioSaavn URL has expired
      const expiresMatch = url.match(/[eE]xpires=(\d+)/);
      let isExpired = false;
      if (expiresMatch) {
        const expiresTime = parseInt(expiresMatch[1], 10);
        if (Date.now() / 1000 >= expiresTime - 30) {
          isExpired = true;
          console.log(`JioSaavn URL has expired (Expires: ${expiresTime}, Now: ${Math.floor(Date.now() / 1000)})`);
        }
      }

      // AUTO-RESOLUTION for Spotify Metadata or Expired Saavn URLs
      if (url.startsWith('@spotify:') || isExpired) {
        console.log(`Resolving fresh audio stream for: ${songName} - ${artist}`);
        try {
          // Search for the track on our robust hybrid mirrors
          const res = await fetch(`/api/songs?query=${encodeURIComponent(`${songName} ${artist} audio`)}`);
          if (res.ok) {
            const data = await res.json();
            // Pick the first non-spotify result (prefer Saavn for direct cdn links)
            const alt = data.results?.find((s: any) => s.source === 'saavn') || 
                        data.results?.find((s: any) => s.source === 'youtube') ||
                        data.results?.[0];
            if (alt?.url) {
              console.log("Found fresh playable stream:", alt.url);
              finalUrl = alt.url;
            } else {
              throw new Error('No playable stream found');
            }
          }
        } catch (e) {
          console.error("Audio stream resolution failed:", e);
          if (isExpired) return; // Abort if expired and we couldn't resolve a new one
        }
      }

      // Handle YouTube Stream Proxy
      if (finalUrl.startsWith('/api/stream?id=')) {
        console.log("Resolving YouTube stream via API and Proxy...", finalUrl);
        try {
          const res = await fetch(finalUrl);
          if (!res.ok) throw new Error('Stream extraction failed');
          const data = await res.json();
          if (!data.url) throw new Error('No stream URL provided');
          
          // FORCE CORS-SAFE PROXY for all YouTube streams
          finalUrl = `/api/proxy-audio?url=${encodeURIComponent(data.url)}`;
        } catch (streamErr) {
          console.error("YouTube Stream resolution failed:", streamErr);
          if (bgAudioRef.current) bgAudioRef.current.pause();
          return; 
        }
      }

      // Use Native Audio for streaming long tracks
      const isExternal = finalUrl.startsWith('http');
      const playerUrl = isExternal 
        ? `/api/proxy-audio?url=${encodeURIComponent(finalUrl)}` 
        : finalUrl;

      console.log(`Starting background track: ${isExternal ? 'External (Proxied)' : 'Local'}`, playerUrl);

      let audio = bgAudioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.volume = 1; // Controlled by bgGain node
        bgAudioRef.current = audio;

        // Use standard Web Audio API to create source and link to Tone.js
        const ctx = Tone.getContext();
        const source = ctx.createMediaElementSource(audio);
        
        // Connect to Tone graph
        Tone.connect(source, bgGainRef.current);
        bgNodeRef.current = source;
      } else {
        audio.pause();
      }
      
      audio.src = playerUrl;
      audio.load(); // Forces browser to load the fresh audio source
      audio.loop = false;

      // Real-time metadata listeners
      audio.ontimeupdate = () => setBgTime(audio.currentTime);
      audio.onloadedmetadata = () => setBgDuration(audio.duration);
      audio.onplay = () => onStateChange?.(true);
      audio.onpause = () => onStateChange?.(false);
      audio.onended = () => {
        onStateChange?.(false);
        onEnded?.();
      };

      // Start playback
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name === 'AbortError') {
            console.log("Audio play request was safely interrupted by a call to pause() or a new track load. Safe to ignore.");
          } else {
            console.error("Audio playback interrupted/blocked:", err);
            // Auto-retry once on interaction if blocked
            const retry = () => {
                audio.play().catch(() => {});
                window.removeEventListener('click', retry);
            };
            window.addEventListener('click', retry);
          }
        });
      }
      
      console.log("Background track streaming started.");
    } catch (e) {
      console.warn("Could not start background track:", e);
    }
  }, []);

  const stopBackgroundTrack = useCallback(() => {
    if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
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
      case 'volume': masterGainRef.current?.gain.rampTo(Number(val), 0.1); break;
      case 'reverb': if (reverbRef.current) reverbRef.current.wet.rampTo(Number(val), 0.1); break;
      case 'octave': setOctaveOffset(Number(val)); break;
      case 'sustain': setSustain(Boolean(val)); break;
      case 'preset': setCurrentPreset(String(val)); break;
      case 'beatVolume': beatGainRef.current?.gain.rampTo(Number(val), 0.1); break;
      case 'bgVolume': bgGainRef.current?.gain.rampTo(Number(val), 0.1); break;
      case 'bgRepeat': if (bgAudioRef.current) bgAudioRef.current.loop = Boolean(val); break;
      case 'seek': if (bgAudioRef.current) bgAudioRef.current.currentTime = Number(val); break;
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
    stopAll,
    playBackgroundTrack,
    stopBackgroundTrack,
    bgTime,
    bgDuration
  };
}

