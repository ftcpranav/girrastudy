-- ============================================================
-- GirraStudy — Optimal Production Database Migration
-- Run this in Supabase SQL Editor: Project > SQL Editor > New Query
-- ============================================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic search & AI notes (pgvector)

-- ============================================================
-- 1. USERS (Public profile synced from auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. STUDENT SUBJECTS (Enrolment junction table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_subjects (
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
CREATE TABLE IF NOT EXISTS public.assessments (
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
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  mark_achieved NUMERIC(5,2) NOT NULL CHECK (mark_achieved >= 0 AND mark_achieved <= 100),
  weighting NUMERIC(5,2) NOT NULL CHECK (weighting >= 0 AND weighting <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 6. NOTES (Support text, Google Docs, Drive, YouTube, Textbook)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
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
  embedding VECTOR(1536),
  ai_summary TEXT,
  is_public BOOLEAN DEFAULT FALSE NOT NULL
);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
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
CREATE TABLE IF NOT EXISTS public.study_sessions (
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
CREATE TABLE IF NOT EXISTS public.flashcards (
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
CREATE TABLE IF NOT EXISTS public.quizzes (
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
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT TRUE NOT NULL,
  notification_preferences_json JSONB DEFAULT '{"due_7_days": true, "due_1_day": true, "overdue": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- PERFORMANCE INDEXES (Optimized Query Speed)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_subjects_user ON public.student_subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_due ON public.assessments(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_marks_user_subject ON public.marks(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_subject ON public.notes(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.study_sessions(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
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

-- Users policies
CREATE POLICY "users_select_authenticated" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Subjects policies
CREATE POLICY "subjects_select_all" ON public.subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "subjects_admin_all" ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Student Subjects policies
CREATE POLICY "student_subjects_own" ON public.student_subjects FOR ALL USING (auth.uid() = user_id);

-- Assessments policies
CREATE POLICY "assessments_own" ON public.assessments FOR ALL USING (auth.uid() = user_id);

-- Marks policies
CREATE POLICY "marks_own" ON public.marks FOR ALL USING (auth.uid() = user_id);

-- Notes policies (own notes OR public shared notes)
CREATE POLICY "notes_own" ON public.notes FOR ALL USING (auth.uid() = user_id OR is_public = TRUE);

-- Notifications policies
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Study Sessions policies
CREATE POLICY "study_sessions_own" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "flashcards_own" ON public.flashcards FOR ALL USING (auth.uid() = user_id);

-- Quizzes policies
CREATE POLICY "quizzes_own" ON public.quizzes FOR ALL USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "settings_own" ON public.settings FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER FUNCTION: Sync auth.users to public.users & settings
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'),
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;

  INSERT INTO public.settings (user_id, dark_mode)
  VALUES (new.id, TRUE)
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
