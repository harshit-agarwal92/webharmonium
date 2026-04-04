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
  Settings2,
  Sliders,
  Repeat,
  Headphones,
  FastForward,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCALES, RADIX_NOTES, PRESETS_LIST } from '@/lib/constants';
import { motion } from 'framer-motion';

interface ControlPanelProps {
  volume: number; setVolume: (v: number) => void;
  reverb: number; setReverb: (v: number) => void;
  sustain: boolean; setSustain: (b: boolean) => void;
  octaveOffset: number; setOctaveOffset: (v: number) => void;
  labelMode: string; setLabelMode: (v: string) => void;
  selectedScale: string; setScale: (v: string) => void;
  rootNote: string; setRootNote: (v: string) => void;
  
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
  onToggleBeat: (id: string) => void;
  onBeatSelect: (id: string) => void;
  onBeatVolumeChange: (vol: number) => void;

  // Background Props
  bgVolume: number;
  isBGActive: boolean;
  onToggleBG: (active: boolean) => void;
  onBGVolumeChange: (vol: number) => void;
  isRepeat: boolean;
  onToggleRepeat: (repeat: boolean) => void;
  
  selectedPreset: string;
  onPresetSelect: (id: string) => void;
  isLoaded: boolean;
  songs: any[];
  beats: any[];
}

