'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Keyboard as PianoIcon, Sparkles, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  onStart: () => void;
  isInitializing: boolean;
}

export function LandingPage({ onStart, isInitializing }: LandingPageProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center bg-[#07080a] overflow-hidden select-none relative h-full">
      
      {/* ADVANCED ATMOSPHERIC RENDERING */}
      {isMounted && (
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {/* LARGE DEPTH PARTICLES */}
          {Array.from({ length: isMobile ? 12 : 45 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-accent-gold/20"
              initial={{ 
                x: Math.random() * 3000 - 500, 
                y: Math.random() * 3000 - 500, 
                scale: Math.random() * 2,
                filter: `blur(${Math.random() * 30 + 15}px)`
               }}
              animate={{ 
                x: [Math.random() * 3000 - 500, Math.random() * 3000 - 500], 
                y: [Math.random() * 3000 - 500, Math.random() * 3000 - 500],
                opacity: [0.1, 0.5, 0.1]
              }}
              transition={{ 
                duration: Math.random() * 30 + 30, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{ width: '100px', height: '100px' }}
            />
          ))}
          
          {/* SCANLINE OVERLAY */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
          
          {/* VIGNETTE */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        </div>
      )}

      {/* DYNAMIC SHAPE LAYER */}
      <motion.div 
        animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-[1200px] h-[1200px] border border-accent-gold/20 rounded-full blur-[2px] pointer-events-none"
      />

      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 text-center space-y-12 w-full px-8 flex flex-col items-center"
      >
        <div className="relative inline-block group">
          <motion.div
            animate={{ 
                rotateZ: [0, 5, -5, 0],
                y: [0, -10, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="p-12 md:p-16 glass rounded-[60px] md:rounded-[80px] border-accent-gold/30 shadow-[0_0_100px_rgba(212,175,55,0.2)] relative z-20 overflow-hidden"
          >
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-sweep" />
             <Music className="w-24 h-24 md:w-32 h-32 text-accent-gold drop-shadow-[0_0_50px_rgba(212,175,55,0.6)]" />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-24 bg-accent-gold/10 blur-[150px] -z-10" 
          />
        </div>

        <div className="space-y-4 w-full">
          <motion.h1 
            initial={{ letterSpacing: '0.1em', opacity: 0 }}
            animate={{ letterSpacing: '0.4em', opacity: 1 }}
            transition={{ duration: 2.5 }}
            className="text-4xl sm:text-7xl md:text-9xl font-black tracking-widest text-[#f4ece1] italic leading-tight uppercase"
          >
            HARMONIUM <span className="text-accent-gold not-italic">PRO</span>
          </motion.h1>
          <div className="flex flex-col items-center gap-4">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white/30 uppercase tracking-[0.8em] font-black text-[10px] md:text-base px-4"
            >
                Professional Symmetry Reeds v3.5
            </motion.p>
            <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />
          </div>
        </div>

        <motion.button
          whileHover={!isInitializing ? { scale: 1.05, letterSpacing: '0.3em' } : {}}
          whileTap={!isInitializing ? { scale: 0.95 } : {}}
          onClick={onStart}
          disabled={isInitializing}
          className={cn(
            "group relative px-8 sm:px-12 md:px-20 py-4 sm:py-6 md:py-8 bg-accent-gold text-[#07080a] rounded-full font-black uppercase tracking-[0.2em] text-lg sm:text-xl md:text-3xl transition-all duration-700",
            isInitializing ? "opacity-70 cursor-wait" : "shadow-[0_30px_60px_-15px_rgba(212,175,55,0.5)] hover:shadow-[0_0_120px_rgba(212,175,55,1)]"
          )}
        >
          <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
          <span className="relative z-10 flex items-center gap-4 md:gap-6">
             {isInitializing ? (
               <>
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
                 Warming Reeds...
               </>
             ) : (
               <>
                 <Play className="fill-current w-6 h-6 md:w-8 h-8" /> Start Master
               </>
             )}
          </span>
        </motion.button>

        <div className="flex justify-center gap-8 md:gap-16 pt-8 opacity-40">
           <Feature icon={<PianoIcon />} label="Real Reeds" />
           <Feature icon={<Activity />} label="Low Latency" />
           <Feature icon={<Sparkles />} label="Studio FX" />
        </div>
      </motion.div>

      <div className="absolute bottom-8 w-full flex justify-center opacity-5">
         <motion.div 
            animate={{ x: [-1000, 1000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="text-[12px] uppercase font-black tracking-[1.5em] text-white whitespace-nowrap"
         >
            CINEMATIC PERFORMANCE • ARTISAN REEDS • GHATAM • HARMONIUM • ELITE SERIES v3.5
         </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 text-accent-gold">
                {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</span>
        </div>
    );
}
