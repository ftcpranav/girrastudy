'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  Calendar,
  FileText,
  Calculator,
  Timer,
  BookOpen,
  LogOut,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ManageSubjectsModal from '../dashboard/ManageSubjectsModal';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { profile, enrolledSubjects, signOut } = useAuth();
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'ATAR Calculator', href: '/atar-calculator', icon: Calculator },
    { name: 'Focus Timer', href: '/focus-timer', icon: Timer },
    { name: 'Resource Vault', href: '/resources', icon: BookOpen },
    { name: 'Assessments', href: '/assessments', icon: CheckSquare },
    { name: 'Markbook', href: '/markbook', icon: TrendingUp },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Study Notes', href: '/notes', icon: FileText },
  ];

  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <aside
        className={cn(
          'w-64 glass-card border-r flex flex-col h-screen sticky top-0 bg-white/80 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 z-30 transition-colors',
          className
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-emerald-500/15">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-wider bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                GirraStudy
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide block">
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
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/40 border border-transparent'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Subjects Sub-list */}
          <div className="pt-6">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                My Subjects ({enrolledSubjects.length})
              </span>
              <button
                type="button"
                onClick={() => setIsManageSubjectsOpen(true)}
                className="text-[10px] flex items-center gap-1 font-bold text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                title="Add or remove subjects"
              >
                <PlusCircle className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
              {enrolledSubjects.map((sub) => {
                const href = `/subjects/${sub.subject_id}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={sub.id}
                    href={href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group',
                      isActive
                        ? 'bg-slate-200/80 dark:bg-slate-900/60 text-slate-900 dark:text-slate-200 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/20 hover:text-slate-900 dark:hover:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color_hex }}
                      />
                      <span className="truncate">{sub.subject?.name}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-400" />
                  </Link>
                );
              })}
              {enrolledSubjects.length === 0 && (
                <p className="text-[11px] text-slate-400 px-3 italic py-1">
                  No subjects enrolled
                </p>
              )}
            </div>
          </div>

          {/* Admin Links */}
          {isAdmin && (
            <div className="pt-6">
              <span className="px-3 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Administration
              </span>
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group border',
                  pathname === '/admin'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/25 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/40 border-transparent'
                )}
              >
                <ShieldCheck className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Footer Panel */}
        <div className="p-4 border-t border-emerald-500/15 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3 truncate">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center font-bold text-sm text-white border border-emerald-400/20 shadow-md">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {profile?.full_name || 'HSC Student'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {profile?.year_group || 'NSW HSC'} • {isAdmin ? 'Admin' : 'Student'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Manage Subjects Modal */}
      <ManageSubjectsModal
        isOpen={isManageSubjectsOpen}
        onClose={() => setIsManageSubjectsOpen(false)}
      />
    </>
  );
}

