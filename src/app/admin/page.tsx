'use client';

import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-10 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-white/50">Verifying Admin Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-10 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <Lock className="w-10 h-10 text-pink-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold uppercase tracking-wider">Authentication Required</h2>
          <p className="text-xs text-white/50 mt-1 max-w-sm">Please log in to your account with admin privileges to view the Control Center.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/music" className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-black uppercase tracking-wider text-white hover:opacity-90 transition-all">
              Go to App & Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/music" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[9px]">Back to App</span>
        </Link>
      </div>
      <AdminDashboard currentUserEmail={user.email || ''} />
    </div>
  );
}
