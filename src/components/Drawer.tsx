'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Grid, History, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: any, context?: any[]) => void;
  trendingSongs: any[];
  recentlyPlayed: any[];
}

export function Drawer({ isOpen, onClose, onSelectSong, trendingSongs, recentlyPlayed }: DrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = ['Trending 🚀', 'Party 🔥', 'Chill 🌙', 'Gaming 🎮', 'LoFi ☕'];

  // Handle live search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        setLoading(true);
        try {
          const res = await fetch(`/api/songs?query=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (e) {
          console.error("Drawer search failed:", e);
        } finally {
          setLoading(false);
        }
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[85%] md:w-[400px] glass z-[110] flex flex-col shadow-2xl border-r border-white/10"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h2 className="text-xl font-bold flex items-center gap-3 lowercase tracking-tighter">
                <Music className="text-masti-pink w-6 h-6" />
                masti <span className="text-masti-cyan">library</span>
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 sticky top-0 bg-transparent z-10">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-harmonium-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Search local & web songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-harmonium-accent/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.section
                    key="search"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-harmonium-accent mb-4 px-2">
                       {loading ? "Searching Deep..." : `Vault Results (${searchResults.length})`}
                    </h3>
                    <div className="grid gap-2">
                      {searchResults.map((song, i) => (
                        <SongItem key={i} song={song} onClick={() => onSelectSong(song, searchResults)} />
                      ))}
                    </div>
                  </motion.section>
                ) : (
                  <motion.div 
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Trending */}
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 px-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Trending Songs
                      </h3>
                      <div className="grid gap-1">
                        {trendingSongs.map((song, i) => (
                          <SongItem key={i} song={song} onClick={() => onSelectSong(song, trendingSongs)} />
                        ))}
                      </div>
                    </section>

                    {/* Categories */}
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 px-2 flex items-center gap-2">
                        <Grid className="w-4 h-4" /> Categories
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSearchQuery(cat.replace(/ .*/, ''))}
                            className="glass p-4 rounded-3xl text-sm font-bold hover:bg-masti-pink/20 hover:text-white text-left hover:scale-[1.02] active:scale-98 transition-all"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Recently Played */}
                    {recentlyPlayed.length > 0 && (
                      <section>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 px-2 flex items-center gap-2">
                          <History className="w-4 h-4" /> Recently Played
                        </h3>
                        <div className="grid gap-1">
                          {recentlyPlayed.map((song, i) => (
                            <SongItem key={i} song={song} onClick={() => onSelectSong(song, recentlyPlayed)} />
                          ))}
                        </div>
                      </section>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SongItem({ song, onClick }: { song: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group text-left"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
        <img
          src={song.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
          alt={song.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate group-hover:text-harmonium-accent transition-colors">
          {song.name}
        </h4>
        <p className="text-xs text-white/40 truncate">{song.artist || 'Unknown Artist'}</p>
      </div>
    </button>
  );
}
