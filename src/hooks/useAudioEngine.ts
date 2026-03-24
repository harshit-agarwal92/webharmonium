'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';

interface PresetConfig {
  oscillator: any;
  envelope: any;
  filter: { Q: number; baseFrequency: number; octaves: number };
}

const PRESETS: Record<string, PresetConfig> = {
  classic: {
    oscillator: { type: "pwm", modulationFrequency: 0.2 },
    envelope: { attack: 0.1, decay: 0.3, sustain: 1, release: 0.8 },
    filter: { Q: 1, baseFrequency: 300, octaves: 4 }
  },
  bright: {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.5 },
    filter: { Q: 2, baseFrequency: 800, octaves: 5 }
  },
  bass: {
    oscillator: { type: "sine", modulationType: "triangle" },
    envelope: { attack: 0.2, decay: 0.5, sustain: 1, release: 1.5 },
    filter: { Q: 0.8, baseFrequency: 100, octaves: 2 }
  },
  soft: {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.2, decay: 0.4, sustain: 1, release: 1.2 },
    filter: { Q: 0.5, baseFrequency: 200, octaves: 2 }
  },
  organ: {
    oscillator: { type: "pulse", width: 0.2 },
    envelope: { attack: 0.08, decay: 0.1, sustain: 1, release: 0.4 },
    filter: { Q: 3, baseFrequency: 400, octaves: 3 }
  },
  'e-organ': {
    oscillator: { type: "square8" },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.1 },
    filter: { Q: 5, baseFrequency: 1000, octaves: 4 }
  },
  pad: {
    oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
    envelope: { attack: 1.5, decay: 1, sustain: 1, release: 3 },
    filter: { Q: 0.5, baseFrequency: 500, octaves: 3 }
  }
};

export function useAudioEngine() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const gainRef = useRef<Tone.Gain | null>(null);
  const chorusRef = useRef<Tone.Chorus | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const boostRef = useRef<Tone.Distortion | null>(null);
  const eqRef = useRef<Tone.EQ3 | null>(null);
  
  const droneSynthRef = useRef<Tone.PolySynth | null>(null);
  const metronomeRef = useRef<Tone.Synth | null>(null);
  const metronomeLoopRef = useRef<Tone.Loop | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [currentPreset, setPresetName] = useState('classic');

  useEffect(() => {
    limiterRef.current = new Tone.Limiter(-1).toDestination();
    gainRef.current = new Tone.Gain(0.8).connect(limiterRef.current);
    reverbRef.current = new Tone.Reverb({ decay: 5, wet: 0.2 }).connect(gainRef.current);
    eqRef.current = new Tone.EQ3(0, 0, 0).connect(reverbRef.current);
    boostRef.current = new Tone.Distortion({ distortion: 0.1, wet: 0 }).connect(eqRef.current);
    filterRef.current = new Tone.Filter({ frequency: 4000, type: "lowpass", Q: 1 }).connect(boostRef.current);
    chorusRef.current = new Tone.Chorus(4, 2.5, 0.5).connect(filterRef.current).start();

    const initialPreset = PRESETS.classic;
    synthRef.current = new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: initialPreset.oscillator,
      envelope: initialPreset.envelope,
      filter: { Q: initialPreset.filter.Q, type: "lowpass", rolloff: -12 },
      filterEnvelope: { ...initialPreset.envelope, baseFrequency: initialPreset.filter.baseFrequency, octaves: initialPreset.filter.octaves }
    }).connect(chorusRef.current);

    droneSynthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 2, release: 2 }
    }).connect(chorusRef.current);

    metronomeRef.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();

    setIsLoaded(true);

    return () => {
      [synthRef, reverbRef, gainRef, chorusRef, limiterRef, filterRef, boostRef, eqRef, droneSynthRef, metronomeRef, metronomeLoopRef].forEach(ref => ref.current?.dispose());
    };
  }, []);

  const initAudio = useCallback(async () => {
    await Tone.start();
  }, []);

  const changePreset = useCallback((name: string) => {
    if (!synthRef.current || !PRESETS[name]) return;
    const p = PRESETS[name];
    
    // cast to any for direct set since PolySynth type generics are complex
    (synthRef.current as any).set({
      oscillator: p.oscillator,
      envelope: p.envelope,
      filter: { Q: p.filter.Q },
      filterEnvelope: { baseFrequency: p.filter.baseFrequency, octaves: p.filter.octaves }
    });
    setPresetName(name);
  }, []);

  const playNote = useCallback(async (note: string, velocity = 0.8, options: { isCoupler?: boolean, transpose?: number, fineTune?: number } = {}) => {
    if (!isLoaded || !synthRef.current) return;
    if (Tone.getContext().state !== 'running') await Tone.start();

    const { isCoupler = false, transpose = 0, fineTune = 0 } = options;
    const freq = Tone.Frequency(note).transpose(transpose).toFrequency();
    const tunedFreq = freq * Math.pow(2, fineTune / 1200);

    synthRef.current.triggerAttack(tunedFreq, Tone.now(), velocity);
    if (isCoupler) synthRef.current.triggerAttack(tunedFreq * 2, Tone.now(), velocity * 0.4);

    setActiveNotes(prev => prev.includes(note) ? prev : [...prev, note]);
  }, [isLoaded]);

  const stopNote = useCallback((note: string, options: { isCoupler?: boolean, transpose?: number } = {}) => {
    if (!synthRef.current) return;
    const { isCoupler = false, transpose = 0 } = options;
    const freq = Tone.Frequency(note).transpose(transpose).toFrequency();
    
    synthRef.current.triggerRelease(freq, Tone.now());
    if (isCoupler) synthRef.current.triggerRelease(freq * 2, Tone.now());

    setActiveNotes(prev => prev.filter(n => n !== note));
  }, []);

  const setAudioParam = useCallback((param: string, val: number | boolean) => {
    if (!isLoaded) return;
    switch(param) {
      case 'volume': gainRef.current?.gain.rampTo(Number(val), 0.1); break;
      case 'reverb': reverbRef.current && (reverbRef.current.wet.value = Number(val)); break;
      case 'brightness': filterRef.current?.frequency.rampTo(Number(val), 0.1); break;
      case 'boost': 
        if (boostRef.current && eqRef.current) {
          boostRef.current.wet.rampTo(val ? 0.35 : 0, 0.2);
          eqRef.current.high.rampTo(val ? 6 : 0, 0.2);
          eqRef.current.mid.rampTo(val ? 3 : 0, 0.2);
        }
        break;
    }
  }, [isLoaded]);

  const playDrone = useCallback((note: string, active: boolean) => {
    if (!droneSynthRef.current) return;
    active ? droneSynthRef.current.triggerAttack(note, Tone.now(), 0.1) : droneSynthRef.current.triggerRelease(note, Tone.now());
  }, []);

  const toggleMetronome = useCallback((bpm: number, active: boolean) => {
    metronomeLoopRef.current?.dispose();
    if (active) {
      Tone.getTransport().bpm.value = bpm;
      metronomeLoopRef.current = new Tone.Loop(t => metronomeRef.current?.triggerAttackRelease("C6", "32n", t), "4n").start(0);
      Tone.getTransport().start();
    } else Tone.getTransport().stop();
  }, []);

  return { isLoaded, initAudio, playNote, stopNote, playDrone, toggleMetronome, setAudioParam, changePreset, currentPreset, activeNotes };
}
