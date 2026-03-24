'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Keyboard } from '@/components/Keyboard';
import { ControlPanel } from '@/components/ControlPanel';
import { Visualizer } from '@/components/Visualizer';
import { LandingPage } from '@/components/LandingPage';
import { KEYBOARD_MAPPING } from '@/lib/constants';
import { LayoutPanelLeft, Music, Mic, Disc, X } from 'lucide-react';
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
  const [showConsole, setShowConsole] = useState(false); // Mobile: Closed by default
  const [intensity, setIntensity] = useState(0);

  const activeKeys = useRef<Set<string>>(new Set());

  useEffect(() => { 
    setIsMounted(true); 
    // Default show console on desktop
    if (window.innerWidth > 1024) setShowConsole(true);
  }, []);

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
            className="flex-1 flex flex-col h-full w-full relative z-10 overflow-hidden"
          >
            {/* ATMOSPHERIC DYNAMIC BACKGROUND */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />
            {isMounted && (
              <motion.div 
                  className="absolute inset-0 pointer-events-none opacity-20 blur-[120px]"
                  animate={{ 
                    background: `radial-gradient(circle at ${showConsole ? '75%' : '50%'} 50%, ${getThemeColor()}, transparent 75%)`
                  }}
                  transition={{ duration: 1.5 }}
              />
            )}

            {/* TOP BAR */}
            <header className="h-16 lg:h-20 shrink-0 px-4 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-2xl z-[60]">
              <div className="flex items-center gap-3 lg:gap-6">
                 <div className="p-2.5 lg:p-3.5 bg-accent-gold rounded-xl lg:rounded-2xl shadow-[0_15px_40px_-5px_var(--accent-gold-glow)] flex items-center justify-center">
                    <Music className="w-5 h-5 lg:w-6 h-6 text-black" />
                 </div>
                 <div className="flex flex-col">
                    <h1 className="text-lg lg:text-2xl font-black tracking-tighter text-accent-gold italic leading-none uppercase">HARMONIUM <span className="text-white/40 not-italic hidden sm:inline">ELITE v3.5</span></h1>
                    <span className="text-[7px] lg:text-[10px] font-black uppercase tracking-[0.6em] text-white/5 mt-1 lg:mt-2">Ultra Latency Engine</span>
                 </div>
              </div>
              
              <div className="flex items-center gap-3 lg:gap-6">
                 <button 
                   onClick={() => setShowConsole(!showConsole)}
                   className={cn(
                     "p-3 lg:p-4 rounded-2xl lg:rounded-3xl transition-all border outline-none", 
                     showConsole 
                        ? "bg-accent-gold text-black border-accent-gold" 
                        : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                    )}
                 >
                   {showConsole && window.innerWidth < 1024 ? <X className="w-5 h-5 lg:w-6 h-6" /> : <LayoutPanelLeft className="w-5 h-5 lg:w-6 h-6" />}
                 </button>
              </div>
            </header>

            {/* CENTER */}
            <div className="flex-1 flex min-h-0 relative overflow-hidden">
              <AnimatePresence>
                {showConsole && (
                  <>
                    {/* MOBILE OVERLAY DIMMER */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => { if (window.innerWidth < 1024) setShowConsole(false); }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                    
                    {/* CONSOLE DRAWER */}
                    <motion.aside
                      initial={{ x: -400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -400, opacity: 0 }}
                      transition={{ type: "spring", damping: 30, stiffness: 200 }}
                      className="absolute left-0 top-0 bottom-0 z-50 h-full w-[85%] sm:w-[50%] lg:w-[480px] p-4 lg:p-10 overflow-y-auto custom-scrollbar lg:border-r border-white/5 bg-black/95 lg:bg-transparent backdrop-blur-3xl lg:backdrop-blur-0 shadow-2xl lg:shadow-none"
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
                  </>
                )}
              </AnimatePresence>

              <main className="flex-1 flex flex-col justify-center items-center p-4 lg:p-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />
                
                <motion.div 
                    className="w-full max-w-5xl aspect-[16/9] lg:aspect-[21/9] flex flex-col items-center justify-center relative touch-none pointer-events-none"
                    animate={{ 
                        scale: 1 + intensity * 0.005, 
                        rotateX: intensity * 0.1,
                    }}
                >
                    <Visualizer />
                </motion.div>

                {/* HUD Overlay (Mobile Friendly) */}
                {!showConsole && (
                    <div className="absolute top-4 lg:top-10 flex gap-4 lg:gap-10 items-center opacity-40 font-black text-[7px] lg:text-[9px] uppercase tracking-[0.3em] text-white bg-black/20 px-4 py-2 rounded-full">
                        <span>OCT: {octaveShift}</span>
                        <div className="w-0.5 h-0.5 rounded-full bg-accent-gold" />
                        <span>{selectedScale.split(' ')[0]}</span>
                        <div className="w-0.5 h-0.5 rounded-full bg-accent-gold" />
                        <span className="text-accent-gold">{currentPreset}</span>
                    </div>
                )}
              </main>
            </div>

            {/* BOTTOM KEYBOARD (Optimized for Finger Touch) */}
            <div className="shrink-0 bg-black/90 border-t border-white/5 p-2 lg:p-8 relative">
                {/* Octave Controls for Thumb Touch */}
                <div className="absolute -top-10 lg:-top-14 left-1/2 -translate-x-1/2 flex items-center gap-4 lg:gap-8 glass px-6 lg:px-8 py-2.5 lg:py-3.5 rounded-full border-white/10 z-20 shadow-2xl">
                    <button onClick={() => setOctaveShift(prev => Math.max(-2, prev - 1))} className="p-2 lg:p-1 hover:text-accent-gold transition-colors text-white/30"><MinusIcon /></button>
                    <div className="flex flex-col items-center select-none">
                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-accent-gold w-20 lg:w-32 text-center">BASS</span>
                    </div>
                    <button onClick={() => setOctaveShift(prev => Math.min(2, prev + 1))} className="p-2 lg:p-1 hover:text-accent-gold transition-colors text-white/30"><PlusIcon /></button>
                </div>
                
                <div className="w-full overflow-hidden">
                    <Keyboard 
                       playNote={wrapPlayNote} stopNote={wrapStopNote} activeNotes={activeNotes} 
                       labelMode={labelMode} selectedScale={selectedScale} rootNote={rootNote}
                       boostMode={boost} intensity={intensity}
                    />
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
