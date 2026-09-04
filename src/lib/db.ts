import { supabase, isRealSupabase } from './supabaseClient';

export interface DbSong {
  id: string;
  name?: string;
  artist?: string;
  image?: string;
  url?: string;
}

export interface DbPlaylist {
  id: string;
  name: string;
  created_at?: string;
  songs?: DbSong[];
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at?: string;
}

/**
 * ---------------------------------------------------------
 * USER SYNC & PROFILE (SUPABASE)
 * ---------------------------------------------------------
 */
export async function syncUserToSupabase(user: { id?: string; uid?: string; name?: string; displayName?: string; email: string; avatar_url?: string; photoURL?: string }) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  const email = (user.email || '').toLowerCase().trim();
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const name = user.name || user.displayName || email.split('@')[0] || 'Music Fan';
  const avatar_url = user.avatar_url || user.photoURL || null;
  const role: 'user' | 'admin' = email === 'aggarwalharshit345@gmail.com' ? 'admin' : 'user';

  try {
    // 1. Check if user exists by email
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      const updatePayload: any = { name, avatar_url };
      if (email === 'aggarwalharshit345@gmail.com') {
        updatePayload.role = 'admin';
      }
      const { data, error: updateError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', existingUser.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.warn('[Supabase syncUserToSupabase] update notice:', updateError.message || updateError.details);
      }
      return { success: true, data: data || existingUser };
    } else {
      // Generate a valid UUID v4 for the new user record if not provided
      const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14).padStart(12, '0');

      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          id: newId,
          name,
          email,
          avatar_url,
          role
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.warn('[Supabase syncUserToSupabase] insert notice:', insertError.message || insertError.details || insertError);
        return { success: false, error: insertError.message || 'Insert restricted by database policy' };
      }
      return { success: true, data };
    }
  } catch (err: any) {
    const errorMsg = err?.message || err?.details || err?.hint || 'Database sync exception';
    console.warn('[Supabase syncUserToSupabase] caught:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * ---------------------------------------------------------
 * ADMIN QUERIES (SUPABASE)
 * ---------------------------------------------------------
 */
export async function getAdminStats() {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized', data: { usersCount: 0, featuredCount: 0, favoritesCount: 0 } };
  }

  try {
    const [usersRes, featuredRes, favsRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('featured_content').select('id', { count: 'exact', head: true }),
      supabase.from('favorites').select('id', { count: 'exact', head: true })
    ]);

    if (usersRes.error) throw usersRes.error;

    return {
      success: true,
      data: {
        usersCount: usersRes.count ?? 0,
        featuredCount: featuredRes.count ?? 0,
        favoritesCount: favsRes.count ?? 0
      }
    };
  } catch (err: any) {
    console.error('[getAdminStats] error:', err);
    return { success: false, error: err.message || 'Failed to fetch admin stats' };
  }
}

export async function getAdminUsers(): Promise<{ success: boolean; data?: DbUser[]; error?: string }> {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('[getAdminUsers] error:', err);
    return { success: false, error: err.message || 'Failed to fetch users from Supabase' };
  }
}

export async function updateUserRole(userId: string, newRole: 'user' | 'admin') {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('[updateUserRole] error:', err);
    return { success: false, error: err.message || 'Failed to update user role' };
  }
}

export async function deleteUserRecord(userId: string) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('[deleteUserRecord] error:', err);
    return { success: false, error: err.message || 'Failed to delete user' };
  }
}

/**
 * ---------------------------------------------------------
 * FAVORITES HELPER FUNCTIONS (SUPABASE)
 * ---------------------------------------------------------
 */
export async function addFavorite(userId: string, song: DbSong) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        song_id: String(song.id),
        song_name: song.name || '',
        song_image: song.image || ''
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('addFavorite error:', err);
    return { success: false, error: err.message || 'Failed to add favorite' };
  }
}

export async function removeFavorite(userId: string, songId: string) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', String(songId));

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('removeFavorite error:', err);
    return { success: false, error: err.message || 'Failed to remove favorite' };
  }
}

