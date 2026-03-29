'use client';

import React from 'react';
import { SongSearch } from '@/components/SongSearch';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Piano } from 'lucide-react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

export default function SongsPage() {
  const router = useRouter();
  const { playBackgroundTrack, stopBackgroundTrack } = useAudioEngine();

  return (
    <div className="min-h-screen bg-[#0a0500] text-amber-100 p-6 lg:p-12 selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/')}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-accent-gold hover:text-black transition-all group"
            >
              <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">
                SONG <span className="text-accent-gold not-italic">EXPLORER</span>
              </h1>
              <p className="text-sm text-white/40 uppercase tracking-[0.3em] font-bold">Discover background tracks</p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 px-6 py-4 bg-accent-gold text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            <Piano className="w-5 h-5" />
            Back to Harmonium
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Search JioSaavn</h2>
            <p className="text-sm text-white/40">Find any song and play it as a background track for your harmonium practice.</p>
          </div>
          
          <div className="h-[600px]">
            <SongSearch 
              onSelectSong={(url) => {
                playBackgroundTrack(url);
                // Optionally show a notification
              }}
              onStopSong={stopBackgroundTrack}
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
