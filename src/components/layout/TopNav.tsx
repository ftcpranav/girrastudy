'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Bell, Sun, Moon, Search, Loader2, Book, CheckSquare, FileText, X, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Assessment, Note, Subject } from '@/lib/types';
import CommandPalette from './CommandPalette';

export default function TopNav() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Command palette state
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    assessments: (Assessment & { subject: Subject })[];
    notes: (Note & { subject: Subject })[];
    subjects: Subject[];
  }>({ assessments: [], notes: [], subjects: [] });

  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);

  // Listen for Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdKOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch unread notification counts
  useEffect(() => {
    if (!user) return;

    const fetchNotificationsCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchNotificationsCount();

    const channel = supabase
      .channel('schema-db-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotificationsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Click outside search results to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search handler
  useEffect(() => {
    if (!user || searchQuery.trim().length < 2) {
      setResults({ assessments: [], notes: [], subjects: [] });
      setShowResults(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setShowResults(true);
      try {
        const query = searchQuery.trim();

        const { data: asts } = await supabase
          .from('assessments')
          .select('*, subject:subjects(*)')
          .eq('user_id', user.id)
          .ilike('name', `%${query}%`)
          .limit(4);

        const { data: nts } = await supabase
          .from('notes')
          .select('*, subject:subjects(*)')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,topic.ilike.%${query}%`)
          .limit(4);

        const { data: enrolled } = await supabase
          .from('student_subjects')
          .select('*, subject:subjects(*)')
          .eq('user_id', user.id);

        const matchedSubjects = (enrolled || [])
          .map((item: any) => item.subject as Subject)
          .filter((sub: any) => sub && sub.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4);

        setResults({
          assessments: (asts || []) as any,
          notes: (nts || []) as any,
          subjects: matchedSubjects,
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, user]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-indigo-950/20 bg-slate-950/40 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Bar & Cmd+K Trigger Container */}
      <div ref={searchRef} className="relative w-full max-w-md flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assessments, notes, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
            className="w-full pl-10 pr-9 py-1.5 bg-slate-900/40 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-600/10 placeholder-slate-500 text-slate-200 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Cmd + K Hotkey Badge Button */}
        <button
          onClick={() => setIsCmdKOpen(true)}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-indigo-950/30 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors cursor-pointer"
          title="Open Command Palette (Cmd + K)"
        >
          <Command className="h-3 w-3" />
          <span>K</span>
        </button>

        {/* Command Palette Modal */}
        <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />

        {/* Live Search Results Popup */}
        {showResults && (
          <div className="absolute top-12 left-0 right-0 glass-card rounded-2xl p-4 shadow-2xl z-50 max-h-[80vh] overflow-y-auto bg-slate-950/95 border border-indigo-950/50">
            {isSearching ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                <span>Searching...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {results.subjects.length === 0 &&
                  results.assessments.length === 0 &&
                  results.notes.length === 0 && (
                    <p className="text-center py-4 text-xs text-slate-500 italic">
                      No matching results found for "{searchQuery}"
                    </p>
                  )}

                {/* Subjects Section */}
                {results.subjects.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-2 border-b border-indigo-950/25 pb-1">
                      Subjects ({results.subjects.length})
                    </h3>
                    <div className="space-y-1">
                      {results.subjects.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            router.push(`/subjects/${sub.id}`);
                            setShowResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-violet-600/10 rounded-lg transition-colors text-slate-300 text-xs"
                        >
                          <Book className="h-3.5 w-3.5 text-violet-400" />
                          <span className="font-medium">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assessments Section */}
                {results.assessments.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-2 border-b border-indigo-950/25 pb-1">
                      Assessments ({results.assessments.length})
                    </h3>
                    <div className="space-y-1">
                      {results.assessments.map((ast) => (
                        <button
                          key={ast.id}
                          onClick={() => {
                            router.push(`/subjects/${ast.subject_id}?tab=assessments`);
                            setShowResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left flex items-center justify-between px-2.5 py-1.5 hover:bg-violet-600/10 rounded-lg transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <CheckSquare className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span className="font-medium text-slate-200 truncate">{ast.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 italic bg-slate-905 px-1.5 py-0.5 rounded">
                            {ast.subject?.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {results.notes.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-2 border-b border-indigo-950/25 pb-1">
                      Notes ({results.notes.length})
                    </h3>
                    <div className="space-y-1">
                      {results.notes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => {
                            router.push(`/subjects/${note.subject_id}?tab=notes`);
                            setShowResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left flex items-center justify-between px-2.5 py-1.5 hover:bg-violet-600/10 rounded-lg transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span className="font-medium text-slate-200 truncate">{note.title}</span>
                          </div>
                          <div className="flex gap-1.5 shrink-0 items-center">
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              #{note.topic}
                            </span>
                            <span className="text-[10px] text-slate-400 italic">
                              {note.subject?.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-indigo-950/20 transition-all cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => router.push('/notifications')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-indigo-950/20 transition-all cursor-pointer relative"
          title="Notification Center"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse border border-slate-950">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
