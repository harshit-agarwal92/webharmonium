'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface HorizontalScrollSectionProps {
  title: string;
  items: any[];
  onPlay: (item: any) => void;
  emptyMessage?: string;
}

export function HorizontalScrollSection({ title, items, onPlay, emptyMessage = "Nothing to show yet." }: HorizontalScrollSectionProps) {
  if (items.length === 0) {
    return (
      <div className="w-full mt-8">
        <h3 className="text-sm font-black text-white/50 uppercase tracking-widest mb-4 px-2">{title}</h3>
        <div className="h-32 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8">
      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
        {title}
      </h3>
      <div className="flex overflow-x-auto gap-4 pb-4 px-2 custom-scrollbar snap-x snap-mandatory">
        {items.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex-shrink-0 w-32 snap-start group cursor-pointer"
            onClick={() => onPlay(item)}
          >
            <div className="w-32 h-32 rounded-2xl overflow-hidden relative shadow-lg mb-3">
              <img 
                src={item.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="w-10 h-10 rounded-full bg-masti-pink text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,0,127,0.5)]">
                    <Play className="w-4 h-4 translate-x-[2px] fill-current" />
                 </div>
              </div>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
            <p className="text-[10px] text-white/50 truncate uppercase font-bold mt-1">{item.artist || 'Unknown'}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
