'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useNotificationAlerts() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkOverdueAssessments = async () => {
      try {
        const now = new Date().toISOString();

        // 1. Fetch assessments that are past due and still 'Upcoming'
        const { data: pastDue, error: fetchError } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'Upcoming')
          .lt('due_date', now);

        if (fetchError || !pastDue || pastDue.length === 0) return;

        for (const ast of pastDue) {
          // A. Update status to Overdue in database
          await supabase
            .from('assessments')
            .update({ status: 'Overdue' })
            .eq('id', ast.id);

          // B. Check if overdue notification already exists
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('related_assessment_id', ast.id)
            .eq('type', 'assessment_overdue')
            .maybeSingle();

          // C. If not, insert it
          if (!existingNotif) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              message: `Assessment "${ast.name}" is overdue! Please complete it.`,
              type: 'assessment_overdue',
              related_assessment_id: ast.id,
            });
          }
        }
      } catch (err) {
        console.error('Error checking overdue assessments:', err);
      }
    };

    // Run immediately on load
    checkOverdueAssessments();

    // Re-check periodically every 60 seconds
    const interval = setInterval(checkOverdueAssessments, 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);
}
