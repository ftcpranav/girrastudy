'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  FileText,
  Plus,
  BookOpen,
  ChevronLeft,
  Clock,
  Pin,
  Trash2,
  ExternalLink,
  Award,
  Circle,
  CheckCircle2,
  PlayCircle,
  X,
} from 'lucide-react';
import { Assessment, Note, Subject, Mark, StudentSubject } from '@/lib/types';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import AddAssessmentModal from '@/components/dashboard/AddAssessmentModal';
import AddNoteModal from '@/components/dashboard/AddNoteModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SubjectPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, enrolledSubjects } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'markbook' | 'notes'>('overview');

  // Modals
  const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  // States
  const [subject, setSubject] = useState<Subject | null>(null);
  const [enrollment, setEnrollment] = useState<StudentSubject | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter notes state
  const [noteTopicFilter, setNoteTopicFilter] = useState('');

  // Fetch all subject data
  const fetchSubjectData = async () => {
    if (!user || !id) return;
    try {
      setLoading(true);

      // 1. Fetch Subject Info
      const { data: subData } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (subData) setSubject(subData);

      // 2. Fetch Enrollment Info (for color)
      const enroll = enrolledSubjects.find((s) => s.subject_id === id);
      if (enroll) setEnrollment(enroll);

      // 3. Fetch Assessments
      const { data: asts } = await supabase
        .from('assessments')
        .select('*, mark:marks(*)')
        .eq('user_id', user.id)
        .eq('subject_id', id)
        .order('due_date', { ascending: true });
      if (asts) setAssessments(asts);

      // 4. Fetch Marks
      const { data: mrks } = await supabase
        .from('marks')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_id', id)
        .order('created_at', { ascending: true });
      if (mrks) setMarks(mrks);

      // 5. Fetch Notes
      const { data: nts } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_id', id)
        .order('created_at', { ascending: false });
      if (nts) setNotes(nts);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectData();
  }, [user, id, enrolledSubjects]);

  // Hook query parameters for tab switcher
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'assessments', 'markbook', 'notes'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Toggle completion
  const handleToggleComplete = async (ast: Assessment) => {
    const newStatus = ast.status === 'Completed' ? (new Date(ast.due_date) < new Date() ? 'Overdue' : 'Upcoming') : 'Completed';
    const completedAt = newStatus === 'Completed' ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('assessments')
        .update({ status: newStatus, completed_at: completedAt })
        .eq('id', ast.id);

      if (!error) {
        fetchSubjectData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle pin note
  const handleTogglePinNote = async (note: Note) => {
    try {
      await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', note.id);
      fetchSubjectData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await supabase.from('notes').delete().eq('id', noteId);
      fetchSubjectData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Weighted Average for this subject
  const calculateAverage = () => {
    let weightedSum = 0;
    let totalWeight = 0;

    marks.forEach((m) => {
      weightedSum += Number(m.mark_achieved) * Number(m.weighting);
      totalWeight += Number(m.weighting);
    });

    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : null;
  };

  // Color thresholds
  const getThresholdColor = (avgStr: string | null) => {
    if (!avgStr) return { text: 'text-slate-500', bg: 'bg-slate-800', border: 'border-slate-800' };
    const avg = parseFloat(avgStr);
    if (avg < 50) return { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/20' };
    if (avg < 65) return { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/20' };
    if (avg < 75) return { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/20' };
    if (avg < 85) return { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/20' };
    return { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500/20' };
  };

  // Calculate countdown to next assessment
  const getNextAssessmentCountdown = () => {
    const upcoming = assessments
      .filter((a) => a.status !== 'Completed' && new Date(a.due_date) > new Date())
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    if (upcoming.length === 0) return 'No upcoming tasks';

    const next = new Date(upcoming[0].due_date);
    const now = new Date();
    const days = differenceInDays(next, now);
    const hours = differenceInHours(next, now) % 24;

    if (days === 0 && hours === 0) return 'Due within the hour!';
    if (days === 0) return `Due in ${hours} hours`;
    return `${days}d ${hours}h left (${upcoming[0].name})`;
  };

  const avgScore = calculateAverage();
  const themeColors = getThresholdColor(avgScore);
  const nextCountdown = getNextAssessmentCountdown();

  // Filter notes by topic
  const filteredNotes = noteTopicFilter
    ? notes.filter((n) => n.topic.toLowerCase().includes(noteTopicFilter.toLowerCase()))
    : notes;

  // Render icons for notes
  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'google_doc': return <FileText className="h-4.5 w-4.5 text-blue-400" />;
      case 'google_drive': return <BookOpen className="h-4.5 w-4.5 text-blue-300" />;
      case 'youtube': return <PlayCircle className="h-4.5 w-4.5 text-red-400" />;
      default: return <FileText className="h-4.5 w-4.5 text-emerald-400" />;
    }
  };

  return (
    <AppLayout>
      {/* Return Navigation */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Subject Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span
            className="w-4.5 h-4.5 rounded-full shrink-0"
            style={{ backgroundColor: enrollment?.color_hex || '#8b5cf6' }}
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
              {subject?.name || 'HSC Subject'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Course Code: <span className="font-mono font-bold text-slate-300">{subject?.code}</span>
            </p>
          </div>
        </div>

        {/* Action launchers */}
        <div className="flex items-center gap-2">
          {activeTab === 'assessments' && (
            <button
              onClick={() => setIsAddAssessmentOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Assessment</span>
            </button>
          )}
          {activeTab === 'notes' && (
            <button
              onClick={() => setIsAddNoteOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Note</span>
            </button>
          )}
        </div>
      </div>

      {/* RADIX TABS STRIP */}
      <div className="flex border-b border-indigo-950/20 mb-8 overflow-x-auto select-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'assessments', label: 'Assessments' },
          { id: 'markbook', label: 'Markbook' },
          { id: 'notes', label: 'Study Notes' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-semibold tracking-wider relative transition-colors cursor-pointer shrink-0 ${
                isSelected ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {isSelected && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Average visual */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Weighted Average</span>
              <span className={`text-3xl font-black font-mono mt-2 block ${themeColors.text}`}>
                {avgScore ? `${avgScore}%` : '--'}
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full ${themeColors.bg}`}
                style={{ width: avgScore ? `${avgScore}%` : '0%' }}
              />
            </div>
          </div>

          {/* Next assessment countdown */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Next Task Deadline</span>
              <span className="text-xs font-bold text-slate-200 mt-3 block leading-relaxed">
                {nextCountdown}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-4">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Due Date tracking</span>
            </div>
          </div>

          {/* Total assessments count */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Assessments</span>
              <span className="text-3xl font-black text-slate-300 mt-2 block font-mono">
                {assessments.length}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-4 font-semibold">
              {assessments.filter((a) => a.status === 'Completed').length} Completed tasks
            </span>
          </div>

          {/* Total notes count */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Private Notes Count</span>
              <span className="text-3xl font-black text-slate-300 mt-2 block font-mono">
                {notes.length}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-4 font-semibold">
              {notes.filter((n) => n.is_pinned).length} Pinned links
            </span>
          </div>
        </div>
      )}

      {/* 2. ASSESSMENTS TAB */}
      {activeTab === 'assessments' && (
        <div className="glass-card rounded-2xl overflow-hidden border-indigo-950/20 animate-fade-in shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-indigo-950/25">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">Done</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Assessment Name</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Due Date</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Weighting</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-950/15">
                {assessments.map((ast) => {
                  const isCompleted = ast.status === 'Completed';
                  return (
                    <tr key={ast.id} className="hover:bg-slate-900/10 transition-colors text-slate-300">
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleComplete(ast)}
                          className="p-1 rounded-full text-slate-500 hover:text-violet-400 hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/10" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-xs font-bold">
                        <span className={isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {ast.name}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-950 border border-indigo-950/20 px-2 py-0.5 rounded-md">
                          {ast.type}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono">
                        {format(new Date(ast.due_date), 'dd MMM yyyy')}
                      </td>
                      <td className="p-4 text-xs font-semibold font-mono text-slate-500">
                        {ast.weighting}%
                      </td>
                      <td className="p-4 text-xs font-mono font-bold">
                        {ast.mark ? (
                          <span className="text-violet-400">{ast.mark.mark_achieved}%</span>
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {assessments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-slate-500 italic">
                      No assessments recorded for this subject.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MARKBOOK TAB */}
      {activeTab === 'markbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Trend graph */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-5 border-indigo-950/20">
            <h3 className="text-sm font-bold text-slate-200 mb-6">Subject Mark Progress</h3>
            
            <div className="h-[260px] w-full">
              {marks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marks.map((m) => ({
                    name: format(new Date(m.created_at), 'dd MMM'),
                    score: Number(m.mark_achieved),
                  }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#090d16',
                        borderColor: 'rgba(99, 102, 241, 0.2)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#f8fafc',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', stroke: '#c084fc', strokeWidth: 1 }}
                      name="Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                  No logged scores to plot progression graph.
                </div>
              )}
            </div>
          </div>

          {/* Localized ledger */}
          <div className="glass-card rounded-3xl p-5 border-indigo-950/20">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Scores History</h3>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {marks.map((m) => (
                <div key={m.id} className="p-3 bg-slate-950 border border-indigo-950/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">LOGGED MARK</span>
                    <span className="text-xs font-bold text-slate-300">Weighting: {m.weighting}%</span>
                  </div>
                  <span className="text-sm font-black text-violet-400 font-mono">
                    {m.mark_achieved}%
                  </span>
                </div>
              ))}
              {marks.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-12">No scores logged.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. STUDY NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-6 animate-fade-in">
          {/* Tag filtering bar */}
          <div className="glass-card rounded-2xl p-4 flex gap-4 border-indigo-950/20">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Filter notes by topic tag..."
                value={noteTopicFilter}
                onChange={(e) => setNoteTopicFilter(e.target.value)}
                className="w-full pl-4 pr-9 py-1.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              {noteTopicFilter && (
                <button onClick={() => setNoteTopicFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div key={note.id} className="glass-card border border-indigo-950/20 p-5 rounded-2xl flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between mb-3 w-full">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-950 border border-indigo-950/20 rounded-lg shrink-0">
                        {getNoteIcon(note.note_type)}
                      </div>
                      <span className="text-[10px] text-violet-400 font-bold">#{note.topic}</span>
                    </div>
                    <button
                      onClick={() => handleTogglePinNote(note)}
                      className={`p-1.5 rounded-lg border border-transparent transition-all cursor-pointer ${
                        note.is_pinned ? 'text-violet-400' : 'text-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <Pin className={`h-3.5 w-3.5 ${note.is_pinned ? 'rotate-45 fill-violet-400' : ''}`} />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 mb-3">{note.title}</h4>

                  {note.note_type === 'typed' && note.content_text && (
                    <div
                      className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed bg-slate-950/15 p-2 rounded"
                      dangerouslySetInnerHTML={{ __html: note.content_text }}
                    />
                  )}

                  {note.note_type === 'textbook' && (
                    <div className="text-[10px] bg-slate-950/15 p-2 rounded text-slate-400 space-y-0.5">
                      <p><strong>Title:</strong> {note.textbook_title}</p>
                      <p><strong>Ch:</strong> {note.textbook_chapter || 'N/A'}</p>
                      <p><strong>Page:</strong> {note.textbook_page || 'N/A'}</p>
                    </div>
                  )}

                  {note.note_type !== 'typed' && note.note_type !== 'textbook' && note.url && (
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] flex items-center justify-between text-violet-400 bg-violet-600/5 px-2 py-1 rounded truncate border border-violet-500/10"
                    >
                      <span className="truncate">{note.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-indigo-950/10 text-[9px] text-slate-500 w-full">
                  <span>Logged {format(new Date(note.created_at), 'dd MMM yyyy')}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-slate-900/10 border border-indigo-950/20 rounded-2xl">
                <p className="text-xs text-slate-500 italic">No study notes found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <AddAssessmentModal
        isOpen={isAddAssessmentOpen}
        onClose={() => setIsAddAssessmentOpen(false)}
        onSuccess={fetchSubjectData}
        subjects={enrolledSubjects}
      />

      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onSuccess={fetchSubjectData}
        subjects={enrolledSubjects}
      />
    </AppLayout>
  );
}
