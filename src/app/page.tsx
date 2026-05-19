'use client';

import { motion } from 'framer-motion';
import { Piano as PianoIcon, Music, Zap, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-hidden relative">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <Music className="w-16 h-16 text-masti-pink/20 absolute top-[20%] left-[10%] animate-float rotate-12" />
         <Music className="w-12 h-12 text-masti-cyan/20 absolute bottom-[30%] right-[15%] animate-float -rotate-12" style={{ animationDelay: '2s' }} />
         <Sparkles className="w-8 h-8 text-masti-orange/20 absolute top-[40%] right-[25%] animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full relative z-10"
      >
        <div className="mb-16">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-gradient-to-tr from-masti-pink to-masti-cyan rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,0,127,0.5)] animate-pulse-slow"
          >
            <Zap className="w-12 h-12 text-white fill-current" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">
            Masti <span className="text-transparent bg-clip-text bg-gradient-to-r from-masti-pink to-masti-cyan animate-pulse">Music</span>
          </h1>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-lg md:text-2xl font-black max-w-2xl mx-auto uppercase tracking-[0.2em] mb-8">
            Nonstop Masti & Music
          </p>
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm mb-10">Feel the Beat 🎵 Vibe Unlimited</p>
          
          <Link href="/music" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-masti-pink to-masti-cyan text-black rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(255,0,127,0.6)]">
            <Play className="w-5 h-5 fill-current" />
            Start Listening
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full mt-16">
          <MainCard 
            href="/harmonium"
            title="Harmonium"
            description="Play with friends 🎵"
            icon={<PianoIcon className="w-10 h-10" />}
            color="bg-masti-pink"
            glowColor="rgba(255,0,127,0.5)"
          />
          <MainCard 
            href="/music"
            title="Masti Vault"
            description="Trending Hits 🔥"
            icon={<Music className="w-10 h-10" />}
            color="bg-masti-cyan"
            glowColor="rgba(0,240,255,0.5)"
          />
        </div>
      </motion.div>

      {/* Decorative Blur */}
      <div className="fixed -bottom-32 -left-32 w-[30rem] h-[30rem] bg-masti-pink/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed -top-32 -right-32 w-[30rem] h-[30rem] bg-masti-cyan/20 blur-[140px] pointer-events-none rounded-full" />
    </div>
  );
}

function MainCard({ href, title, description, icon, color, glowColor }: { href: string, title: string, description: string, icon: React.ReactNode, color: string, glowColor: string }) {
  return (
    <Link href={href} className="group relative block w-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card p-10 rounded-[40px] text-left border border-white/5 relative overflow-hidden"
      >
        <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-all duration-500 group-hover:scale-110", color)} style={{ boxShadow: `0 0 40px ${glowColor}` }}>
          <div className="text-black">{icon}</div>
        </div>
        <div>
          <h3 className="text-3xl font-black tracking-tight mb-2 uppercase group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-colors">{title}</h3>
          <p className="text-white/60 font-bold text-sm uppercase tracking-widest leading-relaxed flex items-center gap-2">
            {description}
          </p>
        </div>
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-8 h-8 text-white/40 fill-current group-hover:text-white transition-colors" />
        </div>
        
        <div className={cn("absolute -bottom-10 -right-10 w-40 h-40 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full", color)} />
      </motion.div>
    </Link>
  );
}
