'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { X, Loader2, Calendar } from 'lucide-react';
import { StudentSubject, Assessment } from '@/lib/types';

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: StudentSubject[];
  editingAssessment?: Assessment | null;
}

export default function AddAssessmentModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
  editingAssessment = null,
}: AddAssessmentModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState<'Assignment' | 'Exam' | 'Practical' | 'Presentation' | 'Other'>('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [weighting, setWeighting] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingAssessment) {
        setName(editingAssessment.name);
        setSubjectId(editingAssessment.subject_id);
        setType(editingAssessment.type);
        // Format ISO date (e.g. 2026-06-24T11:20:00.000Z) to YYYY-MM-DDThh:mm
        try {
          const dateVal = new Date(editingAssessment.due_date);
          const tzOffset = dateVal.getTimezoneOffset() * 60000;
          const localISOTime = new Date(dateVal.getTime() - tzOffset).toISOString().slice(0, 16);
          setDueDate(localISOTime);
        } catch (e) {
          setDueDate('');
        }
        setWeighting(String(editingAssessment.weighting));
        setNotes(editingAssessment.notes || '');
      } else {
        setName('');
        setSubjectId('');
        setType('Assignment');
        setDueDate('');
        setWeighting('');
        setNotes('');
      }
      setErrorMsg('');
    }
  }, [isOpen, editingAssessment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !subjectId || !type || !dueDate || !weighting) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const weightNum = parseFloat(weighting);
    if (isNaN(weightNum) || weightNum < 0 || weightNum > 100) {
      setErrorMsg('Weighting must be a percentage between 0 and 100.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const dueDateTime = new Date(dueDate).toISOString();
      const statusValue = new Date(dueDate) < new Date() ? 'Overdue' : 'Upcoming';

      if (editingAssessment) {
        // 1. Update existing assessment
        const { error } = await supabase
          .from('assessments')
          .update({
            subject_id: subjectId,
            name,
            type,
            due_date: dueDateTime,
            weighting: weightNum,
            notes: notes || null,
            status: statusValue,
          })
          .eq('id', editingAssessment.id);

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        // 2. Re-create notifications for updated assessment
        await supabase
          .from('notifications')
          .delete()
          .eq('related_assessment_id', editingAssessment.id);

        // A) 7 Days Before notification
        const sevenDaysBefore = new Date(dueDate);
        sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
        if (sevenDaysBefore > new Date()) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            message: `Assessment "${name}" is due in 7 days!`,
            type: 'assessment_due_7',
            related_assessment_id: editingAssessment.id,
            created_at: sevenDaysBefore.toISOString(),
          });
        }

        // B) 1 Day Before notification
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        if (oneDayBefore > new Date()) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            message: `Assessment "${name}" is due tomorrow!`,
            type: 'assessment_due_1',
            related_assessment_id: editingAssessment.id,
            created_at: oneDayBefore.toISOString(),
          });
        }
      } else {
        // 1. Insert assessment
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            subject_id: subjectId,
            name,
            type,
            due_date: dueDateTime,
            weighting: weightNum,
            notes: notes || null,
            status: statusValue,
          })
          .select()
          .single();

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        // 2. Schedule assessment notifications
        // A) 7 Days Before notification
        const sevenDaysBefore = new Date(dueDate);
        sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
        if (sevenDaysBefore > new Date()) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            message: `Assessment "${name}" is due in 7 days!`,
            type: 'assessment_due_7',
            related_assessment_id: data.id,
            created_at: sevenDaysBefore.toISOString(),
          });
        }

        // B) 1 Day Before notification
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        if (oneDayBefore > new Date()) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            message: `Assessment "${name}" is due tomorrow!`,
            type: 'assessment_due_1',
            related_assessment_id: data.id,
            created_at: oneDayBefore.toISOString(),
          });
        }
      }

      onSuccess();
      setName('');
      setSubjectId('');
      setDueDate('');
      setWeighting('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving assessment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-card rounded-3xl p-6 md:p-8 animate-fade-in shadow-2xl relative bg-slate-900 border-indigo-950/20">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-2">
          {editingAssessment ? 'Edit Assessment' : 'Add Assessment'}
        </h2>
        <p className="text-slate-400 text-xs mb-6">
          {editingAssessment 
            ? 'Update the assessment details, dates, or weighting percentage.' 
            : 'Record a new task, assignment, exam, or practical for your HSC units.'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assessment Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Assessment Name *</label>
            <input
              type="text"
              placeholder="e.g. Assessment Task 2: Trial Exam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 transition-all"
                required
              >
                <option value="" disabled>Choose Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.subject_id} className="bg-slate-950">
                    {sub.subject?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Type *</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 transition-all"
                required
              >
                <option value="Assignment" className="bg-slate-950">Assignment</option>
                <option value="Exam" className="bg-slate-950">Exam</option>
                <option value="Practical" className="bg-slate-950">Practical</option>
                <option value="Presentation" className="bg-slate-950">Presentation</option>
                <option value="Other" className="bg-slate-950">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Due Date & Time *</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 transition-all font-mono"
                required
              />
            </div>

            {/* Weighting */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Weighting (%) *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                placeholder="e.g. 25"
                value={weighting}
                onChange={(e) => setWeighting(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Notes (Optional)</label>
            <textarea
              placeholder="e.g. Topics covered: Chapter 3 Differentiation, Integration..."
              value={notes}
              rows={3}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-indigo-950/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-indigo-950/20 rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition-all border border-violet-500/35 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>{editingAssessment ? 'Save Changes' : 'Save Assessment'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
