import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KeyProps {
  note: string;
  label: string;
  keyLabel: string;
  type: 'white' | 'black';
  active: boolean;
  highlighted: boolean;
  guideHighlight: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const Key = memo(function Key({
  note,
  label,
  keyLabel,
  type,
  active,
  highlighted,
  guideHighlight,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave
}: KeyProps) {
  const isWhite = type === 'white';
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    onMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onMouseUp();
  };

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center justify-end pb-12 transition-all duration-300 pointer-events-auto select-none touch-none will-change-transform cursor-pointer",
        isWhite 
          ? "w-[58px] md:w-[72px] h-[45vh] md:h-[50vh] bg-gradient-to-b from-[#1a1c1d] to-[#0f1112] border-b-[6px] md:border-b-[10px] border-white/5 rounded-b-[24px] z-0 border-x border-white/[0.02]" 
          : "w-[36px] md:w-[44px] h-[28vh] md:h-[32vh] bg-gradient-to-b from-[#2a2d2e] via-[#1a1c1d] to-[#0a0b0c] rounded-b-[14px] md:rounded-b-[18px] shadow-2xl z-10 -mx-[18px] md:-mx-[22px] border-t-[4px] border-white/5 border-x border-black/90",
        
        active && (isWhite ? "brightness-125" : "brightness-150"),
        !active && highlighted && "after:content-[''] after:absolute after:bottom-4 after:w-1 after:h-1 after:bg-neon-green/30 after:rounded-full after:blur-[1px]",
        guideHighlight && "ring-2 ring-neon-green/50 shadow-[0_0_30px_rgba(0,255,204,0.3)] z-30"
      )}
      style={{ transformOrigin: "top center" }}

      animate={{
        rotateX: active ? -8 : 0,
        y: active ? 4 : 0,
        boxShadow: active 
          ? `0 0 50px rgba(0, 255, 204, 0.5)` 
          : guideHighlight ? `0 0 30px rgba(0, 255, 204, 0.2)` : "none",
        borderColor: active ? "var(--color-neon-green)" : "rgba(255, 255, 255, 0.05)",
      }}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(); }}
      onMouseUp={(e) => { e.preventDefault(); onMouseUp(); }}
      onMouseEnter={(e) => { if (e.buttons === 1) onMouseEnter(); }}
      onMouseLeave={onMouseLeave}
      
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      
      initial={false}
    >
      {/* SHINE EFFECT ON KEY DESCENT */}
      <AnimatePresence>
        {active && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neon-green rounded-inherit z-0"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "absolute top-6 flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity",
        isWhite ? "text-white/40" : "text-white/60"
      )}>
        <span className="text-[10px] font-black font-mono border border-current px-2 py-0.5 rounded-lg uppercase tracking-tighter">{keyLabel}</span>
      </div>

      <div className={cn(
        "flex flex-col items-center gap-1 select-none pointer-events-none transition-all duration-500",
        active ? "opacity-100 scale-110 translate-y-[-4px]" : "opacity-40",
        "text-white z-10"
      )}>
        <span className={cn(
          "font-black font-poppins tracking-tighter uppercase leading-none",
          isWhite ? "text-2xl md:text-4xl" : "text-lg md:text-2xl",
          active || guideHighlight ? "text-neon-green neon-text" : "text-white"
        )}>
          {label.replace(/[0-9']|\./g, '')}
        </span>
        <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 text-center">
            {label.includes("'") ? "High" : label.includes(".") ? "Low" : "Mid"}
        </span>
      </div>

      {/* BOTTOM GLOW INDICATOR */}
      <AnimatePresence>
        {(active || guideHighlight) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -4 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 w-1/2 h-1 bg-neon-green rounded-full shadow-[0_0_15px_rgba(0,255,204,0.8)] z-30"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});
