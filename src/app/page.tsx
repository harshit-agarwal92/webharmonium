'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Keyboard } from '@/components/Keyboard';
import { ControlPanel } from '@/components/ControlPanel';
import { Visualizer } from '@/components/Visualizer';
import { LandingPage } from '@/components/LandingPage';
import { KEYBOARD_MAPPING, RADIX_NOTES } from '@/lib/constants';
import { PRELOADED_SONGS } from '@/lib/songs';
import { PRELOADED_BEATS } from '@/lib/beats';
import { getSargamNote } from '@/lib/theory';
import * as Tone from 'tone';
import { LayoutPanelLeft, Music, Volume2, VolumeX, X, ArrowLeft } from 'lucide-react';
import { SongSearch } from '@/components/SongSearch';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProfessionalHarmonium() {
  // Beat Mode State
  const [currentBeatId, setCurrentBeatId] = useState(PRELOADED_BEATS[0].id);
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [beatVolume, setBeatVolume] = useState(0.5);

  // Background Music State
  const [bgVolume, setBGVolume] = useState(0.25);
  const [isBGActive, setIsBGActive] = useState(true);

  const { 
    isLoaded, isReady, initAudio, playNote, stopNote, 
    setAudioParam, activeNotes, octaveOffset, sustain,
    playBeat, stopBeat, stopAll, playBackgroundTrack, stopBackgroundTrack
  } = useAudioEngine();

  const [isStarted, setIsStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Audio Params State
  const [volume, setVol] = useState(0.8);
  const [reverb, setRev] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [sustainEffect, setSustainEffect] = useState(false);
  const [octaveShift, setOctaveShift] = useState(0);

  // UI State
  const [labelMode, setLabelMode] = useState('sargam');
  const [selectedScale, setScale] = useState('Chromatic');
  const [rootNote, setRootNote] = useState('C');
  const [showConsole, setShowConsole] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('classic');

  // Song Mode State
  const [currentSongId, setCurrentSongId] = useState(PRELOADED_SONGS[0].id);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [isSongsOpen, setIsSongsOpen] = useState(false);
  const [songSpeed, setSongSpeed] = useState(1);
  const [guideNotes, setGuideNotes] = useState<string[]>([]);
  
  const activeKeys = useRef<Set<string>>(new Set());
  const scheduledEvents = useRef<number[]>([]);

  useEffect(() => { 
    setIsMounted(true); 
    if (window.innerWidth > 1024) setShowConsole(true);
  }, []);

  const handleStart = async () => {
    setIsInitializing(true);
    await initAudio();
    setIsStarted(true);
    setIsInitializing(false);
  };

  const wrapPlayNote = useCallback((noteName: string, time?: number) => {
    if (!isStarted || !isReady || isMuted) return;
    
    // APPLY GLOBAL ROOT OFFSET (TRANSPOSE BASED ON SELECTED SCALE)
    const originalRootIdx = 0; // C
    const currentRootIdx = RADIX_NOTES.indexOf(rootNote);
    const rootOffset = currentRootIdx - originalRootIdx;
    
    const transposedNote = Tone.Frequency(noteName).transpose(rootOffset).toNote();
    playNote(transposedNote, 0.8, time);
    
    if (!time) {
        setIntensity(prev => Math.min(prev + 8, 25));
        setTimeout(() => setIntensity(prev => Math.max(0, prev - 4)), 150);
    }
  }, [playNote, isStarted, isReady, isMuted, rootNote]);

  const wrapStopNote = useCallback((noteName: string, time?: number) => {
    const originalRootIdx = 0; 
    const currentRootIdx = RADIX_NOTES.indexOf(rootNote);
    const rootOffset = currentRootIdx - originalRootIdx;
    
    const transposedNote = Tone.Frequency(noteName).transpose(rootOffset).toNote();
    stopNote(transposedNote, time);
  }, [stopNote, rootNote]);

  // SYNC AUDIO ENGINE PARAMS
  useEffect(() => {
    setAudioParam('volume', isMuted ? 0 : volume);
  }, [volume, isMuted, setAudioParam]);

  useEffect(() => {
    setAudioParam('reverb', reverb);
    setAudioParam('octave', octaveShift);
    setAudioParam('sustain', sustainEffect);
    setAudioParam('preset', selectedPreset);
  }, [reverb, octaveShift, sustainEffect, selectedPreset, setAudioParam]);

  useEffect(() => {
    setAudioParam('beatVolume', isMuted ? 0 : beatVolume);
    setAudioParam('bgVolume', (isMuted || !isBGActive) ? 0 : bgVolume);
  }, [beatVolume, bgVolume, isMuted, isBGActive, setAudioParam]);

  // KEYBOARD EVENTS
  useEffect(() => {
    if (!isStarted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;

      const key = e.key.toLowerCase();
      const mapped = KEYBOARD_MAPPING[key];
      if (mapped) {
        if ([' ', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
        
        switch(mapped) {
           case 'SUSTAIN': setSustainEffect(true); break;
           case 'OCTAVE_UP': setOctaveShift(prev => Math.min(1, prev + 1)); break;
           case 'OCTAVE_DOWN': setOctaveShift(prev => Math.max(-1, prev - 1)); break;
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
        if (mapped === 'SUSTAIN') setSustainEffect(false); 
        else if (mapped !== 'OCTAVE_UP' && mapped !== 'OCTAVE_DOWN') {
            activeKeys.current.delete(key);
            wrapStopNote(mapped);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isStarted, wrapPlayNote, wrapStopNote]);

  // SONG PLAYBACK LOGIC
  const stopSong = useCallback(() => {
    stopAll();
    scheduledEvents.current.forEach(id => Tone.getTransport().clear(id));
    scheduledEvents.current = [];
    setGuideNotes([]);
    setIsPlayingSong(false);
  }, [stopAll]);

  const executePlaySong = useCallback((songId: string, speed: number) => {
    stopSong();
    const song = PRELOADED_SONGS.find(s => s.id === songId);
    if (!song) return;

    if (isBGActive && song.backgroundUrl) {
        playBackgroundTrack(song.backgroundUrl);
    }

    const originalRootIdx = Tone.Frequency("C4").toMidi() % 12;
    const currentRootIdx = Tone.Frequency(`${rootNote}4`).toMidi() % 12;
    const rootOffset = currentRootIdx - originalRootIdx;

    setIsPlayingSong(true);
    const songDuration = Math.max(...song.notes.map(n => n.time + 1.0)); // +1 bar buffer
    
    // CONFIGURE LOOPING (At least 2 minutes of play feel)
    Tone.getTransport().loop = true;
    Tone.getTransport().loopStart = 0;
    Tone.getTransport().loopEnd = songDuration;
    
    Tone.getTransport().bpm.value = 120 * speed;
    Tone.getTransport().start();

    const translateNote = (n: string) => {
      const mapping: Record<string, string> = {
        "Sa": "C", "re": "C#", "Re": "D", "ga": "D#", "Ga": "E", "Ma": "F", "ma": "F#",
        "Pa": "G", "dha": "G#", "Dha": "A", "ni": "A#", "Ni": "B", "Sa'": "C5"
      };
      // If it's a 2-char string like "Sa", use mapping. If it has a number like "C4", keep it.
      if (mapping[n]) return mapping[n].includes('5') ? mapping[n] : mapping[n] + '4';
      return n;
    };

    song.notes.forEach((item) => {
      const actualNote = translateNote(item.note);
      const transposedNote = Tone.Frequency(actualNote).transpose(rootOffset).toNote();
      
      // 1. SCHEDULE AUDIO
      const eventId = Tone.getTransport().schedule((time) => {
        wrapPlayNote(transposedNote, time);
      }, item.time);
      scheduledEvents.current.push(eventId);

      // 2. SCHEDULE UI (Visualizer Pulse & Guide Notes)
      const visualId = Tone.getTransport().schedule((time) => {
        Tone.Draw.schedule(() => {
          setGuideNotes([transposedNote]);
          setIntensity(20);
          setTimeout(() => setIntensity(0), 100);
        }, time);
      }, item.time);
      scheduledEvents.current.push(visualId);

      // 3. SCHEDULE AUDIO OFF
      const duration = Tone.Time(item.duration).toSeconds() / speed;
      const offEventId = Tone.getTransport().schedule((time) => {
          wrapStopNote(transposedNote, time);
      }, item.time + duration);
      scheduledEvents.current.push(offEventId);

      // 4. SCHEDULE UI OFF
      const visualOffId = Tone.getTransport().schedule((time) => {
          Tone.Draw.schedule(() => {
              setGuideNotes(prev => prev.filter(n => n !== transposedNote));
          }, time);
      }, item.time + duration);
      scheduledEvents.current.push(visualOffId);
    });

    const lastNote = song.notes[song.notes.length - 1];
    const endEventId = Tone.getTransport().schedule(() => {
      Tone.Draw.schedule(() => stopSong(), Tone.now());
    }, lastNote.time + Tone.Time(lastNote.duration).toSeconds() + 1.0);
    scheduledEvents.current.push(endEventId);
  }, [rootNote, wrapPlayNote, wrapStopNote, stopSong, isBGActive, playBackgroundTrack]);

  const toggleSong = useCallback(() => {
    if (isPlayingSong) stopSong();
    else executePlaySong(currentSongId, songSpeed);
  }, [isPlayingSong, currentSongId, songSpeed, stopSong, executePlaySong]);

  const selectSong = useCallback((id: string) => {
    setCurrentSongId(id);
    const song = PRELOADED_SONGS.find(s => s.id === id);
    if (isBGActive && song?.backgroundUrl) {
        playBackgroundTrack(song.backgroundUrl);
    }
    if (isPlayingSong) executePlaySong(id, songSpeed);
  }, [isPlayingSong, songSpeed, executePlaySong, isBGActive, playBackgroundTrack]);

  // BEAT CONTROL
  const toggleBeat = useCallback(() => {
    if (isPlayingBeat) {
      stopBeat();
      setIsPlayingBeat(false);
    } else {
      const beat = PRELOADED_BEATS.find(b => b.id === currentBeatId);
      if (beat) {
        playBeat(beat.url);
        setIsPlayingBeat(true);
      }
    }
  }, [isPlayingBeat, currentBeatId, playBeat, stopBeat]);

  const selectBeat = useCallback((id: string) => {
    setCurrentBeatId(id);
    if (isPlayingBeat) {
       const beat = PRELOADED_BEATS.find(b => b.id === id);
       if (beat) playBeat(beat.url);
    }
  }, [isPlayingBeat, playBeat]);

  return (
    <div className="w-screen h-screen bg-[#050505] flex overflow-hidden selection:bg-accent-gold/20 font-sans relative">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <LandingPage onStart={handleStart} key="landing" isInitializing={isInitializing} />
        ) : (
          <motion.div 
            key="instrument-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full w-full relative z-10 overflow-hidden"
          >
            {/* AMBIENT GLOW */}
            {isMounted && (
              <motion.div 
                  className="absolute inset-0 pointer-events-none opacity-20 blur-[120px]"
                  animate={{ 
                    background: `radial-gradient(circle at ${showConsole ? '75%' : '50%'} 50%, #d4af37, transparent 75%)`
                  }}
                  transition={{ duration: 2 }}
              />
            )}

            {/* FLOATING CONTROL TOGGLE */}
            <button 
              onClick={() => setShowConsole(!showConsole)}
              className={cn(
                "fixed top-6 left-6 z-[100] p-4 rounded-2xl transition-all duration-300 shadow-2xl flex items-center gap-3",
                showConsole ? "bg-accent-gold text-black scale-90" : "bg-black/60 text-accent-gold backdrop-blur-xl border border-white/10 hover:border-accent-gold/40"
              )}
            >
              <LayoutPanelLeft className={cn("w-6 h-6", showConsole && "rotate-180")} />
              {!showConsole && <span className="text-xs font-black uppercase tracking-widest pr-2">Controls</span>}
            </button>

            {/* SIDEBAR */}
            <AnimatePresence>
              {showConsole && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => { if (window.innerWidth < 1024) setShowConsole(false); }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                  />
                  
                  <motion.aside
                    initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -400, opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                    className="fixed lg:relative left-0 top-0 bottom-0 z-[80] h-full w-[85%] sm:w-[50%] lg:w-[420px] shrink-0 p-6 lg:p-8 overflow-y-auto custom-scrollbar border-r border-white/5 bg-black/95 lg:bg-black/40 backdrop-blur-3xl shadow-2xl"
                  >
                    <div className="flex items-center gap-4 mb-10">
                       <div className="p-3 bg-accent-gold rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                          <Music className="w-6 h-6 text-black" />
                       </div>
                       <div className="flex flex-col">
                          <h1 className="text-xl font-black tracking-tighter text-accent-gold italic leading-none uppercase">BHAVANA <span className="text-white/40 not-italic">PRO</span></h1>
                          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 mt-1">Symmetry v4.0</span>
                       </div>
                    </div>

                    <ControlPanel 
                      {...{
                        volume, setVolume: setVol, reverb, setReverb: setRev,
                        sustain: sustainEffect, setSustain: setSustainEffect,
                        octaveOffset: octaveShift, setOctaveOffset: setOctaveShift,
                        labelMode, setLabelMode, selectedScale, setScale, rootNote, setRootNote,
                        songs: PRELOADED_SONGS,
                        beats: PRELOADED_BEATS,
                        isPlayingSong, currentSongId, songSpeed, 
                        onToggleSong: toggleSong,
                        onSongSelect: selectSong,
                        onSpeedSelect: setSongSpeed,
                        isPlayingBeat, currentBeatId, beatVolume,
                        onToggleBeat: toggleBeat,
                        onBeatSelect: selectBeat,
                        onBeatVolumeChange: setBeatVolume,
                        bgVolume, isBGActive,
                        onToggleBG: setIsBGActive,
                        onBGVolumeChange: setBGVolume,
                        selectedPreset,
                        onPresetSelect: (id: string) => setAudioParam('preset', id),
                        onSearchSongSelect: (url: string, name?: string, artist?: string) => {
                          setIsBGActive(true);
                          playBackgroundTrack(url, name, artist);
                        },
                        onStopBackground: stopBackgroundTrack,
                        onOpenExplorer: () => setIsSongsOpen(true),
                        isLoaded
                      }}
                    />
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* FULL SCREEN SONGS EXPLORER OVERLAY */}
            <AnimatePresence>
              {isSongsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[200] bg-[#0a0500] p-6 md:p-12 overflow-hidden flex flex-col"
                >
                  <div className="max-w-4xl mx-auto w-full h-full flex flex-col space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <button 
                             onClick={() => setIsSongsOpen(false)}
                             className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-accent-gold hover:text-black transition-all group"
                           >
                             <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                           </button>
                           <h1 className="text-3xl font-black italic uppercase tracking-tighter">JIOSAAVN <span className="text-accent-gold">STUDIO</span></h1>
                        </div>
                        <button 
                          onClick={() => setIsSongsOpen(false)}
                          className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all"
                        >
                          <X className="w-6 h-6" />
                        </button>
                     </div>

                     <div className="flex-1 bg-black/40 rounded-[32px] border border-white/5 p-8 overflow-hidden">
                        <SongSearch 
                          onSelectSong={(url, name, artist) => {
                            setIsBGActive(true);
                            playBackgroundTrack(url, name, artist);
                          }}
                          onStopSong={stopBackgroundTrack}
                        />
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#000]">
              {/* TOP BAR */}
              <header className="h-16 lg:h-20 shrink-0 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl z-[60]">
                <div className="flex items-center gap-6">
                   <button 
                     onClick={() => setShowConsole(!showConsole)}
                     className={cn(
                       "p-3 rounded-2xl transition-all border outline-none group bg-white/5 border-white/5 hover:border-accent-gold/40 text-white/60", 
                       showConsole && "bg-accent-gold text-black border-accent-gold"
                      )}
                   >
                     <LayoutPanelLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                   </button>
                   
                   <div className="hidden md:flex gap-6 items-center opacity-40 font-black text-[10px] uppercase tracking-widest text-white bg-white/5 px-6 py-2 rounded-full border border-white/5">
                      <span>OCT: <span className="text-accent-gold">{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</span></span>
                      <span>SCALE: <span className="text-accent-gold">{selectedScale}</span></span>
                      <span className={cn(isReady ? "text-green-500" : "text-yellow-500")}>[ {isReady ? "LIVE" : "LOADING"} ]</span>
                   </div>
                </div>

                {/* SARGAM TRACE (REAL-TIME HISTORY) */}
                <div className="hidden lg:flex flex-1 items-center justify-center px-12 overflow-hidden pointer-events-none">
                   <AnimatePresence initial={false}>
                       <div className="flex gap-4 items-center">
                           {activeNotes.slice(-8).map((note, idx) => (
                               <motion.div 
                                   key={`${note}-${idx}`}
                                   initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                   animate={{ opacity: 1, x: 0, scale: 1 }}
                                   className="px-4 py-1.5 glass rounded-xl border-accent-gold/20 text-accent-gold font-black text-sm italic shadow-lg"
                               >
                                   {/* Note name with octave indicators via display formatting */}
                                   {getSargamNote(Tone.Frequency(note).transpose(octaveShift * 12).toNote(), rootNote)}
                               </motion.div>
                           ))}
                       </div>
                   </AnimatePresence>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                       onClick={() => setIsMuted(!isMuted)}
                       className={cn(
                          "p-3 rounded-xl transition-all border outline-none",
                          isMuted ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-white/5 text-white/40 border-white/5"
                       )}
                    >
                       {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>
              </header>

              <main className="flex-1 flex flex-col min-h-0 relative">
                <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 min-h-0">
                    <motion.div 
                        className="w-full max-w-5xl aspect-video flex flex-col items-center justify-center relative touch-none pointer-events-none"
                        animate={{ scale: 1 + intensity * 0.002, rotateX: intensity * 0.1 }}
                    >
                        <Visualizer />
                    </motion.div>
                </div>

                {/* KEYBOARD BOTTOM */}
                <div className="shrink-0 w-full bg-black/60 border-t border-white/5 pb-6 lg:pb-16 pt-4 relative">
                    {/* QUICK ACCESS SARGAM PADS */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-8 px-4">
           {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'].map((noteName, idx) => {
              const label = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'][idx];
              const isActive = activeNotes.includes(noteName);
              return (
                <button
                  key={noteName}
                  onMouseDown={() => wrapPlayNote(noteName)}
                  onMouseUp={() => wrapStopNote(noteName)}
                  onTouchStart={(e) => { e.preventDefault(); wrapPlayNote(noteName); }}
                  onTouchEnd={(e) => { e.preventDefault(); wrapStopNote(noteName); }}
                  className={cn(
                    "flex-1 max-w-[80px] h-12 sm:h-20 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 border-t-[3px] sm:border-t-[5px] transition-all active:scale-95 shadow-2xl",
                    isActive 
                      ? "bg-accent-gold text-black border-yellow-200 brightness-125" 
                      : "bg-gradient-to-b from-[#4d3319] to-[#2b1d0e] border-[#8a5a2b] text-white/80 hover:brightness-110"
                  )}
                >
                  <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest opacity-40">{noteName.replace('4', '')}</span>
                  <span className="text-sm sm:text-2xl font-black uppercase tracking-tighter">{label}</span>
                </button>
              );
           })}
        </div>
        
        <Keyboard 
                       playNote={wrapPlayNote} stopNote={wrapStopNote} 
                       activeNotes={activeNotes} guideNotes={guideNotes}
                       labelMode={labelMode} selectedScale={selectedScale} rootNote={rootNote}
                       intensity={intensity}
                    />
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
