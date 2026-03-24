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
  
  // SHARED HANDLERS FOR MOUSE AND TOUCH
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onMouseDown();
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onMouseUp();
  };

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-end pb-8 lg:pb-12 transition-all duration-300 pointer-events-auto select-none touch-none",
        isWhite 
          ? "w-12 sm:w-16 h-48 sm:h-80 bg-gradient-to-b from-[#ffffff] via-[#f8f8f8] to-[#e0e0e0] border-b-[8px] lg:border-b-[12px] border-[#bbb] rounded-b-[1.5rem] lg:rounded-b-[2rem] z-0 border-x border-[#f0f0f0]" 
          : "w-8 sm:w-11 h-28 sm:h-48 bg-gradient-to-b from-[#555] via-[#222] to-[#010101] rounded-b-xl lg:rounded-b-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] z-10 -mx-4 lg:-mx-5.5 border-t-[3px] lg:border-t-[5px] border-[#666] border-x border-black/95",
        active && "z-20 scale-[0.98] brightness-110",
        !active && highlighted && "ring-[2px] lg:ring-[3px] ring-accent-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
      )}
      style={{ transformOrigin: "top center" }}
      animate={{
        rotateX: active ? -10 : 0,
        y: active ? 4 : 0,
        boxShadow: active 
          ? `0 0 ${boosted ? '80px' : '45px'} var(--accent-gold)` 
          : highlightsToShadow(highlighted, isWhite),
      }}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseEnter={(e) => { if (e.buttons === 1) onMouseEnter(); }}
      onMouseLeave={onMouseLeave}
      
      // TOUCH SUPPORT (Polyphonic Multi-Touch)
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      
      initial={false}
    >
      {/* RADIANCE */}
      {highlighted && !active && (
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={cn(
            "absolute top-6 w-3 h-3 rounded-full blur-[4px]",
            isWhite ? "bg-accent-gold/20" : "bg-accent-gold/40"
          )} 
        />
      )}

      {/* LABEL (Mobile Responsive sizing) */}
      <div className={cn(
        "flex flex-col items-center gap-1 lg:gap-3 select-none pointer-events-none transition-all duration-300",
        active ? "opacity-100 scale-110 translate-y-[-5px]" : "opacity-30 translate-y-0",
        isWhite ? "text-black" : "text-white"
      )}>
        <span className={cn(
          "font-black tracking-tightest uppercase",
          isWhite ? "text-lg lg:text-3xl" : "text-sm lg:text-xl",
          highlighted && "text-accent-gold drop-shadow-lg"
        )}>
          {label}
        </span>
        <span className="text-[7px] lg:text-[11px] font-black uppercase tracking-widest opacity-60">
            {note.replace(/\d+$/, '') === 'C' && note.includes('4') ? 'Mid' : ''}
        </span>
      </div>

      {/* REED IGNITION */}
      <AnimatePresence>
        {active && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute top-2 w-4 h-1 lg:w-6 lg:h-1.5 bg-accent-gold rounded-full shadow-[0_0_20px_var(--accent-gold)] z-30"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function highlightsToShadow(highlighted: boolean, isWhite: boolean) {
  if (highlighted) {
    return isWhite 
      ? "inset 0 -15px 25px rgba(212,175,55,0.08), 0 15px 40px rgba(0,0,0,0.5)" 
      : "inset 0 -15px 25px rgba(212,175,55,0.15), 0 20px 45px rgba(0,0,0,0.7)";
  }
  return isWhite ? "0 15px 40px rgba(0,0,0,0.4)" : "0 20px 50px rgba(0,0,0,0.8)";
}
