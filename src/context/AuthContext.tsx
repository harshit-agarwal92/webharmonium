'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isRealFirebase } from '@/lib/firebase';
import { supabase, isRealSupabase } from '@/lib/supabaseClient';
import { syncUserToSupabase } from '@/lib/db';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  isAdmin: boolean;
  userRole: 'user' | 'admin';
  loading: boolean;
  logout: () => Promise<void>;
  setUserMock: (user: User | null, role?: 'user' | 'admin') => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'aggarwalharshit345@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  const fetchUserProfile = async (currentUser: User) => {
    const email = (currentUser.email || '').toLowerCase().trim();
    let role: 'user' | 'admin' = email === ADMIN_EMAIL ? 'admin' : 'user';
    let profileData: UserProfileData = {
      uid: currentUser.uid,
      name: currentUser.displayName || email.split('@')[0] || 'User',
      email: email,
      photoURL: currentUser.photoURL || undefined,
      role: role
    };

    if (isRealSupabase && supabase && email) {
      try {
        // Sync to Supabase in background
        syncUserToSupabase({
          uid: currentUser.uid,
          name: profileData.name,
          email: email,
          avatar_url: profileData.photoURL
        }).catch(() => {});

        // Fetch Supabase user profile
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (dbUser && !error) {
          if (dbUser.role) {
            role = dbUser.role as 'user' | 'admin';
          } else if (email === ADMIN_EMAIL) {
            role = 'admin';
          }
          profileData = {
            ...profileData,
            name: dbUser.name || profileData.name,
            photoURL: dbUser.avatar_url || profileData.photoURL,
            role: role,
            createdAt: dbUser.created_at
          };
        }
      } catch (e: any) {
        console.warn("[AuthContext] Supabase profile fetch fallback:", e?.message);
      }
    }

    const checkIsAdmin = role === 'admin' || email === ADMIN_EMAIL;
    setUserRole(checkIsAdmin ? 'admin' : 'user');
    setIsAdmin(checkIsAdmin);
    setUserProfile(profileData);
  };

  useEffect(() => {
    if (isRealFirebase && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await fetchUserProfile(currentUser);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
          setUserRole('user');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const mockedSession = typeof window !== 'undefined' ? localStorage.getItem('masti_mock_user') : null;
      if (mockedSession) {
        try {
          const u = JSON.parse(mockedSession);
          const email = (u?.email || '').toLowerCase().trim();
          const mockedRole = u?.role || (email === ADMIN_EMAIL ? 'admin' : 'user');
          setUser(u as unknown as User);
          setIsAdmin(mockedRole === 'admin' || email === ADMIN_EMAIL);
          setUserRole(mockedRole);
          setUserProfile({
            uid: u.uid || 'mock-id',
            name: u.displayName || u.name || 'Mock User',
            email: email,
            photoURL: u.photoURL,
            role: mockedRole
          });
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  const logout = async () => {
    if (isRealFirebase && auth) {
      await firebaseSignOut(auth);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('masti_mock_user');
    }
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setUserRole('user');
  };

  const setUserMock = (newUser: User | null, mockRole?: 'user' | 'admin') => {
    setUser(newUser);
    const email = (newUser?.email || '').toLowerCase().trim();
    const role = mockRole || (email === ADMIN_EMAIL ? 'admin' : 'user');
    const checkAdmin = role === 'admin' || email === ADMIN_EMAIL;
    setIsAdmin(checkAdmin);
    setUserRole(role);
    if (newUser) {
      const profile: UserProfileData = {
        uid: newUser.uid,
        name: newUser.displayName || email.split('@')[0] || 'User',
        email: email,
        photoURL: newUser.photoURL || undefined,
        role
      };
      setUserProfile(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('masti_mock_user', JSON.stringify({ ...newUser, role }));
      }
      if (isRealSupabase && email) {
        syncUserToSupabase({
          uid: newUser.uid,
          name: profile.name,
          email: email,
          avatar_url: profile.photoURL
        }).catch(() => {});
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('masti_mock_user');
      }
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isAdmin, userRole, loading, logout, setUserMock, refreshProfile }}>
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
