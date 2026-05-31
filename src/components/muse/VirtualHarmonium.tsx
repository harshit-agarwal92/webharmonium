'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Circle, Settings2, SlidersHorizontal, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

// Frequencies for C3 to B4 (2 Octaves)
const NOTES = [
  { note: 'C3', freq: 130.81, key: 'a', isBlack: false },
  { note: 'C#3', freq: 138.59, key: 'w', isBlack: true },
  { note: 'D3', freq: 146.83, key: 's', isBlack: false },
  { note: 'D#3', freq: 155.56, key: 'e', isBlack: true },
  { note: 'E3', freq: 164.81, key: 'd', isBlack: false },
  { note: 'F3', freq: 174.61, key: 'f', isBlack: false },
  { note: 'F#3', freq: 185.00, key: 't', isBlack: true },
  { note: 'G3', freq: 196.00, key: 'g', isBlack: false },
  { note: 'G#3', freq: 207.65, key: 'y', isBlack: true },
  { note: 'A3', freq: 220.00, key: 'h', isBlack: false },
  { note: 'A#3', freq: 233.08, key: 'u', isBlack: true },
  { note: 'B3', freq: 246.94, key: 'j', isBlack: false },
  { note: 'C4', freq: 261.63, key: 'k', isBlack: false },
  { note: 'C#4', freq: 277.18, key: 'o', isBlack: true },
  { note: 'D4', freq: 293.66, key: 'l', isBlack: false },
  { note: 'D#4', freq: 311.13, key: 'p', isBlack: true },
  { note: 'E4', freq: 329.63, key: ';', isBlack: false },
  { note: 'F4', freq: 349.23, key: "'", isBlack: false },
  { note: 'F#4', freq: 369.99, key: ']', isBlack: true },
  { note: 'G4', freq: 392.00, key: '\\', isBlack: false },
];

const SCALES = {
  'None': [],
  'C Major': ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'],
  'Raag Bhairavi': ['C3', 'C#3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4', 'C#4', 'D#4', 'F4', 'G4'],
  'Raag Yaman': ['C3', 'D3', 'E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'],
};

