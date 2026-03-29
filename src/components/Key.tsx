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
        "relative flex flex-col items-center justify-end pb-8 sm:pb-12 transition-all duration-200 pointer-events-auto select-none touch-none will-change-transform cursor-pointer",
        isWhite 
          ? "w-[min(56px,8.5vw)] sm:w-[68px] h-[40vh] sm:h-[48vh] bg-gradient-to-b from-[#fffff0] via-[#f8f8e0] to-[#f0f0d0] border-b-[8px] sm:border-b-[12px] border-[#d2b48c] rounded-b-[1.5rem] lg:rounded-b-[2rem] z-0 border-x border-black/5" 
          : "w-[min(34px,5.5vw)] sm:w-[42px] h-[24vh] sm:h-[30vh] bg-gradient-to-b from-[#2a2a2a] via-[#111] to-[#000] rounded-b-xl sm:rounded-b-2xl shadow-[0_12px_30px_rgba(0,0,0,0.85)] z-10 -mx-[min(17px,2.75vw)] sm:-mx-[21px] border-t-[3px] sm:border-t-[5px] border-[#333] border-x border-black/90",
        
        active && (isWhite ? "bg-[#eee] brightness-90 shadow-inner" : "brightness-125"),
        !active && highlighted && "after:content-[''] after:absolute after:bottom-4 after:w-1.5 after:h-1.5 after:bg-accent-gold/40 after:rounded-full after:blur-[2px]",
        guideHighlight && "ring-4 ring-accent-gold ring-inset shadow-[0_0_20px_var(--accent-gold)] z-30"
      )}
      style={{ transformOrigin: "top center" }}

      animate={{
        rotateX: active ? -10 : 0,
        y: active ? 4 : 0,
        filter: active ? "brightness(1.1)" : "brightness(1)",
        boxShadow: active 
          ? `0 0 40px var(--accent-gold)` 
          : guideHighlight ? `0 0 30px var(--accent-gold)` : "none",
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
      <AnimatePresence>
        {guideHighlight && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-accent-gold/20 rounded-inherit z-[-1] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "absolute top-6 sm:top-8 flex flex-col items-center opacity-70",
        isWhite ? "text-black/40" : "text-white/30"
      )}>
        <span className="text-[10px] sm:text-xs font-black font-mono border border-current px-1.5 py-0.5 rounded-md uppercase tracking-widest">{keyLabel}</span>
      </div>

      <div className={cn(
        "flex flex-col items-center gap-0.5 sm:gap-1 select-none pointer-events-none transition-all duration-300",
        active ? "opacity-100 scale-110 translate-y-[-4px]" : "opacity-60",
        isWhite ? "text-black" : "text-white"
      )}>
        <span className={cn(
          "font-black tracking-tighter uppercase leading-none drop-shadow-sm",
          isWhite ? "text-xl sm:text-3xl" : "text-sm sm:text-xl",
          active || guideHighlight ? "text-accent-gold scale-125 brightness-150" : (
            ['Sa', 'Ga', 'Pa'].some(n => label.includes(n)) ? "text-blue-600/60" : 
            ['Re', 'Ma', 'Dha', 'Ni'].some(n => label.toLowerCase().includes(n.toLowerCase())) ? "text-red-600/60" : 
            isWhite ? "text-black/60" : "text-white/60"
          )
        )}>
          {label.replace(/[0-9']|\./g, '')}
        </span>
        <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 text-center">
            {label.includes("'") ? "High" : label.includes(".") ? "Low" : ""}
            {label.toLowerCase().includes('re') && label === 're' ? 'Komal' : 
             label.toLowerCase().includes('ga') && label === 'ga' ? 'Komal' :
             label.toLowerCase().includes('dha') && label === 'dha' ? 'Komal' :
             label.toLowerCase().includes('ni') && label === 'ni' ? 'Komal' :
             label.includes('#') ? 'Tivra' : 'Shuddh'}
        </span>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -2 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 sm:bottom-28 w-4 h-1 lg:w-6 lg:h-1.5 bg-accent-gold rounded-full shadow-[0_0_20px_var(--accent-gold)] z-30"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

