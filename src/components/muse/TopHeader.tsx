'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface TopHeaderProps {
  setMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: (q: string) => void;
  setActiveTab: (tab: string) => void;
}

export const TopHeader = React.memo(function TopHeader({
  setMenuOpen,
  searchQuery,
  setSearchQuery,
  handleSearch,
  setActiveTab
}: TopHeaderProps) {
  const { user } = useAuth();
  const currentUser = 'users';

  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Late Night Drive', 'Synthwave', 'Arijit Singh']);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync if external searchQuery changes (e.g. from trending tags)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Debounce search typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
        if (localQuery.trim()) {
          handleSearch(localQuery);
        } else {
          handleSearch('');
        }
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [localQuery, searchQuery, setSearchQuery, handleSearch]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pt-4 px-2 md:px-0 relative z-40">
      {/* Mobile Top Bar (Greeting & Hamburger) */}
      <div className="flex items-center justify-between lg:hidden w-full bg-[#050505]/90 backdrop-blur-md px-4 py-3 fixed top-0 left-0 right-0 z-40 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="text-white text-lg font-medium tracking-tight">Good Evening,</span>
          <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#8B5CF6]">{currentUser}</span>
        </div>
        <button 
          onClick={() => setMenuOpen(true)}
          className="p-2 text-white/80 hover:text-white active:scale-90 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Greeting */}
      <div className="hidden lg:flex items-center gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Good Evening,</h2>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#8B5CF6]">{currentUser}</h2>
      </div>

      {/* Premium Search Bar */}
      <div 
        ref={searchContainerRef}
        className="relative w-full lg:w-[450px] mt-20 lg:mt-0 z-50"
      >
        <div className={cn(
          "w-full flex items-center bg-white/5 backdrop-blur-md border p-1 rounded-2xl transition-all duration-300",
          searchFocused ? "border-[#8B5CF6]/50 shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-white/10" : "border-white/10 hover:border-white/20 hover:bg-white/10"
        )}>
          <Search className={cn("ml-4 w-5 h-5 transition-colors", searchFocused ? "text-[#8B5CF6]" : "text-white/40")} />
          <input 
            type="text"
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setActiveTab('search');
            }}
            onFocus={() => {
              setSearchFocused(true);
              setActiveTab('search');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && localQuery.trim()) {
                setSearchQuery(localQuery);
                handleSearch(localQuery);
                if (!recentSearches.includes(localQuery)) {
                  setRecentSearches(prev => [localQuery, ...prev.slice(0, 4)]);
                }
                setSearchFocused(false);
              }
            }}
            placeholder="Artists, songs, or podcasts"
            className="w-full bg-transparent border-none outline-none py-3 px-4 text-sm font-medium text-white placeholder-white/30"
          />
          {localQuery && (
            <button 
              onClick={() => { setLocalQuery(''); setSearchQuery(''); handleSearch(''); }} 
              className="p-2 mr-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        <AnimatePresence>
          {searchFocused && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-3 p-4 rounded-2xl bg-[#121212]/95 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="space-y-4">
                {/* Recent Searches */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Recent Searches</p>
                  <div className="space-y-1">
                    {recentSearches.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between group">
                        <button
                          onClick={() => {
                            setSearchQuery(item);
                            handleSearch(item);
                            setSearchFocused(false);
                          }}
                          className="flex-1 text-left px-3 py-2 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {item}
                        </button>
                        <button
                          onClick={() => setRecentSearches(prev => prev.filter(x => x !== item))}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending (Mocked) */}
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                    Trending
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Global Top 50', 'Weekend Vibes', 'Lo-Fi Beats'].map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(tag);
                          handleSearch(tag);
                          setSearchFocused(false);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#8B5CF6]/30 text-xs text-white/70 hover:text-white transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
