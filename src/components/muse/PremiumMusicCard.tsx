'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Plus, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PremiumMusicCardProps {
  song: any;
  onClick: (song: any, queue?: any[]) => void;
  onFav: (song: any, e: React.MouseEvent) => void;
  onDl: (song: any, e: React.MouseEvent) => void;
  contextQueue?: any[];
  isFav: boolean;
  isActive?: boolean;
  isPlaying?: boolean;
}

export const PremiumMusicCard = React.memo(function PremiumMusicCard({
  song, onClick, onFav, onDl, isFav, isActive = false, isPlaying = false, contextQueue
}: PremiumMusicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "w-48 p-3 rounded-[20px] bg-[#0f0f0f] border shrink-0 group select-none cursor-pointer overflow-hidden transition-all duration-200 ease-out hover:scale-[1.05]",
        isActive 
          ? "border-[#00F0FF] shadow-[0_0_25px_rgba(0,240,255,0.3)] bg-[#141414]" 
          : "border-white/5 hover:border-white/20 hover:bg-[#161616] hover:-translate-y-1"
      )}
      onClick={() => onClick(song, contextQueue)}
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-square w-full rounded-[16px] overflow-hidden mb-3 bg-[#1a1a1a]">
        <Image 
          src={song.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
          alt={song.name || 'Artwork'}
          fill
          sizes="(max-width: 768px) 150px, 192px"
          quality={100}
          loading="lazy"
          className={cn(
            "object-cover transition-transform duration-500 ease-out group-hover:scale-110",
            isActive && isPlaying ? "scale-105" : ""
          )} 
        />
        
        {/* Heart Icon Overlay */}
        <button 
          onClick={(e) => { e.stopPropagation(); onFav(song, e); }}
          className="absolute top-2 right-2 z-20 p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:text-[#EC4899] active:scale-90 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Favorite song"
        >
          <Heart className={cn("w-4 h-4", isFav ? "fill-[#EC4899] text-[#EC4899]" : "text-white")} />
        </button>
        
        {/* Large Circular Centered Play Button (Visible on hover and on touch when active) */}
        <div className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200 flex items-center justify-center",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-200">
            {isActive && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Live Animated Equalizer Bars Badge */}
        {isActive && (
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#00F0FF]/40 text-[#00F0FF] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-[#00F0FF] animate-[bounce_0.8s_infinite_100ms] h-full" />
                <span className="w-0.5 bg-[#00F0FF] animate-[bounce_0.8s_infinite_300ms] h-2/3" />
                <span className="w-0.5 bg-[#00F0FF] animate-[bounce_0.8s_infinite_200ms] h-4/5" />
              </div>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            )}
            {isPlaying ? "Playing" : "Paused"}
          </div>
        )}
      </div>

      {/* Track info details */}
      <div className="px-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-black text-white truncate flex-1 leading-snug tracking-tight" title={song.name}>
            {song.name}
          </h4>
          <button 
            onClick={(e) => { e.stopPropagation(); onDl(song, e); }}
            className="p-1 rounded text-white/30 hover:text-[#00F0FF] transition-colors shrink-0"
            aria-label="Queue / Add"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-white/40 truncate mt-1 font-medium">
          {song.artist}
        </p>
      </div>
    </motion.div>
  );
});
