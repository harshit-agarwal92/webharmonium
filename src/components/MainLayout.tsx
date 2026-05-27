'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Drawer } from '@/components/Drawer';
import { MiniPlayer } from '@/components/MiniPlayer';
import { usePathname } from 'next/navigation';
import { Menu, Piano as PianoIcon, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { 
    currentTrack, 
    isBGActive, 
    setIsBGActive, 
    stopBackgroundTrack, 
    playBackgroundTrack, 
    bgTime, 
    bgDuration,
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
  const isMusicPath = pathname.startsWith('/music');

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

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  const handleSelectSong = (song: any, context?: any[]) => {
    setCurrentTrack(song);
    // If context is provided (from Drawer search etc), use it
    if (context) {
        setQueue(context);
    } else {
        // Fallback detection
        if (trending.find(t => t.id === song.id)) setQueue(trending);
        else if (recentlyPlayed.find(t => t.id === song.id)) setQueue(recentlyPlayed);
    }
    
    playBackgroundTrack(song.url, song.name, song.artist, setIsBGActive);
    setDrawerOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col">
      {/* BACKGROUND GRADIENTS */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-masti-pink),_transparent_40%)] pointer-events-none opacity-20 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-masti-cyan),_transparent_40%)] pointer-events-none opacity-20 z-0" />

      {/* GLOBAL HEADER */}
      {!isMusicPath && (
        <header className="relative z-50 flex items-center justify-between p-4 md:p-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDrawerOpen(true)}
              className="p-3 glass rounded-2xl hover:bg-masti-pink/20 transition-all group active:scale-90"
            >
              <Menu className="w-6 h-6 group-hover:text-masti-pink transition-colors" />
            </button>
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
      <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar">
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

      {currentTrack && !isMusicPath && (
        <MiniPlayer 
          currentTrack={currentTrack}
          isPlaying={isBGActive}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={() => {
            if (isBGActive) {
                stopBackgroundTrack();
                setIsBGActive(false);
            } else {
                playBackgroundTrack(currentTrack.url, currentTrack.name, currentTrack.artist, setIsBGActive);
            }
          }}
          onVolumeChange={(v: number) => setAudioParam('volume', v)}
          onToggleMute={() => setIsMuted(!isMuted)}
          onNext={() => playNext()}
          onPrev={() => playPrevious()}
          progress={bgDuration ? bgTime / bgDuration : 0}
        />
      )}
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
