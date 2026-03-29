import React, { useState, useEffect } from 'react';
import { Search, Play, Music, Loader2, TrendingUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  onSelectSong: (url: string, name?: string, artist?: string) => void;
  onStopSong: () => void;
}

export const SongSearch: React.FC<SongSearchProps> = ({ onSelectSong, onStopSong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchSongs('@trending');
  }, []);

  const searchSongs = async (searchQuery?: string) => {
    const activeQuery = searchQuery || query;
    if (!activeQuery) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/songs?query=${encodeURIComponent(activeQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.results || []);
    } catch (e) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-white font-sans">
      {/* JioSaavn-Style Search Header */}
      <div className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[20px] p-2 pr-4 shadow-2xl">
          <div className="p-3 bg-teal-500/20 rounded-xl mr-3">
             <Search className="h-5 w-5 text-teal-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchSongs()}
            placeholder="Search on JioSaavn..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder-white/20"
          />
          <button
            onClick={() => searchSongs()}
            disabled={loading}
            className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "FIND"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
        {loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-teal-500/40">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Fetching JioSaavn Library...</p>
          </div>
        )}

        {/* Empty State / Trending Chips */}
        {!query && results.length === 0 && !loading && (
           <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                 <TrendingUp className="w-4 h-4 text-emerald-400" />
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Trending Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                 {['Bollywood Hits', 'Devotional', 'Arijit Singh', 'Indie Hindi', 'MS Dhoni'].map(tag => (
                   <button 
                     key={tag} 
                     onClick={() => { setQuery(tag); searchSongs(tag); }}
                     className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold hover:bg-teal-500 hover:text-black transition-all"
                   >
                     {tag}
                   </button>
                 ))}
              </div>
           </div>
        )}

        {/* Search Results in JioSaavn Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {results.map((song, i) => (
              <motion.div
                key={song.id + i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 hover:border-teal-500/20 transition-all cursor-pointer overflow-hidden"
                onClick={() => onSelectSong(song.url, song.name, song.artist)}
              >
                <div className="absolute top-2 right-2 flex gap-1">
                   {song.source === 'saavn' && <span className="text-[6px] font-black bg-teal-500 text-black px-1.2 rounded-sm rotate-12">SAAVN</span>}
                </div>
                <div className="relative shrink-0">
                  <img src={song.image} alt={song.name} className="w-16 h-16 rounded-2xl object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                     <Play className="w-6 h-6 fill-current text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:text-teal-400 transition-colors">{song.name}</h4>
                  <p className="text-[10px] text-white/40 font-medium truncate mt-1 uppercase tracking-tighter">{song.artist}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={onStopSong}
        className="mt-6 w-full py-4 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-[10px] font-black rounded-2xl border border-red-500/20 transition-all uppercase tracking-[0.3em]"
      >
        SILENCE BACKGROUND
      </button>
    </div>
  );
};
