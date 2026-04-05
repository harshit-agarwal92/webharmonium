'use client';

import { motion } from 'framer-motion';
import { Piano as PianoIcon, Music, Zap, Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full"
      >
        <div className="mb-16">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-harmonium-accent rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(168,85,247,0.5)]"
          >
            <Zap className="w-12 h-12 text-black fill-current" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">
            Digital <span className="text-harmonium-accent">Harmony</span>
          </h1>
          <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto uppercase tracking-[0.2em]">
            Premium Studio Experience for Harmonium & Music Enthusiasts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          <MainCard 
            href="/harmonium"
            title="Play Harmonium"
            description="Professional Virtual Instrument"
            icon={<PianoIcon className="w-10 h-10" />}
            color="bg-harmonium-accent"
          />
          <MainCard 
            href="/music"
            title="Music Library"
            description="Streaming & Learning Vault"
            icon={<Music className="w-10 h-10" />}
            color="bg-blue-500"
          />
        </div>
      </motion.div>

      {/* Decorative Blur */}
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-harmonium-accent/20 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />
    </div>
  );
}

function MainCard({ href, title, description, icon, color }: { href: string, title: string, description: string, icon: React.ReactNode, color: string }) {
  return (
    <Link href={href} className="group relative block w-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card p-10 rounded-[40px] text-left border border-white/5 relative overflow-hidden"
      >
        <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-all duration-500 group-hover:scale-110", color)}>
          <div className="text-black">{icon}</div>
        </div>
        <div>
          <h3 className="text-3xl font-black tracking-tight mb-2 uppercase group-hover:text-harmonium-accent transition-colors">{title}</h3>
          <p className="text-white/40 font-bold text-sm uppercase tracking-widest leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-8 h-8 text-white/20 fill-current" />
        </div>
        
        <div className={cn("absolute -bottom-10 -right-10 w-40 h-40 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full", color)} />
      </motion.div>
    </Link>
  );
}
