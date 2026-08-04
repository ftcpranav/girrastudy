'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sparkles,
  Loader2,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNoteUpvote, useSaveCommunityNote } from '@/hooks/useCommunityHub';
import type { Note } from '@/lib/types';
import AiNoteBreakdownPanel from './AiNoteBreakdownPanel';

interface AiNoteMetadata {
  note_id: string;
  summary_bullets: string[];
  key_terms: string[];
  key_formulas: string[];
  auto_dot_point_ids: string[];
  generated_flashcards: Array<{ question: string; answer: string }>;
}

interface CommunityNoteWithMeta extends Note {
  upvote_count?: number;
  ai_metadata?: AiNoteMetadata | null;
}

interface CommunityHubTabProps {
  currentUserId: string | null;
}

/**
 * The Community Hub tab shown inside /resources.
 * Lists all public notes across all subjects with search, filter, upvote, and save-to-vault.
 */
export default function CommunityHubTab({ currentUserId }: CommunityHubTabProps) {
  const [notes, setNotes] = useState<CommunityNoteWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [savedNoteIds, setSavedNoteIds] = useState<Set<string>>(new Set());
  const [upvotedNoteIds, setUpvotedNoteIds] = useState<Set<string>>(new Set());

  const { upvote, removeUpvote } = useNoteUpvote();
  const { save, unsave } = useSaveCommunityNote();

  // Fetch public notes + AI metadata + upvote counts
  useEffect(() => {
    async function fetchCommunityNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          subject:subjects(id, name, code),
          ai_metadata:ai_note_metadata(*)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotes(data as CommunityNoteWithMeta[]);
      }
      setLoading(false);
    }

    fetchCommunityNotes();
  }, []);

  // Fetch user's upvoted & saved notes
  useEffect(() => {
    if (!currentUserId) return;
    async function fetchUserState() {
      const [upvotesRes, savedRes] = await Promise.all([
        supabase.from('note_upvotes').select('note_id').eq('user_id', currentUserId),
        supabase.from('saved_community_notes').select('note_id').eq('user_id', currentUserId),
      ]);
      if (upvotesRes.data) {
        setUpvotedNoteIds(new Set(upvotesRes.data.map((r: any) => r.note_id)));
      }
      if (savedRes.data) {
        setSavedNoteIds(new Set(savedRes.data.map((r: any) => r.note_id)));
      }
    }
    fetchUserState();
  }, [currentUserId]);

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.topic.toLowerCase().includes(q) ||
      n.subject?.name.toLowerCase().includes(q) ||
      n.ai_metadata?.key_terms?.some((t) => t.toLowerCase().includes(q)) ||
      n.ai_metadata?.auto_dot_point_ids?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleUpvoteToggle = async (noteId: string) => {
    if (!currentUserId) return;
    if (upvotedNoteIds.has(noteId)) {
      await removeUpvote(noteId, currentUserId);
      setUpvotedNoteIds((prev) => { const s = new Set(prev); s.delete(noteId); return s; });
    } else {
      await upvote(noteId, currentUserId);
      setUpvotedNoteIds((prev) => new Set(prev).add(noteId));
    }
  };

  const handleSaveToggle = async (noteId: string) => {
    if (!currentUserId) return;
    if (savedNoteIds.has(noteId)) {
      await unsave(noteId, currentUserId);
      setSavedNoteIds((prev) => { const s = new Set(prev); s.delete(noteId); return s; });
    } else {
      await save(noteId, currentUserId);
      setSavedNoteIds((prev) => new Set(prev).add(noteId));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">Community Notes Hub</h2>
            <p className="text-xs text-slate-400">
              {notes.length} public notes — Browse, upvote, and save top-rated HSC notes
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, topic, term..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-emerald-500/20 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Note Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
          <p className="text-slate-500 text-sm italic">
            {searchQuery ? 'No notes matched your search.' : 'No public notes yet. Be the first to share!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            const isUpvoted = upvotedNoteIds.has(note.id);
            const isSaved = savedNoteIds.has(note.id);
            const hasAI = !!note.ai_metadata;

            return (
              <div
                key={note.id}
                className="glass-card rounded-2xl p-4 border-emerald-500/15 transition-all"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {note.subject?.code ?? 'GEN'}
                      </span>
                      <span className="text-[10px] text-slate-500">#{note.topic}</span>
                      {hasAI && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Sparkles className="h-3 w-3" />
                          AI Parsed
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 truncate">{note.title}</h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {note.url && (
                      <a
                        href={note.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveToggle(note.id)}
                      disabled={!currentUserId}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSaved ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                      title={isSaved ? 'Unsave' : 'Save to My Vault'}
                    >
                      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpvoteToggle(note.id)}
                      disabled={!currentUserId}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isUpvoted
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{isUpvoted ? 'Upvoted' : 'Upvote'}</span>
                    </button>
                  </div>
                </div>

                {/* AI breakdown toggle */}
                {hasAI && (
                  <button
                    type="button"
                    onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                    className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-500/80 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isExpanded ? 'Hide AI Breakdown' : 'Show AI Breakdown'}
                  </button>
                )}

                {/* Expanded AI breakdown */}
                {isExpanded && note.ai_metadata && (
                  <AiNoteBreakdownPanel metadata={note.ai_metadata} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
