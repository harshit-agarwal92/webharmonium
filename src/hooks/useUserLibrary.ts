'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, isRealFirebase } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export function useUserLibrary() {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isRealFirebase || !db) {
      setLoading(false);
      return;
    }

    const fetchLibrary = async () => {
      try {
        const userRef = doc(db!, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setLikedSongs(data.likedSongs || []);
          setPlaylists(data.playlists || []);
        } else {
          // Initialize empty if doesn't exist
          await setDoc(userRef, { likedSongs: [], playlists: [] }, { merge: true });
        }
      } catch (err) {
        console.error('Failed to fetch user library:', err);
      }
      setLoading(false);
    };

    fetchLibrary();
  }, [user]);

  const toggleLike = async (song: any) => {
    if (!user || !isRealFirebase || !db) return false;

    const isLiked = likedSongs.some((s) => s.id === song.id);
    const userRef = doc(db!, 'users', user.uid);

    try {
      if (isLiked) {
        const updated = likedSongs.filter((s) => s.id !== song.id);
        setLikedSongs(updated);
        await updateDoc(userRef, {
          likedSongs: updated // Using direct array replacement to handle object comparison easily, though arrayRemove works if object reference matches perfectly.
        });
        return false;
      } else {
        const songData = { id: song.id, name: song.name, artist: song.artist, image: song.image, url: song.url };
        setLikedSongs([...likedSongs, songData]);
        await updateDoc(userRef, {
          likedSongs: arrayUnion(songData)
        });
        return true;
      }
    } catch (e) {
      console.error("Error toggling like:", e);
      return isLiked;
    }
  };

  const isSongLiked = (songId: string) => {
    return likedSongs.some((s) => s.id === songId);
  };

  return { likedSongs, playlists, loading, toggleLike, isSongLiked };
}
