'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Sparkles, Grid, History, Play, Filter, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MusicPage() {
  const { setCurrentTrack, playBackgroundTrack, setIsBGActive, recentlyPlayed, setQueue, queue } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchTrending();
    fetchNewReleases();
  }, []);

  // DEBOUNCED SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch(searchQuery);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/songs?query=@trending');
      const data = await res.json();
      const results = data.results || [];
      setTrending(results);
      if (queue.length === 0) setQueue(results);
    } catch (e) {
      console.error("Failed to fetch trending:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/songs?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: any) => {
    setCurrentTrack(song);
    // Determine context (Search results or Trending or New)
    if (searchResults.find(t => t.id === song.id)) {
        setQueue(searchResults);
    } else if (trending.find(t => t.id === song.id)) {
        setQueue(trending);
    } else if (newReleases.find(t => t.id === song.id)) {
        setQueue(newReleases);
    } else if (recentlyPlayed.find(t => t.id === song.id)) {
        setQueue(recentlyPlayed);
    }
    
    playBackgroundTrack(song.url, song.name, song.artist, setIsBGActive);
  };

  const fetchNewReleases = async () => {
    try {
       const res = await fetch('/api/songs?query=latest%202024');
       const data = await res.json();
       setNewReleases(data.results?.slice(0, 10) || []);
    } catch (e) {}
  };

  const categories = [
    { name: 'Bollywood', color: 'from-orange-500 to-red-600', icon: '🎬' },
    { name: 'Bhajan', color: 'from-yellow-400 to-orange-500', icon: '🪔' },
    { name: 'Classical', color: 'from-harmonium-purple to-harmonium-deep-purple', icon: '🎻' },
    { name: 'Lo-fi', color: 'from-blue-600 to-purple-600', icon: '☕' }
  ];

  return (
    <div className="h-full flex flex-col p-6 md:p-12 max-w-7xl mx-auto w-full pb-[120px]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-4">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-[10px]">Back Home</span>
            </Link>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">Studio <span className="text-harmonium-accent">Vault</span></h1>
            <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em] px-1 border-l-4 border-harmonium-accent mt-4">JioSaavn Enterprise Stream v5.2</p>
        </div>

        <div className="md:w-96 glass-card p-1 rounded-[24px] group">
            <div className="relative flex items-center">
                <Search className="absolute left-6 w-5 h-5 text-white/20 group-focus-within:text-harmonium-accent transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs..."
                  className="w-full bg-transparent border-none outline-none py-4 pl-16 pr-6 font-bold text-sm placeholder-white/20"
                />
                <button className="absolute right-4 p-2 bg-white/5 rounded-2xl hover:bg-white/10">
                    <Filter className="w-4 h-4 text-white/40" />
                </button>
            </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.section 
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-harmonium-accent/20 rounded-2xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-harmonium-accent" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {loading ? "Searching Studio..." : searchResults.length > 0 ? `Found ${searchResults.length} Results` : "No results found"}
                </h3>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {[1,2,3,4,5].map(i => <div key={i} className="aspect-square bg-white/5 rounded-[40px] animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {searchResults.map((song, i) => (
                        <SongCard key={song.id || i} song={song} onPlay={() => handlePlaySong(song)} />
                    ))}
                </div>
            )}
          </motion.section>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* TRENDING SECTION */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                          <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Trending Now</h3>
                  </div>
                  <button onClick={fetchTrending} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white">Refresh →</button>
              </div>

              <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar snap-x no-scrollbar-on-mobile h-[340px] items-start">
                  {loading ? (
                      [1,2,3,4].map(i => <div key={i} className="w-[240px] h-[300px] bg-white/5 rounded-[40px] animate-pulse shrink-0" />)
                  ) : (
                      trending.map((song, i) => (
                          <SongCard key={song.id || i} song={song} onPlay={() => handlePlaySong(song)} large />
                      ))
                  )}
              </div>
            </section>

            {/* NEW RELEASES SECTION */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-500 fill-purple-500" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">New Releases</h3>
                  </div>
              </div>

              <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar h-[340px] items-start">
                  {newReleases.map((song, i) => (
                      <SongCard key={song.id || i} song={song} onPlay={() => handlePlaySong(song)} large />
                  ))}
              </div>
            </section>

            {/* CATEGORIES GRID */}
            <div className="grid lg:grid-cols-2 gap-16">
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-harmonium-accent/20 rounded-2xl flex items-center justify-center">
                            <Grid className="w-6 h-6 text-harmonium-accent" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Explore Genres</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat, i) => (
                            <div 
                              key={i} 
                              onClick={() => { setSearchQuery(cat.name); handleSearch(cat.name); }}
                              className={cn(
                                  "relative h-32 rounded-[32px] overflow-hidden p-6 glass-card group cursor-pointer border border-white/5",
                                  "hover:scale-[1.02] active:scale-98 transition-all shadow-xl"
                              )}
                            >
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", cat.color)} />
                                <span className="text-4xl absolute -bottom-2 -right-2 rotate-12 opacity-40 grayscale group-hover:grayscale-0 group-hover:rotate-0 transition-all duration-500 leading-none">{cat.icon}</span>
                                <h4 className="text-xl font-black uppercase tracking-tighter relative z-10">{cat.name}</h4>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RECENTLY PLAYED */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                            <History className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Recently Played</h3>
                    </div>
                    <div className="space-y-4">
                        {recentlyPlayed.length > 0 ? recentlyPlayed.map((song, i) => (
                            <div key={i} className="flex items-center gap-4 glass-card p-3 rounded-[24px] group border border-white/5">
                                <img src={song.image} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" data-artist={song.artist} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold truncate text-sm">{song.name}</h4>
                                    <p className="text-[10px] text-white/30 truncate font-black uppercase tracking-[0.1em]">{song.artist}</p>
                                </div>
                                <button 
                                  onClick={() => handlePlaySong(song)}
                                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-harmonium-accent hover:text-black transition-all group-hover:scale-110 active:scale-90"
                                >
                                  <Play className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 opacity-40">
                                <History className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No studio history yet</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SongCard({ song, onPlay, large = false }: { song: any, onPlay: () => void, large?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      className={cn(
        "group relative flex flex-col glass-card p-5 rounded-[40px] cursor-pointer snap-start border border-white/5 shrink-0",
        large ? "w-[240px]" : "w-full"
      )}
      onClick={onPlay}
    >
      <div className="relative aspect-square w-full rounded-[30px] overflow-hidden mb-6 shadow-2xl border border-white/10">
        <img src={song.image} alt={song.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute right-4 bottom-4 bg-white p-5 rounded-[24px] text-black shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 scale-90 group-hover:scale-110">
          <Play className="w-6 h-6 fill-current" />
        </div>
      </div>

      <div className="px-2">
        <h4 className="text-md font-black tracking-tighter uppercase leading-none truncate group-hover:text-harmonium-accent transition-colors">{song.name}</h4>
        <p className="text-[10px] text-white/30 truncate mt-2 font-black uppercase tracking-widest">{song.artist}</p>
      </div>
    </motion.div>
  );
}
