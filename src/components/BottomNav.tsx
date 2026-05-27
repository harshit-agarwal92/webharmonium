'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Download, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/music' },
    { label: 'Search', icon: Search, href: '/music?tab=search' }, // Will handle via URL state if possible, or simple linking
    { label: 'Library', icon: Library, href: '/music?tab=favorites' },
    { label: 'Downloads', icon: Download, href: '/music?tab=downloads' },
    { label: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-50 px-2 pb-safe pt-2">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {navItems.map((item) => {
          // Simplistic active check (can be refined based on actual routing)
          const isActive = pathname === item.href || (item.href.includes('?') && false); // For now just simple check

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-14 group active:scale-90 transition-transform"
            >
              <div className="relative z-10 flex flex-col items-center justify-center gap-1 text-white/50 group-hover:text-white/80 transition-colors">
                <item.icon className={cn("w-6 h-6", isActive && "text-masti-pink")} />
                <span className={cn("text-[10px] font-bold", isActive ? "text-masti-pink" : "")}>
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="bottomNavGlow"
                  className="absolute inset-0 bg-masti-pink/20 rounded-xl blur-md -z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
