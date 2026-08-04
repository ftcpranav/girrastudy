-- ====================================================================
-- GIRRASTUDY v2 DATABASE MIGRATION SCRIPT
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ====================================================================

-- 1. Create table for Community Upvotes
CREATE TABLE IF NOT EXISTS public.note_upvotes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id     UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

-- 2. Create table for Saved / Bookmarked Community Notes
CREATE TABLE IF NOT EXISTS public.saved_community_notes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  note_id     UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, note_id)
);

-- 3. Create table for AI Note Parsing Metadata
CREATE TABLE IF NOT EXISTS public.ai_note_metadata (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id               UUID REFERENCES public.notes(id) ON DELETE CASCADE UNIQUE NOT NULL,
  summary_bullets       JSONB DEFAULT '[]'::jsonb NOT NULL,
  key_terms             JSONB DEFAULT '[]'::jsonb NOT NULL,
  key_formulas          JSONB DEFAULT '[]'::jsonb NOT NULL,
  auto_dot_point_ids    JSONB DEFAULT '[]'::jsonb NOT NULL,
  generated_flashcards  JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notes_is_public
  ON public.notes(is_public);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id
  ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_note_id
  ON public.note_upvotes(note_id);
CREATE INDEX IF NOT EXISTS idx_saved_notes_user_id
  ON public.saved_community_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_metadata_note_id
  ON public.ai_note_metadata(note_id);

-- 5. Enable Row Level Security
ALTER TABLE public.note_upvotes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_community_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_note_metadata      ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: note_upvotes
CREATE POLICY "Public can view upvotes"
  ON public.note_upvotes FOR SELECT USING (true);

CREATE POLICY "User can upvote"
  ON public.note_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can remove own upvote"
  ON public.note_upvotes FOR DELETE USING (auth.uid() = user_id);

-- 7. RLS Policies: saved_community_notes
CREATE POLICY "User can view own saved notes"
  ON public.saved_community_notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User can save a community note"
  ON public.saved_community_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can unsave a community note"
  ON public.saved_community_notes FOR DELETE USING (auth.uid() = user_id);

-- 8. RLS Policies: ai_note_metadata
CREATE POLICY "Public can view AI metadata"
  ON public.ai_note_metadata FOR SELECT USING (true);

CREATE POLICY "Service role can insert AI metadata"
  ON public.ai_note_metadata FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update AI metadata"
  ON public.ai_note_metadata FOR UPDATE USING (true);
