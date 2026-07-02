'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  List,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingUp,
  Tag,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import AddAssessmentModal from '@/components/dashboard/AddAssessmentModal';
import { Assessment, Subject, Mark } from '@/lib/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
} from 'date-fns';

export default function AssessmentsPage() {
  const { user, enrolledSubjects } = useAuth();

  // Dialog controllers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [loggingMarkAssessment, setLoggingMarkAssessment] = useState<Assessment | null>(null);

  // States
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');

  // Filters
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  // Input states for Log Mark inline dialog
  const [achievedMark, setAchievedMark] = useState('');

  // Fetch assessments
  const fetchAssessments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*, subject:subjects(*), mark:marks(*)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (!error && data) {
        setAssessments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [user]);

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
        // If completed, check if we should prompt to enter a mark
        if (newStatus === 'Completed') {
          setLoggingMarkAssessment(ast);
        } else {
          // If uncompleted, delete the associated mark
          await supabase.from('marks').delete().eq('assessment_id', ast.id);
        }
        fetchAssessments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add/Update mark achieved
  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !loggingMarkAssessment) return;

    const markNum = parseFloat(achievedMark);
    if (isNaN(markNum) || markNum < 0 || markNum > 100) {
      alert('Please enter a percentage between 0 and 100.');
      return;
    }

    try {
      // Upsert mark
      const { error } = await supabase.from('marks').upsert({
        user_id: user.id,
        assessment_id: loggingMarkAssessment.id,
        subject_id: loggingMarkAssessment.subject_id,
        mark_achieved: markNum,
        weighting: loggingMarkAssessment.weighting,
      });

      if (!error) {
        setAchievedMark('');
        setLoggingMarkAssessment(null);
        fetchAssessments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Assessment
  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This will also remove any associated marks.')) return;
    try {
      const { error } = await supabase.from('assessments').delete().eq('id', id);
      if (!error) {
        fetchAssessments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Assessments
  const filteredAssessments = assessments.filter((ast) => {
    const matchesSearch = ast.name.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = filterSubject ? ast.subject_id === filterSubject : true;
    const matchesType = filterType ? ast.type === filterType : true;
    const matchesStatus = filterStatus ? ast.status === filterStatus : true;
    return matchesSearch && matchesSubject && matchesType && matchesStatus;
  });

  // Calendar dates generation
  const getCalendarDays = () => {
    if (calendarMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  };

  const calendarDays = getCalendarDays();

  // Get assessments due on a specific day
  const getAssessmentsForDay = (day: Date) => {
    return assessments.filter((ast) => isSameDay(new Date(ast.due_date), day));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Overdue': return 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse';
      case 'Due Today': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <AppLayout>
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
            Assessment Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track weightings, log completed scores, and monitor upcoming assessment tasks.
          </p>
        </div>

        {/* View Toggle & Add Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-indigo-950/20 rounded-xl p-1 shrink-0 select-none">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg border border-violet-500/35 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="glass-card rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-indigo-950/20">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3.5 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="" className="bg-slate-950">All Subjects</option>
          {enrolledSubjects.map((sub) => (
            <option key={sub.id} value={sub.subject_id} className="bg-slate-950">
              {sub.subject?.name}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3.5 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="" className="bg-slate-950">All Formats</option>
          <option value="Assignment" className="bg-slate-950">Assignment</option>
          <option value="Exam" className="bg-slate-950">Exam</option>
          <option value="Practical" className="bg-slate-950">Practical</option>
          <option value="Presentation" className="bg-slate-950">Presentation</option>
          <option value="Other" className="bg-slate-950">Other</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3.5 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="" className="bg-slate-950">All Statuses</option>
          <option value="Upcoming" className="bg-slate-950">Upcoming</option>
          <option value="Completed" className="bg-slate-950">Completed</option>
          <option value="Overdue" className="bg-slate-950">Overdue</option>
        </select>
      </div>

      {/* DYNAMIC LIST VIEW CONTAINER */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden border-indigo-950/20 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-indigo-950/25">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">Done</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Assessment Name</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Format</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Due Date</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Weight</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Mark</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/15">
                  {filteredAssessments.map((ast) => {
                    const isCompleted = ast.status === 'Completed';
                    const subEnroll = enrolledSubjects.find((s) => s.subject_id === ast.subject_id);
                    return (
                      <tr key={ast.id} className="hover:bg-slate-900/10 transition-colors text-slate-300">
                        {/* Done Toggler */}
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

                        {/* Title */}
                        <td className="p-4">
                          <div>
                            <span className={`text-xs font-bold leading-tight ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {ast.name}
                            </span>
                            {ast.notes && (
                              <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                                {ast.notes}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: subEnroll?.color_hex || '#475569' }}
                            />
                            <span className="text-xs font-medium truncate max-w-[120px]">
                              {ast.subject?.name}
                            </span>
                          </div>
                        </td>

                        {/* Format */}
                        <td className="p-4">
                          <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-950 px-2 py-0.5 border border-indigo-950/20 rounded-md">
                            {ast.type}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="p-4 text-xs font-mono">
                          <div className="flex flex-col leading-tight">
                            <span className="text-slate-300">{format(new Date(ast.due_date), 'dd MMM yyyy')}</span>
                            <span className="text-[10px] text-slate-500">{format(new Date(ast.due_date), 'h:mm a')}</span>
                          </div>
                        </td>

                        {/* Weight */}
                        <td className="p-4 text-xs font-semibold text-slate-400 font-mono">
                          {ast.weighting}%
                        </td>

                        {/* Mark Log */}
                        <td className="p-4 text-xs font-bold font-mono">
                          {ast.mark ? (
                            <span className="text-violet-400">{ast.mark.mark_achieved}%</span>
                          ) : isCompleted ? (
                            <button
                              onClick={() => setLoggingMarkAssessment(ast)}
                              className="text-[10px] flex items-center gap-1 text-violet-400 hover:text-violet-300 bg-violet-600/10 px-2 py-1 rounded border border-violet-500/20 hover:bg-violet-600/20 cursor-pointer"
                            >
                              <TrendingUp className="h-3 w-3" />
                              <span>Log Mark</span>
                            </button>
                          ) : (
                            <span className="text-slate-600">--</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingAssessment(ast)}
                              className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                              title="Edit Task"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssessment(ast.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAssessments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs text-slate-500 italic">
                        {loading ? 'Fetching records...' : 'No assessments found matching the search criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* CALENDAR VIEW GRID */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Day Picker (Span 2) */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 border-indigo-950/20">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <div className="flex items-center gap-2 select-none">
                <button
                  onClick={() => setCalendarMode(calendarMode === 'month' ? 'week' : 'month')}
                  className="px-2.5 py-1 bg-slate-950 text-[10px] font-semibold text-slate-400 rounded-lg hover:text-slate-200 border border-indigo-950/25"
                >
                  {calendarMode === 'month' ? 'Switch to Week' : 'Switch to Month'}
                </button>
                <div className="flex border border-indigo-950/20 bg-slate-950 rounded-lg">
                  <button
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="p-1 hover:text-slate-100 text-slate-400 border-r border-indigo-950/10 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="p-1 hover:text-slate-100 text-slate-400 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-500 mb-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                const dayAssessments = getAssessmentsForDay(day);
                const isDaySelected = isSameDay(day, selectedCalendarDate);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCalendarDate(day)}
                    className={`min-h-[64px] p-1.5 rounded-xl border flex flex-col items-start justify-between text-left transition-all ${
                      isDaySelected
                        ? 'bg-violet-600/10 border-violet-500'
                        : isToday(day)
                        ? 'bg-slate-900 border-slate-700 text-violet-400'
                        : isCurrentMonth
                        ? 'bg-slate-950 border-indigo-950/15 text-slate-300 hover:border-slate-800'
                        : 'bg-slate-950/20 border-transparent text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono leading-none">{format(day, 'd')}</span>
                    
                    {/* Render indicator dots for assessments */}
                    <div className="flex flex-wrap gap-1 w-full mt-1.5">
                      {dayAssessments.slice(0, 3).map((ast) => {
                        const enroll = enrolledSubjects.find((s) => s.subject_id === ast.subject_id);
                        return (
                          <span
                            key={ast.id}
                            className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                            style={{ backgroundColor: enroll?.color_hex || '#94a3b8' }}
                            title={ast.name}
                          />
                        );
                      })}
                      {dayAssessments.length > 3 && (
                        <span className="text-[8px] leading-none font-bold text-slate-500">
                          +{dayAssessments.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Assessments due on selected day */}
          <div className="glass-card rounded-2xl p-5 border-indigo-950/20 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-1">
                Deadlines for {format(selectedCalendarDate, 'dd MMMM yyyy')}
              </h3>
              <p className="text-[11px] text-slate-500 pb-3 border-b border-indigo-950/15 mb-4">
                Total assessments due: {getAssessmentsForDay(selectedCalendarDate).length}
              </p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {getAssessmentsForDay(selectedCalendarDate).map((ast) => {
                  const enroll = enrolledSubjects.find((s) => s.subject_id === ast.subject_id);
                  const isCompleted = ast.status === 'Completed';
                  return (
                    <div
                      key={ast.id}
                      className="p-3 bg-slate-950 border border-indigo-950/20 rounded-xl flex items-start gap-3"
                    >
                      <span
                        className="w-1.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: enroll?.color_hex || '#94a3b8' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold leading-tight truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {ast.name}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                          <span>Weighting: {ast.weighting}%</span>
                          <span className="font-semibold">{ast.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getAssessmentsForDay(selectedCalendarDate).length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-8">
                    No assessments due on this day.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="w-full mt-6 py-2 bg-slate-900 hover:bg-slate-900/60 border border-indigo-950/20 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Assessment</span>
            </button>
          </div>

        </div>
      )}

      {/* MODALS */}
      <AddAssessmentModal
        isOpen={isAddOpen || !!editingAssessment}
        onClose={() => {
          setIsAddOpen(false);
          setEditingAssessment(null);
        }}
        onSuccess={fetchAssessments}
        subjects={enrolledSubjects}
        editingAssessment={editingAssessment}
      />

      {/* Log Mark Inline Modal */}
      {loggingMarkAssessment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 bg-slate-900 border-indigo-950/20 relative animate-fade-in shadow-2xl">
            <button
              onClick={() => setLoggingMarkAssessment(null)}
              className="absolute right-4 top-4 p-1 text-slate-500 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Log Assessment Mark</h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              Log the achieved score for <strong className="text-slate-300">"{loggingMarkAssessment.name}"</strong> to calculate your weighted subject average instantly.
            </p>
            <form onSubmit={handleSaveMark} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mark Achieved (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  placeholder="e.g. 85"
                  value={achievedMark}
                  onChange={(e) => setAchievedMark(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setLoggingMarkAssessment(null)}
                  className="px-3 py-1.5 bg-slate-950 border border-indigo-950/20 text-slate-400 hover:text-slate-200 text-xs rounded-xl cursor-pointer"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl border border-violet-500/30 cursor-pointer"
                >
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
