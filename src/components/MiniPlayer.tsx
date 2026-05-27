'use client';

import { Play, Pause, SkipForward, Volume2, SkipBack, VolumeX, ChevronDown, Download, Heart, Shuffle, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAudio } from '@/context/AudioContext';

interface MiniPlayerProps {
  currentTrack: any;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function MiniPlayer({ 
  currentTrack, isPlaying, onTogglePlay, onNext, onPrev, 
  progress, volume, onVolumeChange, isMuted, onToggleMute 
}: MiniPlayerProps) {
  const { isPlayerExpanded, setIsPlayerExpanded, bgTime, bgDuration } = useAudio();

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If not expanded, render the Mini version. If expanded, render Full screen version.
  return (
    <>
      <AnimatePresence>
        {!isPlayerExpanded && (
          <motion.div
            layoutId="player-container"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={() => setIsPlayerExpanded(true)}
            className="fixed bottom-[90px] md:bottom-4 left-4 right-4 md:left-[10%] md:right-[10%] h-[70px] glass rounded-2xl z-[90] flex items-center px-4 border border-white/20 shadow-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          >
            {/* Progress Bar overlay */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-masti-pink shadow-[0_0_10px_rgba(255,0,127,0.8)]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
              {currentTrack && (
                <>
                  <motion.div layoutId="player-artwork" className="w-12 h-12 rounded-lg overflow-hidden shadow-lg shrink-0">
                    <img
                      src={currentTrack.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
                      alt={currentTrack.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="flex flex-col min-w-0">
                    <motion.h4 layoutId="player-title" className="text-sm font-bold truncate tracking-tight text-white">{currentTrack.name}</motion.h4>
                    <motion.p layoutId="player-artist" className="text-[10px] text-white/50 truncate font-medium mt-0.5">{currentTrack.artist || 'Masti Music'}</motion.p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
              <button onClick={onTogglePlay} className="p-2 bg-white text-black rounded-full shadow-lg">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 translate-x-[1px] fill-current" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlayerExpanded && (
          <motion.div
            layoutId="player-container"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) setIsPlayerExpanded(false);
            }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Blurred Background from Artwork */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 blur-[80px] scale-110"
                style={{ backgroundImage: `url(${currentTrack?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 pt-12">
              <button onClick={() => setIsPlayerExpanded(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                <ChevronDown className="w-6 h-6" />
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-white/50">Now Playing</span>
              <div className="w-8" /> {/* Spacer */}
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-12 w-full max-w-md mx-auto">
              
              {/* Massive Artwork */}
              <motion.div layoutId="player-artwork" className="w-full aspect-square rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(255,0,127,0.2)] mb-10 relative group">
                <img
                  src={currentTrack?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
                  alt={currentTrack?.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>

              {/* Title & Actions Row */}
              <div className="w-full flex items-center justify-between mb-8">
                <div className="flex flex-col min-w-0 pr-4">
                  <motion.h2 layoutId="player-title" className="text-2xl md:text-3xl font-black text-white truncate tracking-tight">{currentTrack?.name}</motion.h2>
                  <motion.p layoutId="player-artist" className="text-base text-white/50 truncate font-medium mt-1">{currentTrack?.artist || 'Masti Music'}</motion.p>
                </div>
                <button className="p-3 text-white/50 hover:text-masti-pink transition-colors">
                  <Heart className="w-7 h-7" />
                </button>
              </div>

              {/* Seekbar */}
              <div className="w-full mb-8">
                <div className="group cursor-pointer mb-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                     <div 
                       className="absolute top-0 left-0 h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_white]"
                       style={{ width: `${progress * 100}%` }}
                     />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-white/40 tracking-widest">
                  <span>{formatTime(bgTime)}</span>
                  <span>{formatTime(bgDuration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full flex items-center justify-between">
                <button className="text-white/40 hover:text-white transition-colors"><Shuffle className="w-5 h-5" /></button>
                <button onClick={onPrev} className="text-white hover:text-masti-pink transition-colors active:scale-90"><SkipBack className="w-10 h-10 fill-current" /></button>
                <button onClick={onTogglePlay} className="w-20 h-20 rounded-full bg-masti-pink text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,0,127,0.4)]">
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 translate-x-[2px] fill-current" />}
                </button>
                <button onClick={onNext} className="text-white hover:text-masti-pink transition-colors active:scale-90"><SkipForward className="w-10 h-10 fill-current" /></button>
                <button className="text-white/40 hover:text-white transition-colors"><Repeat className="w-5 h-5" /></button>
              </div>
              
              {/* Download Option */}
              <div className="w-full flex justify-center mt-10">
                 <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-white/60">
                    <Download className="w-4 h-4" /> Save Offline
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
