'use client';

import { Play, Pause, SkipForward, Volume2, SkipBack, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MiniPlayerProps {
  currentTrack: any;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function MiniPlayer({ 
  currentTrack, isPlaying, onTogglePlay, onNext, onPrev, 
  progress, volume, onVolumeChange, isMuted, onToggleMute 
}: MiniPlayerProps) {
  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed bottom-4 left-4 right-4 md:left-[10%] md:right-[10%] h-[80px] glass rounded-[24px] z-[90] flex items-center px-4 md:px-8 border border-white/20 shadow-2xl overflow-hidden shadow-purple-900/20"
    >
      {/* Progress Bar background overlay */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-white/5 overflow-hidden">
        <motion.div
          className="h-full bg-harmonium-accent shadow-[0_0_10px_rgba(168,85,247,0.8)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
        {currentTrack && (
          <>
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0">
              <img
                src={currentTrack.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
                alt={currentTrack.name}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-bold truncate tracking-tight">{currentTrack.name}</h4>
              <p className="text-[10px] text-white/40 truncate uppercase font-bold tracking-[0.1em] mt-1">{currentTrack.artist || 'Web Harmonium Live'}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-8 shrink-0">
        <button
          onClick={onPrev}
          className="p-2 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-xl"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" />
          ) : (
            <Play className="w-6 h-6 md:w-7 md:h-7 translate-x-[2px] fill-current" />
          )}
        </button>

        <button
          onClick={onNext}
          className="p-2 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-4 flex-1 justify-end">
        <button 
          onClick={onToggleMute}
          className={cn("transition-colors", isMuted ? "text-red-500" : "text-white/40 hover:text-white")}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden relative group">
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div 
             className="h-full bg-white/40" 
             animate={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
        </div>
      </div>
    </motion.footer>
  );
}
