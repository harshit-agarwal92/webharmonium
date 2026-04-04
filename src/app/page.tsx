'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Keyboard } from '@/components/Keyboard';
import { ControlPanel } from '@/components/ControlPanel';
import { Visualizer } from '@/components/Visualizer';
import { SongSearch } from '@/components/SongSearch';
import { PRELOADED_SONGS } from '@/lib/songs';
import { PRELOADED_BEATS } from '@/lib/beats';
import { RADIX_NOTES } from '@/lib/constants';
import * as Tone from 'tone';
import { 
  Music, 
  Piano as PianoIcon, 
  Home, 
  Search,
  Settings,
  Headphones,
  Zap,
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  User,
  Pause,
  Maximize2,
  Settings2,
  Loader2,
  Library
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type ViewMode = 'home' | 'music' | 'harmonium';

interface SongEntry {
  name: string;
  artist: string;
  image: string;
  url: string;
  folder?: boolean;
}

const LOCAL_FILES: SongEntry[] = [
  { name: "Bairan", artist: "", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300", url: "/Bairan - NaaSongs.mp3" },
  { name: "Ishqa Ve", artist: "Zeeshan Ali", image: "https://c.saavncdn.com/393/Ishqa-Ve-Hindi-2023-20231013145450-500x500.jpg", url: "/Ishqa-Ve-Mp3-Song-by-Zeeshan-Ali(PagalWorldi.com.co).mp3" },
  { name: "Justin Bieber", artist: "", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=300", url: "/Justin Bieber - NaaSongs.mp3" },
  { name: "Khat", artist: "", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300", url: "/Khat - Khat (128 kbps).mp3" },
  { name: "Kitab", artist: "", image: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?auto=format&fit=crop&q=80&w=300", url: "/Kitab - NaaSongs.mp3" },
  { name: "Not Guilty", artist: "", image: "https://c.saavncdn.com/567/Not-Guilty-Haryanvi-2024-20240301131012-500x500.jpg", url: "/Not Guilty - NaaSongs.mp3" },
  { name: "Number Plate", artist: "", image: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=300", url: "/Number Plate - Refixed Beretta - NaaSongs.mp3" },
  { name: "Padhe Padhe", artist: "", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=300", url: "/Padhe Padhe (From \"Rakasa\") - NaaSongs.mp3" },
  { name: "Sheesha", artist: "", image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&q=80&w=300", url: "/Sheesha (Aakhya Mai Aakh Ghali Jo Bairan) - NaaSongs.mp3" },
  { name: "Khatole 2 (Exclusive)", artist: "", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=300", url: "/khatole/01 - khatole-2.mp3" }
];

export default function SurSyncAI() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [currentTrack, setCurrentTrack] = useState<SongEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Home Data states
  const [trending, setTrending] = useState<SongEntry[]>([]);
  const [hindiHits, setHindiHits] = useState<SongEntry[]>([]);
  const [ragas, setRagas] = useState<SongEntry[]>([]);
  const [loadingHome, setLoadingHome] = useState(false);

  const { 
    isLoaded, isReady, initAudio, playNote, stopNote, 
    setAudioParam, activeNotes, octaveOffset, sustain,
    playBeat, stopBeat, stopAll, playBackgroundTrack, stopBackgroundTrack,
    bgTime, bgDuration
  } = useAudioEngine();

  const [isStarted, setIsStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [volume, setVol] = useState(0.8);
  const [reverb, setRev] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [sustainEffect, setSustainEffect] = useState(false);
  const [octaveShift, setOctaveShift] = useState(0);

  const [labelMode, setLabelMode] = useState('sargam');
  const [selectedScale, setScale] = useState('Chromatic');
  const [rootNote, setRootNote] = useState('C');
  const [showConsole, setShowConsole] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('classic');

  const [currentSongId, setCurrentSongId] = useState(PRELOADED_SONGS[0].id);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [songSpeed, setSongSpeed] = useState(1);
  const [guideNotes, setGuideNotes] = useState<string[]>([]);
  
  const [isBGActive, setIsBGActive] = useState(false);
  const [bgVolume, setBGVolume] = useState(0.5);
  const [isRepeat, setIsRepeat] = useState(true);
  const [searchResults, setSearchResults] = useState<SongEntry[]>([]);
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [currentBeatId, setCurrentBeatId] = useState(PRELOADED_BEATS[0].id);
  const [beatVolume, setBeatVolume] = useState(0.5);

  useEffect(() => { 
    setIsMounted(true); 
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoadingHome(true);
    try {
      const fetchSection = async (q: string) => {
        const res = await fetch(`/api/songs?query=${encodeURIComponent(q)}`);
        const data = await res.json();
        return data.results || [];
      };

      const [tr, hi, rg] = await Promise.all([
        fetchSection('@trending'),
        fetchSection('Top Hindi Hits'),
        fetchSection('Raag Harmonium Classical')
      ]);

      setTrending(tr.slice(0, 8));
      setHindiHits(hi.slice(0, 10));
      setRagas(rg.slice(0, 10));
    } catch (e) {
      console.error("Home fetch failed:", e);
    } finally {
      setLoadingHome(false);
    }
  };

  const handleStart = async (targetView: ViewMode) => {
    if (!isStarted) {
      setIsInitializing(true);
      await initAudio();
      setIsStarted(true);
      setIsInitializing(false);
    }
    setViewMode(targetView);
  };

  const wrapPlayNote = useCallback((noteName: string, time?: number) => {
    if (!isStarted || !isReady || isMuted) return;
    const currentRootIdx = RADIX_NOTES.indexOf(rootNote);
    const transposedNote = Tone.Frequency(noteName).transpose(currentRootIdx).toNote();
    playNote(transposedNote, 0.8, time);
    
    if (!time) {
        setIntensity(prev => Math.min(prev + 12, 30));
        setTimeout(() => setIntensity(prev => Math.max(0, prev - 6)), 200);
    }
  }, [playNote, isStarted, isReady, isMuted, rootNote]);

  const wrapStopNote = useCallback((noteName: string, time?: number) => {
    const currentRootIdx = RADIX_NOTES.indexOf(rootNote);
    const transposedNote = Tone.Frequency(noteName).transpose(currentRootIdx).toNote();
    stopNote(transposedNote, time);
  }, [stopNote, rootNote]);

  useEffect(() => {
    setAudioParam('volume', isMuted ? 0 : volume);
    setAudioParam('reverb', reverb);
    setAudioParam('octave', octaveShift);
    setAudioParam('sustain', sustainEffect);
    setAudioParam('preset', selectedPreset);
    setAudioParam('beatVolume', isMuted ? 0 : beatVolume);
    setAudioParam('bgVolume', (isMuted || !isBGActive) ? 0 : bgVolume);
    setAudioParam('bgRepeat', isRepeat);
  }, [volume, reverb, octaveShift, sustainEffect, selectedPreset, isMuted, beatVolume, bgVolume, isBGActive, isRepeat, setAudioParam]);

  const findActiveList = (): SongEntry[] => {
    if (LOCAL_FILES.find((s: SongEntry) => s.url === currentTrack?.url)) return LOCAL_FILES;
    if (searchResults.find((s: SongEntry) => s.url === currentTrack?.url)) return searchResults;
    if (trending.find((s: SongEntry) => s.url === currentTrack?.url)) return trending;
    if (hindiHits.find((s: SongEntry) => s.url === currentTrack?.url)) return hindiHits;
    if (ragas.find((s: SongEntry) => s.url === currentTrack?.url)) return ragas;
    return [];
  };

  const handleNext = () => {
    const list = findActiveList();
    if (list.length === 0) return;
    const idx = list.findIndex((s: SongEntry) => s.url === currentTrack?.url);
    const nextIdx = (idx + 1) % list.length;
    const nextSong = list[nextIdx];
    playBackgroundTrack(nextSong.url, nextSong.name, nextSong.artist, setIsBGActive);
    setCurrentTrack(nextSong);
  };

  const handlePrev = () => {
    const list = findActiveList();
    if (list.length === 0) return;
    const idx = list.findIndex((s: SongEntry) => s.url === currentTrack?.url);
    const prevIdx = (idx - 1 + list.length) % list.length;
    const prevSong = list[prevIdx];
    playBackgroundTrack(prevSong.url, prevSong.name, prevSong.artist, setIsBGActive);
    setCurrentTrack(prevSong);
  };

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'harmonium', label: 'Harmonium', icon: PianoIcon },
  ];

  return (
    <div className="w-screen h-screen flex bg-black text-white font-sans overflow-hidden selection:bg-spotify-green/30">
      
      {/* SIDEBAR */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col bg-black h-full pt-8 border-r border-white/5 pb-10">
        <div className="px-6 mb-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-spotify-green rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(29,185,84,0.4)]">
             <Zap className="w-6 h-6 text-black fill-current" />
          </div>
          <span className="text-2xl font-black font-poppins tracking-tighter uppercase whitespace-nowrap">SurSync <span className="text-spotify-green text-xs align-top">AI</span></span>
        </div>

        <nav className="flex flex-col gap-2 px-3">
          {navLinks.map((link) => (
            <button
               key={link.id}
               onClick={() => isStarted ? setViewMode(link.id as ViewMode) : (link.id !== 'home' ? handleStart(link.id as ViewMode) : setViewMode('home'))}
               className={cn(
                 "nav-link text-lg",
                 viewMode === link.id && "nav-link-active bg-white/[0.08] active-nav-glow"
               )}
            >
               <link.icon className={cn("w-6 h-6", viewMode === link.id ? "text-spotify-green" : "text-white/40")} />
               <span className="text-sm font-bold">{link.label}</span>
               {viewMode === link.id && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-3/5 bg-spotify-green rounded-r-full shadow-[0_0_10px_rgba(29,185,84,0.8)]" />
               )}
            </button>
          ))}
        </nav>

        <div className="mt-12 px-7 space-y-6 flex-1">
           <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/20">Studio Environment</span>
              <button onClick={() => setShowConsole(!showConsole)} className="nav-link w-full text-xs font-bold py-2"><Settings2 className="w-5 h-5 mr-4" /> Config</button>
              <button disabled className="nav-link w-full text-xs font-bold py-2 opacity-30"><Library className="w-5 h-5 mr-4" /> My Library</button>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#121212] via-black to-black overflow-y-auto custom-scrollbar relative pb-[110px]">
        
        {/* HEADER */}
        <header className="h-[72px] shrink-0 px-8 flex items-center justify-between sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
           <div className="flex items-center gap-6">
              <div className={cn("hidden md:flex items-center bg-white/10 rounded-full px-5 py-2.5 w-[420px] border border-white/5 group focus-within:border-spotify-green/40 focus-within:bg-white/15 transition-all shadow-inner", viewMode !== 'music' && "opacity-40")}>
                 <Search className="w-5 h-5 text-white/40 group-focus-within:text-spotify-green" />
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => {
                       setSearchQuery(e.target.value);
                       if (viewMode !== 'music') setViewMode('music');
                    }}
                    placeholder="Search JioSaavn for harmonium tracks..." 
                    className="bg-transparent border-none outline-none flex-1 ml-4 text-sm font-bold placeholder-white/20"
                 />
              </div>
           </div>

           <div className="flex items-center gap-5">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={cn("p-2.5 rounded-full hover:bg-white/10 transition-all bg-white/5 border border-white/5 shadow-xl", isMuted ? "text-red-500" : "text-white/40 hover:text-white")}
              >
                 {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 hover:scale-105 transition-all text-white/40 hover:text-white">
                 <User className="w-6 h-6" />
              </div>
           </div>
        </header>

        <div className="p-8 lg:p-12 min-h-full">
          <AnimatePresence mode="wait">
            {viewMode === 'home' && (
              <motion.div key="home-full" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16">
                <div>
                   <h1 className="text-6xl font-black font-poppins tracking-tighter mb-12 uppercase leading-none">Sonic <span className="text-spotify-green">Live</span></h1>
                   
                   {loadingHome ? (
                      <div className="flex items-center gap-4 py-8 opacity-40">
                         <Loader2 className="w-6 h-6 animate-spin text-spotify-green" />
                         <span className="text-xs font-black uppercase tracking-widest">Hydrating Studio Data...</span>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {trending.slice(0, 8).map((song, i) => (
                          <div 
                             key={'grid'+i} 
                             className="flex items-center gap-4 bg-white/[0.04] rounded-xl overflow-hidden group cursor-pointer hover:bg-white/[0.1] transition-all border border-white/5"
                             onClick={() => {
                               playBackgroundTrack(song.url!, song.name, 'Studio Track', setIsBGActive);
                               setCurrentTrack(song);
                             }}
                          >
                             <img src={song.image} alt="" className="w-20 h-20 object-cover shadow-2xl border-r border-white/5" />
                             <div className="flex-1 min-w-0 pr-2">
                                <span className="block font-black text-[12px] truncate uppercase tracking-tighter leading-tight">{song.name}</span>
                                <span className="block text-[8px] text-white/30 uppercase font-bold tracking-widest mt-1">Trending Hit</span>
                             </div>
                             <div className="p-3 bg-spotify-green rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-110 mr-4">
                                <Play className="w-4 h-4 fill-current text-black" />
                             </div>
                          </div>
                        ))}
                      </div>
                   )}
                </div>

                <SpotifySection 
                  title="🎧 Studio Vault" 
                  compact={true}
                  items={LOCAL_FILES} 
                  onPlay={(item) => {
                     playBackgroundTrack(item.url, item.name, item.artist, setIsBGActive);
                     setCurrentTrack(item);
                  }}
                />

                <SpotifySection 
                  title="🔥 Trending Now (JioSaavn Live)" 
                  items={trending} 
                  onPlay={(item) => {
                     playBackgroundTrack(item.url, item.name, item.artist, setIsBGActive);
                     setCurrentTrack(item);
                  }}
                />

                <SpotifySection 
                  title="🇮🇳 Bollywood Masterclass" 
                  items={hindiHits} 
                  onPlay={(item) => {
                     playBackgroundTrack(item.url, item.name, item.artist, setIsBGActive);
                     setCurrentTrack(item);
                  }}
                />

                <SpotifySection 
                  title="🎹 Harmonium Ragas & Classical" 
                  items={ragas} 
                  onPlay={(item) => {
                     playBackgroundTrack(item.url, item.name, item.artist, setIsBGActive);
                     setCurrentTrack(item);
                  }}
                />
              </motion.div>
            )}

            {viewMode === 'music' && (
              <motion.div key="music-full" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-12 h-screen flex flex-col -mt-4 pb-20">
                 <div className="flex flex-col gap-2">
                    <h1 className="text-8xl font-black tracking-tighter font-poppins uppercase leading-none">Studio <span className="text-spotify-green">Live</span></h1>
                    <span className="text-spotify-text-secondary text-[11px] font-black uppercase tracking-[0.5em] mt-6 px-1 border-l-4 border-spotify-green">JioSaavn Enterprise Stream v5.2</span>
                 </div>
                 
                 <div className="flex-1 min-h-0 bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl overflow-hidden shadow-3xl">
                    <SongSearch 
                       query={searchQuery}
                       onResultsUpdate={(results) => setSearchResults(results.map((r: any) => ({ name: r.name, artist: r.artist, image: r.image, url: r.url })))}
                       onSelectSong={(url, name, artist, img) => {
                         playBackgroundTrack(url, name, artist, setIsBGActive);
                         setCurrentTrack({
                           name: name || 'Studio Track',
                           artist: artist || 'Premium Artist',
                           image: img || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200',
                           url: url
                         });
                       }}
                       isBGActive={isBGActive}
                       setIsBGActive={setIsBGActive}
                    />
                 </div>
              </motion.div>
            )}

            {viewMode === 'harmonium' && (
              <motion.div key="harmonium-full" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col h-full bg-black rounded-[48px] overflow-hidden border border-white/5">
                 <div className="flex-1 flex flex-col items-center justify-center relative p-12">
                    <div className="absolute top-12 left-12 flex flex-col gap-4">
                       <h2 className="text-5xl font-black font-poppins uppercase tracking-tighter">Harmonium <span className="text-spotify-green">Engine</span></h2>
                       <div className="flex items-center gap-4 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                          <span className="bg-white/5 px-4 py-2 rounded-full border border-spotify-green/20">LIVE STUDIO v5</span>
                          <span>REG: {octaveShift === 0 ? 'MID' : 'SHIFTED'}</span>
                       </div>
                    </div>
                    <div className="w-full max-w-5xl aspect-video relative">
                       <Visualizer />
                    </div>
                 </div>
                 <div className="shrink-0 bg-black/40 border-t border-white/5 py-16 px-12 backdrop-blur-3xl">
                    <Keyboard 
                       playNote={wrapPlayNote} stopNote={wrapStopNote} 
                       activeNotes={activeNotes} guideNotes={guideNotes}
                       labelMode={labelMode} selectedScale={selectedScale} rootNote={rootNote}
                       intensity={intensity}
                    />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* PLAYER BAR */}
      <footer className="player-bar h-[110px] shrink-0 flex items-center justify-between px-8 z-[150] fixed bottom-0 w-full bg-[#000] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
         <div className="flex items-center gap-5 w-[30%]">
            {currentTrack && (
               <>
                  <div className="w-20 h-20 rounded-[12px] overflow-hidden shadow-2xl border border-white/10 group">
                     <img src={currentTrack.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-md font-black font-poppins truncate hover:text-spotify-green cursor-pointer uppercase tracking-tighter">{currentTrack.name}</span>
                     <span className="text-[10px] text-spotify-text-secondary truncate font-bold uppercase tracking-widest mt-2">{currentTrack.artist}</span>
                  </div>
               </>
            )}
         </div>

         <div className="flex flex-col items-center gap-2 max-w-[40%] flex-1">
            <div className="flex items-center gap-10">
               <Shuffle className="w-4 h-4 text-spotify-text-secondary hover:text-spotify-green transition-all cursor-pointer opacity-40 shrink-0" />
               <SkipBack 
                  onClick={handlePrev}
                  className="w-5 h-5 text-white/60 hover:text-white transition-all cursor-pointer fill-current shrink-0 active:scale-90" 
               />
               <button 
                  onClick={() => {
                     // Force logic for play/pause if state doesn't match
                     if (isBGActive) {
                        stopBackgroundTrack();
                        setIsBGActive(false);
                     } else if (currentTrack) {
                        playBackgroundTrack(currentTrack.url, currentTrack.name, currentTrack.artist, setIsBGActive);
                        setIsBGActive(true);
                     }
                  }}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(29,185,84,0.3)] shrink-0"
               >
                  {isBGActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 translate-x-[2px] fill-current" />}
               </button>
               <SkipForward 
                  onClick={handleNext}
                  className="w-5 h-5 text-white/60 hover:text-white transition-all cursor-pointer fill-current shrink-0 active:scale-90" 
               />
               <Repeat className="w-4 h-4 text-spotify-text-secondary hover:text-spotify-green transition-all cursor-pointer opacity-40 shrink-0" />
            </div>
            <div className="flex items-center gap-3 w-full max-w-xl group">
               <span className="text-[10px] text-spotify-text-secondary w-10 text-right font-mono pr-2">
                 {Math.floor(bgTime / 60)}:{Math.floor(bgTime % 60).toString().padStart(2, '0')}
               </span>
               <div className="flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer overflow-hidden group-hover:h-2 transition-all">
                  <div 
                    className="absolute left-0 top-0 h-full bg-spotify-green transition-all group-hover:bg-spotify-green/80" 
                    style={{ width: `${(bgTime / (bgDuration || 1)) * 100}%` }} 
                  />
               </div>
               <span className="text-[10px] text-spotify-text-secondary w-10 font-mono">
                 {Math.floor(bgDuration / 60)}:{Math.floor(bgDuration % 60).toString().padStart(2, '0')}
               </span>
            </div>
         </div>

         <div className="flex items-center gap-8 justify-end w-[30%]">
            <div className="flex items-center gap-4 w-44 group">
               <Volume2 className="w-5 h-5 text-spotify-text-secondary group-hover:text-white" />
               <div className="flex-1 h-[4px] bg-white/10 rounded-full relative group cursor-pointer overflow-hidden group-hover:h-1.5 transition-all">
                  <div className="absolute left-0 top-0 h-full bg-spotify-green" style={{ width: `${bgVolume * 100}%` }} />
                  <input 
                    type="range" min="0" max="1" step="0.01" value={bgVolume} 
                    onChange={(e) => {
                       const v = parseFloat(e.target.value);
                       setBGVolume(v);
                       setAudioParam('bgVolume', v);
                    }} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
               </div>
            </div>
         </div>
      </footer>

      {/* SETTINGS DRAWER OVERLAY */}
      <AnimatePresence>
        {showConsole && (
          <motion.aside
            initial={{ x: 450, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 450, opacity: 0 }}
            className="fixed right-6 top-6 bottom-[130px] w-[420px] z-[120] bg-[#121212] border border-white/10 rounded-[32px] p-10 shadow-3xl overflow-y-auto custom-scrollbar backdrop-blur-3xl"
          >
            <div className="flex items-center justify-between mb-12">
               <h3 className="text-2xl font-black flex items-center gap-4 uppercase tracking-tighter"><Settings className="w-6 h-6 text-spotify-green" /> Studio Config</h3>
               <button onClick={() => setShowConsole(false)} className="text-[10px] font-black uppercase text-white/20 hover:text-white">Close</button>
            </div>
            <ControlPanel {...{
                volume, setVolume: setVol, reverb, setReverb: setRev, sustain: sustainEffect, setSustain: setSustainEffect,
                octaveOffset: octaveShift, setOctaveOffset: setOctaveShift, labelMode, setLabelMode, selectedScale, setScale, rootNote, setRootNote,
                songs: PRELOADED_SONGS, 
                beats: PRELOADED_BEATS, 
                isPlayingSong, currentSongId, songSpeed, 
                onToggleSong: () => {}, 
                onSongSelect: setCurrentSongId, 
                onSpeedSelect: setSongSpeed, 
                isPlayingBeat, 
                currentBeatId, 
                beatVolume, 
                onToggleBeat: (id: string) => {
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
                }, 
                onBeatSelect: (id: string) => {
                  setCurrentBeatId(id);
                  if (isPlayingBeat) {
                    const beat = PRELOADED_BEATS.find(b => b.id === id);
                    if (beat) playBeat(beat.url);
                  }
                }, 
                onBeatVolumeChange: setBeatVolume,
                bgVolume, 
                isBGActive, 
                onToggleBG: setIsBGActive, 
                onBGVolumeChange: setBGVolume, 
                isRepeat,
                onToggleRepeat: setIsRepeat,
                selectedPreset, 
                onPresetSelect: (id: string) => setAudioParam('preset', id), 
                isLoaded
            }} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpotifySection({ title, items, onPlay, compact = false }: { title: string, items: any[], onPlay: (item: any) => void, compact?: boolean }) {
   return (
      <section className={cn("animate-fade-in", compact ? "space-y-4" : "space-y-8")}>
         <div className={cn("flex items-center justify-between border-b border-white/5", compact ? "pb-3" : "pb-6")}>
            <h2 className={cn("font-black font-poppins uppercase tracking-tighter text-white/40", compact ? "text-xl" : "text-3xl")}>{title}</h2>
            <span className="text-[9px] font-black text-spotify-text-secondary uppercase tracking-[0.2em] hover:text-spotify-green cursor-pointer">Live Fetch →</span>
         </div>
         <div className={cn("flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x", compact ? "h-[220px]" : "h-[300px]")}>
            {items.map((item, i) => (
               <div key={i} className={cn("shrink-0 spotify-card p-4 group cursor-pointer border border-white/5", compact ? "w-[150px]" : "w-[200px]")} onClick={() => onPlay(item)}>
                  <div className="relative aspect-square mb-4 shadow-2xl rounded-xl overflow-hidden border border-white/5">
                     <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className={cn("absolute right-3 bottom-3 p-3 bg-spotify-green rounded-full shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500", compact ? "p-2" : "p-4")}>
                        <Play className={cn("fill-current text-black", compact ? "w-4 h-4" : "w-6 h-6")} />
                     </div>
                  </div>
                  <h4 className={cn("font-black truncate leading-none uppercase tracking-tighter", compact ? "text-[11px]" : "text-[13px]")}>{item.name}</h4>
                  <p className="text-[9px] text-spotify-text-secondary mt-2 truncate font-bold uppercase tracking-widest">{item.artist}</p>
               </div>
            ))}
         </div>
      </section>
   );
}
