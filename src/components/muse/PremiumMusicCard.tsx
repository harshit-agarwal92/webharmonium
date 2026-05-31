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
        "w-48 p-3 rounded-2xl bg-[#0f0f0f] border shrink-0 group select-none cursor-pointer overflow-hidden transition-all duration-300",
        isActive 
          ? "border-[#8B5CF6] shadow-[0_10px_30px_rgba(139,92,246,0.25)]" 
          : "border-white/5 hover:border-white/20 hover:bg-[#151515] hover:-translate-y-1.5"
      )}
      onClick={() => onClick(song, contextQueue)}
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[#1a1a1a]">
        <Image 
          src={song.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
          alt={song.name || 'Artwork'}
          fill
          sizes="(max-width: 768px) 150px, 192px"
          quality={100}
          loading="lazy"
          className={cn(
            "object-cover transition-transform duration-700 ease-out group-hover:scale-110",
            isActive && isPlaying ? "scale-105" : ""
          )} 
        />
        
        {/* Heart Icon Overlay */}
        <button 
          onClick={(e) => { e.stopPropagation(); onFav(song, e); }}
          className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white/70 hover:text-[#EC4899] transition-colors"
          aria-label="Favorite song"
        >
          <Heart className={cn("w-3.5 h-3.5", isFav ? "fill-[#EC4899] text-[#EC4899]" : "text-white")} />
        </button>
        
        {/* Play hover state overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-[#8B5CF6] text-white p-3 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)] transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-[#a78bfa]">
            {isActive && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Live EQ Badge */}
        {isActive && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#EC4899]/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.5)]">
            <span className={cn("w-1.5 h-1.5 rounded-full bg-white", isPlaying && "animate-ping")} />
            {isPlaying ? "Live" : "Paused"}
          </div>
        )}
      </div>

      {/* Track info details */}
      <div className="px-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-white truncate flex-1 leading-snug" title={song.name}>
            {song.name}
          </h4>
          <button 
            onClick={(e) => { e.stopPropagation(); onDl(song, e); }}
            className="p-1 rounded text-white/30 hover:text-[#8B5CF6] transition-colors shrink-0"
            aria-label="Queue / Add"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-white/40 truncate mt-0.5 font-medium">
          {song.artist}
        </p>
      </div>
    </motion.div>
  );
});
