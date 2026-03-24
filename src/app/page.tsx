'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Keyboard } from '@/components/Keyboard';
import { ControlPanel } from '@/components/ControlPanel';
import { Visualizer } from '@/components/Visualizer';
import { LandingPage } from '@/components/LandingPage';
import { KEYBOARD_MAPPING } from '@/lib/constants';
import { LayoutPanelLeft, Music, Mic, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProfessionalHarmonium() {
  const { 
    isLoaded, initAudio, playNote, stopNote, playDrone, toggleMetronome, 
    setAudioParam, changePreset, currentPreset, activeNotes 
  } = useAudioEngine();

  const [isStarted, setIsStarted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [volume, setVol] = useState(0.8);
  const [reverb, setRev] = useState(0.2);
  const [brightness, setBright] = useState(4000);
  const [boost, setBoost] = useState(false);
  const [sustain, setSustain] = useState(false);
  const [coupler, setCoupler] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [fineTune, setFineTune] = useState(0);
  const [octaveShift, setOctaveShift] = useState(0);
  const [bpm, setBPM] = useState(120);
  const [isMetronome, setMetronome] = useState(false);
  const [labelMode, setLabelMode] = useState('sargam');
  const [selectedScale, setScale] = useState('Chromatic');
  const [rootNote, setRootNote] = useState('C');
  const [activeDrone, setActiveDrone] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [intensity, setIntensity] = useState(0);

  const activeKeys = useRef<Set<string>>(new Set());

  useEffect(() => { setIsMounted(true); }, []);

  const getThemeColor = () => {
    switch(currentPreset) {
        case 'classic': return '#d4af37';
        case 'bright': return '#ffc864';
        case 'bass': return '#964b00';
        case 'soft': return '#fffff0';
        case 'organ': return '#6496ff';
        case 'e-organ': return '#00ffc8';
        case 'pad': return '#c864ff';
        default: return '#d4af37';
    }
  };

  const handleStart = async () => {
    await initAudio();
    setIsStarted(true);
  };

  const wrapPlayNote = useCallback((noteName: string) => {
    if (!isStarted) return;
    const noteMatch = noteName.match(/^([A-G]#?)(\d+)$/);
    if (!noteMatch) return;
    const [_, pitch, octave] = noteMatch;
    const shiftedNote = `${pitch}${parseInt(octave) + octaveShift}`;

    playNote(shiftedNote, 0.8, { isCoupler: coupler, transpose, fineTune });
    setIntensity(prev => Math.min(prev + 5, 20));
    setTimeout(() => setIntensity(prev => Math.max(0, prev - 2)), 200);
  }, [playNote, coupler, transpose, fineTune, octaveShift, isStarted]);

  const wrapStopNote = useCallback((noteName: string) => {
    const noteMatch = noteName.match(/^([A-G]#?)(\d+)$/);
    if (!noteMatch) return;
    const [_, pitch, octave] = noteMatch;
    const shiftedNote = `${pitch}${parseInt(octave) + octaveShift}`;

    if (!sustain) stopNote(shiftedNote, { isCoupler: coupler, transpose });
  }, [stopNote, coupler, transpose, sustain, octaveShift]);

  useEffect(() => {
    setAudioParam('volume', volume);
    setAudioParam('reverb', reverb);
    setAudioParam('brightness', brightness);
    setAudioParam('boost', boost);
  }, [volume, reverb, brightness, boost, setAudioParam]);

  useEffect(() => {
    if (!isStarted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['TEXTAREA'].includes(target.tagName)) return;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'range') return;

      const key = e.key.toLowerCase();
      const mapped = KEYBOARD_MAPPING[key];
      if (mapped) {
        if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
        switch(mapped) {
           case 'SUSTAIN': setSustain(true); break;
           case 'OCTAVE_UP': setOctaveShift(prev => Math.min(2, prev + 1)); break;
           case 'OCTAVE_DOWN': setOctaveShift(prev => Math.max(-2, prev - 1)); break;
           default:
              if (activeKeys.current.has(key)) return; 
              activeKeys.current.add(key);
              wrapPlayNote(mapped);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mapped = KEYBOARD_MAPPING[key];
      if (mapped) {
        if (mapped === 'SUSTAIN') setSustain(false); 
        else if (mapped !== 'OCTAVE_UP' && mapped !== 'OCTAVE_DOWN') {
            activeKeys.current.delete(key);
            wrapStopNote(mapped);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isStarted, wrapPlayNote, wrapStopNote]);

  return (
    <div className="w-screen h-screen bg-[#050505] flex flex-col overflow-hidden selection:bg-accent-gold/20 font-sans relative">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <LandingPage onStart={handleStart} key="landing" />
        ) : (
          <motion.div 
            key="instrument-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col h-full w-full relative z-10"
          >
            {/* ATMOSPHERIC DYNAMIC BACKGROUND */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />
            {isMounted && (
              <motion.div 
                  className="absolute inset-0 pointer-events-none opacity-20 blur-[180px]"
                  animate={{ 
                    background: `radial-gradient(circle at ${showConsole ? '75%' : '50%'} 50%, ${getThemeColor()}, transparent 75%)`
                  }}
                  transition={{ duration: 1.5 }}
              />
            )}

            {/* TOP BAR - PREMIUM GLOSS */}
            <header className="h-20 shrink-0 px-8 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-2xl z-50">
              <div className="flex items-center gap-6">
                 <div className="p-3.5 bg-accent-gold rounded-2xl shadow-[0_15px_40px_-5px_var(--accent-gold-glow)] flex items-center justify-center group cursor-pointer hover:rotate-12 transition-transform duration-500">
                    <Music className="w-6 h-6 text-black" />
                 </div>
                 <div className="flex flex-col">
                    <h1 className="text-2xl font-black tracking-tighter text-accent-gold italic leading-none uppercase">HARMONIUM <span className="text-white/40 not-italic">ELITE v3.5</span></h1>
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/5 mt-2 ml-1">Flagship Synthesis Engine</span>
                 </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="hidden md:flex flex-col items-end gap-1 opacity-20">
                    <span className="text-[8px] font-bold uppercase tracking-widest">Latency: 0.15ms</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest">Buff: 256ch</span>
                 </div>
                 <button 
                   onClick={() => setShowConsole(!showConsole)}
                   className={cn(
                     "p-4 rounded-3xl transition-all border active:scale-90", 
                     showConsole 
                        ? "bg-accent-gold text-black border-accent-gold shadow-[0_10px_30px_rgba(212,175,55,0.4)]" 
                        : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                    )}
                 >
                   <LayoutPanelLeft className="w-6 h-6" />
                 </button>
              </div>
            </header>

            {/* CENTER - MODULAR PERFORMANCE STAGE */}
            <div className="flex-1 flex min-h-0 relative">
              <AnimatePresence>
                {showConsole && (
                  <motion.aside
                    initial={{ x: -100, opacity: 0, scale: 0.95 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: -100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                    className="absolute lg:relative z-40 h-full w-screen lg:w-[480px] p-6 lg:p-10 overflow-y-auto custom-scrollbar lg:border-r border-white/5 bg-black/95 lg:bg-transparent backdrop-blur-3xl lg:backdrop-blur-0"
                  >
                    <ControlPanel 
                      {...{
                        volume, setVolume: setVol, reverb, setReverb: setRev, brightness, setBrightness: setBright,
                        coupler, setCoupler, sustain, setSustain, boost, setBoost,
                        bpm, setBPM: (v) => { setBPM(v); if (isMetronome) toggleMetronome(v, true); },
                        isMetronome, setMetronome: (v) => { setMetronome(v); toggleMetronome(bpm, v); },
                        transpose, setTranspose, fineTune, setFineTune, octaveShift, setOctaveShift,
                        labelMode, setLabelMode, selectedScale, setScale, rootNote, setRootNote,
                        currentPreset, setPreset: changePreset,
                        isRecording, startRecording: () => setIsRecording(true), stopRecording: () => setIsRecording(false),
                        activeDrone, toggleDrone: (note) => {
                          if (activeDrone === note) { playDrone(note, false); setActiveDrone(null); }
                          else { if (activeDrone) playDrone(activeDrone, false); playDrone(note, true); setActiveDrone(note); }
                        }
                      }}
                    />
                  </motion.aside>
                )}
              </AnimatePresence>

              <main className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative overflow-hidden">
                {/* CENTER GLOW PILLAR */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />
                
                <motion.div 
                    className="w-full max-w-5xl aspect-[21/9] flex flex-col items-center justify-center relative"
                    animate={{ 
                        scale: 1 + intensity * 0.005, 
                        rotateX: intensity * 0.1,
                        filter: `drop-shadow(0 0 ${intensity * 2}px var(--accent-gold-glow))`
                    }}
                >
                    <Visualizer />
                </motion.div>

                {/* Performance HUD */}
                {!showConsole && (
                    <div className="absolute top-10 flex gap-10 items-center opacity-30 hover:opacity-100 transition-opacity duration-700 font-mono text-[9px] uppercase tracking-[0.5em] text-white">
                        <span>OCT: {octaveShift}</span>
                        <div className="w-1 h-1 rounded-full bg-accent-gold" />
                        <span>{selectedScale} ({rootNote})</span>
                        <div className="w-1 h-1 rounded-full bg-accent-gold" />
                        <span className="text-accent-gold">{currentPreset}</span>
                    </div>
                )}
              </main>
            </div>

            {/* BOTTOM - ANCHORED ELITE KEYBOARD */}
            <div className="shrink-0 bg-black/90 border-t border-white/5 p-4 lg:p-8 relative">
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-4 glass px-8 py-3.5 rounded-full border-white/10 z-20 shadow-[0_25px_50px_-12px_rgba(0,0,0,1)]">
                    <button onClick={() => setOctaveShift(prev => Math.max(-2, prev - 1))} className="p-1 hover:text-accent-gold transition-colors text-white/20"><MinusIcon /></button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-gold w-32 text-center">BASS OCTAVE</span>
                        <span className="text-[9px] font-bold text-white/20 mt-1">{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</span>
                    </div>
                    <button onClick={() => setOctaveShift(prev => Math.min(2, prev + 1))} className="p-1 hover:text-accent-gold transition-colors text-white/20"><PlusIcon /></button>
                </div>
                
                <div className="w-full max-w-[1920px] mx-auto overflow-hidden">
                    <Keyboard 
                       playNote={wrapPlayNote} stopNote={wrapStopNote} activeNotes={activeNotes} 
                       labelMode={labelMode} selectedScale={selectedScale} rootNote={rootNote}
                       boostMode={boost} intensity={intensity}
                    />
                </div>
                
                <div className="mt-4 flex justify-between items-center opacity-10 px-10">
                    <span className="text-[8px] font-black tracking-[0.8em] uppercase">Hyper-Symmetry Engine v3.5.2</span>
                    <div className="flex gap-10">
                        <span className="text-[8px] font-black uppercase tracking-widest">SR: 96kHz</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">Poly: 128 Unison</span>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MinusIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function PlusIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
