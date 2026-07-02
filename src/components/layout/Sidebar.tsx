'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  Calendar,
  FileText,
  LogOut,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { profile, enrolledSubjects, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assessments', href: '/assessments', icon: CheckSquare },
    { name: 'Markbook', href: '/markbook', icon: TrendingUp },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Study Notes', href: '/notes', icon: FileText },
  ];

  const isAdmin = profile?.role === 'admin';

  return (
    <aside
      className={cn(
        'w-64 glass-card border-r flex flex-col h-screen sticky top-0 bg-slate-950/70 text-slate-200 z-30',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-indigo-950/20">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 group-hover:bg-violet-600/30 transition-colors">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wider bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              GirraStudy
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
              GIRRAWEEN HIGH
            </span>
          </div>
        </Link>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-300'
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                )}
              </a>
            );
          })}
        </div>

        {/* Subjects Sub-list */}
        <div className="pt-6">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              My Subjects
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
              {enrolledSubjects.length}
            </span>
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {enrolledSubjects.map((sub) => {
              const href = `/subjects/${sub.subject_id}`;
              const isActive = pathname === href;
              return (
                <a
                  key={sub.id}
                  href={href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group',
                    isActive
                      ? 'bg-slate-900/60 text-slate-200'
                      : 'text-slate-400 hover:bg-slate-900/20 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color_hex }}
                    />
                    <span className="truncate">{sub.subject?.name}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500" />
                </a>
              );
            })}
            {enrolledSubjects.length === 0 && (
              <p className="text-[11px] text-slate-500 px-3 italic py-1">
                No subjects enrolled
              </p>
            )}
          </div>
        </div>

        {/* Admin Links */}
        {isAdmin && (
          <div className="pt-6">
            <span className="px-3 block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Administration
            </span>
            <a
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group border',
                pathname === '/admin'
                  ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
              )}
            >
              <ShieldCheck className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Admin Panel</span>
            </a>
          </div>
        )}
      </nav>

      {/* User Footer Panel */}
      <div className="p-4 border-t border-indigo-950/20 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3 truncate">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white border border-violet-400/20">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate leading-tight">
              {profile?.full_name || 'HSC Student'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {profile?.year_group || 'NSW HSC'} • {isAdmin ? 'Admin' : 'Student'}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