export function ControlPanel(props: ControlPanelProps) {
  const {
    volume, setVolume, reverb, setReverb,
    sustain, setSustain, octaveOffset, setOctaveOffset,
    labelMode, setLabelMode, selectedScale, setScale,
    rootNote, setRootNote,
    isPlayingBeat, onToggleBeat, currentBeatId, beatVolume, onBeatVolumeChange,
    bgVolume, isBGActive, onToggleBG, onBGVolumeChange, isRepeat, onToggleRepeat,
    selectedPreset, onPresetSelect,
    isLoaded, songs, beats
  } = props;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* PERFORMANCE SETTINGS */}
      <section className="space-y-4">
         <div className="flex items-center gap-2 text-white/20 mb-4">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Studio Dynamics</span>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSustain(!sustain)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300",
                sustain ? "bg-spotify-green/10 border-spotify-green/40 text-spotify-green" : "bg-white/[0.03] border-white/5 text-white/20"
              )}
            >
               <InfinityIcon className={cn("w-5 h-5", sustain && "animate-pulse")} />
               <span className="text-[9px] font-black uppercase">Sustain</span>
            </button>

            <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 border border-white/5">
               <span className="text-[8px] font-black uppercase text-white/20 tracking-widest leading-none">Register</span>
               <div className="flex gap-1 w-full shrink-0">
                  {[-1, 0, 1].map(o => (
                    <button 
                      key={o} 
                      onClick={() => setOctaveOffset(o)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-black border transition-all",
                        octaveOffset === o ? "bg-spotify-green text-black border-spotify-green" : "bg-white/5 border-white/5 text-white/20"
                      )}
                    >
                      {o === -1 ? 'L' : o === 0 ? 'M' : 'H'}
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* RHYTHM BEATS SECTION */}
      <section className="space-y-4 border-t border-white/5 pt-6">
         <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
               <Zap className="w-4 h-4 text-spotify-green" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Studio Rhythm</span>
            </div>
            <div className="flex items-center gap-4">
               <Volume2 className="w-3.5 h-3.5 text-white/20" />
               <input 
                 type="range" min="0" max="1" step="0.01" value={beatVolume} 
                 onChange={(e) => onBeatVolumeChange(parseFloat(e.target.value))} 
                 className="w-20 h-1.5 accent-spotify-green bg-white/10 rounded-full cursor-pointer" 
               />
            </div>
         </div>
         <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto custom-scrollbar pr-2">
            {beats.map(beat => (
               <button
                  key={beat.id}
                  onClick={() => onToggleBeat(beat.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                    isPlayingBeat && currentBeatId === beat.id 
                      ? "bg-spotify-green/10 border-spotify-green/40 text-spotify-green" 
                      : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.08]"
                  )}
               >
                  <div className={cn("shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all", isPlayingBeat && currentBeatId === beat.id ? "bg-spotify-green text-black" : "bg-white/5 text-white/20 group-hover:text-white/40")}>
                     {isPlayingBeat && currentBeatId === beat.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[10px] font-black truncate uppercase tracking-tighter leading-none mb-1.5">{beat.name}</span>
                     <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">{beat.bpm} BPM</span>
                  </div>
               </button>
            ))}
         </div>
      </section>

      {/* AUTOPLAY & LOOP CONFIG */}
      <section className="bg-spotify-green/5 border border-spotify-green/10 rounded-[32px] p-6 space-y-5">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Repeat className="w-4 h-4 text-spotify-green" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-spotify-green">Auto-Play Logic</span>
            </div>
            <button 
              onClick={() => onToggleRepeat(!isRepeat)}
              className={cn(
                "w-10 h-5 rounded-full p-1 transition-all duration-500 flex items-center",
                isRepeat ? "bg-spotify-green" : "bg-white/10"
              )}
            >
              <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", isRepeat ? "translate-x-5" : "translate-x-0")} />
            </button>
         </div>
         <div className="flex items-center justify-between opacity-40 pointer-events-none">
            <div className="flex items-center gap-2">
               <FastForward className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Play Next Track</span>
            </div>
            <button className="w-10 h-5 rounded-full p-1 bg-white/5 flex items-center">
              <div className="w-3 h-3 bg-white/20 rounded-full" />
            </button>
         </div>
      </section>

      {/* MASTER VOLUME & FX */}
      <section className="space-y-6 pt-2">
        <div className="flex items-center gap-2 text-white/20">
           <Sliders className="w-4 h-4" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Mixing</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
           <KnobControl label="Master Output" value={volume} onChange={setVolume} min={0} max={1.5} />
           <KnobControl label="Studio Reverb" value={reverb} onChange={setReverb} min={0} max={1.0} />
        </div>
      </section>

      {/* INSTRUMENT PRESETS */}
      <section className="space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 pl-1">Reed Engine</span>
        <div className="grid grid-cols-2 gap-2">
           {PRESETS_LIST.map(p => (
             <button 
               key={p.id} 
               onClick={() => onPresetSelect(p.id)}
               className={cn(
                 "py-4 rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest",
                 selectedPreset === p.id 
                   ? "bg-spotify-green text-black border-spotify-green shadow-[0_0_20px_rgba(29,185,84,0.3)]" 
                   : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.08]"
               )}
             >
                {p.label}
             </button>
           ))}
        </div>
      </section>

      {/* THEORY & SCALE */}
      <section className="space-y-4 border-t border-white/5 pt-6">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 pl-1">Theoretic Base</span>
        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-2">
             <label className="text-[8px] font-black text-white/20 uppercase ml-1 tracking-widest">Root Key</label>
             <select value={rootNote} onChange={(e) => setRootNote(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-[11px] font-black outline-none appearance-none text-spotify-green cursor-pointer">
                {RADIX_NOTES.map(n => <option key={n} value={n} className="bg-[#111]">{n}</option>)}
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-[8px] font-black text-white/20 uppercase ml-1 tracking-widest">Scale / Raga</label>
             <select value={selectedScale} onChange={(e) => setScale(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-[11px] font-black outline-none appearance-none truncate cursor-pointer">
                {SCALES.map(s => <option key={s.name} value={s.name} className="bg-[#111]">{s.name}</option>)}
             </select>
           </div>
        </div>
      </section>
    </div>
  );
}

function KnobControl({ label, value, onChange, min, max }: any) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center">
         <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">{label}</span>
         <span className="text-[10px] font-mono text-spotify-green font-bold">{Math.round(percentage)}%</span>
      </div>
      <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
         <div 
           className="absolute top-0 left-0 h-full bg-spotify-green shadow-[0_0_15px_rgba(29,185,84,0.5)] transition-all duration-300" 
           style={{ width: `${percentage}%` }}
         />
         <input 
           type="range" min={min} max={max} step={0.01} value={value} 
           onChange={(e) => onChange(parseFloat(e.target.value))} 
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
         />
      </div>
    </div>
  );
}
