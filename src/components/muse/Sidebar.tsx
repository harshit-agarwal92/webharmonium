'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Home, Compass, Search, Heart, FolderHeart, Download, 
  Monitor, LogIn, User, Disc, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  setShowInstallModal: (show: boolean) => void;
  favoritesCount: number;
  downloadsCount: number;
}

export const Sidebar = React.memo(function Sidebar({
  activeTab,
  setActiveTab,
  menuOpen,
  setMenuOpen,
  setShowAuthModal,
  setShowInstallModal,
  favoritesCount,
  downloadsCount
}: SidebarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <>
      {/* MOBILE BACKDROP */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "w-[260px] shrink-0 bg-[#050505] border-r border-white/5 p-6 flex flex-col justify-between h-screen fixed lg:sticky left-0 top-0 z-50 transition-transform duration-300 ease-in-out select-none overflow-y-auto custom-scrollbar",
        menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div>
          {/* Logo / Brand */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3 group active:scale-95 transition-all">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] rounded-[14px] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all">
                <Disc className="w-6 h-6 text-white group-hover:animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Masti.</h1>
              </div>
            </Link>
            
            <button 
              onClick={() => setMenuOpen(false)}
              className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4 px-2">Discover</p>
              <nav className="space-y-1.5">
                <SidebarBtn icon={<Home className="w-5 h-5" />} label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setMenuOpen(false); }} />
                <SidebarBtn icon={<Compass className="w-5 h-5" />} label="Explore" active={activeTab === 'explore'} onClick={() => { setActiveTab('explore'); setMenuOpen(false); }} />
                <SidebarBtn icon={<Search className="w-5 h-5" />} label="Search" active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setMenuOpen(false); }} />
              </nav>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4 px-2">Library</p>
              <nav className="space-y-1.5">
                <SidebarBtn icon={<Heart className="w-5 h-5" />} label="Favorites" active={activeTab === 'favorites'} count={favoritesCount} onClick={() => { setActiveTab('favorites'); setMenuOpen(false); }} />
                <SidebarBtn icon={<FolderHeart className="w-5 h-5" />} label="Memories" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); setMenuOpen(false); }} />
                <SidebarBtn icon={<Download className="w-5 h-5" />} label="Downloads" active={activeTab === 'downloads'} count={downloadsCount} onClick={() => { setActiveTab('downloads'); setMenuOpen(false); }} />
              </nav>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 pt-8">
          <button 
            onClick={() => { setShowInstallModal(true); setMenuOpen(false); }}
            className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-white/5 to-white/5 hover:from-[#EC4899]/20 hover:to-[#8B5CF6]/20 border border-white/5 hover:border-[#8B5CF6]/40 transition-all duration-300"
          >
            <Monitor className="w-4 h-4 text-[#8B5CF6]" />
            Install App
          </button>

          {!user ? (
            <button 
              onClick={() => { setShowAuthModal(true); setMenuOpen(false); }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                className="w-full py-2.5 px-3 bg-[#111] border border-white/5 rounded-xl text-xs font-bold text-white flex items-center justify-between gap-3 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="truncate">{user.displayName || user.email?.split('@')[0]}</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-transform text-white/40 shrink-0", showUserDropdown && "rotate-90")} />
              </button>
              
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50"
                  >
                    <Link href="/profile" className="w-full text-left px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">Profile</Link>
                    {isAdmin && (
                      <Link href="/admin" className="block w-full text-left px-3 py-2 text-xs font-medium text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors">Admin Dashboard</Link>
                    )}
                    <div className="h-[1px] bg-white/10 my-1"></div>
                    <button onClick={() => { logout(); setShowUserDropdown(false); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Log out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </aside>
    </>
  );
});

const SidebarBtn = React.memo(function SidebarBtn({ icon, label, active, count, onClick }: { icon: React.ReactNode; label: string; active: boolean; count?: number; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 group",
        active 
          ? "bg-gradient-to-r from-[#8B5CF6]/20 to-transparent text-white border-l-2 border-[#8B5CF6] shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
          : "text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "transition-transform duration-300 group-hover:scale-110",
          active ? "text-[#8B5CF6]" : "text-white/40 group-hover:text-white"
        )}>
          {icon}
        </div>
        <span>{label}</span>
      </div>

      {count !== undefined && count > 0 && (
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-bold",
          active ? "bg-[#8B5CF6] text-white" : "bg-white/10 text-white/60 group-hover:bg-white/20"
        )}>
          {count}
        </span>
      )}
    </button>
  );
});
