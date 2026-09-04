import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth,
  type Auth,
  signInWithPopup as fbSignInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDBac2bbUICWHte4uUujGeqyrwamdD2BvA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "masti-music-cae9d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "masti-music-cae9d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "masti-music-cae9d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "76083614699",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:76083614699:web:03cfb150bb6281a620ffae",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SQ0D133MVS"
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | undefined;
let isRealFirebase = false;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics }) => {
      if (app) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
  isRealFirebase = true;
} catch (e) {
  console.warn("Firebase Auth fallback mode initialized.", e);
  isRealFirebase = false;
}

export { app, auth, db, storage, analytics, isRealFirebase };

export const simulateAuth = {
  signInWithGoogle: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { 
      user: { 
        email: 'aggarwalharshit345@gmail.com', 
        displayName: 'Harshit Agarwal', 
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        uid: 'google-admin-uid-101' 
      } 
    };
  }
};