export function VirtualHarmonium() {
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const activeNodesRef = useRef<Record<string, { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }>>({});
  
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState(0.7);
  const [sustain, setSustain] = useState(false);
  const [mode, setMode] = useState<keyof typeof SCALES>('None');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<{note: string, time: number}[]>([]);
  const recordingStartTime = useRef(0);
  const [isPlayingRecord, setIsPlayingRecord] = useState(false);

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioCtx(ctx);
    return () => { ctx.close(); };
  }, []);

  const playNote = useCallback((noteObj: typeof NOTES[0]) => {
    if (!audioCtx) return;
    if (activeNodesRef.current[noteObj.note]) return; // Already playing

    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (isRecording) {
      setRecordedNotes(prev => [...prev, { note: noteObj.note, time: Date.now() - recordingStartTime.current }]);
    }

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();

    // Harmonium reed approximation
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.value = noteObj.freq;
    osc2.frequency.value = noteObj.freq * 2; // Octave harmonic

    filter.type = 'lowpass';
    filter.frequency.value = 2500;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioCtx.currentTime + 0.05);

    osc1.start();
    osc2.start();

    activeNodesRef.current[noteObj.note] = { osc1, osc2, gain: gainNode };
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.add(noteObj.note);
      return next;
    });
  }, [audioCtx, volume, isRecording]);

  const stopNote = useCallback((noteObj: typeof NOTES[0]) => {
    if (!audioCtx || sustain) return; // If sustain is on, we don't stop immediately
    
    const node = activeNodesRef.current[noteObj.note];
    if (node) {
      node.gain.gain.setValueAtTime(node.gain.gain.value, audioCtx.currentTime);
      node.gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      setTimeout(() => {
        node.osc1.stop();
        node.osc2.stop();
        node.osc1.disconnect();
        node.osc2.disconnect();
        node.gain.disconnect();
      }, 150);
      delete activeNodesRef.current[noteObj.note];
    }

    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(noteObj.note);
      return next;
    });
  }, [audioCtx, sustain]);

  // Keyboard mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const noteObj = NOTES.find(n => n.key === key);
      if (noteObj) playNote(noteObj);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const noteObj = NOTES.find(n => n.key === key);
      if (noteObj) stopNote(noteObj);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, stopNote]);

  // Recording controls
  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setRecordedNotes([]);
      recordingStartTime.current = Date.now();
      setIsRecording(true);
    }
  };

  const handlePlayRecord = async () => {
    if (recordedNotes.length === 0 || isPlayingRecord) return;
    setIsPlayingRecord(true);
    
    for (let i = 0; i < recordedNotes.length; i++) {
      const current = recordedNotes[i];
      const next = recordedNotes[i+1];
      
      const noteObj = NOTES.find(n => n.note === current.note);
      if (noteObj) {
        playNote(noteObj);
        setTimeout(() => stopNote(noteObj), 300); // fixed duration for simplicity
      }
      
      if (next) {
        const delay = next.time - current.time;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    setIsPlayingRecord(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          Virtual Harmonium
          <span className="px-2 py-0.5 rounded text-[10px] bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(236,72,153,0.5)]">
            PRO
          </span>
        </h2>
        <p className="text-white/40 text-sm">Experience the authentic reedy tone of an Indian Harmonium directly in your browser.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Settings */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3 h-3" /> Volume
            </label>
            <input 
              type="range" min="0" max="1" step="0.05" value={volume} 
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-32 accent-[#8B5CF6]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Practice Mode</label>
            <select 
              value={mode} 
              onChange={e => setMode(e.target.value as keyof typeof SCALES)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#8B5CF6]/50"
            >
              {Object.keys(SCALES).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Sustain</label>
            <button 
              onClick={() => setSustain(!sustain)}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", sustain ? "bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-[#1a1a1a] text-white/50")}
            >
              {sustain ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Recording */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <button 
            onClick={handleRecord}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              isRecording 
                ? "bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse" 
                : "bg-[#1a1a1a] text-white/70 hover:bg-white/10"
            )}
          >
            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Circle className="w-4 h-4 fill-red-500 text-red-500" />}
            {isRecording ? 'RECORDING...' : 'RECORD'}
          </button>

          <button 
            onClick={handlePlayRecord}
            disabled={recordedNotes.length === 0 || isRecording || isPlayingRecord}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> PLAYBACK
          </button>
        </div>
      </div>

      {/* Keyboard Container */}
      <div className="w-full overflow-x-auto pb-8 no-scrollbar-on-mobile">
        <div className="flex relative h-64 min-w-[800px] bg-[#111] p-4 rounded-b-2xl rounded-t-lg border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none">
          {/* Wooden Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#2A1508] to-[#1A0A04] rounded-t-lg border-b border-black flex items-center px-4">
            <div className="flex gap-2">
              {[1,2,3,4,5,6].map(i => <div key={i} className="w-2 h-2 rounded-full bg-black/50" />)}
            </div>
          </div>
          
          <div className="flex relative mt-4 h-full w-full">
            {NOTES.map((note, idx) => {
              const isScaleHighlight = mode !== 'None' && SCALES[mode].includes(note.note);
              const isActive = activeKeys.has(note.note);

              if (!note.isBlack) {
                return (
                  <div
                    key={note.note}
                    onMouseDown={() => playNote(note)}
                    onMouseUp={() => stopNote(note)}
                    onMouseLeave={() => stopNote(note)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(note); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopNote(note); }}
                    className={cn(
                      "relative flex-1 h-full border border-black/20 rounded-b-md shadow-sm flex flex-col justify-end pb-4 items-center transition-all cursor-pointer",
                      isActive 
                        ? "bg-gradient-to-b from-gray-200 to-gray-400 transform origin-top rotate-x-2" 
                        : "bg-gradient-to-b from-white to-gray-100 hover:from-gray-100 hover:to-gray-200"
                    )}
                    style={{ zIndex: 1 }}
                  >
                    {isScaleHighlight && !isActive && <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mb-2 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />}
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-[#EC4899]/30 to-transparent pointer-events-none" />}
                    <span className="text-[10px] font-bold text-black/30 uppercase">{note.key}</span>
                  </div>
                );
              } else {
                // Black key positioning
                // It overlaps the previous and next white keys
                // Flex basis of white key is ~ 100% / number of white keys. Black keys are absolute.
                const whiteKeysBefore = NOTES.slice(0, idx).filter(n => !n.isBlack).length;
                const totalWhiteKeys = NOTES.filter(n => !n.isBlack).length;
                const leftPos = `calc(${(whiteKeysBefore / totalWhiteKeys) * 100}% - 1.5%)`;

                return (
                  <div
                    key={note.note}
                    onMouseDown={() => playNote(note)}
                    onMouseUp={() => stopNote(note)}
                    onMouseLeave={() => stopNote(note)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(note); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopNote(note); }}
                    className={cn(
                      "absolute top-0 h-2/3 w-[3%] rounded-b-md shadow-2xl flex flex-col justify-end pb-4 items-center transition-all cursor-pointer",
                      isActive 
                        ? "bg-gradient-to-b from-[#111] to-black transform origin-top rotate-x-2" 
                        : "bg-gradient-to-b from-[#222] to-black hover:from-[#333]"
                    )}
                    style={{ left: leftPos, zIndex: 2 }}
                  >
                    {isScaleHighlight && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899] mb-2 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />}
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-[#8B5CF6]/50 to-transparent pointer-events-none rounded-b-md" />}
                    <span className="text-[9px] font-bold text-white/30 uppercase">{note.key}</span>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
