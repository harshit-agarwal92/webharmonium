'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Sparkles, RefreshCw, AudioLines, Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';
export type BadgeType = 'TOP CHART' | 'JIOSAAVN' | 'AI PICK' | 'NEW' | 'MASTI' | 'DEFAULT';

interface MusicCarouselProps {
  title: string;
  subtitle?: string;
  badge?: BadgeType;
  icon?: React.ReactNode;
  loading: boolean;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  skeletonType?: 'music' | 'playlist';
  onReload?: () => void;
  onLoadMore?: () => void;
}

export const MusicCarousel = React.memo(function MusicCarousel({
  title, subtitle, badge, icon, loading, items, renderItem, skeletonType = 'music', onReload, onLoadMore
}: MusicCarouselProps) {
  
  const getBadgeConfig = (b?: BadgeType) => {
    switch(b) {
      case 'TOP CHART': return { color: 'bg-[#00F0FF]', text: 'text-black font-black' };
      case 'JIOSAAVN': return { color: 'bg-[#EC4899]', text: 'text-white' };
      case 'AI PICK': return { color: 'bg-indigo-500', text: 'text-white' };
      case 'NEW': return { color: 'bg-emerald-500', text: 'text-white' };
      case 'MASTI': return { color: 'bg-gradient-to-r from-[#EC4899] to-[#00F0FF]', text: 'text-white font-black' };
      default: return null;
    }
  };

  const badgeConfig = getBadgeConfig(badge);

  return (
    <section className="mb-14">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                {icon}
              </div>
            )}
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>
              {badgeConfig && (
                <span className={cn("text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-md", badgeConfig.color, badgeConfig.text)}>
                  {badge}
                </span>
              )}
            </div>
          </div>
          {onReload && (
            <button 
              onClick={onReload} 
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} /> Reload feed
            </button>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-white/40 font-medium pl-11">{subtitle}</p>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto overscroll-x-contain pb-6 no-scrollbar-on-mobile scroll-smooth snap-x snap-mandatory pt-2 px-1">
        {loading && items.length === 0 ? (
          // Shimmer Skeleton Cards
          [1, 2, 3, 4, 5, 6].map(idx => (
            <div 
              key={`skeleton-${idx}`} 
              className={cn(
                "rounded-[20px] bg-[#111] border border-white/5 shrink-0 overflow-hidden relative p-3",
                skeletonType === 'music' ? "w-48 h-64" : "w-72 md:w-80 h-44"
              )}
            >
              <div className="w-full h-40 rounded-[14px] bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse mb-3" />
              <div className="w-3/4 h-3.5 rounded-full bg-white/10 animate-pulse mb-2" />
              <div className="w-1/2 h-2.5 rounded-full bg-white/5 animate-pulse" />
            </div>
          ))
        ) : (
          <>
            {items.map((item, index) => (
              <div key={`carousel-item-${item.id || index}`} className="snap-start shrink-0">
                {renderItem(item, index)}
              </div>
            ))}
            {onLoadMore && items.length > 0 && (
              <div className="snap-start shrink-0 flex items-center justify-center w-32 md:w-48 h-64 pr-6">
                <button 
                  onClick={onLoadMore} 
                  className="flex flex-col items-center gap-4 text-white/50 hover:text-white transition-colors group p-4"
                >
                  <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 group-active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white/70 group-hover:text-white">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center">View All</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
});
