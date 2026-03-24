'use client';

import { 
  Volume2, 
  Wind, 
  Layers, 
  Infinity as InfinityIcon, 
  Music2, 
  Settings2,
  Mic,
  Disc,
  ArrowUpCircle,
  Zap,
  Music,
  Minus,
  Plus,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCALES, LABEL_MODES, RADIX_NOTES, PRESETS_LIST } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlPanelProps {
  volume: number; setVolume: (v: number) => void;
  reverb: number; setReverb: (v: number) => void;
  brightness: number; setBrightness: (v: number) => void;
  coupler: boolean; setCoupler: (b: boolean) => void;
  sustain: boolean; setSustain: (b: boolean) => void;
  boost: boolean; setBoost: (b: boolean) => void;
  bpm: number; setBPM: (v: number) => void;
  isMetronome: boolean; setMetronome: (b: boolean) => void;
  transpose: number; setTranspose: (v: number) => void;
  fineTune: number; setFineTune: (v: number) => void;
  octaveShift: number; setOctaveShift: (v: number) => void;
  labelMode: string; setLabelMode: (v: string) => void;
  selectedScale: string; setScale: (v: string) => void;
  rootNote: string; setRootNote: (v: string) => void;
  currentPreset: string; setPreset: (v: string) => void;
  activeDrone: string | null; toggleDrone: (note: string) => void;
  isRecording: boolean; startRecording: () => void; stopRecording: () => void;
}

