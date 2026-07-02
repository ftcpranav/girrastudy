export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  year_group: 'Year 11' | 'Year 12' | null;
  role: UserRole;
  avatar_url?: string | null;
  preferences_json?: Record<string, any>;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentSubject {
  id: string;
  user_id: string;
  subject_id: string;
  enrolled_at: string;
  color_hex: string;
  // populated field
  subject?: Subject;
}

export interface Assessment {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  type: 'Assignment' | 'Exam' | 'Practical' | 'Presentation' | 'Other';
  due_date: string;
  weighting: number; // weighting percentage, e.g. 25
  notes?: string | null;
  status: 'Upcoming' | 'Completed' | 'Overdue';
  created_at: string;
  completed_at?: string | null;
  // populated fields
  subject?: Subject;
  mark?: Mark;
}

export interface Mark {
  id: string;
  user_id: string;
  assessment_id?: string | null;
  subject_id: string;
  mark_achieved: number; // e.g. 85.5
  weighting: number; // e.g. 25
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  topic: string;
  note_type: 'google_doc' | 'google_drive' | 'youtube' | 'website' | 'typed' | 'textbook';
  content_text?: string | null;
  url?: string | null;
  textbook_title?: string | null;
  textbook_chapter?: string | null;
  textbook_page?: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  embedding?: number[] | null;
  ai_summary?: string | null;
  is_public: boolean;
  // populated fields
  subject?: Subject;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'assessment_due_7' | 'assessment_due_1' | 'assessment_overdue' | 'admin_alert';
  is_read: boolean;
  created_at: string;
  related_assessment_id?: string | null;
  // populated
  assessment?: Assessment;
}

export interface SystemSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  notification_preferences_json: {
    due_7_days: boolean;
    due_1_day: boolean;
    overdue: boolean;
  };
  created_at: string;
}
