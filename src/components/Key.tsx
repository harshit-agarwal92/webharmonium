'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KeyProps {
  note: string;
  label: string;
  type: 'white' | 'black';
  active: boolean;
  highlighted: boolean;
  boosted: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function Key({
  note,
  label,
  type,
  active,
  highlighted,
  boosted,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave
}: KeyProps) {
  const isWhite = type === 'white';
  
  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-end pb-12 transition-all duration-[500ms] pointer-events-auto",
        isWhite 
          ? "w-16 h-80 bg-gradient-to-b from-[#ffffff] via-[#f8f8f8] to-[#e0e0e0] border-b-[12px] border-[#bbb] rounded-b-[2rem] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] z-0 border-x border-[#f0f0f0] ring-1 ring-white/50" 
          : "w-11 h-48 bg-gradient-to-b from-[#555] via-[#222] to-[#010101] rounded-b-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] z-10 -mx-5.5 border-t-[5px] border-[#666] border-x border-black/95 ring-1 ring-white/10",
        active && "z-20",
        !active && highlighted && "ring-[3px] ring-accent-gold/40 shadow-[0_0_35px_rgba(212,175,55,0.3)]"
      )}
      style={{ transformOrigin: "top center" }}
      animate={{
        rotateX: active ? -12 : 0,
        y: active ? 6 : 0,
        boxShadow: active 
          ? `0 0 ${boosted ? '100px' : '65px'} var(--accent-gold)` 
          : highlightsToShadow(highlighted, isWhite),
        backgroundColor: active 
          ? (isWhite ? "#f0f0f0" : "#1a1a1a") 
          : (isWhite ? "#ffffff" : "#222"),
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={(e) => { if (e.buttons === 1) onMouseEnter(); }}
      onMouseLeave={onMouseLeave}
      initial={false}
    >
      {/* SCALE RADIANCE */}
      {highlighted && !active && (
        <motion.div 
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute top-8 w-4 h-4 rounded-full blur-[4px]",
            isWhite ? "bg-accent-gold/30" : "bg-accent-gold/60"
          )} 
        />
      )}

      {/* REED IGNITION LIGHT */}
      <AnimatePresence>
        {active && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.8, 1], filter: ['blur(2px)', 'blur(4px)', 'blur(2px)'] }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute top-3 w-6 h-1 bg-accent-gold rounded-full shadow-[0_0_30px_rgba(212,175,55,1)] z-30"
          />
        )}
      </AnimatePresence>

      {/* REED OPENING DETAIL */}
      <div className={cn(
        "absolute top-0 w-full h-[3px] bg-black/10 transition-opacity duration-700",
        active ? "opacity-100" : "opacity-0"
      )} />

      {/* LABEL FINESSE */}
      <div className={cn(
        "flex flex-col items-center gap-3 select-none pointer-events-none transition-all duration-700",
        active ? "opacity-100 scale-125 translate-y-[-10px]" : "opacity-25 translate-y-0",
        isWhite ? "text-black" : "text-white"
      )}>
        <span className={cn(
          "font-black tracking-tightest uppercase transition-all duration-500",
          isWhite ? "text-2xl" : "text-xl",
          highlighted && "text-accent-gold italic scale-110 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
        )}>
          {label}
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">{note.replace(/\d+$/, '')}</span>
      </div>

      {/* ENERGY FIELDS */}
      <AnimatePresence>
        {active && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className={cn(
                    "absolute inset-0 pointer-events-none rounded-b-[2rem] border-[4px] shadow-[inset_0_0_30px_rgba(212,175,55,0.2)]",
                    boosted ? "border-accent-gold/50" : "border-accent-gold/20"
                )}
            />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function highlightsToShadow(highlighted: boolean, isWhite: boolean) {
  if (highlighted) {
    return isWhite 
      ? "inset 0 -30px 40px rgba(212,175,55,0.12), 0 25px 50px rgba(0,0,0,0.6)" 
      : "inset 0 -25px 35px rgba(212,175,55,0.25), 0 35px 70px rgba(0,0,0,0.9)";
  }
  return isWhite ? "0 25px 60px rgba(0,0,0,0.6)" : "0 30px 70px rgba(0,0,0,0.9)";
}
