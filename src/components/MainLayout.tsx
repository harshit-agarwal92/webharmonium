'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAudio } from '@/context/AudioContext';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav } from '@/components/BottomNav';
import { usePathname } from 'next/navigation';
import { Menu, Piano as PianoIcon, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const Drawer = dynamic(() => import('@/components/Drawer').then(mod => ({ default: mod.Drawer })), { ssr: false });
const InstallPromptModal = dynamic(() => import('@/components/InstallPromptModal').then(mod => ({ default: mod.InstallPromptModal })), { ssr: false });
import Link from 'next/link';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { 
    currentTrack, 
    isBGActive, 
    setIsBGActive, 
    stopBackgroundTrack, 
    playBackgroundTrack, 
    isMuted,
    setIsMuted,
    volume,
    setAudioParam,
    recentlyPlayed,
    setCurrentTrack,
    playNext,
    playPrevious,
    queue,
    setQueue
  } = useAudio();
  
  const [trending, setTrending] = useState<any[]>([]);
  const pathname = usePathname();
  const isMusicPath = pathname === '/' || pathname.startsWith('/music');

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/songs?query=@trending');
        const data = await res.json();
        const results = data.results?.slice(0, 8) || [];
        setTrending(results);
        // Initialize queue with trending if empty
        if (queue.length === 0) setQueue(results);
      } catch (e) {
        console.error("Failed to fetch trending:", e);
      }
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('Masti PWA Service Worker registered:', reg.scope))
          .catch(err => console.error('Masti PWA Service Worker registration failed:', err));
      };
      
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  const handleSelectSong = useCallback((song: any, context?: any[]) => {
    setCurrentTrack(song);
    if (context) {
        setQueue(context);
    } else {
        if (trending.find(t => t.id === song.id)) setQueue(trending);
        else if (recentlyPlayed.find(t => t.id === song.id)) setQueue(recentlyPlayed);
    }
    console.log("Song Object:", song);
    playBackgroundTrack(song.url, song.name, song.artist, setIsBGActive);
    setDrawerOpen(false);
  }, [trending, recentlyPlayed, setCurrentTrack, setQueue, playBackgroundTrack, setIsBGActive]);

  const handleTogglePlay = useCallback(() => {
    if (isBGActive) {
      stopBackgroundTrack();
      setIsBGActive(false);
    } else if (currentTrack) {
      console.log("Song Object (toggle):", currentTrack);
      playBackgroundTrack(currentTrack.url, currentTrack.name, currentTrack.artist, setIsBGActive);
    }
  }, [isBGActive, currentTrack, stopBackgroundTrack, playBackgroundTrack, setIsBGActive]);

  const handleVolumeChange = useCallback((v: number) => setAudioParam('volume', v), [setAudioParam]);
  const handleToggleMute = useCallback(() => setIsMuted(!isMuted), [isMuted, setIsMuted]);
  const handleNext = useCallback(() => playNext(), [playNext]);
  const handlePrev = useCallback(() => playPrevious(), [playPrevious]);

  return (
    <div className="relative min-h-[100dvh] w-full bg-black text-white font-sans overflow-hidden flex flex-col">
      {/* DYNAMIC AMBIENT ARTWORK BACKDROP */}
      {currentTrack?.image && (
        <div 
          className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-15 blur-[120px] scale-125 transition-all duration-1000 z-0"
          style={{ backgroundImage: `url(${currentTrack.image})` }}
        />
      )}
      {/* BACKGROUND GRADIENTS */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_#EC4899,_transparent_45%)] pointer-events-none opacity-20 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_#00F0FF,_transparent_45%)] pointer-events-none opacity-20 z-0" />

      {/* GLOBAL HEADER */}
      {!isMusicPath && (
        <header className="relative z-50 flex items-center justify-between p-4 md:p-8 shrink-0">
          <div className="flex items-center gap-4">

            <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
              <div className="w-10 h-10 bg-gradient-to-r from-masti-pink to-masti-cyan rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,0,127,0.4)]">
                <PianoIcon className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase hidden sm:block">
                Masti <span className="text-transparent bg-clip-text bg-gradient-to-r from-masti-pink to-masti-cyan">Music</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center glass rounded-2xl px-2 py-1 mr-4">
               <NavLink href="/" active={pathname === "/"}>Home</NavLink>
               <NavLink href="/harmonium" active={pathname === "/harmonium"}>Harmonium</NavLink>
               <NavLink href="/music" active={pathname === "/music"}>Music</NavLink>
            </nav>
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-3 glass rounded-2xl transition-all",
                isMuted ? "text-red-500" : "text-white/60 hover:text-white"
              )}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* PAGE CONTENT */}
      <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pb-[180px] md:pb-24">
        {children}
      </main>

      {/* DRAWERS & PLAYERS */}
      {!isMusicPath && (
        <Drawer 
          isOpen={drawerOpen} 
          onClose={() => setDrawerOpen(false)} 
          onSelectSong={handleSelectSong}
          trendingSongs={trending}
          recentlyPlayed={recentlyPlayed}
        />
      )}

      {currentTrack && (
        <MiniPlayer 
          currentTrack={currentTrack}
          isPlaying={isBGActive}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={handleTogglePlay}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <InstallPromptModal />
      {!isMusicPath && <BottomNav />}
    </div>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link 
      href={href}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
        active ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}
