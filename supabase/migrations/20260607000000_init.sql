-- ============================================================
-- GirraStudy — Fully Idempotent Production Database Migration
-- Run this ENTIRE script in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DROP EXISTING TABLES (clean slate, order matters for FK deps)
-- ============================================================
DROP TABLE IF EXISTS public.ai_note_metadata CASCADE;
DROP TABLE IF EXISTS public.saved_community_notes CASCADE;
DROP TABLE IF EXISTS public.note_upvotes CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.marks CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.student_subjects CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================
-- 1. USERS (Public profile synced from auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Student',
  year_group TEXT CHECK (year_group IN ('Year 11', 'Year 12')),
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  preferences_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 2. SUBJECTS (Pre-seeded catalogue, admin managed)
-- ============================================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. STUDENT SUBJECTS (Enrolment junction table)
-- ============================================================
CREATE TABLE public.student_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#6366F1',
  UNIQUE(user_id, subject_id)
);

-- ============================================================
-- 4. ASSESSMENTS
-- ============================================================
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Assignment', 'Exam', 'Practical', 'Presentation', 'Other')) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  weighting NUMERIC(5,2) NOT NULL CHECK (weighting >= 0 AND weighting <= 100),
  notes TEXT,
  status TEXT CHECK (status IN ('Upcoming', 'Completed', 'Overdue')) NOT NULL DEFAULT 'Upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- 5. MARKS
-- ============================================================
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  mark_achieved NUMERIC(5,2) NOT NULL CHECK (mark_achieved >= 0 AND mark_achieved <= 100),
  weighting NUMERIC(5,2) NOT NULL CHECK (weighting >= 0 AND weighting <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 6. NOTES
-- ============================================================
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('google_doc', 'google_drive', 'youtube', 'website', 'typed', 'textbook')) NOT NULL,
  content_text TEXT,
  url TEXT,
  textbook_title TEXT,
  textbook_chapter TEXT,
  textbook_page TEXT,
  is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assessment_due_7', 'assessment_due_1', 'assessment_overdue', 'admin_alert')),
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  related_assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. STUDY SESSIONS (Focus Timer Logging)
-- ============================================================
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  soundscape TEXT DEFAULT 'none',
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 9. FLASHCARDS (Spaced Repetition)
-- ============================================================
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 10. QUIZZES (Practice Quiz Deck)
-- ============================================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  questions_json JSONB NOT NULL,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 11. SETTINGS
-- ============================================================
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT TRUE NOT NULL,
  notification_preferences_json JSONB DEFAULT '{"due_7_days": true, "due_1_day": true, "overdue": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 12. v2: COMMUNITY / AI TABLES
-- ============================================================
CREATE TABLE public.note_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

CREATE TABLE public.saved_community_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, note_id)
);

CREATE TABLE public.ai_note_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE UNIQUE NOT NULL,
  summary_bullets JSONB DEFAULT '[]'::jsonb NOT NULL,
  key_terms JSONB DEFAULT '[]'::jsonb NOT NULL,
  key_formulas JSONB DEFAULT '[]'::jsonb NOT NULL,
  auto_dot_point_ids JSONB DEFAULT '[]'::jsonb NOT NULL,
  generated_flashcards JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX idx_student_subjects_user ON public.student_subjects(user_id);
