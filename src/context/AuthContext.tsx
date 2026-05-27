'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isRealFirebase } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  setUserMock: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'aggarwalharshit345@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isRealFirebase && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsAdmin(currentUser?.email === ADMIN_EMAIL);
          // Defer loading state update to avoid sync setState in effect
          setTimeout(() => {
            setLoading(false);
          }, 0);
      });
      return () => unsubscribe();
    } else {
      // If we are in mock mode, check localStorage for a mocked session (optional)
      const mockedSession = localStorage.getItem('masti_mock_user');
      if (mockedSession) {
        try {
          const u = JSON.parse(mockedSession);
          // Update state asynchronously to avoid sync setState in effect
          setTimeout(() => {
            setUser(u as unknown as User);
            setIsAdmin(u?.email === ADMIN_EMAIL);
          }, 0);
        } catch (e) {
          console.error(e);
        }
      }
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, []);

  const logout = async () => {
    if (isRealFirebase && auth) {
      await firebaseSignOut(auth);
    } else {
      localStorage.removeItem('masti_mock_user');
      setUser(null);
      setIsAdmin(false);
    }
  };

  const setUserMock = (newUser: User | null) => {
    if (!isRealFirebase) {
      setUser(newUser);
      setIsAdmin(newUser?.email === ADMIN_EMAIL);
      if (newUser) {
        localStorage.setItem('masti_mock_user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('masti_mock_user');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout, setUserMock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
