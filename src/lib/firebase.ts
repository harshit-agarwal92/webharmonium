import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth,
  type Auth,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPopup as fbSignInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

// Standard Firebase web app configuration using placeholders or env vars
const firebaseConfig = {
  apiKey: "AIzaSyDBac2bbUICWHte4uUujGeqyrwamdD2BvA",
  authDomain: "masti-music-cae9d.firebaseapp.com",
  projectId: "masti-music-cae9d",
  storageBucket: "masti-music-cae9d.firebasestorage.app",
  messagingSenderId: "76083614699",
  appId: "1:76083614699:web:03cfb150bb6281a620ffae",
  measurementId: "G-SQ0D133MVS"
};


let app;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | undefined;
let isRealFirebase = false;

try {
  // If the config is valid and not using the absolute dummy key, or we just want to attempt to initialize
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    }).catch(console.error);
  }
  isRealFirebase = true;
} catch (e) {
  console.warn("Firebase Auth initialized in local mock simulator mode.", e);
}

export { auth, db, storage, analytics, isRealFirebase };

// Mock authentications for robust fallback if Firebase is not connected or fails in local environments
export const simulateAuth = {
  signIn: async (email: string, pass: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency
    if (email && pass.length >= 6) {
      const username = email.split('@')[0];
      return { user: { email, displayName: username, uid: 'mock-uid-' + Date.now() } };
    }
    throw new Error("Invalid email or password must be at least 6 characters.");
  },
  signUp: async (email: string, pass: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!email.includes('@')) throw new Error("Invalid email address.");
    if (pass.length < 6) throw new Error("Password must be at least 6 characters.");
    const username = email.split('@')[0];
    return { user: { email, displayName: username, uid: 'mock-uid-' + Date.now() } };
  },
  signInWithGoogle: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { user: { email: 'premium.user@gmail.com', displayName: 'NeonVibeMaster', uid: 'google-mock-uid-' + Date.now() } };
  }
};
