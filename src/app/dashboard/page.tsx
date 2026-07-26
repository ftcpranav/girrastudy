'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  FileText,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  ExternalLink,
  BookOpen,
  PlayCircle,
  Calculator,
  Timer,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddAssessmentModal from '@/components/dashboard/AddAssessmentModal';
import AddNoteModal from '@/components/dashboard/AddNoteModal';
import { Assessment, Note, StudentSubject, Mark } from '@/lib/types';
import { format, isToday, isBefore, addDays } from 'date-fns';

export default function Dashboard() {
  const { user, profile, enrolledSubjects } = useAuth();
  const router = useRouter();

  // Modals state
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // Data state
  const [loadingData, setLoadingData] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoadingData(true);

      // 1. Fetch assessments
      const { data: asts, error: astError } = await supabase
        .from('assessments')
        .select('*, subject:subjects(*)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (!astError && asts) {
        setAssessments(asts);
      }

      // 2. Fetch marks
      const { data: mrks, error: mrkError } = await supabase
        .from('marks')
        .select('*')
        .eq('user_id', user.id);

      if (!mrkError && mrks) {
        setMarks(mrks);
      }

      // 3. Fetch recent notes
      const { data: nts, error: ntError } = await supabase
        .from('notes')
        .select('*, subject:subjects(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!ntError && nts) {
        setRecentNotes(nts);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Check assessment status helper
  const getAssessmentStatus = (dueDateStr: string, completedAtStr?: string | null) => {
    if (completedAtStr) return { label: 'Completed', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
    const dueDate = new Date(dueDateStr);
    const now = new Date();

    if (isBefore(dueDate, now)) {
      return { label: 'Overdue', color: 'bg-red-500/15 text-red-400 border-red-500/20' };
    }
    if (isToday(dueDate)) {
      return { label: 'Due Today', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
    }
    if (isBefore(dueDate, addDays(now, 7))) {
      return { label: 'Due This Week', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' };
    }
    return { label: 'Upcoming', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' };
  };

  // Mark averages calculations
  const calculateSubjectMetrics = (subjId: string) => {
    // Enrolled assessments count
    const subAssessments = assessments.filter((a) => a.subject_id === subjId);
    
    // Weighted Average Calculation
    const subMarks = marks.filter((m) => m.subject_id === subjId);
    let weightedMarkSum = 0;
    let totalWeight = 0;

    subMarks.forEach((m) => {
      weightedMarkSum += Number(m.mark_achieved) * Number(m.weighting);
      totalWeight += Number(m.weighting);
    });

    const average = totalWeight > 0 ? (weightedMarkSum / totalWeight).toFixed(1) : null;

    // Next Due Assessment
    const upcoming = subAssessments
      .filter((a) => a.status !== 'Completed' && new Date(a.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const nextDueDate = upcoming.length > 0 ? format(new Date(upcoming[0].due_date), 'dd MMM') : '--';

    return {
      average,
      assessmentCount: subAssessments.length,
      nextDueDate,
    };
  };

  // Color progress codes based on mark ranges
  const getProgressColor = (avg: number) => {
    if (avg < 50) return 'bg-red-500';
    if (avg < 65) return 'bg-orange-500';
    if (avg < 75) return 'bg-yellow-500';
    if (avg < 85) return 'bg-green-500';
    return 'bg-purple-500';
  };

  // Overall Weighted average across all subjects
  const calculateOverallAverage = () => {
    let weightedMarkSum = 0;
    let totalWeight = 0;

    marks.forEach((m) => {
      weightedMarkSum += Number(m.mark_achieved) * Number(m.weighting);
      totalWeight += Number(m.weighting);
    });

    return totalWeight > 0 ? (weightedMarkSum / totalWeight).toFixed(1) : '--';
  };

  // Get note icons based on format
  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'google_doc':
      case 'google_drive':
        return <FileText className="h-4.5 w-4.5 text-blue-400" />;
      case 'youtube':
        return <PlayCircle className="h-4.5 w-4.5 text-red-400" />;
      case 'website':
        return <ExternalLink className="h-4.5 w-4.5 text-cyan-400" />;
      case 'textbook':
        return <BookOpen className="h-4.5 w-4.5 text-amber-400" />;
      default:
        return <FileText className="h-4.5 w-4.5 text-emerald-400" />;
    }
  };

  return (
    <AppLayout>
      {/* Welcome & Dashboard Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
            Welcome, {profile?.full_name || 'HSC Student'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            NSW {profile?.year_group || 'HSC'} Study Portal • Target Focus Areas:{' '}
            {profile?.preferences_json?.study_focus?.map((f: string) => (
              <span
                key={f}
                className="inline-block bg-indigo-950/40 border border-indigo-500/10 text-[10px] uppercase font-bold text-violet-400 px-2 py-0.5 rounded-full mr-1.5"
              >
                {f}
              </span>
            )) || <span className="text-slate-500 italic">None selected</span>}
          </p>
        </div>

        {/* Global Stats Box */}
        <div className="flex items-center gap-4 bg-slate-900/30 border border-indigo-950/20 px-6 py-3 rounded-2xl backdrop-blur-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Average</span>
            <span className="text-2xl font-black text-violet-400 font-mono">
              {calculateOverallAverage()}%
            </span>
          </div>
          <div className="h-8 w-px bg-indigo-950/35" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Tasks Completed</span>
            <span className="text-2xl font-black text-slate-200 font-mono">
              {assessments.filter((a) => a.status === 'Completed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
        <button
          onClick={() => setIsAssessmentOpen(true)}
          className="flex items-center gap-3 p-3.5 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-300 font-semibold rounded-2xl transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 group-hover:scale-110 transition-transform">
            <Plus className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-xs block font-bold">Add Task</span>
            <span className="text-[10px] text-violet-400/80 font-normal">New deadline</span>
          </div>
        </button>

        <button
          onClick={() => router.push('/atar-calculator')}
          className="flex items-center gap-3 p-3.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-300 font-semibold rounded-2xl transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition-transform">
            <Calculator className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-xs block font-bold">ATAR Estimator</span>
            <span className="text-[10px] text-indigo-400/80 font-normal">Scaling graphs</span>
          </div>
        </button>

        <button
          onClick={() => router.push('/focus-timer')}
          className="flex items-center gap-3 p-3.5 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/20 hover:border-pink-500/30 text-pink-300 font-semibold rounded-2xl transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-pink-600/20 text-pink-400 group-hover:scale-110 transition-transform">
            <Timer className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-xs block font-bold">Focus Timer</span>
            <span className="text-[10px] text-pink-400/80 font-normal">Soundscapes</span>
          </div>
        </button>

        <button
          onClick={() => router.push('/resources')}
          className="flex items-center gap-3 p-3.5 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-300 font-semibold rounded-2xl transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 group-hover:scale-110 transition-transform">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-xs block font-bold">Vault & Quiz</span>
            <span className="text-[10px] text-amber-400/80 font-normal">Past papers</span>
          </div>
        </button>

        <button
          onClick={() => setIsNoteOpen(true)}
          className="flex items-center gap-3 p-3.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-300 font-semibold rounded-2xl transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition-transform">
            <Plus className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-xs block font-bold">Add Note</span>
            <span className="text-[10px] text-emerald-400/80 font-normal">Textbook/links</span>
          </div>
        </button>

        <button
          onClick={() => router.push('/markbook')}
          className="flex items-center gap-3 p-3.5 bg-slate-900/40 hover:bg-slate-900/60 border border-indigo-950/20 text-slate-300 font-semibold rounded-2xl transition-all cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-xs block font-bold">Markbook</span>
            <span className="text-[10px] text-slate-500 font-normal">Weighted logs</span>
          </div>
        </button>
      </div>

      {/* Main Grid: Subjects Overview & Left Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Span 2): Subject Overview Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200 tracking-wide border-b border-indigo-950/20 pb-2 flex items-center justify-between">
              <span>HSC Subject Cards</span>
              <span className="text-[10px] text-slate-500 bg-slate-900/40 border border-indigo-950/15 px-2 py-0.5 rounded-full">
                Units of Study
              </span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {enrolledSubjects.map((sub) => {
                const metrics = calculateSubjectMetrics(sub.subject_id);
                return (
                  <button
                    key={sub.id}
                    onClick={() => router.push(`/subjects/${sub.subject_id}`)}
                    className="w-full glass-card hover:bg-slate-900/20 border border-indigo-950/20 p-5 rounded-2xl flex flex-col text-left transition-all hover:scale-[1.01] hover:border-violet-500/20 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3 w-full">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color_hex }}
                        />
                        <span className="font-bold text-slate-200 truncate text-sm">
                          {sub.subject?.name}
                        </span>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md font-mono shrink-0">
                        {sub.subject?.code}
                      </span>
                    </div>

                    {/* Progress Bar & Average */}
                    <div className="mt-2 w-full">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 font-semibold">Weighted Avg</span>
                        <span className="font-bold text-slate-300 font-mono">
                          {metrics.average ? `${metrics.average}%` : '--'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            metrics.average ? getProgressColor(parseFloat(metrics.average)) : 'bg-slate-800'
                          }`}
                          style={{ width: metrics.average ? `${metrics.average}%` : '0%' }}
                        />
                      </div>
                    </div>

                    {/* Sub-Metrics Row */}
                    <div className="grid grid-cols-2 gap-4 mt-5 w-full pt-3 border-t border-indigo-950/10">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Assessments</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {metrics.assessmentCount} recorded
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Next Deadline</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {metrics.nextDueDate}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {enrolledSubjects.length === 0 && (
                <div className="sm:col-span-2 text-center p-8 border border-dashed border-indigo-950/20 rounded-2xl bg-slate-900/10">
                  <p className="text-sm text-slate-500 italic">No enrolled subjects found.</p>
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="mt-3 text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                  >
                    Select Subjects
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Assessments & Recent Notes */}
        <div className="space-y-6">
          {/* Upcoming Assessments Panel */}
          <div>
            <h2 className="text-lg font-bold text-slate-200 tracking-wide border-b border-indigo-950/20 pb-2">
              Upcoming Assessments
            </h2>
            <div className="space-y-3 mt-4">
              {assessments
                .filter((a) => a.status !== 'Completed')
                .slice(0, 5)
                .map((ast) => {
                  const subEnroll = enrolledSubjects.find((s) => s.subject_id === ast.subject_id);
                  const status = getAssessmentStatus(ast.due_date, ast.completed_at);
                  return (
                    <div
                      key={ast.id}
                      className="p-4 bg-slate-900/20 border border-indigo-950/20 rounded-2xl flex items-start gap-3.5"
                    >
                      <span
                        className="w-1.5 h-12 rounded-full shrink-0"
                        style={{ backgroundColor: subEnroll?.color_hex || '#475569' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1 w-full">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                            {ast.subject?.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 font-mono ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{ast.name}</h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(ast.due_date), 'dd MMM yyyy')}
                          </span>
                          <span>Weighting: {ast.weighting}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {assessments.filter((a) => a.status !== 'Completed').length === 0 && (
                <div className="text-center p-6 bg-slate-900/10 border border-indigo-950/20 rounded-2xl">
                  <p className="text-xs text-slate-500 italic">No upcoming assessments.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notes Panel */}
          <div>
            <h2 className="text-lg font-bold text-slate-200 tracking-wide border-b border-indigo-950/20 pb-2">
              Recent Notes
            </h2>
            <div className="space-y-3 mt-4">
              {recentNotes.map((note) => {
                const subEnroll = enrolledSubjects.find((s) => s.subject_id === note.subject_id);
                return (
                  <button
                    key={note.id}
                    onClick={() => router.push(`/subjects/${note.subject_id}?tab=notes`)}
                    className="w-full text-left p-4 bg-slate-900/20 hover:bg-slate-900/40 border border-indigo-950/20 hover:border-violet-500/20 rounded-2xl flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-950/25 group-hover:scale-105 transition-transform shrink-0">
                        {getNoteIcon(note.note_type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{note.title}</h4>
                        <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                          {note.subject?.name} • #{note.topic}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
              {recentNotes.length === 0 && (
                <div className="text-center p-6 bg-slate-900/10 border border-indigo-950/20 rounded-2xl">
                  <p className="text-xs text-slate-500 italic">No notes created yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Assessment Modal component */}
      <AddAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onSuccess={() => {
          fetchData();
          router.refresh();
        }}
        subjects={enrolledSubjects}
      />

      {/* Add Note Modal component */}
      <AddNoteModal
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        onSuccess={() => {
          fetchData();
          router.refresh();
        }}
        subjects={enrolledSubjects}
      />
    </AppLayout>
  );
}
