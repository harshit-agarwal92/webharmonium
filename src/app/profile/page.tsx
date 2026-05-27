'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import { User as UserIcon, LogOut, ShieldCheck, Mail, ArrowLeft, Settings, Headphones, Heart, ListMusic, DownloadCloud, Clock, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { HorizontalScrollSection } from '@/components/profile/HorizontalScrollSection';
import { getOfflineTracks } from '@/lib/offlineStorage';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

export default function ProfilePage() {
  const { user, isAdmin, logout, loading } = useAuth();
  const { recentlyPlayed, setCurrentTrack, playBackgroundTrack, setIsBGActive, setQueue, setIsPlayerExpanded } = useAudio();
  const { likedSongs, playlists, loading: libLoading } = useUserLibrary();
  const router = useRouter();

  const [downloads, setDownloads] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      router.push('/music');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadDownloads() {
       const tracks = await getOfflineTracks();
       setDownloads(tracks);
    }
    loadDownloads();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/music');
  };

  const playSong = (song: any, contextQueue: any[]) => {
    setIsPlayerExpanded(true);
    setCurrentTrack(song);
    setQueue(contextQueue);
    setTimeout(() => {
      playBackgroundTrack(song.url, song.name, song.artist, setIsBGActive);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 overflow-x-hidden relative pb-32">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-masti-pink/20 to-black opacity-50" />
      </div>

      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-8">
        <Link href="/music" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <button onClick={() => alert("Settings coming soon!")} className="p-2 text-white/70 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-24 max-w-5xl mx-auto px-4 md:px-8">
        
        {/* PROFILE HEADER CARD */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
          {/* Avatar Profile */}
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-masti-pink to-masti-cyan rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-[6px] border-black bg-white/10 z-10 flex items-center justify-center shadow-2xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-white/50" />
              )}
            </div>
            {isAdmin && (
              <div className="absolute bottom-0 right-0 bg-yellow-500 text-black p-2.5 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] z-20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50 mb-2">Profile</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">{user.displayName || "User"}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-white/60 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Premium Tier</span>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatBox icon={<Headphones className="w-5 h-5 text-masti-pink" />} label="Listening Hours" value="124" />
          <StatBox icon={<Heart className="w-5 h-5 text-red-500" />} label="Liked Songs" value={likedSongs.length.toString()} />
          <StatBox icon={<ListMusic className="w-5 h-5 text-masti-cyan" />} label="Playlists" value={playlists.length.toString()} />
          <StatBox icon={<DownloadCloud className="w-5 h-5 text-white" />} label="Downloads" value={downloads.length.toString()} />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-8">
           <button 
             onClick={() => setIsEditModalOpen(true)}
             className="px-6 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2"
           >
             <Edit3 className="w-4 h-4" /> Edit Profile
           </button>
           <button onClick={handleLogout} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
             <LogOut className="w-4 h-4" /> Disconnect
           </button>
        </div>

        {/* RECENTLY PLAYED */}
        <HorizontalScrollSection 
          title="Recently Played" 
          items={recentlyPlayed} 
          onPlay={(song) => playSong(song, recentlyPlayed)} 
          emptyMessage="Start listening to see your history."
        />

        {/* LIKED SONGS CAROUSEL */}
        <HorizontalScrollSection 
          title="Liked Songs" 
          items={likedSongs} 
          onPlay={(song) => playSong(song, likedSongs)} 
          emptyMessage="No liked songs yet."
        />

        {/* OFFLINE DOWNLOADS */}
        <HorizontalScrollSection 
          title="Offline Vault" 
          items={downloads} 
          onPlay={(song) => playSong(song, downloads)} 
          emptyMessage="No songs downloaded yet."
        />

        {/* LIKED SONGS & PLAYLISTS CARDS */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-8 hover:border-red-500/30 transition-all cursor-pointer group">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform">
               <Heart className="w-8 h-8 text-white fill-current" />
             </div>
             <h3 className="text-2xl font-black text-white mb-2">Liked Songs</h3>
             <p className="text-sm font-bold text-white/50">{likedSongs.length} saved tracks</p>
          </div>

          <div className="glass-card rounded-3xl p-8 hover:border-masti-cyan/30 transition-all cursor-pointer group flex flex-col justify-end relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-masti-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <h3 className="text-2xl font-black text-white mb-2 relative z-10">Your Playlists</h3>
             <p className="text-sm font-bold text-white/50 relative z-10">{playlists.length} custom mixes</p>
          </div>
        </div>

        {/* MODALS */}
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</span>
        {icon}
      </div>
      <span className="text-3xl font-black tracking-tighter text-white">{value}</span>
    </div>
  );
}
