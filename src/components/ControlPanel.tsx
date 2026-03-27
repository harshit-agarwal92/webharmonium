'use client';

import { 
  Volume2, 
  Wind, 
  Infinity as InfinityIcon, 
  Music,
  Minus,
  Plus,
  Play,
  Square,
  Zap,
  Activity,
  History,
  FastForward
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCALES, RADIX_NOTES } from '@/lib/constants';
interface ControlPanelProps {
  volume: number; setVolume: (v: number) => void;
  reverb: number; setReverb: (v: number) => void;
  sustain: boolean; setSustain: (b: boolean) => void;
  octaveOffset: number; setOctaveOffset: (v: number) => void;
  labelMode: string; setLabelMode: (v: string) => void;
  selectedScale: string; setScale: (v: string) => void;
  rootNote: string; setRootNote: (v: string) => void;
  
  // Data Props
  songs: any[];
  beats: any[];

  // Song Mode Props
  isPlayingSong: boolean;
  currentSongId: string;
  songSpeed: number;
  onToggleSong: () => void;
  onSongSelect: (id: string) => void;
  onSpeedSelect: (speed: number) => void;

  // Beat Mode Props
  isPlayingBeat: boolean;
  currentBeatId: string;
  beatVolume: number;
  onToggleBeat: () => void;
  onBeatSelect: (id: string) => void;
  onBeatVolumeChange: (vol: number) => void;

  // Background Props
  bgVolume: number;
  isBGActive: boolean;
  onToggleBG: (active: boolean) => void;
  onBGVolumeChange: (vol: number) => void;

  isLoaded: boolean;
}

