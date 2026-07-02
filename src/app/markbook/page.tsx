'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Award,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { Mark, StudentSubject, Subject } from '@/lib/types';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function MarkbookPage() {
  const { user, enrolledSubjects } = useAuth();

  // Data states
  const [marks, setMarks] = useState<Mark[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [assessmentName, setAssessmentName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [achievedMark, setAchievedMark] = useState('');
  const [weighting, setWeighting] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Trend Filter State
  const [trendSubjectFilter, setTrendSubjectFilter] = useState<string>('all');

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch marks
      const { data: marksData, error: marksError } = await supabase
        .from('marks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!marksError && marksData) {
        setMarks(marksData);
      }

      // Fetch subjects list
      const { data: subsData } = await supabase.from('subjects').select('*');
      if (subsData) setSubjectsList(subsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedSubjectId || !achievedMark || !weighting) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const markNum = parseFloat(achievedMark);
    const weightNum = parseFloat(weighting);

    if (isNaN(markNum) || markNum < 0 || markNum > 100) {
      setErrorMsg('Mark achieved must be between 0 and 100.');
      return;
    }

    if (isNaN(weightNum) || weightNum < 0 || weightNum > 100) {
      setErrorMsg('Weighting must be between 0 and 100.');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');

    try {
      // Create a dummy assessment or log mark directly
      // In V1, we log direct marks for subjects
      const { error } = await supabase.from('marks').insert({
        user_id: user.id,
        subject_id: selectedSubjectId,
        mark_achieved: markNum,
        weighting: weightNum,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setAssessmentName('');
        setSelectedSubjectId('');
        setAchievedMark('');
        setWeighting('');
        setIsAddOpen(false);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMark = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark record?')) return;
    try {
      const { error } = await supabase.from('marks').delete().eq('id', id);
      if (!error) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Calculate weighted average per subject
  const getSubjectAverage = (subjId: string) => {
    const subMarks = marks.filter((m) => m.subject_id === subjId);
    let weightedSum = 0;
    let totalWeight = 0;

    subMarks.forEach((m) => {
      weightedSum += Number(m.mark_achieved) * Number(m.weighting);
      totalWeight += Number(m.weighting);
    });

    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : null;
  };

  // 2. Color code progress bar thresholds
  const getThresholdColor = (avgStr: string | null) => {
    if (!avgStr) return { text: 'text-slate-500', bg: 'bg-slate-800', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    const avg = parseFloat(avgStr);
    if (avg < 50) return { text: 'text-red-400', bg: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (avg < 65) return { text: 'text-orange-400', bg: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    if (avg < 75) return { text: 'text-yellow-400', bg: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if (avg < 85) return { text: 'text-green-400', bg: 'bg-green-500', badge: 'bg-green-500/10 text-green-400 border-green-500/20' };
    return { text: 'text-purple-400', bg: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
  };

  // 3. Calculate Overall Weighted Average
  const getOverallAverage = () => {
    let weightedSum = 0;
    let totalWeight = 0;

    marks.forEach((m) => {
      weightedSum += Number(m.mark_achieved) * Number(m.weighting);
      totalWeight += Number(m.weighting);
    });

    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : null;
  };

  // Prepare trend data for Recharts
  const getTrendChartData = () => {
    const filteredMarks = trendSubjectFilter === 'all'
      ? marks
      : marks.filter((m) => m.subject_id === trendSubjectFilter);

    // Format date and map
    return filteredMarks.map((m, idx) => {
      const subject = subjectsList.find((s) => s.id === m.subject_id);
      return {
        name: format(new Date(m.created_at), 'dd MMM'),
        score: Number(m.mark_achieved),
        subject: subject?.name || 'Subject',
        weight: `${m.weighting}%`,
      };
    });
  };

  const trendData = getTrendChartData();
  const overallAvg = getOverallAverage();
  const overallThemeColors = getThresholdColor(overallAvg);

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
            Marks & ATAR Calculator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Log raw marks to automatically evaluate weighted grades per HSC unit.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg border border-violet-500/35 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Log Assessment Score</span>
        </button>
      </div>

      {/* OVERALL STATISTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Weighted Score */}
        <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Weighted Average</span>
            <span className={`text-4xl font-black font-mono tracking-tight ${overallThemeColors.text}`}>
              {overallAvg ? `${overallAvg}%` : '--'}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${overallThemeColors.badge}`}>
                {overallAvg ? (parseFloat(overallAvg) >= 85 ? 'HSC Band 6 Potential' : parseFloat(overallAvg) >= 75 ? 'HSC Band 5' : 'HSC Passing') : 'No Marks Logged'}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/10 z-10">
            <Award className="h-8 w-8" />
          </div>
          {/* Subtle decor blur */}
          <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-36 h-36 rounded-full bg-violet-600/5 blur-2xl" />
        </div>

        {/* Completed Assessments count */}
        <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Assessments Entered</span>
            <span className="text-4xl font-black font-mono tracking-tight text-slate-200">
              {marks.length}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Accumulated unit weighings: {marks.reduce((acc, curr) => acc + Number(curr.weighting), 0)}%</p>
          </div>
          <div className="p-4 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 z-10">
            <Layers className="h-8 w-8" />
          </div>
        </div>

        {/* Average Milestone target */}
        <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Next Milestone Target</span>
            <span className="text-4xl font-black font-mono tracking-tight text-slate-400">
              85.0%
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-indigo-950/20 text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-violet-400 fill-violet-400" />
                <span>{overallAvg && parseFloat(overallAvg) >= 85 ? 'Goal achieved!' : 'HSC Band 6 Target'}</span>
              </span>
            </div>
          </div>
          <div className="p-4 rounded-full bg-pink-600/10 text-pink-400 border border-pink-500/10 z-10">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* CHART & SUBJECT AVERAGES SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Recharts Trend Line Graph (Span 2) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 border-indigo-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Mark Progression Trend</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Timeline tracking of your scores over the school year.</p>
            </div>
            
            {/* Subject Selector for Trend Graph */}
            <select
              value={trendSubjectFilter}
              onChange={(e) => setTrendSubjectFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-indigo-950/25 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {enrolledSubjects.map((sub) => (
                <option key={sub.id} value={sub.subject_id}>
                  {sub.subject?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-[280px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    activeDot={{ r: 6 }}
                    name="Mark achieved %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                No marks logged to plot the progression graph.
              </div>
            )}
          </div>
        </div>

        {/* Subject progress panel */}
        <div className="glass-card rounded-3xl p-5 border-indigo-950/20">
          <h3 className="text-sm font-bold text-slate-200 mb-1">Subject Progress</h3>
          <p className="text-[11px] text-slate-500 pb-3 border-b border-indigo-950/15 mb-4">
            Weighted aggregates per registered HSC unit.
          </p>

          <div className="space-y-4">
            {enrolledSubjects.map((sub) => {
              const avg = getSubjectAverage(sub.subject_id);
              const themeColors = getThresholdColor(avg);
              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color_hex }}
                      />
                      <span className="font-bold text-slate-300 truncate">{sub.subject?.name}</span>
                    </div>
                    <span className={`font-mono font-bold ${themeColors.text}`}>
                      {avg ? `${avg}%` : '--'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${themeColors.bg}`}
                      style={{ width: avg ? `${avg}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
            {enrolledSubjects.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-6">
                No subjects registered yet.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* MARKS LEDGER TABLE */}
      <div className="glass-card rounded-3xl overflow-hidden border-indigo-950/20">
        <div className="px-5 py-4 border-b border-indigo-950/15 flex items-center justify-between bg-slate-900/10">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Assessment Scores Ledger</h3>
            <p className="text-[11px] text-slate-500">History log of all logged marks.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-indigo-950/25">
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Weighting</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Mark achieved</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date logged</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/15">
              {marks.map((m) => {
                const subEnroll = enrolledSubjects.find((s) => s.subject_id === m.subject_id);
                return (
                  <tr key={m.id} className="hover:bg-slate-900/10 transition-colors text-slate-300 text-xs">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: subEnroll?.color_hex || '#475569' }}
                        />
                        <span className="font-bold text-slate-200">
                          {subjectsList.find((s) => s.id === m.subject_id)?.name || 'Subject'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-400">
                      {m.weighting}%
                    </td>
                    <td className="p-4 font-mono font-bold text-violet-400">
                      {m.mark_achieved}%
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {format(new Date(m.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteMark(m.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Remove score"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {marks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-500 italic">
                    {loading ? 'Fetching records...' : 'No marks logged yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG SCORE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 md:p-8 animate-fade-in shadow-2xl relative bg-slate-900 border-indigo-950/20">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-100 mb-2">Log Score</h2>
            <p className="text-slate-400 text-xs mb-6">
              Enter assessment marks achieved directly to calculate your weighted subject average.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddMark} className="space-y-4">
              {/* Subject Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Subject *</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 transition-all"
                  required
                >
                  <option value="" disabled>Choose Subject</option>
                  {enrolledSubjects.map((sub) => (
                    <option key={sub.id} value={sub.subject_id} className="bg-slate-950">
                      {sub.subject?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Score Achieved */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Score Achieved (%) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="e.g. 92"
                    value={achievedMark}
                    onChange={(e) => setAchievedMark(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-650 transition-all font-mono"
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
                    placeholder="e.g. 15"
                    value={weighting}
                    onChange={(e) => setWeighting(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-655 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-indigo-950/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-indigo-950/20 rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition-all border border-violet-500/35 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>Save Score</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
