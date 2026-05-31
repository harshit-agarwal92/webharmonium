'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface FeaturedPlaylistCardProps {
  playlist: any;
  onClick: () => void;
}

export const FeaturedPlaylistCard = React.memo(function FeaturedPlaylistCard({ 
  playlist, onClick 
}: FeaturedPlaylistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-72 md:w-80 h-44 rounded-2xl overflow-hidden cursor-pointer shrink-0 border border-white/5 group shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] hover:border-[#EC4899]/30 transition-all duration-500"
    >
      {/* Thumbnail Image */}
      <Image 
        src={playlist.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400'}
        alt={playlist.title || 'Playlist'}
        fill
        sizes="(max-width: 768px) 288px, 320px"
        loading="lazy"
        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      
      {/* Premium Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      
      {/* Subtle highlight glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent transition-opacity duration-700 pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-4 left-5 right-5 z-10 flex flex-col items-start gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white bg-[#EC4899]/90 backdrop-blur-md px-2 py-0.5 rounded shadow-[0_0_10px_rgba(236,72,153,0.5)]">
          JIOSAAVN
        </span>
        <h4 className="text-xl font-bold text-white uppercase tracking-tight leading-snug drop-shadow-md">
          {playlist.title}
        </h4>
        {playlist.query && (
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium truncate w-full">
            Curated feed • {playlist.query}
          </p>
        )}
      </div>
    </motion.div>
  );
});
