import { createClient } from '@supabase/supabase-js';

/**
 * A Supabase client that uses the Service Role Key for server-side API routes.
 * Never import this in client components.
 */
export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder_service_role'
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !serviceKey) {
    throw new Error('[GirraStudy] Supabase environment variables are not configured.');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
