'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  getUserPlaylists, 
  type DbSong, 
  type DbPlaylist 
} from '@/lib/db';
import { isRealSupabase } from '@/lib/supabaseClient';

export function useUserLibrary() {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState<DbSong[]>([]);
  const [playlists, setPlaylists] = useState<DbPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLibrary = useCallback(async () => {
    if (!user) {
      setLikedSongs([]);
      setPlaylists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (isRealSupabase) {
      try {
        const [favs, pls] = await Promise.all([
          getFavorites(user.uid),
          getUserPlaylists(user.uid)
        ]);
        setLikedSongs(favs || []);
        setPlaylists(pls || []);
      } catch (e) {
        console.error("[useUserLibrary] Supabase library fetch error:", e);
      }
    } else {
      const localLikes = localStorage.getItem('masti_favorites');
      if (localLikes) {
        try { setLikedSongs(JSON.parse(localLikes)); } catch (e) {}
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const toggleLike = async (song: DbSong) => {
    if (!user) return false;

    const isLiked = likedSongs.some((s) => String(s.id) === String(song.id));

    try {
      if (isLiked) {
        const updated = likedSongs.filter((s) => String(s.id) !== String(song.id));
        setLikedSongs(updated);
        localStorage.setItem('masti_favorites', JSON.stringify(updated));
        await removeFavorite(user.uid, song.id);
        return false;
      } else {
        const songData: DbSong = { 
          id: String(song.id), 
          name: song.name, 
          artist: song.artist, 
          image: song.image, 
          url: song.url 
        };
        const updated = [songData, ...likedSongs];
        setLikedSongs(updated);
        localStorage.setItem('masti_favorites', JSON.stringify(updated));
        await addFavorite(user.uid, songData);
        return true;
      }
    } catch (e) {
      console.error("[useUserLibrary] Error toggling like:", e);
      return isLiked;
    }
  };

  const isSongLiked = (songId: string) => {
    return likedSongs.some((s) => String(s.id) === String(songId));
  };

  return { likedSongs, playlists, loading, toggleLike, isSongLiked, refreshLibrary: loadLibrary };
}
