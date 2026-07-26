'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  HSC_COURSES,
  SelectedCourse,
  validateHscRules,
  calculateBest10UnitsAggregate,
  getScaledMarkPerUnit,
  getEffectiveCourseMark,
} from '@/lib/atarScaling';
import {
  Calculator,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Info,
  Layers,
  Zap,
  BookOpen,
  Award,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function AtarCalculatorPage() {
  // Global Mode: Simple Composite vs 50/50 Moderation Mode
  const [calculationMode, setCalculationMode] = useState<'simple' | 'moderated'>('moderated');

  // Default course selection (Girraween STEM Track)
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([
    { courseId: 'eng_adv', rawMark: 88, schoolMark: 87, examMark: 89, schoolRankPercentile: 85, useModerationMode: true },
    { courseId: 'math_ext1', rawMark: 88, schoolMark: 86, examMark: 90, schoolRankPercentile: 90, useModerationMode: true },
    { courseId: 'math_ext2', rawMark: 85, schoolMark: 84, examMark: 86, schoolRankPercentile: 85, useModerationMode: true },
    { courseId: 'physics', rawMark: 86, schoolMark: 85, examMark: 87, schoolRankPercentile: 80, useModerationMode: true },
    { courseId: 'chemistry', rawMark: 87, schoolMark: 86, examMark: 88, schoolRankPercentile: 85, useModerationMode: true },
  ]);

  const [courseToAdd, setCourseToAdd] = useState<string>('');
  const [targetAtar, setTargetAtar] = useState<number>(95.0);

  // Toggle global calculation mode
  const handleToggleMode = (mode: 'simple' | 'moderated') => {
    setCalculationMode(mode);
    setSelectedCourses((prev) =>
      prev.map((c) => ({ ...c, useModerationMode: mode === 'moderated' }))
    );
  };

  // Handlers for marks
  const handleRawMarkChange = (courseId: string, mark: number) => {
    setSelectedCourses((prev) =>
      prev.map((c) => (c.courseId === courseId ? { ...c, rawMark: Math.min(100, Math.max(0, mark)) } : c))
    );
  };

  const handleSchoolMarkChange = (courseId: string, schoolMark: number) => {
    setSelectedCourses((prev) =>
      prev.map((c) => (c.courseId === courseId ? { ...c, schoolMark: Math.min(100, Math.max(0, schoolMark)) } : c))
    );
  };

  const handleExamMarkChange = (courseId: string, examMark: number) => {
    setSelectedCourses((prev) =>
      prev.map((c) => (c.courseId === courseId ? { ...c, examMark: Math.min(100, Math.max(0, examMark)) } : c))
    );
  };

  const handleRankPercentileChange = (courseId: string, rankPct: number) => {
    setSelectedCourses((prev) =>
      prev.map((c) => (c.courseId === courseId ? { ...c, schoolRankPercentile: Math.min(100, Math.max(0, rankPct)) } : c))
    );
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((c) => c.courseId !== courseId));
  };

  const handleAddCourse = () => {
    if (!courseToAdd) return;
    if (selectedCourses.some((c) => c.courseId === courseToAdd)) return;
    setSelectedCourses((prev) => [
      ...prev,
      {
        courseId: courseToAdd,
        rawMark: 80,
        schoolMark: 80,
        examMark: 80,
        schoolRankPercentile: 80,
        useModerationMode: calculationMode === 'moderated',
      },
    ]);
    setCourseToAdd('');
  };

  // Run validation and calculations
  const validation = validateHscRules(selectedCourses);
  const results = calculateBest10UnitsAggregate(selectedCourses);

  // Available courses not yet selected
  const availableCourses = HSC_COURSES.filter(
    (c) => !selectedCourses.some((sc) => sc.courseId === c.id)
  );

  // Prepare Raw vs Scaled Curve Chart Data
  const getScalingCurveData = () => {
    const rawSteps = [50, 60, 70, 80, 90, 100];
    return rawSteps.map((raw) => {
      const dataPoint: Record<string, any> = { raw: `${raw}%` };
      selectedCourses.forEach((sc) => {
        const course = HSC_COURSES.find((c) => c.id === sc.courseId);
        if (course) {
          dataPoint[course.name] = getScaledMarkPerUnit(course, raw);
        }
      });
      return dataPoint;
    });
  };

  // Color palette for charts
  const colors = [
    '#8b5cf6',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#a855f7',
  ];

  const scalingCurveData = getScalingCurveData();

  // Aggregate contribution bar data
  const contributionBarData = results.unitBreakdown.map((ub) => ({
    name: `${ub.courseName.slice(0, 12)} U${ub.unitNumber}`,
    scaledScore: Math.round(ub.scaledScorePerUnit * 10) / 10,
    isBest10: ub.isIncludedInBest10,
  }));

  return (
    <AppLayout>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20">
              <Calculator className="h-5 w-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
              HSC ATAR & Scaling Estimator
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            UAC scaled mark predictor & NESA 50% School Assessment + 50% Exam Moderation Engine.
          </p>
        </div>

        {/* Live ATAR Score Card */}
        <div className="glass-card rounded-2xl px-6 py-3 border-indigo-950/30 flex items-center gap-5 bg-gradient-to-r from-violet-950/30 to-slate-900/40">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Estimated ATAR
            </span>
            <span className="text-3xl font-black text-violet-400 font-mono tracking-tight">
              {validation.isValid ? results.atar.toFixed(2) : '--.--'}
            </span>
          </div>
          <div className="h-10 w-px bg-indigo-950/40" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Best 10 Aggregate
            </span>
            <span className="text-xl font-bold text-slate-200 font-mono">
              {validation.isValid ? `${results.aggregate}/500` : '--/500'}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Toggle Bar */}
      <div className="glass-card rounded-2xl p-4 border-indigo-950/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-200 block">Calculation Engine Mode:</span>
          <span className="text-[11px] text-slate-400">
            {calculationMode === 'moderated'
              ? 'NESA 50/50 Formula: 50% Internal Moderated School Assessment + 50% External HSC Exam'
              : 'Direct Composite Mark: Single overall raw mark per course'}
          </span>
        </div>

        <div className="inline-flex p-1 bg-slate-950 border border-indigo-950/30 rounded-xl">
          <button
            onClick={() => handleToggleMode('moderated')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              calculationMode === 'moderated'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>50/50 Moderation Mode</span>
          </button>

          <button
            onClick={() => handleToggleMode('simple')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              calculationMode === 'simple'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Direct Mark Mode</span>
          </button>
        </div>
      </div>

      {/* Rules Validation Banner */}
      <div className="mb-8">
        {validation.errors.length > 0 ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
              <span>NESA ATAR Eligibility Restrictions Unmet</span>
            </div>
            <ul className="list-disc list-inside text-xs space-y-1 text-red-400/90 pl-1">
              {validation.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              <span>NESA ATAR Requirements Satisfied (10+ Units, Compulsory English, Valid Extension Prerequisites)</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400">
              ATAR Eligible
            </span>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>{validation.warnings.join(' • ')}</span>
          </div>
        )}
      </div>

      {/* MAIN TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column (Span 2): Course Selection & Marks Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-950/15">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-violet-400" />
                  <span>Selected HSC Subjects ({selectedCourses.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {calculationMode === 'moderated'
                    ? 'Enter internal school mark, external exam mark, and school rank percentile.'
                    : 'Adjust overall raw mark slider per course.'}
                </p>
              </div>

              {/* Add Course Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={courseToAdd}
                  onChange={(e) => setCourseToAdd(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-indigo-950/30 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
                >
                  <option value="">+ Add HSC Course...</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.units}u)
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddCourse}
                  disabled={!courseToAdd}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Courses List */}
            <div className="space-y-4">
              {selectedCourses.map((sc) => {
                const course = HSC_COURSES.find((c) => c.id === sc.courseId);
                if (!course) return null;

                const compositeMark = getEffectiveCourseMark(sc);
                const scaledMark = getScaledMarkPerUnit(course, compositeMark);

                return (
                  <div
                    key={sc.courseId}
                    className="p-4 bg-slate-900/30 border border-indigo-950/20 rounded-2xl transition-all hover:border-violet-500/20 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {course.units}U
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-200 truncate">{course.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {course.category} • Composite Mark: <strong className="text-violet-300 font-mono">{compositeMark}%</strong> • Scaled: <strong className="text-emerald-400 font-mono">~{Math.round(scaledMark * 10) / 10}/50 per u</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveCourse(sc.courseId)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-950 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Controls based on Calculation Mode */}
                    {calculationMode === 'moderated' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-950/15 text-xs">
                        {/* 1. Internal School Assessment Mark */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">
                            School Assessment Mark (50%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.schoolMark ?? sc.rawMark}
                            onChange={(e) => handleSchoolMarkChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-indigo-950/30 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        {/* 2. External HSC Exam Mark */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">
                            External Exam Mark (50%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.examMark ?? sc.rawMark}
                            onChange={(e) => handleExamMarkChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-indigo-950/30 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        {/* 3. School Rank Percentile */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">
                            School Rank Percentile (Girraween)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={sc.schoolRankPercentile ?? 80}
                            onChange={(e) => handleRankPercentileChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            placeholder="e.g. 90 (Top 10%)"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-indigo-950/30 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pt-2 border-t border-indigo-950/15">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sc.rawMark}
                          onChange={(e) => handleRawMarkChange(sc.courseId, parseFloat(e.target.value))}
                          className="w-full accent-violet-500 cursor-pointer"
                        />
                        <div className="relative shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.rawMark}
                            onChange={(e) => handleRawMarkChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-slate-950 border border-indigo-950/30 rounded-lg text-xs font-mono font-bold text-center text-violet-300 focus:outline-none focus:border-violet-500"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recharts scaling curve chart */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                <span>UAC Scaled Curves (Composite Mark vs Scaled per Unit)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Shows how each selected course scales at different composite mark benchmarks.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scalingCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.08)" />
                  <XAxis dataKey="raw" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 50]} stroke="#64748b" fontSize={11} label={{ value: 'Scaled /50', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#090d16',
                      borderColor: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                  />
                  {selectedCourses.map((sc, idx) => {
                    const course = HSC_COURSES.find((c) => c.id === sc.courseId);
                    if (!course) return null;
                    return (
                      <Line
                        key={course.id}
                        type="monotone"
                        dataKey={course.name}
                        stroke={colors[idx % colors.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Best 10 Breakdown & Target Goal Slider */}
        <div className="space-y-6">
          {/* ATAR Target Slider Card */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span>Target ATAR Goal</span>
              </h3>
              <span className="text-sm font-mono font-bold text-violet-400">{targetAtar.toFixed(2)}</span>
            </div>

            <input
              type="range"
              min="70"
              max="99.95"
              step="0.5"
              value={targetAtar}
              onChange={(e) => setTargetAtar(parseFloat(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer mb-4"
            />

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Prediction:</span>
                <span className="font-mono font-bold text-slate-200">{results.atar.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Gap:</span>
                <span className={`font-mono font-bold ${results.atar >= targetAtar ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {results.atar >= targetAtar ? 'Goal Achieved! 🎉' : `+${(targetAtar - results.atar).toFixed(2)} pts needed`}
                </span>
              </div>
            </div>
          </div>

          {/* Best 10 Unit Breakdown Graph */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-emerald-400" />
                <span>Best 10 Unit Aggregate Contributions</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Highlights units counted in your 500-point aggregate.
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributionBarData} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.08)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} angle={-35} textAnchor="end" />
                  <YAxis domain={[0, 50]} stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: '#090d16',
                      borderColor: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="scaledScore" radius={[6, 6, 0, 0]}>
                    {contributionBarData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isBest10 ? '#8b5cf6' : '#334155'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-violet-500" />
                <span>Counted in Best 10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-700" />
                <span>Excess Unit</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
