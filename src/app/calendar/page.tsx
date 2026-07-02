'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  Tag,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Assessment, StudentSubject } from '@/lib/types';
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
  addDays,
  subDays,
} from 'date-fns';
import AddAssessmentModal from '@/components/dashboard/AddAssessmentModal';

export default function CalendarPage() {
  const { user, enrolledSubjects } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date trackers
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

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

  const fetchAssessments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*, subject:subjects(*)')
        .eq('user_id', user.id);

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

  // Navigate dates
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  // Generate calendar days interval
  const getDays = () => {
    if (viewMode === 'month') {
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

  const days = getDays();
  const selectedDateAssessments = assessments.filter((a) => isSameDay(new Date(a.due_date), selectedDate));

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
            Study Calendar
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Visualise assessments, trials, and practical tasks chronologically.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex bg-slate-900 border border-indigo-950/20 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg border border-violet-500/35 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* CALENDAR BODY INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Grid: Days layout (Span 3) */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-5 md:p-6 border-indigo-950/20 flex flex-col">
          {/* Month/Week Label & Nav Arrows */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-200 tracking-wide">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM yyyy')}`}
            </h2>

            <div className="flex border border-indigo-950/20 bg-slate-950 rounded-xl">
              <button
                onClick={handlePrev}
                className="p-2 hover:text-slate-100 text-slate-400 border-r border-indigo-950/10 cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3.5 py-1 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-200 border-r border-indigo-950/10 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:text-slate-100 text-slate-400 cursor-pointer"
                title="Next"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Days labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          {/* Grid Cells */}
          <div className={`grid grid-cols-7 gap-2 ${viewMode === 'month' ? 'min-h-[400px]' : 'min-h-[120px]'} flex-1`}>
            {days.map((day, idx) => {
              const dayAssessments = assessments.filter((a) => isSameDay(new Date(a.due_date), day));
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`p-2.5 rounded-2xl border flex flex-col justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-violet-600/10 border-violet-500 ring-2 ring-violet-500/20'
                      : isTodayDate
                      ? 'bg-slate-900 border-slate-700 text-violet-400'
                      : isCurrentMonth || viewMode === 'week'
                      ? 'bg-slate-950 border-indigo-950/15 text-slate-300 hover:border-slate-800'
                      : 'bg-slate-950/20 border-transparent text-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">{format(day, 'd')}</span>

                  {/* Render color tags for assessments */}
                  <div className="space-y-1 w-full mt-2 overflow-hidden">
                    {dayAssessments.slice(0, 2).map((ast) => {
                      const enroll = enrolledSubjects.find((s) => s.subject_id === ast.subject_id);
                      return (
                        <div
                          key={ast.id}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded border truncate w-full flex items-center gap-1 bg-slate-900/50 border-indigo-950/20 text-slate-300"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: enroll?.color_hex || '#94a3b8' }}
                          />
                          <span className="truncate">{ast.name}</span>
                        </div>
                      );
                    })}
                    {dayAssessments.length > 2 && (
                      <span className="text-[8px] text-slate-500 font-bold block text-right">
                        +{dayAssessments.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Drawer: selected date tasks list (Span 1) */}
        <div className="glass-card rounded-3xl p-5 md:p-6 border-indigo-950/20 flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-indigo-950/15">
              <CalendarDays className="h-5 w-5 text-violet-400" />
              <h3 className="text-sm font-bold text-slate-200">
                {format(selectedDate, 'dd MMMM yyyy')}
              </h3>
            </div>

            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-3">
              Due on this date
            </span>

            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {selectedDateAssessments.map((ast) => {
                const enroll = enrolledSubjects.find((s) => s.subject_id === ast.subject_id);
                const isCompleted = ast.status === 'Completed';
                return (
                  <div
                    key={ast.id}
                    className="p-3.5 bg-slate-950 border border-indigo-950/20 rounded-2xl flex items-start gap-3 relative group"
                  >
                    <span
                      className="w-1.5 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: enroll?.color_hex || '#94a3b8' }}
                    />
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className={`text-xs font-bold leading-tight truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {ast.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {ast.subject?.name}
                      </p>
                      
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 pt-1.5 border-t border-indigo-950/10">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {format(new Date(ast.due_date), 'h:mm a')}
                        </span>
                        <span>{ast.weighting}% Weight</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
                      <button
                        onClick={() => setEditingAssessment(ast)}
                        className="p-1 text-slate-500 hover:text-violet-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Edit Task"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(ast.id)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedDateAssessments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-500 italic">No task entries scheduled.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-900/60 border border-indigo-950/20 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Assessment</span>
          </button>
        </div>

      </div>

      {/* SCHEDULE MODAL */}
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
    </AppLayout>
  );
}
