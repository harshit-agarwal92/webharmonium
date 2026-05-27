import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Music, HardDriveDownload, Activity, 
  Upload, ShieldAlert, BarChart3, Settings, Trash2, 
  Search, PlayCircle, Star
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isRealFirebase } from '@/lib/firebase';

interface AdminDashboardProps {
  currentUserEmail: string;
}

export default function AdminDashboard({ currentUserEmail }: AdminDashboardProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'songs' | 'users' | 'analytics' | 'content'>('overview');
  
  // Security Guard - Extra safety check for Admin
  if (currentUserEmail !== 'aggarwalharshit345@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Access Denied</h2>
        <p className="text-white/50 text-sm">You do not have administrative clearance.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-2xl shadow-[0_0_30px_rgba(255,0,127,0.4)]">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Control Center</h1>
          <p className="text-[10px] text-pink-500 font-extrabold uppercase tracking-[0.3em] mt-1">Super Admin Clearance Active</p>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
        <AdminTab btnTab="overview" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={<Activity />} label="Overview" />
        <AdminTab btnTab="songs" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={<Music />} label="Manage Songs" />
        <AdminTab btnTab="users" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={<Users />} label="Users" />
        <AdminTab btnTab="analytics" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={<BarChart3 />} label="Analytics" />
        <AdminTab btnTab="content" activeTab={activeAdminTab} setTab={setActiveAdminTab} icon={<Star />} label="Content Control" />
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

function AdminTab({ btnTab, activeTab, setTab, icon, label }: any) {
  const active = btnTab === activeTab;
  return (
      <button 
    onClick={() => setTab(btnTab)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
      active 
        ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
        : 'bg-transparent text-white/40 border border-transparent hover:text-white/80 hover:bg-white/5'
    }`}
    >
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
      {label}
    </button>
  );
}

// --- SUB-PANELS ---

function OverviewPanel() {
  const [userCount, setUserCount] = useState<number | string>("...");
  useEffect(() => {
    if (isRealFirebase && db) {
      getDocs(collection(db, 'users')).then(snap => setUserCount(snap.size)).catch(() => setUserCount("Error"));
    } else {
      setUserCount("Mock Mode");
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={userCount} icon={<Users className="w-5 h-5 text-cyan-400" />} />
        <StatCard title="Active Streams" value="Live" icon={<PlayCircle className="w-5 h-5 text-green-400" />} />
        <StatCard title="Total Songs" value="150+" icon={<Music className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Local Downloads" value="Syncing" icon={<HardDriveDownload className="w-5 h-5 text-pink-400" />} />
      </div>
      <div className="glass p-6 rounded-[24px]">
        <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">System Health</h3>
        <div className="h-40 flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
          <span className="text-white/30 text-xs font-bold uppercase tracking-widest">All Systems Optimal - Firebase Connected</span>
        </div>
      </div>
    </div>
  );
}

function SongsPanel() {
  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-[24px] border border-pink-500/20">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-pink-500" /> Upload New Track
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Song Title" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-pink-500/50 transition-all" />
          <input type="text" placeholder="Artist" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-pink-500/50 transition-all" />
          <input type="text" placeholder="Category/Genre" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-pink-500/50 transition-all" />
          <input type="text" placeholder="Thumbnail URL" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-pink-500/50 transition-all" />
        </div>
        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-pink-500/50 transition-all cursor-pointer bg-white/5">
          <Music className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Drop Audio File Here (mp3, wav)</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-3 bg-pink-600 hover:bg-pink-500 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all">Upload Track</button>
        </div>
      </div>
      
      <div className="glass p-6 rounded-[24px]">
        <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Existing Library</h3>
        <div className="h-20 flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
          <span className="text-white/30 text-xs font-bold uppercase tracking-widest">No custom tracks uploaded to Firestore yet.</span>
        </div>
      </div>
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      if (isRealFirebase && db) {
        try {
          const snap = await getDocs(collection(db, 'users'));
          const usersData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(usersData);
        } catch (err) {
          console.error("Failed to fetch users", err);
        }
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div className="glass p-6 rounded-[24px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">User Database</h3>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" placeholder="Search Users..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-white outline-none focus:border-pink-500/50" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-bold uppercase tracking-wider text-white/60">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 pl-2">User ID</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center">Loading users from Firebase...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-white/30">No users found in database.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="py-4 pl-2 text-white/50 text-[10px] truncate max-w-[80px]">{u.uid || u.id}</td>
                  <td className="py-4 text-white">{u.name || 'Unknown'}</td>
                  <td className="py-4 text-pink-400">{u.email || 'N/A'}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 rounded-md bg-white/10 text-[9px] text-white">
                      {u.email === 'aggarwalharshit345@gmail.com' ? 'Super Admin' : 'User'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="glass p-6 rounded-[24px]">
      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Traffic & Streams</h3>
      <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Analytics Chart Rendering...</span>
      </div>
    </div>
  );
}

function ContentPanel() {
  return (
    <div className="glass p-6 rounded-[24px]">
      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Homepage Feature Control</h3>
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Trending Section</p>
            <p className="text-xs text-white/40">Manage which songs appear in top trending</p>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-all">Configure</button>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Hero Banners</p>
            <p className="text-xs text-white/40">Manage featured albums and announcements</p>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-all">Configure</button>
        </div>
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
