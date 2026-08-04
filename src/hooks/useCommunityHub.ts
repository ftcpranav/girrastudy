'use client';

import { useState, useCallback } from 'react';

export interface AiNoteMetadata {
  note_id: string;
  summary_bullets: string[];
  key_terms: string[];
  key_formulas: string[];
  auto_dot_point_ids: string[];
  generated_flashcards: Array<{ question: string; answer: string }>;
}

interface ParseNoteResult {
  success: boolean;
  metadata?: AiNoteMetadata;
  error?: string;
}

/**
 * Hook to trigger AI note parsing via /api/ai/parse-note.
 */
export function useAiNoteParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseNote = useCallback(
    async (noteId: string, content: string): Promise<ParseNoteResult> => {
      setIsParsing(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/parse-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteId, content }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error ?? 'Unknown error from AI parser.');
          return { success: false, error: data.error };
        }
        return { success: true, metadata: data.metadata };
      } catch (err: any) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsParsing(false);
      }
    },
    []
  );

  return { parseNote, isParsing, error };
}

/**
 * Hook to toggle an upvote on a public note.
 */
export function useNoteUpvote() {
  const [loading, setLoading] = useState(false);

  const upvote = useCallback(async (noteId: string, userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, userId }),
      });
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUpvote = useCallback(async (noteId: string, userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes/upvote', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, userId }),
      });
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, []);

  return { upvote, removeUpvote, loading };
}

/**
 * Hook to save/unsave a community note to personal vault.
 */
export function useSaveCommunityNote() {
  const [loading, setLoading] = useState(false);

  const save = useCallback(async (noteId: string, userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes/save-community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, userId }),
      });
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, []);

  const unsave = useCallback(async (noteId: string, userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes/save-community', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, userId }),
      });
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, []);

  return { save, unsave, loading };
}
