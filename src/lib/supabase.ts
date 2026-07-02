import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const isPlaceholder = supabaseUrl.includes('placeholder.supabase.co') || supabaseAnonKey === 'placeholder';

export const supabase = isPlaceholder
  ? (mockSupabase as any)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

// Check if credentials are placeholders and log a warning in development
if (typeof window !== 'undefined' && isPlaceholder) {
  console.warn(
    'Supabase environment variables are not configured. Using client-side mock database (localStorage).'
  );
}
