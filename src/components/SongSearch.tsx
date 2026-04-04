'use client';

import { useState, useEffect } from 'react';
import { Search, Play, Loader2, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  source?: string;
}

interface SongSearchProps {
  query?: string;
  onResultsUpdate?: (results: Song[]) => void;
  onSelectSong: (url: string, name?: string, artist?: string, img?: string) => void;
  onStopSong?: () => void;
  isBGActive: boolean;
  setIsBGActive: (active: boolean) => void;
}

export const SongSearch = ({ query = '', onResultsUpdate, onSelectSong, isBGActive, setIsBGActive }: SongSearchProps) => {
  const [results, setResults] = useState<Song[]>([]);
  const [trending, setTrending] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (query) {
      const delayDebounceFn = setTimeout(() => {
        searchSongs(query);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setResults([]);
    }
  }, [query]);

  const fetchTrending = async () => {
    try {
      const response = await fetch(`/api/songs?query=${encodeURIComponent('@trending')}`);
      if (response.ok) {
        const data = await response.json();
        setTrending(data.results || []);
      }
    } catch (e) {
      console.error("Failed to fetch trending:", e);
    }
  };

  const searchSongs = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/songs?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      const songs = data.results || [];
      setResults(songs);
      onResultsUpdate?.(songs);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-white font-sans animate-fade-in">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-12">

        {/* IF SEARCHING SHOW RESULTS */}
        {query && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Search className="w-4 h-4 text-spotify-green" />
              <h3 className="text-2xl font-black font-poppins tracking-tight">Search Results</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-spotify-green" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <AnimatePresence>
                  {results.map((song, i) => (
                    <SongCard key={song.id + i} song={song} onClick={() => onSelectSong(song.url, song.name, song.artist, song.image)} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}

        {/* DEFAULT VIEW: TRENDING & CATEGORIES */}
        {!query && (
          <>
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <h3 className="text-2xl font-black font-poppins tracking-tight">Trending Now</h3>
                </div>
                <button className="text-xs font-bold text-spotify-text-secondary uppercase tracking-widest hover:underline">Show All</button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar no-scrollbar-on-mobile snap-x h-[280px] items-start">
                {trending.map((song, i) => (
                  <SongCard key={'trend' + song.id + i} song={song} onClick={() => onSelectSong(song.url, song.name, song.artist, song.image)} large />
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <Sparkles className="w-5 h-5 text-spotify-green" />
                <h3 className="text-2xl font-black font-poppins tracking-tight">Recently Played</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {trending.slice(0, 5).map((song, i) => (
                  <SongCard key={'recent' + song.id + i} song={song} onClick={() => onSelectSong(song.url, song.name, song.artist, song.image)} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

function SongCard({ song, onClick, large = false }: { song: Song, onClick: () => void, large?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-4 spotify-card p-4 cursor-pointer snap-start",
        large ? "w-52" : "w-full"
      )}
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-2xl">
        <img src={song.image} alt={song.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute right-2 bottom-2 bg-spotify-green p-3 rounded-full shadow-2xl opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Play className="w-6 h-6 fill-current text-black" />
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:underline">{song.name}</h4>
        <p className="text-xs text-spotify-text-secondary truncate">{song.artist}</p>
      </div>
    </motion.div>
  );
}
