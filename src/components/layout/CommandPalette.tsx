'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calculator,
  Timer,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Calendar,
  FileText,
  Search,
  X,
  Sparkles,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  href: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const commands: CommandItem[] = [
    { id: '1', name: 'Dashboard Overview', category: 'Navigation', icon: LayoutDashboard, href: '/dashboard' },
    { id: '2', name: 'HSC ATAR & Scaling Estimator', category: 'Tools', icon: Calculator, href: '/atar-calculator' },
    { id: '3', name: 'Focus & Pomodoro Timer', category: 'Tools', icon: Timer, href: '/focus-timer' },
    { id: '4', name: 'HSC Resource Vault & Past Papers', category: 'Study', icon: BookOpen, href: '/resources' },
    { id: '5', name: 'Assessments & Deadlines', category: 'Navigation', icon: CheckSquare, href: '/assessments' },
    { id: '6', name: 'Markbook & Weighted Averages', category: 'Navigation', icon: TrendingUp, href: '/markbook' },
    { id: '7', name: 'Monthly Study Calendar', category: 'Navigation', icon: Calendar, href: '/calendar' },
    { id: '8', name: 'Study Notes & Summaries', category: 'Study', icon: FileText, href: '/notes' },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl glass-card rounded-3xl p-4 shadow-2xl border-indigo-950/40 bg-slate-950/95 animate-fade-in">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-indigo-950/25">
          <Search className="h-5 w-5 text-violet-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search tools (e.g. ATAR, Timer, Markbook)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-300 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-1 pr-1">
          {filteredCommands.map((cmd) => {
            const IconComponent = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={() => {
                  router.push(cmd.href);
                  onClose();
                }}
                className="w-full text-left flex items-center justify-between px-3.5 py-2.5 hover:bg-violet-600/15 rounded-xl transition-colors text-slate-200 text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-900 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-200 group-hover:text-violet-300">
                    {cmd.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
                  {cmd.category}
                </span>
              </button>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 italic">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="mt-3 pt-3 border-t border-indigo-950/20 flex items-center justify-between text-[10px] text-slate-500 px-2">
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" /> Navigation Command Palette
          </span>
          <span>Press ESC to exit</span>
        </div>

      </div>
    </div>
  );
}