export function ControlPanel(props: ControlPanelProps) {
  const {
    volume, setVolume, reverb, setReverb,
    sustain, setSustain, octaveOffset, setOctaveOffset,
    labelMode, setLabelMode, selectedScale, setScale,
    rootNote, setRootNote,
    songs, beats,
    isPlayingSong, currentSongId, songSpeed, onToggleSong, onSongSelect, onSpeedSelect,
    isPlayingBeat, currentBeatId, beatVolume, onToggleBeat, onBeatSelect, onBeatVolumeChange,
    bgVolume, isBGActive, onToggleBG, onBGVolumeChange,
    isLoaded
  } = props;

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      
      {/* SONG MODE MODULE */}
      <ModuleBox 
        title="SONG MODE & LEARNING" 
        icon={<Music className="w-4 h-4" />} 
        className={cn("border-accent-gold/10 transition-all duration-500", isPlayingSong && "border-accent-gold/60 shadow-[0_0_40px_-10px_rgba(212,175,55,0.3)] bg-accent-gold/[0.04] animate-pulse-slow")}
      >
        <div className="flex flex-col gap-4">
           {isPlayingSong && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-gold/10 rounded-full w-fit">
               <div className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping" />
               <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">Playing: {songs.find(s => s.id === currentSongId)?.name}</span>
             </div>
           )}
           <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-black text-white/20 tracking-widest pl-1">Select Song</span>
              <select 
                value={currentSongId} 
                onChange={(e) => onSongSelect(e.target.value)} 
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-[12px] font-black outline-none appearance-none text-accent-gold cursor-pointer hover:border-accent-gold/40 transition-colors"
              >
                 {songs.map(s => <option key={s.id} value={s.id} className="bg-[#111]">{s.name}</option>)}
              </select>
           </div>

           {/* Background Track Controls */}
           <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Background Track</span>
                 <button 
                  onClick={() => onToggleBG?.(!isBGActive)}
                  className={cn("px-3 py-1 rounded-full text-[9px] font-black transition-all", isBGActive ? "bg-accent-gold text-black" : "bg-white/10 text-white/40")}
                 >
                    {isBGActive ? "ON" : "OFF"}
                 </button>
              </div>
              <KnobControl label="BG VOL" value={bgVolume} onChange={onBGVolumeChange} min={0} max={1.0} />
           </div>

           <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                 <span className="text-[10px] uppercase font-black text-white/20 tracking-widest pl-1">Speed</span>
                 <div className="flex gap-1">
                    {[0.5, 1, 1.5].map(s => (
                      <button 
                        key={s} 
                        onClick={() => onSpeedSelect(s)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-black border transition-all",
                          songSpeed === s ? "bg-accent-gold text-black border-accent-gold" : "bg-white/5 border-white/5 text-white/40"
                        )}
                      >
                         {s}x
                      </button>
                    ))}
                 </div>
              </div>
              
              <button 
                onClick={onToggleSong}
                disabled={!isLoaded}
                className={cn(
                  "flex-[1.5] rounded-2xl font-black uppercase tracking-widest text-xs border transition-all flex items-center justify-center gap-3 shadow-xl",
                  isPlayingSong ? "bg-red-500 text-white border-red-400" : "bg-accent-gold text-black border-accent-gold",
                  !isLoaded && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                {isPlayingSong ? <Square className="w-4 h-4 fill-current" /> : (isLoaded ? <Play className="w-4 h-4 fill-current" /> : <Zap className="w-4 h-4 animate-pulse" />)}
                {isPlayingSong ? "STOP" : (isLoaded ? "AUTO PLAY" : "LOADING...")}
              </button>
           </div>
        </div>
      </ModuleBox>

      {/* AUDIO ENGINE CONTROLS */}
      <ModuleBox title="MASTER AUDIO" icon={<Activity className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
           <KnobControl label="VOLUME" value={volume} onChange={setVolume} min={0} max={1.5} />
           <KnobControl label="REVERB" value={reverb} onChange={setReverb} min={0} max={1.0} />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-6">
          <ControlToggle active={sustain} onClick={() => setSustain(!sustain)} icon={<InfinityIcon className="w-4 h-4" />} label="SUSTAIN" />
          <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 border border-white/5">
             <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Global Register</span>
             <div className="flex gap-1 w-full">
                {[-1, 0, 1].map(o => (
                  <button 
                    key={o} 
                    onClick={() => setOctaveOffset(o)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase tracking-tighter",
                      octaveOffset === o ? "bg-accent-gold text-black border-accent-gold" : "bg-white/5 border-white/5 text-white/40"
                    )}
                  >
                    {o === -1 ? 'Low' : o === 0 ? 'Mid' : 'High'}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </ModuleBox>

      {/* RHYTHM & TAAL MODULE */}
      <ModuleBox 
        title="RHYTHM & TAAL" 
        icon={<History className="w-4 h-4" />} 
        className={cn("border-indigo-500/10 transition-all duration-500", isPlayingBeat && "border-indigo-500/60 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] bg-indigo-500/[0.04] animate-pulse-slow")}
      >
        <div className="flex flex-col gap-4">
           {isPlayingBeat && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-full w-fit">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active: {beats.find(b => b.id === currentBeatId)?.name}</span>
             </div>
           )}
           <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-black text-white/20 tracking-widest pl-1">Select Taal</span>
              <select 
                value={currentBeatId} 
                onChange={(e) => onBeatSelect(e.target.value)} 
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-[12px] font-black outline-none appearance-none text-indigo-400 cursor-pointer hover:border-indigo-500/40 transition-colors"
              >
                 <option value="" className="bg-[#111]">No Beat</option>
                 {beats.map(b => <option key={b.id} value={b.id} className="bg-[#111]">{b.name}</option>)}
              </select>
           </div>

           <div className="flex gap-3">
              <div className="flex-1">
                 <KnobControl label="BEAT VOL" value={beatVolume} onChange={onBeatVolumeChange} min={0} max={1.5} />
              </div>
              
              <button 
                onClick={onToggleBeat}
                className={cn(
                  "flex-1 rounded-2xl font-black uppercase tracking-widest text-xs border transition-all flex items-center justify-center gap-3 shadow-xl",
                  isPlayingBeat ? "bg-indigo-600 text-white border-indigo-400" : "bg-white/10 text-white border-white/20"
                )}
              >
                {isPlayingBeat ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isPlayingBeat ? "STOP" : "START BEAT"}
              </button>
           </div>
        </div>
      </ModuleBox>

      {/* EXPRESSION & THEORY */}
      <ModuleBox title="NOTATION & SCALE" icon={<Zap className="w-4 h-4" />}>
        <div className="flex flex-col gap-4">
           <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-white/20 tracking-widest pl-1">ROOT</span>
                <select value={rootNote} onChange={(e) => setRootNote(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-[11px] font-black outline-none appearance-none text-accent-gold">
                   {RADIX_NOTES.map(n => <option key={n} value={n} className="bg-[#111]">{n}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-white/20 tracking-widest pl-1">SCALE</span>
                <select value={selectedScale} onChange={(e) => setScale(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-[11px] font-black outline-none appearance-none truncate">
                   {SCALES.map(s => <option key={s.name} value={s.name} className="bg-[#111]">{s.name}</option>)}
                </select>
              </div>
           </div>

           <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Notation</span>
              <div className="flex gap-1">
                 {['sargam', 'western', 'none'].map(mode => (
                    <button 
                       key={mode} 
                       onClick={() => setLabelMode(mode)}
                       className={cn(
                         "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                         labelMode === mode ? "bg-accent-gold text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
                       )}
                    >
                       {mode === 'sargam' ? 'SRG' : mode === 'western' ? 'CDE' : 'Off'}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </ModuleBox>

      {/* INDIAN MUSIC THEORY GUIDE */}
      <ModuleBox title="INDIAN MUSIC THEORY" icon={<Zap className="w-4 h-4" />} className="border-orange-500/20">
        <div className="flex flex-col gap-4 text-[10px] leading-relaxed text-white/50 font-medium">
           <div className="space-y-1">
             <p className="text-accent-gold font-black uppercase text-[8px] tracking-widest">The 12 Swaras</p>
             <p>The system uses 7 <span className="text-white/80">Shuddh</span> (Natural) notes: Sa, Re, Ga, Ma, Pa, Dha, Ni.</p>
           </div>
           <div className="space-y-1">
             <p className="text-accent-gold font-black uppercase text-[8px] tracking-widest">Variations</p>
             <p><span className="text-indigo-400">Komal</span> (Flat): Lowered Re, Ga, Dha, Ni.</p>
             <p><span className="text-red-400">Tivra</span> (Sharp): Raised Ma (Ma#).</p>
           </div>
           <div className="space-y-1">
             <p className="text-accent-gold font-black uppercase text-[8px] tracking-widest">Octaves (Saptak)</p>
             <p><span className="text-white/80">Mandra:</span> Low register (suffixed .)</p>
             <p><span className="text-white/80">Madhya:</span> Middle register (normal)</p>
             <p><span className="text-white/80">Taar:</span> High register (suffixed ')</p>
           </div>
           <div className="pt-2 border-t border-white/5">
             <p className="italic underline underline-offset-4 decoration-accent-gold/40">"Practice Alankars (patterns) to master finger movement."</p>
           </div>
        </div>
      </ModuleBox>

      {/* DETAILED HARMONIUM NOTES REFERENCE */}
      <ModuleBox title="HARMONIUM NOTES" icon={<Music className="w-4 h-4" />} className="border-accent-gold/20">
        <div className="flex flex-col gap-5 text-[10px] font-medium text-white/40">
           
           <div className="space-y-2">
             <p className="text-white/80 font-black tracking-widest border-b border-white/5 pb-1">1. BASIC ALANKARS</p>
             <div className="bg-black/40 p-3 rounded-xl space-y-2 font-mono text-[9px] leading-loose">
                <p><span className="text-accent-gold">Up:</span> Sa Re Ga Ma Pa Dha Ni Sa'</p>
                <p><span className="text-accent-gold">Down:</span> Sa' Ni Dha Pa Ma Ga Re Sa</p>
                <p className="pt-1 opacity-60 border-t border-white/5"><span className="text-accent-gold">Jod:</span> SaSa ReRe GaGa MaMa PaPa DhaDha NiNi Sa'Sa'</p>
             </div>
           </div>

           <div className="space-y-2">
             <p className="text-white/80 font-black tracking-widest border-b border-white/5 pb-1">2. RAGA SWARAS</p>
             <div className="bg-black/40 p-3 rounded-xl space-y-3">
                <div>
                   <p className="text-indigo-400 text-[8px] uppercase font-black tracking-wide mb-1">Yaman (Evening)</p>
                   <p className="font-mono text-white/60">Ni Re Ga <span className="text-red-400">Ma#</span> Pa Dha Ni Sa'</p>
                </div>
                <div className="pt-2 border-t border-white/5">
                   <p className="text-orange-400 text-[8px] uppercase font-black tracking-wide mb-1">Bhairavi (Morning)</p>
                   <p className="font-mono text-white/60">Sa <span className="text-indigo-400">re ga</span> Ma Pa <span className="text-indigo-400">dha ni</span> Sa'</p>
                </div>
             </div>
           </div>

           <div className="space-y-2">
             <p className="text-white/80 font-black tracking-widest border-b border-white/5 pb-1">3. BHAJANS & TUNES</p>
             <div className="bg-black/40 p-3 rounded-xl space-y-2 font-mono text-[9px] leading-loose">
                <p className="text-accent-gold/80 italic text-[8px]">Arz Kiya Hai (Anuv Jain)</p>
                <p className="text-white/40 italic text-[7px]">"Kaayar jo the woh shaayar bane"</p>
                <p className="text-white/60">P D P G G G G m G R R</p>
                <p className="pt-2 text-accent-gold/80 italic text-[8px]">Om Jai Jagdish Hare (Start)</p>
                <p className="text-white/60">Sa Sa Sa Re Ga Re Sa Re Ga Ma...</p>
                <p className="pt-2 text-accent-gold/80 italic text-[8px]">National Anthem (Start)</p>
                <p className="text-white/60">Sa Re Ga Ma Pa Pa Pa Pa Pa Dha...</p>
             </div>
           </div>

           <div className="mt-2 p-3 bg-accent-gold/5 rounded-xl border border-accent-gold/10">
              <p className="text-[9px] text-accent-gold italic leading-normal">"Use these notes as a guide. Start slow, then increase speed as you gain confidence."</p>
           </div>
        </div>
      </ModuleBox>

    </div>
  );
}

function ModuleBox({ title, icon, children, className }: any) {
    return (
        <div className={cn("glass rounded-3xl p-6 border border-white/[0.05] shadow-2xl relative group overflow-hidden", className)}>
            <div className="absolute inset-0 bg-accent-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 opacity-40 group-hover:opacity-60 transition-opacity">
                {icon}
                <span className="text-[10px] uppercase font-black tracking-[0.3em]">{title}</span>
            </div>
            {children}
        </div>
    );
}

function KnobControl({ label, value, onChange, min, max }: any) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-row items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
      <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{label}</span>
      <div className="flex items-center gap-4">
        <input 
           type="range" min={min} max={max} step={0.01} value={value} 
           onChange={(e) => onChange(parseFloat(e.target.value))} 
           className="w-24 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent-gold"
        />
        <span className="text-[10px] font-mono text-accent-gold w-8 text-right">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

function ControlToggle({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 w-full group shadow-lg",
        active 
          ? "bg-accent-gold text-black border-accent-gold scale-[1.02]" 
          : "bg-white/[0.03] border-white/10 text-white/40 hover:bg-white/[0.08]"
      )}
    >
      <div className={cn("p-1.5 rounded-xl", active ? "bg-black/10" : "bg-white/5")}>{icon}</div>
      <span className="font-black uppercase tracking-widest text-[10px]">{label}</span>
    </button>
  );
}
