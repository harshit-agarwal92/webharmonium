'use client';

import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();

  if (!user) return null; // handled by layout

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