export async function getFavorites(userId: string): Promise<DbSong[]> {
  if (!isRealSupabase || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.song_id,
      name: row.song_name,
      image: row.song_image
    }));
  } catch (err) {
    console.error('getFavorites error:', err);
    return [];
  }
}

/**
 * ---------------------------------------------------------
 * PLAYLISTS HELPER FUNCTIONS (SUPABASE)
 * ---------------------------------------------------------
 */
export async function createPlaylist(userId: string, name: string) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('playlists')
      .insert({ user_id: userId, name: name.trim() })
      .select()
      .single();

    if (error) throw error;
    return { success: true, playlist: data };
  } catch (err: any) {
    console.error('createPlaylist error:', err);
    return { success: false, error: err.message || 'Failed to create playlist' };
  }
}

export async function addSongToPlaylist(playlistId: string, song: DbSong) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: String(song.id),
        song_name: song.name || '',
        song_image: song.image || ''
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('addSongToPlaylist error:', err);
    return { success: false, error: err.message || 'Failed to add song to playlist' };
  }
}

export async function getUserPlaylists(userId: string): Promise<DbPlaylist[]> {
  if (!isRealSupabase || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_songs(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      created_at: row.created_at,
      songs: (row.playlist_songs || []).map((ps: any) => ({
        id: ps.song_id,
        name: ps.song_name,
        image: ps.song_image
      }))
    }));
  } catch (err) {
    console.error('getUserPlaylists error:', err);
    return [];
  }
}

/**
 * ---------------------------------------------------------
 * RECENTLY PLAYED HELPER FUNCTIONS (SUPABASE)
 * ---------------------------------------------------------
 */
export async function logRecentlyPlayed(userId: string, song: DbSong) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('recently_played')
      .insert({
        user_id: userId,
        song_id: String(song.id),
        song_name: song.name || '',
        song_image: song.image || ''
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('logRecentlyPlayed error:', err);
    return { success: false, error: err.message || 'Failed to log recently played' };
  }
}

export async function getRecentlyPlayed(userId: string): Promise<DbSong[]> {
  if (!isRealSupabase || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('recently_played')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.song_id,
      name: row.song_name,
      image: row.song_image
    }));
  } catch (err) {
    console.error('getRecentlyPlayed error:', err);
    return [];
  }
}

/**
 * ---------------------------------------------------------
 * FEATURED CONTENT HELPER FUNCTIONS (SUPABASE)
 * ---------------------------------------------------------
 */
export async function getFeaturedContent(section?: string): Promise<any[]> {
  if (!isRealSupabase || !supabase) return [];

  try {
    let query = supabase.from('featured_content').select('*').order('position', { ascending: true });
    if (section) query = query.eq('section', section);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error('getFeaturedContent error:', err);
    throw err;
  }
}

export async function addFeaturedContentSong(section: string, song: DbSong, position: number = 0, addedBy?: string) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('featured_content')
      .insert({
        section,
        song_id: String(song.id),
        song_name: song.name || '',
        song_image: song.image || '',
        position,
        added_by: addedBy || null
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('addFeaturedContentSong error:', err);
    return { success: false, error: err.message || 'Failed to add featured song' };
  }
}

export async function removeFeaturedContentSong(featuredId: string) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase
      .from('featured_content')
      .delete()
      .eq('id', featuredId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('removeFeaturedContentSong error:', err);
    return { success: false, error: err.message || 'Failed to remove featured song' };
  }
}

export async function setFeaturedContent(section: string, songs: DbSong[], userId?: string) {
  if (!isRealSupabase || !supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Delete existing entries for this section
    const { error: delError } = await supabase.from('featured_content').delete().eq('section', section);
    if (delError) throw delError;

    if (songs.length === 0) {
      return { success: true, data: [] };
    }

    const rows = songs.map((song, index) => ({
      section,
      song_id: String(song.id),
      song_name: song.name || '',
      song_image: song.image || '',
      position: index,
      added_by: userId || null
    }));

    const { data, error } = await supabase.from('featured_content').insert(rows).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('setFeaturedContent error:', err);
    return { success: false, error: err.message || 'Failed to update featured content' };
  }
}
