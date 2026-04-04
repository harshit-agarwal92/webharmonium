'use client';

import React from 'react';
import { SongSearch } from '@/components/SongSearch';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Piano } from 'lucide-react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

export default function SongsPage() {
  const router = useRouter();
  const { playBackgroundTrack, stopBackgroundTrack } = useAudioEngine();
  const [isBGActive, setIsBGActive] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0a0500] text-amber-100 p-6 lg:p-12 selection:bg-amber-500/30 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/')}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-spotify-green hover:text-black transition-all group"
            >
              <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white font-poppins">
                SONG <span className="text-spotify-green not-italic">EXPLORER</span>
              </h2>
              <p className="text-sm text-white/40 uppercase tracking-[0.3em] font-bold">Discover studio tracks</p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 px-8 py-5 bg-spotify-green text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-spotify-green/20"
          >
            <Piano className="w-5 h-5" />
            Open Studio
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-10 rounded-[48px] shadow-3xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white font-poppins uppercase tracking-tighter">Search JioSaavn</h2>
              <p className="text-sm text-white/40">Find any song and play it as a background track for your harmonium practice.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
               <span className="bg-white/5 px-4 py-2 rounded-full border border-white/10">Enterprise API v5.2</span>
            </div>
          </div>
          
          <div className="h-[700px]">
            <SongSearch 
              onSelectSong={(url, name, artist) => {
                playBackgroundTrack(url, name, artist, setIsBGActive);
              }}
              onStopSong={() => {
                 stopBackgroundTrack();
                 setIsBGActive(false);
              }}
              isBGActive={isBGActive}
              setIsBGActive={setIsBGActive}
            />
          </div>
        </div>

        {/* Info Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40">
           <div className="p-6 rounded-3xl border border-white/10 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-accent-gold">High Quality</h3>
              <p className="text-[10px] leading-relaxed">Stream 320kbps audio directly from Saavn servers for the best experience.</p>
           </div>
           <div className="p-6 rounded-3xl border border-white/10 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-accent-gold">Instant Sync</h3>
              <p className="text-[10px] leading-relaxed">Audio tracks stay active even when you navigate back to the harmonium.</p>
           </div>
           <div className="p-6 rounded-3xl border border-white/10 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-accent-gold">Practice Tool</h3>
              <p className="text-[10px] leading-relaxed">Perfect for riyaz with your favorite Bollywood or classical tracks.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
