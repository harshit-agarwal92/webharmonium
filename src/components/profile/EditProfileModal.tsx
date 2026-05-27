'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User as UserIcon, Camera } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await updateProfile(user, {
        displayName: displayName,
      });
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md glass-card rounded-[32px] p-8 relative overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(255,0,127,0.1)]"
          >
            {/* Background glows */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-masti-pink/20 rounded-full blur-[60px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-masti-cyan/20 rounded-full blur-[60px]" />

            <div className="relative z-10 flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight">Edit Profile</h2>
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 space-y-6">
              {/* Avatar section */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center relative z-10">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                    ) : (
                      <UserIcon className="w-10 h-10 text-white/30" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-3">Tap to change (Coming soon)</p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-white/60 tracking-widest ml-2 mb-2 block">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-masti-pink focus:bg-white/10 transition-all font-bold"
                    placeholder="Enter your name"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
                )}
              </div>

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 mt-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
