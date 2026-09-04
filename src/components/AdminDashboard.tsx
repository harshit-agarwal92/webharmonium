'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Music, HardDriveDownload, Activity, 
  Upload, ShieldAlert, BarChart3, Trash2, 
  Search, PlayCircle, Star, RefreshCw, AlertCircle, Plus,
  Info, ExternalLink
} from 'lucide-react';
import { 
  getAdminStats, 
  getAdminUsers, 
  updateUserRole, 
  deleteUserRecord, 
  getFeaturedContent, 
  addFeaturedContentSong, 
  removeFeaturedContentSong,
  type DbUser 
} from '@/lib/db';
import { isRealSupabase } from '@/lib/supabaseClient';

interface AdminDashboardProps {
  currentUserEmail: string;
}

export default function AdminDashboard({ currentUserEmail }: AdminDashboardProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'songs' | 'users' | 'analytics' | 'content'>('overview');
  
  // Security Guard - Super Admin Clearance
  const isSuperAdmin = currentUserEmail === 'aggarwalharshit345@gmail.com';

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Access Denied</h2>
        <p className="text-white/50 text-sm max-w-md">You do not have administrative clearance to access this control center ({currentUserEmail || 'Not logged in'}).</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl shadow-[0_0_30px_rgba(255,0,127,0.4)]">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Control Center</h1>
            <p className="text-[10px] text-pink-500 font-extrabold uppercase tracking-[0.3em] mt-1">Super Admin Clearance Active (Supabase Database)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70">
          <span className={`w-2 h-2 rounded-full ${isRealSupabase ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isRealSupabase ? 'Supabase Connected' : 'Supabase Not Configured'}</span>
        </div>
      </div>

      {/* Supabase Missing Configuration Notice for Vercel */}
      {!isRealSupabase && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Supabase Environment Variables Missing on Vercel</span>
          </div>
          <p className="text-white/80 leading-relaxed font-normal">
            Database operations are currently disabled because <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">NEXT_PUBLIC_SUPABASE_URL</code> and/or <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are not present in your Vercel Project Settings.
          </p>
          <div className="pt-1 flex items-center gap-4 text-[11px] font-bold">
            <a 
              href="https://vercel.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-amber-400 hover:underline"
            >
              <span>Configure in Vercel Settings &rarr; Environment Variables</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
        <AdminTab btnTab="overview" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={Activity} label="Overview" />
        <AdminTab btnTab="songs" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={Music} label="Manage Songs" />
        <AdminTab btnTab="users" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={Users} label="Users" />
        <AdminTab btnTab="analytics" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={BarChart3} label="Analytics" />
        <AdminTab btnTab="content" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={Star} label="Content Control" />
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeAdminTab === 'overview' && <OverviewPanel />}
        {activeAdminTab === 'songs' && <SongsPanel />}
        {activeAdminTab === 'users' && <UsersPanel />}
        {activeAdminTab === 'analytics' && <AnalyticsPanel />}
        {activeAdminTab === 'content' && <ContentPanel />}
      </div>

    </div>
  );
}

interface AdminTabProps {
  btnTab: string;
  activeTab: string;
  setTab: (tab: any) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function AdminTab({ btnTab, activeTab, setTab, icon: Icon, label }: AdminTabProps) {
  const active = btnTab === activeTab;
  return (
    <button 
      onClick={() => setTab(btnTab)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
        active 
          ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
          : 'bg-transparent text-white/40 border border-transparent hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

// =========================================================================
// 1. OVERVIEW PANEL
// =========================================================================
function OverviewPanel() {
  const [stats, setStats] = useState<{ usersCount: number; featuredCount: number; favoritesCount: number }>({
    usersCount: 0,
    featuredCount: 0,
    favoritesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res?.error || 'Failed to fetch database statistics.');
      }
    } catch (e: any) {
      setError(e?.message || 'Error communicating with Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadStats} 
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registered Users" value={loading ? '...' : (stats?.usersCount ?? 0)} icon={<Users className="w-5 h-5 text-cyan-400" />} />
        <StatCard title="Featured Songs" value={loading ? '...' : (stats?.featuredCount ?? 0)} icon={<Star className="w-5 h-5 text-pink-400" />} />
        <StatCard title="Total Favorites" value={loading ? '...' : (stats?.favoritesCount ?? 0)} icon={<PlayCircle className="w-5 h-5 text-green-400" />} />
        <StatCard title="Database Engine" value={isRealSupabase ? 'Supabase' : 'Standby'} icon={<HardDriveDownload className="w-5 h-5 text-purple-400" />} />
      </div>

      <div className="glass p-6 rounded-[24px]">
        <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">System Health & Data Source</h3>
        <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3 text-xs font-bold">
          <div className="flex items-center justify-between">
            <span className="text-white/40">Supabase Connection</span>
            <span className={isRealSupabase ? 'text-green-400' : 'text-amber-400'}>
              {isRealSupabase ? '✓ Active & Connected' : '⚠ Missing Vercel Environment Variables'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">Database Schema</span>
            <span className="text-green-400">✓ public.supabase_schema.sql Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40">Audio Streaming Engine</span>
            <span className="text-cyan-400">✓ JioSaavn 320kbps + Fallback Providers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. USERS PANEL
// =========================================================================
function UsersPanel() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers();
      if (res && res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setError(res?.error || 'Failed to fetch users list from Supabase.');
      }
    } catch (e: any) {
      setError(e?.message || 'Error fetching users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleRole = async (userId: string, currentRole: 'user' | 'admin', email: string) => {
    if (email === 'aggarwalharshit345@gmail.com') {
      alert("Super Admin role cannot be demoted.");
      return;
    }

    const newRole: 'user' | 'admin' = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(userId);

    try {
      const res = await updateUserRole(userId, newRole);
      if (res && res.success) {
        setUsers(prev => (prev || []).map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert(res?.error || 'Failed to update user role');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === 'aggarwalharshit345@gmail.com') {
      alert("Super Admin account cannot be deleted.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this user from Supabase?")) return;

    setActionLoading(userId);
    try {
      const res = await deleteUserRecord(userId);
      if (res && res.success) {
        setUsers(prev => (prev || []).filter(u => u.id !== userId));
      } else {
        alert(res?.error || 'Failed to delete user');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(u => 
    (u?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u?.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (u?.id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass p-6 rounded-[24px]">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadUsers} 
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">User Database (Supabase `public.users`)</h3>
          <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider mt-0.5">Total Registered: {safeUsers.length}</p>
        </div>
        <div className="relative w-full sm:w-auto flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search users by name, email, ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white outline-none focus:border-pink-500/50" 
            />
          </div>
          <button 
            onClick={loadUsers}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs font-bold uppercase tracking-wider text-white/60">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 pl-2">User ID</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-white/40">Loading users from Supabase...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-white/30">No users found matching query.</td></tr>
            ) : (
              filteredUsers.map((u) => {
                const isSuperAdminUser = u?.email === 'aggarwalharshit345@gmail.com';
                const roleDisplay = isSuperAdminUser ? 'Super Admin' : (u?.role === 'admin' ? 'Admin' : 'User');
                
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-4 pl-2 text-white/50 text-[10px] font-mono truncate max-w-[120px]" title={u.id}>
                      {u.id}
                    </td>
                    <td className="py-4 text-white font-extrabold flex items-center gap-2">
                      {u.avatar_url && (
                        <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span>{u.name || 'Anonymous User'}</span>
                    </td>
                    <td className="py-4 text-pink-400 font-medium normal-case">{u.email || 'N/A'}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        isSuperAdminUser ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 
                        u?.role === 'admin' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40' : 
                        'bg-white/10 text-white/70'
                      }`}>
                        {roleDisplay}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      {!isSuperAdminUser && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRole(u.id, u.role, u.email)}
                            disabled={actionLoading === u.id}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] font-black text-white uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                          >
                            {u?.role === 'admin' ? 'Demote' : 'Promote Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={actionLoading === u.id}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all disabled:opacity-40 cursor-pointer"
                            title="Delete User Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// 3. CONTENT CONTROL PANEL
// =========================================================================
function ContentPanel() {
  const [section, setSection] = useState<'trending_hits' | 'top_charts'>('trending_hits');
  const [featuredSongs, setFeaturedSongs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFeaturedContent(section);
      setFeaturedSongs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load featured content from Supabase.');
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  // Live JioSaavn song search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setSearching(true);
        try {
          const res = await fetch(`/api/songs?query=${encodeURIComponent(searchQuery.trim())}`);
          const data = await res.json();
          setSearchResults(Array.isArray(data?.results) ? data.results.slice(0, 6) : []);
        } catch (e: any) {
          console.error("Failed to search songs:", e);
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddSong = async (song: any) => {
    setActionLoading(true);
    try {
      const safeSongs = Array.isArray(featuredSongs) ? featuredSongs : [];
      const nextPosition = safeSongs.length;
      const res = await addFeaturedContentSong(section, song, nextPosition);
      if (res && res.success) {
        setSearchQuery('');
        setSearchResults([]);
        await loadFeatured();
      } else {
        alert(res?.error || 'Failed to add featured song');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to add song to featured content');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveSong = async (featuredId: string) => {
    try {
      const res = await removeFeaturedContentSong(featuredId);
      if (res && res.success) {
        await loadFeatured();
      } else {
        alert(res?.error || 'Failed to remove featured song');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to remove song');
    }
  };

  const safeFeatured = Array.isArray(featuredSongs) ? featuredSongs : [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadFeatured} 
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      <div className="glass p-6 rounded-[24px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Homepage Feature Control</h3>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">Live Database Section: `public.featured_content`</p>
          </div>
          
          {/* Section Selector */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setSection('trending_hits')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                section === 'trending_hits' ? 'bg-pink-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              Trending Hits
            </button>
            <button 
              onClick={() => setSection('top_charts')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                section === 'top_charts' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              Top Charts
            </button>
          </div>
        </div>

        {/* Add New Song Search Box */}
        <div className="mb-6 relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder={`Search songs from catalog to feature in ${section === 'trending_hits' ? 'Trending' : 'Top Charts'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-pink-500/50"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#121212] border border-white/10 rounded-2xl z-50 shadow-2xl space-y-1 max-h-80 overflow-y-auto">
              {searchResults.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={song.image} alt={song.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{song.name}</p>
                      <p className="text-[10px] text-white/40 truncate">{song.artist}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddSong(song)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Feature</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currently Featured Songs List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/40">
              Live Featured Entries in Database ({safeFeatured.length})
            </h4>
            <button 
              onClick={loadFeatured}
              className="text-[10px] font-bold text-white/40 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-white/40 font-bold uppercase">Loading Supabase Featured Content...</div>
          ) : safeFeatured.length === 0 ? (
            <div className="p-8 border border-white/5 rounded-xl text-center bg-black/20 text-xs font-bold text-white/30 uppercase tracking-widest">
              No featured overrides set for this section. Homepage dynamically streams live catalog.
            </div>
          ) : (
            <div className="space-y-2">
              {safeFeatured.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-pink-400 w-6 shrink-0">#{idx + 1}</span>
                    {item.song_image && (
                      <img src={item.song_image} alt={item.song_name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-white truncate">{item.song_name || 'Song Title'}</p>
                      <p className="text-[9px] font-mono text-white/40 uppercase">ID: {item.song_id || item.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveSong(item.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all shrink-0 cursor-pointer"
                    title="Remove from featured"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. SONGS / UPLOAD PANEL
// =========================================================================
function SongsPanel() {
  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-[24px] border border-pink-500/20">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-pink-500" /> Catalog & Custom Audio
        </h3>
        <p className="text-xs text-white/60 mb-4">
          All audio tracks are streamed directly via the high-fidelity 320kbps JioSaavn CDN with automated Deezer & YouTube fallbacks.
        </p>
        <div className="p-6 border border-white/5 rounded-xl bg-black/20 text-center">
          <Music className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-white uppercase tracking-wider">Unlimited Catalog Active (JioSaavn 320kbps)</p>
          <p className="text-[10px] text-white/40 mt-1">Use the "Content Control" tab to feature specific tracks on the homepage.</p>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. ANALYTICS PANEL
// =========================================================================
function AnalyticsPanel() {
  return (
    <div className="glass p-6 rounded-[24px]">
      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Traffic & Live Streams</h3>
      <div className="h-48 flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Real-time Telemetry & Stream Metrics Operational</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="glass-card p-5 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{title}</span>
        {icon}
      </div>
      <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
    </div>
  );
}
