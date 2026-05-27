'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { DownloadCloud, X, Smartphone } from 'lucide-react';

export function InstallPromptModal() {
  const { deferredPrompt, isAppInstalled, triggerInstall } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // If already installed, never show
    if (isAppInstalled) return;

    // Check if user recently dismissed (store in localStorage)
    const lastDismissed = localStorage.getItem('masti_install_dismissed');
    if (lastDismissed) {
      const timeSinceDismiss = Date.now() - parseInt(lastDismissed, 10);
      // If dismissed within the last hour, don't show
      if (timeSinceDismiss < 60 * 60 * 1000) return;
    }

    // Trigger after 15 seconds of engagement to ensure they see the value first
    const timer = setTimeout(() => {
      if (deferredPrompt || /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
         setShowPrompt(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [deferredPrompt, isAppInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('masti_install_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const success = await triggerInstall();
      if (success) setShowPrompt(false);
    } else {
      // iOS fallback instructions
      alert("To install on iOS: Tap the Share button at the bottom of Safari, then tap 'Add to Home Screen'.");
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && !isAppInstalled && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm glass-card rounded-[32px] p-6 relative overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(255,0,127,0.2)]"
          >
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-masti-pink/30 rounded-full blur-[50px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-masti-cyan/30 rounded-full blur-[50px]" />

            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 relative z-10 pt-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-masti-pink to-masti-cyan flex items-center justify-center shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Install Masti Music</h3>
                <p className="text-sm text-white/60 mt-2 leading-relaxed">
                  Get the full cinematic experience. Enjoy smoother music playback, background audio, and one-tap access on your home screen.
                </p>
              </div>

              <div className="w-full pt-4 flex flex-col gap-3">
                <button 
                  onClick={handleInstallClick}
                  className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                >
                  <DownloadCloud className="w-4 h-4" /> Install App Now
                </button>
                <button 
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-xl border border-white/10 text-white/50 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
