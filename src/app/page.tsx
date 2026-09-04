'use client';

import React, { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Star, Compass, Play, Pause, ArrowLeft, ChevronRight, VolumeX, Volume2, Search, Heart, FolderHeart, Download, Laptop, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOfflineTracks, getOfflineTrackBlobUrl } from '@/lib/offlineStorage';
import dynamic from 'next/dynamic';
const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });
import Image from 'next/image';

// MUSE COMPONENTS
import { Sidebar } from '@/components/muse/Sidebar';
import { TopHeader } from '@/components/muse/TopHeader';
import { MusicCarousel } from '@/components/muse/MusicCarousel';
import { PremiumMusicCard } from '@/components/muse/PremiumMusicCard';
import { FeaturedPlaylistCard } from '@/components/muse/FeaturedPlaylistCard';
const VirtualHarmonium = dynamic(() => import('@/components/muse/VirtualHarmonium').then(mod => ({ default: mod.VirtualHarmonium })), { ssr: false });

const FEATURED_PLAYLISTS = [
  { id: 'f-1', title: 'Top 50 Global', query: 'Global Hits', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&fit=crop' },
  { id: 'f-2', title: 'Chill Vibes', query: 'Lofi Chill', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&fit=crop' },
  { id: 'f-3', title: 'New in Bollywood', query: 'Latest Bollywood', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&fit=crop' }
];

export default function FuturisticMusicPage() {
  const { 
    currentTrack, setCurrentTrack, isBGActive, setIsBGActive,
    volume, setAudioParam, isMuted, setIsMuted, recentlyPlayed,
    queue, setQueue, playNext, playPrevious, playBackgroundTrack, setIsPlayerExpanded,
    playSong, likedSongs, customPlaylists, createPlaylist
  } = useAudio();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [mainTab, setMainTab] = useState<'home'|'harmonium'|'music'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // DATA STATES
  const [favorites, setFavorites] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [memoriesLimit, setMemoriesLimit] = useState(50);
  const [downloadQueue, setDownloadQueue] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLimit, setSearchLimit] = useState(24);

  // Dynamic Discovery States
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [trendingOffset, setTrendingOffset] = useState(0);

  const [topCharts, setTopCharts] = useState<any[]>([]);
  const [chartsOffset, setChartsOffset] = useState(0);

  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [newReleasesOffset, setNewReleasesOffset] = useState(0);

  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [artistsOffset, setArtistsOffset] = useState(0);

  const [recentlyAdded, setRecentlyAdded] = useState<any[]>([]);
  const [recentlyAddedOffset, setRecentlyAddedOffset] = useState(0);

  const [recommended, setRecommended] = useState<any[]>([]);
  const [recommendedOffset, setRecommendedOffset] = useState(0);

  const [azSongs, setAzSongs] = useState<any[]>([]);
  const [azOffset, setAzOffset] = useState(0);
  const [activeLetter, setActiveLetter] = useState('');

  const [loadingFeeds, setLoadingFeeds] = useState(true);

  const fetchCategory = async (category: string, offset: number, letter: string = ''): Promise<any[]> => {
    try {
      const res = await fetch(`/api/database?category=${category}&offset=${offset}&limit=24&letter=${letter}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleLoadMore = async (category: string) => {
    if (category === 'trending') {
      const more = await fetchCategory('trending', trendingOffset + 24);
      setTrendingSongs(prev => [...prev, ...more]);
      setTrendingOffset(prev => prev + 24);
    } else if (category === 'charts') {
      const more = await fetchCategory('charts', chartsOffset + 24);
      setTopCharts(prev => [...prev, ...more]);
      setChartsOffset(prev => prev + 24);
    } else if (category === 'new') {
      const more = await fetchCategory('new', newReleasesOffset + 24);
      setNewReleases(prev => [...prev, ...more]);
      setNewReleasesOffset(prev => prev + 24);
    } else if (category === 'artists') {
      const more = await fetchCategory('artists', artistsOffset + 24);
      setPopularArtists(prev => [...prev, ...more]);
      setArtistsOffset(prev => prev + 24);
    } else if (category === 'recently_added') {
      const more = await fetchCategory('recently_added', recentlyAddedOffset + 24);
      setRecentlyAdded(prev => [...prev, ...more]);
      setRecentlyAddedOffset(prev => prev + 24);
    } else if (category === 'recommended') {
      const more = await fetchCategory('recommended', recommendedOffset + 24);
      setRecommended(prev => [...prev, ...more]);
      setRecommendedOffset(prev => prev + 24);
    } else if (category === 'az') {
      const more = await fetchCategory('az', azOffset + 24, activeLetter);
      setAzSongs(prev => [...prev, ...more]);
      setAzOffset(prev => prev + 24);
    }
  };

  useEffect(() => {
    setMounted(true);
    getOfflineTracks().then(tracks => setDownloadQueue(tracks));
    const savedFavs = localStorage.getItem('masti_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
    fetch('/extracted_songs.json').then(r => r.json()).then(data => setMemories(data)).catch(() => {});
    fetchAllFeeds();
  }, []);

  const fetchAllFeeds = async () => {
    setLoadingFeeds(true);
    try {
      const [trend, charts, newR, artists, recent, rec] = await Promise.all([
        fetchCategory('trending', 0),
        fetchCategory('charts', 0),
        fetchCategory('new', 0),
        fetchCategory('artists', 0),
        fetchCategory('recently_added', 0),
        fetchCategory('recommended', 0)
      ]);
      setTrendingSongs(trend);
      setTopCharts(charts);
      setNewReleases(newR);
      setPopularArtists(artists);
      setRecentlyAdded(recent);
      setRecommended(rec);
      if (queue.length === 0 && trend.length > 0) setQueue(trend);
    } catch (e) {
      console.error("Failed to fetch feeds:", e);
    } finally {
      setLoadingFeeds(false);
    }
  };

  useEffect(() => {
    if (activeLetter) {
      setAzOffset(0);
      fetchCategory('az', 0, activeLetter).then(res => setAzSongs(res));
    }
  }, [activeLetter]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setSearchLimit(24);
    try {
      const res = await fetch(`/api/songs?query=${encodeURIComponent(query)}&limit=50`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavorite = React.useCallback((song: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.some(f => f.id === song.id || f.url === song.url);
      let newFavs;
      if (isFav) {
        newFavs = prev.filter(f => f.id !== song.id && f.url !== song.url);
      } else {
        newFavs = [song, ...prev];
      }
      localStorage.setItem('masti_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  }, []);

  const handleDownload = React.useCallback((song: any, e: React.MouseEvent) => {}, []);
  const handlePlaySong = React.useCallback(async (song: any, contextQueue?: any[]) => {
    if (!user) {
      setAuthMessage("Sign in required to play premium streams.");
      setShowAuthModal(true);
      return;
    }
    setIsPlayerExpanded(true);
    playSong(song, contextQueue);
  }, [user, playSong, setIsPlayerExpanded]);

  if (!mounted) return <div className="min-h-screen w-full bg-[#050505]" />;

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen}
        setShowAuthModal={setShowAuthModal}
        setShowInstallModal={setShowInstallModal}
        favoritesCount={favorites.length}
        downloadsCount={downloadQueue.length}
      />

      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)] pointer-events-none rounded-full" />
        <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.15)_0%,_transparent_70%)] pointer-events-none rounded-full" />
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto w-full pb-[180px]">
          <TopHeader 
            setMenuOpen={setMenuOpen} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            setActiveTab={setActiveTab}
          />

          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-4">
                
                {/* Main Navigation Tabs */}
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-full flex gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    {['home', 'harmonium', 'music'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setMainTab(tab as any)}
                        className={cn(
                          "px-8 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-300",
                          mainTab === tab 
                            ? "bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
                            : "text-white/50 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {mainTab === 'home' && (
                    <motion.div key="main-home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <MusicCarousel 
                        title="Trending Hits" 
                        subtitle="Ranked by community vibes"
                        badge="TOP CHART"
                        icon={<Flame className="w-4 h-4 text-[#8B5CF6]" />}
                        loading={loadingFeeds}
                        items={trendingSongs}
                        onReload={fetchAllFeeds}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            contextQueue={trendingSongs}
                            onClick={handlePlaySong} 
                            onFav={toggleFavorite} 
                            onDl={handleDownload} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('trending')}
                      />

                      <MusicCarousel 
                        title="Top Charts" 
                        badge="JIOSAAVN"
                        icon={<Star className="w-4 h-4 text-[#EC4899]" />}
                        loading={loadingFeeds}
                        items={topCharts}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            contextQueue={topCharts}
                            onClick={handlePlaySong} 
                            onFav={toggleFavorite} 
                            onDl={handleDownload} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('charts')}
                      />
                      
                      <MusicCarousel 
                        title="Popular Artists" 
                        badge="MASTI"
                        loading={loadingFeeds}
                        items={popularArtists}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            contextQueue={popularArtists}
                            onClick={handlePlaySong} 
                            onFav={toggleFavorite} 
                            onDl={handleDownload} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('artists')}
                      />

                      <MusicCarousel 
                        title="Recommended For You" 
                        badge="AI PICK"
                        loading={loadingFeeds}
                        items={recommended}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            contextQueue={recommended}
                            onClick={handlePlaySong} 
                            onFav={toggleFavorite} 
                            onDl={handleDownload} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('recommended')}
                      />
                    </motion.div>
                  )}

                  {mainTab === 'music' && (
                    <motion.div key="main-music" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      {recentlyPlayed.length > 0 && (
                        <MusicCarousel 
                          title="Continue Listening" 
                          badge="MASTI"
                          loading={false}
                          items={recentlyPlayed.slice(0, 8)}
                          renderItem={(song) => (
                            <PremiumMusicCard 
                              song={song} 
                              contextQueue={recentlyPlayed}
                            onClick={handlePlaySong} 
                              onFav={toggleFavorite} 
                              onDl={handleDownload} 
                              isFav={favorites.some(f => f.id === song.id)} 
                              isActive={currentTrack?.id === song.id}
                              isPlaying={isBGActive}
                            />
                          )}
                        />
                      )}

                      <MusicCarousel 
                        title="New Releases" 
                        badge="NEW"
                        loading={loadingFeeds}
                        items={newReleases}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            contextQueue={newReleases}
                            onClick={handlePlaySong} 
                            onFav={toggleFavorite} 
                            onDl={handleDownload} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('new')}
                      />
                      
                      <MusicCarousel 
                        title="Recently Added" 
                        badge="NEW"
                        loading={loadingFeeds}
                        items={recentlyAdded}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            contextQueue={recentlyAdded}
                            onClick={handlePlaySong} 
                            onFav={toggleFavorite} 
                            onDl={handleDownload} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('recently_added')}
                      />

                      {/* A-Z Browse Section */}
                      <section className="mb-14">
                        <div className="flex flex-col gap-1 mb-6">
                          <h3 className="text-xl font-bold tracking-tight text-white">A-Z Browse</h3>
                          <p className="text-sm text-white/40 font-medium">Filter songs alphabetically</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar-on-mobile snap-x snap-mandatory px-1">
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                            <button
                              key={letter}
                              onClick={() => setActiveLetter(letter)}
                              className={cn(
                                "shrink-0 w-10 h-10 rounded-full font-bold transition-all border snap-center",
                                activeLetter === letter 
                                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-110"
                                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                        
                        {activeLetter && (
                          <div className="mt-4">
                            <MusicCarousel 
                              title={`Songs starting with ${activeLetter}`}
                              badge="MASTI"
                              loading={false}
                              items={azSongs}
                              renderItem={(song) => (
                                <PremiumMusicCard 
                                  song={song} 
                                  contextQueue={azSongs}
                            onClick={handlePlaySong} 
                                  onFav={toggleFavorite} 
                                  onDl={handleDownload} 
                                  isFav={favorites.some(f => f.id === song.id)} 
                                  isActive={currentTrack?.id === song.id}
                                  isPlaying={isBGActive}
                                />
                              )}
                              onLoadMore={() => handleLoadMore('az')}
                            />
                          </div>
                        )}
                      </section>
                    </motion.div>
                  )}

                  {mainTab === 'harmonium' && (
                    <motion.div key="main-harmonium" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                      <VirtualHarmonium />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <h3 className="text-2xl font-bold mb-6">Search Results</h3>
                {isSearching ? (
                  <div className="flex flex-wrap gap-6">
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} className="w-48 h-64 rounded-2xl bg-[#111] animate-pulse border border-white/5" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-6">
                      {searchResults.slice(0, searchLimit).map((song, i) => (
                        <PremiumMusicCard 
                          key={i}
                          song={song} 
                          contextQueue={searchResults}
                              onClick={handlePlaySong} 
                          onFav={toggleFavorite} 
                          onDl={handleDownload} 
                          isFav={favorites.some(f => f.id === song.id)} 
                          isActive={currentTrack?.id === song.id}
                          isPlaying={isBGActive}
                        />
                      ))}
                    </div>
                    {searchResults.length > searchLimit && (
                      <div className="flex justify-center mt-10">
                        <button 
                          onClick={() => setSearchLimit(prev => prev + 24)}
                          className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          Load More Results
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-white/40">Enter a term to search across streams.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'explore' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center max-w-lg mx-auto">
                <Compass className="w-20 h-20 text-masti-pink mb-6 animate-pulse" />
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Explore Mode</h2>
                <div className="bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6 inline-block">
                  Under Development
                </div>
                <p className="text-white/60 mb-10 text-lg leading-relaxed">
                  We are actively building a completely new and immersive discovery experience. Stay tuned!
                </p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="px-8 py-3.5 bg-gradient-to-r from-masti-pink to-masti-cyan rounded-full text-sm font-black uppercase tracking-wider text-white shadow-[0_0_30px_rgba(255,0,127,0.4)] hover:shadow-[0_0_40px_rgba(255,0,127,0.6)] hover:scale-105 active:scale-95 transition-all"
                >
                  Go Back to Home
                </button>
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <h3 className="text-2xl font-bold mb-6">Memories</h3>
                {memories.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-6">
                      {memories.slice(0, memoriesLimit).map((song, i) => (
                        <PremiumMusicCard 
                          key={i}
                          song={song} 
                          contextQueue={memories}
                          onClick={handlePlaySong} 
                          onFav={toggleFavorite} 
                          onDl={handleDownload} 
                          isFav={favorites.some(f => f.id === song.id)} 
                          isActive={currentTrack?.id === song.id}
                          isPlaying={isBGActive}
                        />
                      ))}
                    </div>
                    {memories.length > memoriesLimit && (
                      <div className="w-full flex justify-center mt-10">
                        <button 
                          onClick={() => setMemoriesLimit(prev => prev + 50)}
                          className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full font-bold text-sm transition-colors"
                        >
                          Load More Memories
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-8 h-8 border-4 border-masti-pink border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-white/40">Loading Memories...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'liked' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black flex items-center gap-2">
                      <Heart className="w-6 h-6 text-[#EC4899] fill-[#EC4899]" /> Liked Songs
                    </h3>
                    <p className="text-xs text-white/40 mt-1 font-medium">{likedSongs.length} tracks in your personal collection</p>
                  </div>
                  {likedSongs.length > 0 && (
                    <button
                      onClick={() => handlePlaySong(likedSongs[0], likedSongs)}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full text-xs font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-all"
                    >
                      Play All
                    </button>
                  )}
                </div>

                {likedSongs.length > 0 ? (
                  <div className="flex flex-wrap gap-6">
                    {likedSongs.map((song, i) => (
                      <PremiumMusicCard
                        key={i}
                        song={song}
                        contextQueue={likedSongs}
                        onClick={handlePlaySong}
                        onFav={toggleFavorite}
                        onDl={handleDownload}
                        isFav={favorites.some(f => f.id === song.id)}
                        isActive={currentTrack?.id === song.id}
                        isPlaying={isBGActive}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Heart className="w-16 h-16 text-white/10 mb-4" />
                    <p className="text-white/40">No liked songs yet. Click the heart icon on any song to add it here!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'playlists' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black flex items-center gap-2">
                      <FolderHeart className="w-6 h-6 text-[#8B5CF6]" /> Custom Playlists
                    </h3>
                    <p className="text-xs text-white/40 mt-1 font-medium">{customPlaylists.length} playlists created</p>
                  </div>
                  <button
                    onClick={() => {
                      const name = prompt('Enter playlist name:');
                      if (name) createPlaylist(name);
                    }}
                    className="px-6 py-2.5 bg-white/10 border border-white/20 hover:bg-[#8B5CF6] hover:border-[#8B5CF6] rounded-full text-xs font-bold text-white transition-all"
                  >
                    + Create Playlist
                  </button>
                </div>

                {customPlaylists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customPlaylists.map(pl => (
                      <div key={pl.id} className="p-5 rounded-2xl bg-[#0f0f0f] border border-white/10 flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-white">{pl.name}</h4>
                          <p className="text-xs text-white/40 mt-1 font-medium">{pl.songs.length} tracks</p>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          {pl.songs.length > 0 ? (
                            <button
                              onClick={() => handlePlaySong(pl.songs[0], pl.songs)}
                              className="px-5 py-2 rounded-full bg-[#8B5CF6] text-white text-xs font-bold hover:scale-105 transition-all"
                            >
                              Play Playlist
                            </button>
                          ) : (
                            <span className="text-xs text-white/30 italic">Empty playlist</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FolderHeart className="w-16 h-16 text-white/10 mb-4" />
                    <p className="text-white/40">No custom playlists created yet. Click "+ Create Playlist" to get started!</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'genres' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <h3 className="text-2xl font-black mb-6">Moods & Genres</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { name: 'Romantic Hits', query: 'Romantic Hits', bg: 'from-pink-600 to-rose-900' },
                    { name: 'Party Anthems', query: 'Party Hits', bg: 'from-purple-600 to-indigo-900' },
                    { name: 'Sad & Lofi', query: 'Sad Lofi', bg: 'from-blue-600 to-slate-900' },
                    { name: 'Workout Energy', query: 'Workout Energy', bg: 'from-amber-600 to-orange-900' },
                    { name: 'Devotional', query: 'Devotional', bg: 'from-emerald-600 to-teal-900' },
                    { name: '90s Nostalgia', query: '90s Bollywood', bg: 'from-red-600 to-pink-900' }
                  ].map(genre => (
                    <button
                      key={genre.name}
                      onClick={() => {
                        setSearchQuery(genre.query);
                        handleSearch(genre.query);
                        setActiveTab('search');
                      }}
                      className={cn(
                        "h-28 p-4 rounded-2xl bg-gradient-to-br border border-white/10 flex flex-col justify-end text-left font-black text-lg text-white shadow-xl hover:scale-105 transition-transform",
                        genre.bg
                      )}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Other tabs fallback view */}
            {['favorites', 'downloads'].includes(activeTab) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <Compass className="w-16 h-16 text-white/10 mb-4" />
                <p className="text-white/40">Switch back to Home to browse the Masti feeds.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>



      {/* MOBILE BOTTOM NAVIGATION - Replaces Top Nav for Tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around z-[70] pb-safe">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'search', icon: Search, label: 'Search' },
          { id: 'explore', icon: Compass, label: 'Explore' },
          { id: 'library', icon: FolderHeart, label: 'Memories' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === tab.id ? "text-[#8B5CF6]" : "text-white/40 hover:text-white/80"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialMessage={authMessage}
            onSuccess={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
