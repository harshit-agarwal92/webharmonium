import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, isRealFirebase, simulateAuth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (username: string) => void;
  initialMessage?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMessage }: AuthModalProps) {
  const { setUserMock } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-clear message on toggle
  useEffect(() => {
    if (isOpen) {
      setError(initialMessage || '');
      setSuccessMsg('');
    } else {
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMessage]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      let userCredential;
      if (isRealFirebase && auth) {
        const provider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, provider);
        
        // Save user to Firestore to allow Admin Panel to see them
        if (db && userCredential.user) {
          const u = userCredential.user;
          try {
            await setDoc(doc(db, 'users', u.uid), {
              uid: u.uid,
              name: u.displayName || 'GoogleVibe',
              email: u.email,
              photoURL: u.photoURL,
              lastLogin: new Date().toISOString(),
            }, { merge: true });
          } catch (firestoreErr) {
            console.error("Failed to save user to Firestore:", firestoreErr);
          }
        }
      } else {
        userCredential = await simulateAuth.signInWithGoogle();
        setUserMock(userCredential.user as unknown as User);
      }

      const name = userCredential.user.displayName || 'GoogleVibe';
      if (onSuccess) onSuccess(name);
      onClose();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none">
        {/* Cinematic animated blurred backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md z-0"
        />

        {/* Floating Animated Gradient Neon Blobs (GPU Accelerated) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#9D00FF]/30 to-[#FF007F]/20 blur-[120px] animate-floating-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#00F0FF]/20 to-[#9D00FF]/30 blur-[100px] animate-floating-blob-slow" />
        </div>

        {/* Glassmorphic Premium Auth Card (Fullscreen on Mobile) */}
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full h-full md:h-auto md:max-w-[420px] bg-[#121212]/80 md:bg-[#121212]/60 backdrop-blur-3xl md:rounded-[32px] p-6 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative z-10 border-t border-white/10 md:border-white/10 flex flex-col justify-center overflow-y-auto no-scrollbar-on-mobile"
        >
          {/* Close Button */}
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/5 text-white/60 hover:text-white transition-colors z-50 cursor-pointer backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Brand Header */}
          <div className="text-center mb-10 md:mt-2">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-[#9D00FF] to-[#00F0FF] shadow-[0_0_40px_rgba(157,0,255,0.4)] mb-5"
            >
              <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tighter text-white">
              Log in to play
            </h2>
            <p className="text-sm text-white/50 font-medium mt-2">
              Join the premium cinematic audio experience.
            </p>
          </div>

          {/* Dynamic Warning/Success Notifications */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-5 overflow-hidden"
              >
                <div className="p-3.5 rounded-2xl bg-[#FF007F]/10 border border-[#FF007F]/20 text-[#FF007F] text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-5 overflow-hidden"
              >
                <div className="p-3.5 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] text-xs font-bold flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Authentication Button */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full flex justify-center pb-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#9D00FF] to-[#00F0FF] text-sm font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(157,0,255,0.3)] hover:shadow-[0_0_45px_rgba(0,240,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:grayscale cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.247-3.123C18.435 1.79 15.617.977 12.24.977c-6.082 0-11 4.918-11 11s4.918 11 11 11c6.348 0 10.573-4.46 10.573-10.76 0-.72-.08-1.272-.178-1.932h-10.4z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
