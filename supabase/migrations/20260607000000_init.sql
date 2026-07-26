-- ============================================================
-- GirraStudy — Fully Idempotent Production Database Migration
-- Run this ENTIRE script in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DROP EXISTING TABLES (clean slate, order matters for FK deps)
-- ============================================================
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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ai_summary TEXT,
  is_public BOOLEAN DEFAULT FALSE NOT NULL
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
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX idx_student_subjects_user ON public.student_subjects(user_id);
CREATE INDEX idx_assessments_user_due ON public.assessments(user_id, due_date);
CREATE INDEX idx_marks_user_subject ON public.marks(user_id, subject_id);
CREATE INDEX idx_notes_user_subject ON public.notes(user_id, subject_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_study_sessions_user ON public.study_sessions(user_id);

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

-- ============================================================
-- USERS policies
-- The trigger (SECURITY DEFINER) handles initial row creation.
-- Authenticated users can read/update their own row only.
-- ============================================================
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- SUBJECTS policies
-- Anyone can read. Only admins can write.
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
-- Explicit INSERT + SELECT + DELETE for the authenticated user.
-- ============================================================
CREATE POLICY "student_subjects_select_own" ON public.student_subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "student_subjects_insert_own" ON public.student_subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_subjects_delete_own" ON public.student_subjects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- All other table policies — own rows only
-- ============================================================
CREATE POLICY "assessments_own" ON public.assessments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "marks_own" ON public.marks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_select" ON public.notes
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "notes_write" ON public.notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_own" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "flashcards_own" ON public.flashcards
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quizzes_own" ON public.quizzes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_own" ON public.settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Sync auth.users → public.users + create settings
-- SECURITY DEFINER bypasses RLS — safe because it only runs
-- after a successful auth.users INSERT.
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
