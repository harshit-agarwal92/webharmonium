'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Keyboard } from '@/components/Keyboard';
import { Visualizer } from '@/components/Visualizer';
import { ControlPanel } from '@/components/ControlPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, Volume2, ArrowLeft, ChevronUp, ChevronDown, Settings2, X } from 'lucide-react';
import Link from 'next/link';
import { PRELOADED_BEATS } from '@/lib/beats';
import { PRELOADED_SONGS } from '@/lib/songs';
import { KEYBOARD_MAPPING } from '@/lib/constants';

export default function HarmoniumPage() {
  const { 
    isLoaded, isReady, initAudio, playNote, stopNote, 
    activeNotes, octaveOffset, setAudioParam, isMuted,
    playBeat, stopBeat, playBackgroundTrack, stopBackgroundTrack
  } = useAudio();

  const [isStarted, setIsStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  // UI States
  const [showControls, setShowControls] = useState(false);
  
  // Control Panel States
  const [reverb, setReverb] = useState(0.3);
  const [labelMode, setLabelMode] = useState('sargam');
  const [selectedScale, setSelectedScale] = useState('Chromatic');
  const [rootNote, setRootNote] = useState('C');
  const [selectedPreset, setSelectedPreset] = useState('classic');
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [currentBeatId, setCurrentBeatId] = useState('');
  const [beatVolume, setBeatVolume] = useState(0.6);
  const [bgVolume, setBgVolume] = useState(0.6);
  const [isRepeat, setIsRepeat] = useState(true);
  const [sustain, setSustain] = useState(false);

  // Keyboard Handling
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || !isReady) return;
      if (e.repeat) return;
      
      const key = e.key.toLowerCase();
      const note = KEYBOARD_MAPPING[key];
      
      if (note) {
        if (note === 'SUSTAIN') {
            setSustain(prev => {
                const newVal = !prev;
                setAudioParam('sustain', newVal);
                return newVal;
            });
        } else if (note === 'OCTAVE_UP') {
            setAudioParam('octave', Math.min(2, octaveOffset + 1));
        } else if (note === 'OCTAVE_DOWN') {
            setAudioParam('octave', Math.max(-2, octaveOffset - 1));
        } else {
            pressedKeys.current.add(key);
            wrapPlayNote(note);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const note = KEYBOARD_MAPPING[key];
      if (note && note !== 'SUSTAIN' && note !== 'OCTAVE_UP' && note !== 'OCTAVE_DOWN') {
         pressedKeys.current.delete(key);
         wrapStopNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isStarted, isReady, octaveOffset, setAudioParam]);

  const handleStart = async () => {
    setIsInitializing(true);
    await initAudio();
    setIsStarted(true);
    setIsInitializing(false);
  };

  const wrapPlayNote = useCallback((noteName: string, time?: number) => {
    if (!isStarted || !isReady || isMuted) return;
    playNote(noteName, 0.8, time);
    
    if (!time) {
        setIntensity(prev => Math.min(prev + 12, 30));
        setTimeout(() => setIntensity(prev => Math.max(0, prev - 6)), 200);
    }
  }, [playNote, isStarted, isReady, isMuted]);

  const wrapStopNote = useCallback((noteName: string, time?: number) => {
    stopNote(noteName, time);
  }, [stopNote]);

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      {/* TOP NAVIGATION */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Vault</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <h2 className="text-lg font-black uppercase tracking-tighter"> Harmonium <span className="text-harmonium-accent">Studio</span></h2>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowControls(!showControls)}
             className={`p-3 rounded-2xl transition-all active:scale-90 flex items-center gap-3 ${showControls ? 'bg-harmonium-accent text-black shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'glass text-white/60 hover:text-white'}`}
           >
              <Settings2 className={`w-5 h-5 ${showControls ? 'animate-spin-slow' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Engine Config</span>
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* MAIN STUDIO AREA */}
        <main className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8 overflow-hidden">
          {/* Visualizer Area */}
          <div className="w-full max-w-5xl h-[30vh] md:h-[40vh] relative mb-12 flex flex-col items-center justify-center">
            <Visualizer />
            
            <AnimatePresence>
              {!isStarted && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center glass rounded-[48px] m-4 text-center p-8 z-40 border border-white/10 shadow-2xl"
                >
                  <div className="w-20 h-20 bg-harmonium-accent/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                     <Zap className="w-10 h-10 text-harmonium-accent fill-current" />
                  </div>
                  <h3 className="text-4xl font-black mb-4 tracking-tight uppercase">Reed Engine <span className="text-harmonium-accent">Offline</span></h3>
                  <p className="text-white/40 max-w-xs mb-8 text-sm font-medium uppercase tracking-widest">Connect to atmospheric synthesis to begin.</p>
                  <button 
                    onClick={handleStart}
                    disabled={isInitializing}
                    className="bg-white text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 disabled:opacity-50"
                  >
                    {isInitializing ? "Wiring..." : <>Initialize Reeds <Play className="w-4 h-4 fill-current" /></>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keyboard Container */}
          <div className="w-full relative z-10">
            <Keyboard 
               playNote={wrapPlayNote} 
               stopNote={wrapStopNote} 
               activeNotes={activeNotes} 
               guideNotes={[]}
               labelMode={labelMode} 
               selectedScale={selectedScale} 
               rootNote={rootNote}
               intensity={intensity}
            />
          </div>

          {/* Bottom Shadow Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-0" />
        </main>

        {/* SIDE CONTROL PANEL */}
        <AnimatePresence>
          {showControls && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full md:w-[420px] glass h-full z-50 border-l border-white/10 flex flex-col overflow-hidden fixed md:relative"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                   <Settings2 className="w-5 h-5 text-harmonium-accent" />
                   <h3 className="text-sm font-black uppercase tracking-[0.3em]">Advanced Config</h3>
                </div>
                <button onClick={() => setShowControls(false)} className="p-2 hover:bg-white/10 rounded-xl md:hidden">
                   <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                <ControlPanel 
                   volume={volume}
                   setVolume={(v) => { setVolume(v); setAudioParam('volume', v); }}
                   reverb={reverb}
                   setReverb={(v) => { setReverb(v); setAudioParam('reverb', v); }}
                   sustain={sustain}
                   setSustain={(b) => { setSustain(b); setAudioParam('sustain', b); }}
                   octaveOffset={octaveOffset}
                   setOctaveOffset={(v) => setAudioParam('octave', v)}
                   labelMode={labelMode}
                   setLabelMode={setLabelMode}
                   selectedScale={selectedScale}
                   setScale={setSelectedScale}
                   rootNote={rootNote}
                   setRootNote={setRootNote}
                   
                   // Song Mode
                   isPlayingSong={false}
                   currentSongId=""
                   songSpeed={1}
                   onToggleSong={() => {}}
                   onSongSelect={() => {}}
                   onSpeedSelect={() => {}}

                   // Beat Mode
                   isPlayingBeat={isPlayingBeat}
                   currentBeatId={currentBeatId}
                   beatVolume={beatVolume}
                   onToggleBeat={(id) => {
                      if (isPlayingBeat && currentBeatId === id) {
                         stopBeat();
                         setIsPlayingBeat(false);
                      } else {
                         const beat = PRELOADED_BEATS.find(b => b.id === id);
                         if (beat) {
                            playBeat(beat.url);
                            setCurrentBeatId(id);
                            setIsPlayingBeat(true);
                         }
                      }
                   }}
                   onBeatSelect={(id) => setCurrentBeatId(id)}
                   onBeatVolumeChange={(v) => { setBeatVolume(v); setAudioParam('beatVolume', v); }}

                   // Background
                   bgVolume={bgVolume}
                   isBGActive={false}
                   onToggleBG={() => {}}
                   onBGVolumeChange={(v) => { setBgVolume(v); setAudioParam('bgVolume', v); }}
                   isRepeat={isRepeat}
                   onToggleRepeat={(r) => { setIsRepeat(r); setAudioParam('bgRepeat', r); }}

                   selectedPreset={selectedPreset}
                   onPresetSelect={(id) => { setSelectedPreset(id); setAudioParam('preset', id); }}
                   isLoaded={isLoaded}
                   songs={PRELOADED_SONGS}
                   beats={PRELOADED_BEATS}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING STATUS BARS */}
      <div className="fixed bottom-6 left-6 flex items-center gap-4 z-40 pointer-events-none">
          <div className="glass px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-harmonium-accent animate-pulse' : 'bg-red-500'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{isReady ? 'Engine Link Active' : 'Waiting for Auth'}</span>
          </div>
          <div className="glass px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
             <Volume2 className="w-3 h-3 text-white/20" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{Math.round(volume * 100)}% Master</span>
          </div>
      </div>
    </div>
  );
}
