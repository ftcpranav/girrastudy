'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  Bell,
  Check,
  CheckSquare,
  AlertTriangle,
  Clock,
  Trash2,
  Trash,
  Loader2,
  Info,
} from 'lucide-react';
import { Notification } from '@/lib/types';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*, assessment:assessments(*)')
        .eq('user_id', user.id)
        .lte('created_at', now) // Pre-scheduled notices are hidden until current time is past created_at
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);

      if (!error) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark single as read
  const handleMarkRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (!error) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete all notifications
  const handleClearAll = async () => {
    if (!user || notifications.length === 0) return;
    if (!confirm('Are you sure you want to clear your notification history?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (!error) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Icon selector based on category
  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'assessment_overdue':
        return (
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/10 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        );
      case 'assessment_due_1':
        return (
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        );
      case 'assessment_due_7':
        return (
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/10 shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 shrink-0">
            <Info className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <AppLayout>
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
            Notification Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review assessment warnings and due date reminders.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 select-none">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-900/60 border border-indigo-950/20 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Check className="h-4 w-4 text-violet-400" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3.5 py-2 bg-red-950/20 hover:bg-red-950/30 border border-red-500/10 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash className="h-4 w-4" />
              <span>Clear history</span>
            </button>
          </div>
        )}
      </div>

      {/* NOTIFICATIONS CONTAINER */}
      <div className="max-w-3xl space-y-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 shadow-sm ${
              notif.is_read
                ? 'bg-slate-900/10 border-indigo-950/10'
                : 'glass-card border-violet-500/20 bg-slate-900/30 ring-1 ring-violet-500/5'
            }`}
          >
            {/* Severity icon */}
            {getNotifIcon(notif.type)}

            {/* Message Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 w-full">
                <span className="text-[10px] text-slate-500 font-mono">
                  {format(new Date(notif.created_at), 'dd MMM yyyy • h:mm a')}
                </span>
                {!notif.is_read && (
                  <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
                )}
              </div>
              <p className={`text-xs font-semibold ${notif.is_read ? 'text-slate-400' : 'text-slate-200'}`}>
                {notif.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0 self-center">
              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleDeleteNotification(notif.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Delete alert"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16 bg-slate-900/10 border border-indigo-950/20 rounded-3xl">
            <p className="text-sm text-slate-500 italic">
              {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" /> : 'No notifications found.'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
