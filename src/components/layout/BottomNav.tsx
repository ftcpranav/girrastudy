'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assessments', href: '/assessments', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Markbook', href: '/markbook', icon: TrendingUp },
  ];

  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-lg border-t border-indigo-950/20 flex items-center justify-around px-2 pb-safe z-30',
        className
      )}
    >
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full py-2 text-center transition-all',
              isActive ? 'text-violet-400 font-semibold scale-105' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <item.icon
              className={cn(
                'h-5 w-5 mb-1',
                isActive ? 'text-violet-400' : 'text-slate-400'
              )}
            />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </a>
        );
      })}
    </nav>
  );
}