export function ControlPanel(props: ControlPanelProps) {
  const {
    volume, setVolume, reverb, setReverb, brightness, setBrightness,
    coupler, setCoupler, sustain, setSustain, boost, setBoost,
    bpm, setBPM, isMetronome, setMetronome,
    transpose, setTranspose, fineTune, setFineTune, octaveShift, setOctaveShift,
    labelMode, setLabelMode, selectedScale, setScale,
    rootNote, setRootNote, currentPreset, setPreset,
    activeDrone, toggleDrone,
    isRecording, startRecording, stopRecording
  } = props;

  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full pb-32 lg:pb-20">
      
      {/* BRAND & MASTER MODULE */}
      <ModuleBox className="border-accent-gold/20 shadow-[0_0_40px_rgba(212,175,55,0.05)] pt-6 lg:pt-8">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-gold">Engine Status</span>
              <span className="text-lg font-black tracking-tight text-white/80 italic mt-1">Symmetry Pro v3.5</span>
           </div>
           <div className={cn(
             "w-3 h-3 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]",
             isRecording ? "bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-green-500"
           )} />
        </div>

        <div className="grid grid-cols-3 gap-6">
           <KnobControl label="MASTER" value={volume} onChange={setVolume} min={0} max={2.0} />
           <KnobControl label="REED EQ" value={brightness} onChange={setBrightness} min={500} max={8500} />
           <KnobControl label="SPACE" value={reverb} onChange={setReverb} min={0} max={1.0} />
        </div>
      </ModuleBox>

      {/* REED VOICE SELECTOR - THE "BOX" DESIGN */}
      <ModuleBox title="REED VOICES" icon={<Wind className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-3">
          {PRESETS_LIST.map(p => (
            <button
               key={p.id}
               onClick={() => setPreset(p.id)}
               className={cn(
                 "group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500 overflow-hidden",
                 currentPreset === p.id 
                  ? "bg-accent-gold border-accent-gold text-black shadow-lg scale-105 z-10" 
                  : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.08] hover:border-white/10"
               )}
            >
              <div className={cn("p-2 rounded-xl transition-colors", currentPreset === p.id ? "bg-black/10" : "bg-white/5")}>
                 <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{p.label.split(' ')[0]}</span>
              {currentPreset === p.id && (
                <motion.div layoutId="selection-glow" className="absolute inset-0 bg-white/10" transition={{ duration: 1, repeat: Infinity }} />
              )}
            </button>
          ))}
        </div>
      </ModuleBox>

      {/* PERFORMANCE SWITCHES */}
      <div className="grid grid-cols-2 gap-4">
        <ControlToggle active={boost} onClick={() => setBoost(!boost)} icon={<Zap className="w-5 h-5" />} label="PRO BOOST" />
        <ControlToggle active={coupler} onClick={() => setCoupler(!coupler)} icon={<Layers className="w-5 h-5" />} label="COUPLER" />
        <ControlToggle active={sustain} onClick={() => setSustain(!sustain)} icon={<InfinityIcon className="w-5 h-5" />} label="SUSTAIN" />
        <ControlToggle active={isMetronome} onClick={() => setMetronome(!isMetronome)} icon={<Music2 className="w-5 h-5" />} label={`${bpm} BPM`} />
      </div>

      {/* SCALE & TUNING MODULE */}
      <ModuleBox title="PRECISION TUNING" icon={<Settings2 className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
             <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.3em] block text-center">OCTAVE</span>
             <Stepper value={octaveShift} onChange={setOctaveShift} min={-2} max={2} />
          </div>
          <div className="space-y-3">
             <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.3em] block text-center">TRANSPOSE</span>
             <Stepper value={transpose} onChange={setTranspose} min={-12} max={12} />
          </div>
        </div>

        <div className="space-y-3 p-4 bg-black/40 rounded-2xl border border-white/5">
           <div className="flex justify-between items-center text-[9px] font-black text-white/40 tracking-[0.4em]">
              <span>FINE TUNE</span>
              <span className="text-accent-gold">{fineTune} cts</span>
           </div>
           <input 
              type="range" min="-100" max="100" value={fineTune} 
              onChange={(e) => setFineTune(parseInt(e.target.value))} 
              className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent-gold"
           />
        </div>
      </ModuleBox>

      {/* SCALE INTELLIGENCE */}
      <ModuleBox title="SCALES & HARMONICS" icon={<Music className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[8px] uppercase font-black text-white/10 tracking-[0.5em] pl-1">ROOT</span>
            <select value={rootNote} onChange={(e) => setRootNote(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black outline-none appearance-none text-accent-gold">
               {RADIX_NOTES.map(n => <option key={n} value={n} className="bg-[#111]">{n}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-[8px] uppercase font-black text-white/10 tracking-[0.5em] pl-1">SCALE</span>
            <select value={selectedScale} onChange={(e) => setScale(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black outline-none appearance-none truncate">
               {SCALES.map(s => <option key={s.name} value={s.name} className="bg-[#111]">{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
           <div className="flex flex-col md:flex-row justify-between items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">Labels</span>
              <div className="flex flex-wrap justify-center gap-1">
                 {LABEL_MODES.map(m => (
                    <button 
                       key={m.id} 
                       onClick={() => setLabelMode(m.id)}
                       className={cn(
                         "px-3 py-1.5 rounded-lg text-8px font-black uppercase tracking-widest transition-all",
                         labelMode === m.id ? "bg-accent-gold text-black shadow-lg" : "bg-white/5 text-white/30 hover:bg-white/10"
                       )}
                    >
                       {m.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </ModuleBox>

      {/* DRONE & REC */}
      <ModuleBox className="bg-accent-gold/[0.02]">
        <div className="flex gap-2 mb-4">
           {['C3', 'G3', 'F3'].map(note => (
             <button key={note} onClick={() => toggleDrone(note)} className={cn(
               "flex-1 py-4 rounded-2xl text-[10px] font-black tracking-widest border transition-all duration-500",
               activeDrone === note ? "bg-accent-gold text-black border-accent-gold" : "bg-white/[0.02] border-white/5 text-white/20"
             )}>
                {note.replace('3', '')} DRONE
             </button>
           ))}
        </div>
        <button 
           onClick={isRecording ? stopRecording : startRecording}
           className={cn(
             "w-full py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-sm border transition-all duration-700 flex items-center justify-center gap-4",
             isRecording ? "bg-red-500 text-white border-red-400" : "bg-accent-gold text-black border-accent-gold shadow-lg"
           )}
        >
          {isRecording ? <Disc className="animate-spin" /> : <Mic />}
          {isRecording ? "STOP STREAM" : "START CAPTURE"}
        </button>
      </ModuleBox>

    </div>
  );
}

function ModuleBox({ title, icon, children, className }: any) {
    return (
        <div className={cn("glass rounded-[2.5rem] p-6 border border-white/[0.08] shadow-2xl relative group overflow-hidden", className)}>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-sweep pointer-events-none" />
            {title && (
                <div className="flex items-center gap-3 mb-6 opacity-30 group-hover:opacity-60 transition-opacity">
                    {icon}
                    <span className="text-[9px] uppercase font-black tracking-[0.5em]">{title}</span>
                </div>
            )}
            {children}
        </div>
    );
}

function Stepper({ value, onChange, min, max }: any) {
    return (
        <div className="flex items-center justify-between bg-black/40 rounded-2xl border border-white/5 p-2 px-4 shadow-inner">
            <button onClick={() => onChange(Math.max(min, value - 1))} className="p-2 transition-transform active:scale-75"><Minus className="w-5 h-5 opacity-40 hover:opacity-100" /></button>
            <span className="font-mono text-base font-black text-accent-gold">{value > 0 ? `+${value}` : value}</span>
            <button onClick={() => onChange(Math.min(max, value + 1))} className="p-2 transition-transform active:scale-75"><Plus className="w-5 h-5 opacity-40 hover:opacity-100" /></button>
        </div>
    );
}

function KnobControl({ label, value, onChange, min, max }: any) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#333] via-[#111] to-[#000] border-t border-white/10 shadow-2xl flex items-center justify-center cursor-ns-resize cursor-grab active:cursor-grabbing group"
        onWheel={(e) => {
            const delta = e.deltaY * -0.005;
            onChange(Math.max(min, Math.min(max, value + (max - min) * delta)));
        }}
      >
        <div className="absolute top-2 w-1.5 h-4 bg-accent-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,1)]" style={{ rotate: `${(percentage/100) * 270 - 135}deg`, transformOrigin: 'center 20px' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
      <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.3em]">{label}</span>
    </div>
  );
}

function ControlToggle({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-5 rounded-[2.2rem] border transition-all duration-700 w-full group overflow-hidden",
        active 
          ? "bg-accent-gold text-black border-accent-gold shadow-lg scale-105" 
          : "bg-white/[0.03] border-white/5 text-white/30 hover:bg-white/[0.08]"
      )}
    >
      <div className={cn("p-2 rounded-2xl bg-black/20", active ? "bg-black/10" : "")}>{icon}</div>
      <span className="font-black uppercase tracking-[0.2em] text-[10px]">{label}</span>
    </button>
  );
}