CREATE INDEX idx_assessments_user_due ON public.assessments(user_id, due_date);
CREATE INDEX idx_marks_user_subject ON public.marks(user_id, subject_id);
CREATE INDEX idx_notes_user_subject ON public.notes(user_id, subject_id);
CREATE INDEX idx_notes_is_public ON public.notes(is_public);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_study_sessions_user ON public.study_sessions(user_id);
CREATE INDEX idx_upvotes_note_id ON public.note_upvotes(note_id);
CREATE INDEX idx_saved_notes_user_id ON public.saved_community_notes(user_id);
CREATE INDEX idx_ai_metadata_note_id ON public.ai_note_metadata(note_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_community_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_note_metadata ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS policies
-- ============================================================
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- SUBJECTS policies — public read, admin write
-- ============================================================
CREATE POLICY "subjects_select_all" ON public.subjects
  FOR SELECT USING (TRUE);

CREATE POLICY "subjects_admin_write" ON public.subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- STUDENT SUBJECTS policies
-- ============================================================
CREATE POLICY "student_subjects_select_own" ON public.student_subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "student_subjects_insert_own" ON public.student_subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_subjects_update_own" ON public.student_subjects
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_subjects_delete_own" ON public.student_subjects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ASSESSMENTS policies
-- ============================================================
CREATE POLICY "assessments_select_own" ON public.assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "assessments_insert_own" ON public.assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessments_update_own" ON public.assessments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessments_delete_own" ON public.assessments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MARKS policies
-- ============================================================
CREATE POLICY "marks_select_own" ON public.marks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "marks_insert_own" ON public.marks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "marks_update_own" ON public.marks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "marks_delete_own" ON public.marks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- NOTES policies — public notes visible to all, private = owner only
-- ============================================================
CREATE POLICY "notes_select" ON public.notes
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "notes_insert_own" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_own" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_delete_own" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS policies
-- ============================================================
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STUDY SESSIONS policies
-- ============================================================
CREATE POLICY "study_sessions_select_own" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_insert_own" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_delete_own" ON public.study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- FLASHCARDS / QUIZZES / SETTINGS policies
-- ============================================================
CREATE POLICY "flashcards_own_select" ON public.flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "flashcards_own_insert" ON public.flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "flashcards_own_update" ON public.flashcards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "flashcards_own_delete" ON public.flashcards
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "quizzes_own_select" ON public.quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quizzes_own_insert" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quizzes_own_delete" ON public.quizzes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "settings_own_select" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "settings_own_insert" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_own_update" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- v2: note_upvotes / saved_community_notes / ai_note_metadata
-- ============================================================
CREATE POLICY "upvotes_select_all" ON public.note_upvotes
  FOR SELECT USING (true);

CREATE POLICY "upvotes_insert_own" ON public.note_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "upvotes_delete_own" ON public.note_upvotes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "saved_notes_select_own" ON public.saved_community_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_notes_insert_own" ON public.saved_community_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_notes_delete_own" ON public.saved_community_notes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "ai_metadata_select_all" ON public.ai_note_metadata
  FOR SELECT USING (true);

CREATE POLICY "ai_metadata_insert_service" ON public.ai_note_metadata
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ai_metadata_update_service" ON public.ai_note_metadata
  FOR UPDATE USING (true);

-- ============================================================
-- TRIGGER: Sync auth.users → public.users + create settings
-- SECURITY DEFINER bypasses RLS — safe for post-signup user creation
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE
      WHEN EXCLUDED.full_name != 'Student' THEN EXCLUDED.full_name
      ELSE public.users.full_name
    END;

  INSERT INTO public.settings (user_id, dark_mode)
  VALUES (NEW.id, TRUE)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA: HSC Subjects Catalogue
-- ============================================================
INSERT INTO public.subjects (name, code) VALUES
  ('English Advanced', 'ENG_ADV'),
  ('English Standard', 'ENG_STD'),
  ('English Extension 1', 'ENG_EXT1'),
  ('English Extension 2', 'ENG_EXT2'),
  ('Mathematics Advanced', 'MATH_ADV'),
  ('Mathematics Extension 1', 'MATH_EXT1'),
  ('Mathematics Extension 2', 'MATH_EXT2'),
  ('Chemistry', 'CHEM'),
  ('Physics', 'PHYS'),
  ('Biology', 'BIOL'),
  ('Economics', 'ECON'),
  ('Business Studies', 'BUSS'),
  ('Legal Studies', 'LEGL'),
  ('Modern History', 'HIST_MOD'),
  ('Ancient History', 'HIST_ANC'),
  ('Software Engineering', 'SOFT_ENG'),
  ('Engineering Studies', 'ENG_STUD'),
  ('Information Processes and Technology', 'IPT'),
  ('PDHPE', 'PDHPE'),
  ('Studies of Religion', 'SOR')
ON CONFLICT (code) DO NOTHING;
