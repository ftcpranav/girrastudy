'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Subject } from '@/lib/types';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ManageSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#f97316', // Orange
];

export default function ManageSubjectsModal({ isOpen, onClose }: ManageSubjectsModalProps) {
  const { user, enrolledSubjects, refreshProfile } = useAuth();

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#10b981');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Fetch complete subject catalogue from DB
  useEffect(() => {
    if (!isOpen) return;

    const fetchCatalogue = async () => {
      const { data, error } = await supabase.from('subjects').select('*').order('name');
      if (!error && data) {
        setAllSubjects(data);
      }
    };

    fetchCatalogue();
    setErrorMsg('');
    setSuccessMsg('');
  }, [isOpen]);

  if (!isOpen) return null;

  // Subjects that the user is NOT enrolled in yet
  const availableSubjects = allSubjects.filter(
    (sub) => !enrolledSubjects.some((es) => es.subject_id === sub.id)
  );

  // Handle Add Subject
  const handleAddSubject = async () => {
    if (!user || !selectedSubjectId) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Ensure user profile exists in public.users
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email || 'student@girrastudy.com',
        full_name: user.user_metadata?.full_name || 'Student',
        role: 'student',
      });

      const { error } = await supabase.from('student_subjects').insert({
        user_id: user.id,
        subject_id: selectedSubjectId,
        color_hex: selectedColor,
      });

      if (error) {
        throw error;
      }

      await refreshProfile(user.id);
      setSelectedSubjectId('');
      setSuccessMsg('Subject added successfully!');
    } catch (err: any) {
      console.error('Error adding subject:', err);
      setErrorMsg(err.message || 'Failed to add subject.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Remove Subject
  const handleRemoveSubject = async (studentSubjectId: string, subjectName: string) => {
    if (!user) return;
    if (enrolledSubjects.length <= 2) {
      setErrorMsg('You must remain enrolled in at least 2 HSC subjects.');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${subjectName}?`)) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('student_subjects')
        .delete()
        .eq('id', studentSubjectId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      await refreshProfile(user.id);
      setSuccessMsg(`${subjectName} removed.`);
    } catch (err: any) {
      console.error('Error removing subject:', err);
      setErrorMsg(err.message || 'Failed to remove subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-card rounded-3xl p-6 border-emerald-500/20 shadow-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-emerald-500/15">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-wide">Manage Enrolled HSC Subjects</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Add or remove subjects in your study portal.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Currently Enrolled Subjects List */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Enrolled Subjects ({enrolledSubjects.length})</span>
            <span className="text-[10px] font-mono">Min 2 Required</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {enrolledSubjects.map((sub) => (
              <div
                key={sub.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: sub.color_hex || '#10b981' }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {sub.subject?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {sub.subject?.code}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRemoveSubject(sub.id, sub.subject?.name || 'Subject')}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
                  title="Remove subject"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Subject Section */}
        <div className="pt-4 border-t border-emerald-500/15 space-y-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Add New Subject
          </label>

          <div className="space-y-3">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Select Subject from Catalogue --</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            {/* Color selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Subject Color:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                      selectedColor === color
                        ? 'scale-125 border-slate-900 dark:border-white shadow-md'
                        : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Add Action Button */}
            <button
              type="button"
              disabled={!selectedSubjectId || loading}
              onClick={handleAddSubject}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Enrol in Selected Subject</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
