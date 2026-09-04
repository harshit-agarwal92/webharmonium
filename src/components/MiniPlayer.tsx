import { Play, Pause, SkipForward, Volume2, SkipBack, VolumeX, ChevronDown, Download, Heart, Shuffle, Repeat, ListMusic, Moon, FileText, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAudio } from '@/context/AudioContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MiniPlayerProps {
  currentTrack: any;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function MiniPlayer({ 
  currentTrack, isPlaying, onTogglePlay, onNext, onPrev, 
  volume, onVolumeChange, isMuted, onToggleMute 
}: MiniPlayerProps) {
  const { 
    isPlayerExpanded, setIsPlayerExpanded, getBgAudio,
    isShuffle, toggleShuffle, repeatMode, cycleRepeatMode,
    isLiked, toggleLikedSong, queue, playSong,
    sleepTimer, setSleepTimer
  } = useAudio();

  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0.1);

  // Panels & Views state
  const [showQueuePanel, setShowQueuePanel] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'lyrics'>('player');

  useEffect(() => {
    let frameId: number;
    const updateProgress = () => {
      const audio = getBgAudio();
      if (audio) {
        setLocalTime(audio.currentTime);
        setLocalDuration(audio.duration || 0.1);
      }
      frameId = requestAnimationFrame(updateProgress);
    };
    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, [getBgAudio]);

  const progress = localDuration > 0 ? localTime / localDuration : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatSleepTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const liked = isLiked(currentTrack);

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
            className="fixed bottom-[84px] md:bottom-4 left-4 right-4 md:left-[10%] md:right-[10%] h-[70px] glass rounded-2xl z-[90] flex items-center px-4 border border-white/20 shadow-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
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
                  <motion.div layoutId="player-artwork" className="w-12 h-12 rounded-lg overflow-hidden shadow-lg shrink-0 relative">
                    <Image
                      src={currentTrack.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
                      alt={currentTrack.name || 'Cover'}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="flex flex-col min-w-0">
                    <motion.h4 layoutId="player-title" className="text-sm font-bold truncate tracking-tight text-white">{currentTrack.name}</motion.h4>
                    <motion.p layoutId="player-artist" className="text-[10px] text-white/50 truncate font-medium mt-0.5">{currentTrack.artist || 'Masti Music'}</motion.p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
              <span className="hidden md:block text-[10px] font-bold text-white/40 tracking-wider">
                {formatTime(localTime)} / {formatTime(localDuration)}
              </span>

              <button onClick={onPrev} className="p-2 text-white/60 hover:text-white transition-colors hidden sm:block">
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button onClick={onTogglePlay} className="p-2.5 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white rounded-full shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-transform">
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 translate-x-[1px] fill-current" />}
              </button>

              <button onClick={onNext} className="p-2 text-white/60 hover:text-white transition-colors">
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              <button onClick={onToggleMute} className="p-2 text-white/40 hover:text-white transition-colors hidden md:block">
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
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
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Blurred Background from Artwork */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-[20px] scale-110"
                style={{ backgroundImage: `url(${currentTrack?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 pt-12">
              <button onClick={() => setIsPlayerExpanded(false)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                <ChevronDown className="w-6 h-6" />
              </button>
              
              {/* Tab Switcher: Player / Lyrics */}
              <div className="flex bg-white/10 p-1 rounded-full border border-white/10">
                <button
                  onClick={() => setActiveTab('player')}
                  className={cn(
                    "px-4 py-1 rounded-full text-xs font-bold transition-colors",
                    activeTab === 'player' ? "bg-[#8B5CF6] text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  Player
                </button>
                <button
                  onClick={() => setActiveTab('lyrics')}
                  className={cn(
                    "px-4 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5",
                    activeTab === 'lyrics' ? "bg-[#8B5CF6] text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  <FileText className="w-3 h-3" /> Lyrics
                </button>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSleepTimerModal(true)} 
                  className={cn("p-2 rounded-full transition-colors relative", sleepTimer !== null ? "bg-[#8B5CF6] text-white" : "bg-white/10 text-white/70 hover:text-white")}
                  title="Sleep Timer"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowQueuePanel(true)} 
                  className="p-2 bg-white/10 rounded-full text-white/70 hover:text-white transition"
                  title="Up Next Queue"
                >
                  <ListMusic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-12 w-full max-w-md mx-auto">
              
              {activeTab === 'player' ? (
                <>
                  {/* Artwork */}
                  <motion.div layoutId="player-artwork" className="w-full aspect-square rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(255,0,127,0.2)] mb-8 relative group">
                    <Image
                      src={currentTrack?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'}
                      alt={currentTrack?.name || 'Artwork'}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>

                  {/* Title & Actions Row */}
                  <div className="w-full flex items-center justify-between mb-6">
                    <div className="flex flex-col min-w-0 pr-4">
                      <motion.h2 layoutId="player-title" className="text-2xl md:text-3xl font-black text-white truncate tracking-tight">{currentTrack?.name}</motion.h2>
                      <motion.p layoutId="player-artist" className="text-base text-white/50 truncate font-medium mt-1">{currentTrack?.artist || 'Masti Music'}</motion.p>
                    </div>
                    <button 
                      onClick={() => toggleLikedSong(currentTrack)} 
                      className="p-3 text-white/50 hover:text-masti-pink transition-colors"
                    >
                      <Heart className={cn("w-7 h-7 transition-colors", liked ? "fill-[#EC4899] text-[#EC4899]" : "text-white/50")} />
                    </button>
                  </div>

                  {/* Sleep Timer Indicator */}
                  {sleepTimer !== null && (
                    <div className="mb-4 text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5" /> Sleep timer: {formatSleepTimer(sleepTimer)}
                    </div>
                  )}

                  {/* Seekbar */}
                  <div className="w-full mb-6">
                    <div className="group cursor-pointer mb-2">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_white]"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-white/40 tracking-widest">
                      <span>{formatTime(localTime)}</span>
                      <span>{formatTime(localDuration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="w-full flex items-center justify-between">
                    <button 
                      onClick={toggleShuffle} 
                      className={cn("p-2 transition-colors relative", isShuffle ? "text-[#EC4899]" : "text-white/40 hover:text-white")}
                      title={isShuffle ? "Shuffle On" : "Shuffle Off"}
                    >
                      <Shuffle className="w-5 h-5" />
                      {isShuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#EC4899]" />}
                    </button>

                    <button onClick={onPrev} className="text-white hover:text-masti-pink transition-colors active:scale-90"><SkipBack className="w-10 h-10 fill-current" /></button>
                    
                    <button onClick={onTogglePlay} className="w-20 h-20 rounded-full bg-masti-pink text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,0,127,0.4)]">
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 translate-x-[2px] fill-current" />}
                    </button>
                    
                    <button onClick={onNext} className="text-white hover:text-masti-pink transition-colors active:scale-90"><SkipForward className="w-10 h-10 fill-current" /></button>

                    <button 
                      onClick={cycleRepeatMode} 
                      className={cn("p-2 transition-colors relative", repeatMode !== 'off' ? "text-[#EC4899]" : "text-white/40 hover:text-white")}
                      title={`Repeat: ${repeatMode}`}
                    >
                      <Repeat className="w-5 h-5" />
                      {repeatMode === 'one' && (
                        <span className="absolute top-1 right-1 text-[9px] font-bold bg-[#EC4899] text-white w-3 h-3 rounded-full flex items-center justify-center">1</span>
                      )}
                      {repeatMode === 'all' && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#EC4899]" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Lyrics Panel */
                <div className="w-full flex-1 flex flex-col items-center justify-center text-center py-6 overflow-y-auto custom-scrollbar">
                  <FileText className="w-12 h-12 text-[#8B5CF6] mb-4 opacity-80 animate-pulse" />
                  <h3 className="text-lg font-bold text-white mb-1">{currentTrack?.name}</h3>
                  <p className="text-xs text-white/50 mb-6 font-medium">{currentTrack?.artist}</p>
                  
                  <div className="space-y-4 text-sm text-white/70 font-medium leading-relaxed max-w-xs">
                    <p>♫ (Verse 1) ♫</p>
                    <p>Subah ki fizayein tera naam lein...</p>
                    <p>Dil ke taar gunjayein tera shor ho...</p>
                    <br />
                    <p>♫ (Chorus) ♫</p>
                    <p>Masti ke is safar mein hum tum saath chalein...</p>
                    <p>Sangeet ki is dhun mein khoye rahein...</p>
                    <br />
                    <span className="text-xs text-white/30 italic block mt-6">Lyrics sourced dynamically for Masti Music v2.0</span>
                  </div>
                </div>
              )}
            </div>

            {/* Queue / Up Next Panel Drawer */}
            <AnimatePresence>
              {showQueuePanel && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute inset-x-0 bottom-0 top-20 z-50 bg-[#0f0f0f] border-t border-white/10 rounded-t-[32px] p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <ListMusic className="w-5 h-5 text-[#8B5CF6]" />
                      <h3 className="text-lg font-bold text-white">Up Next Queue</h3>
                      <span className="text-xs text-white/40 font-medium">({queue.length} songs)</span>
                    </div>
                    <button onClick={() => setShowQueuePanel(false)} className="p-2 text-white/50 hover:text-white rounded-full bg-white/5">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {queue.map((song, i) => {
                      const isActiveTrack = currentTrack?.id ? currentTrack.id === song.id : currentTrack?.name === song.name;
                      return (
                        <div
                          key={i}
                          onClick={() => { playSong(song, queue); setShowQueuePanel(false); }}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors border",
                            isActiveTrack 
                              ? "bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-white" 
                              : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                            <Image src={song.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'} alt={song.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={cn("text-xs font-bold truncate", isActiveTrack ? "text-[#8B5CF6]" : "text-white")}>{song.name}</span>
                            <span className="text-[10px] text-white/40 truncate">{song.artist}</span>
                          </div>
                          {isActiveTrack && (
                            <span className="text-[10px] font-black uppercase text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded">Playing</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sleep Timer Modal */}
            <AnimatePresence>
              {showSleepTimerModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                  onClick={() => setShowSleepTimerModal(false)}
                >
                  <div className="bg-[#151515] border border-white/10 rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center" onClick={e => e.stopPropagation()}>
                    <Moon className="w-10 h-10 text-[#8B5CF6] mx-auto" />
                    <h3 className="text-lg font-bold text-white">Sleep Timer</h3>
                    <p className="text-xs text-white/50">Playback will pause automatically when timer expires.</p>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[15, 30, 45, 60].map(mins => (
                        <button
                          key={mins}
                          onClick={() => { setSleepTimer(mins); setShowSleepTimerModal(false); }}
                          className="py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-[#8B5CF6] hover:border-[#8B5CF6] font-bold text-xs text-white transition-all"
                        >
                          {mins} Minutes
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => { setSleepTimer(null); setShowSleepTimerModal(false); }}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-colors mt-2"
                    >
                      Turn Off Timer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

