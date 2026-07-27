'use client';

import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopNav from './TopNav';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

import { useNotificationAlerts } from '@/hooks/useNotificationAlerts';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  
  // Activate dynamic alerts listener
  useNotificationAlerts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070e17]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">
            Loading GirraStudy...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, we let the route protection inside AuthProvider handle redirection
  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#070e17] text-slate-100">
      {/* Sidebar - Desktop Only */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Navbar */}
        <TopNav />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
}
