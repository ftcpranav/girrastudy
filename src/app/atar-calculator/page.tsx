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
  Award,
  Sliders,
  BarChart3,
  Target,
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

  // Chart Tab State (reduces vertical clutter by combining charts)
  const [activeChartTab, setActiveChartTab] = useState<'breakdown' | 'scalingCurves'>('breakdown');

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
      {/* Sleek Hero Bar: Title & Live ATAR Display */}
      <div className="glass-card rounded-3xl p-6 border-slate-200 dark:border-emerald-500/20 mb-6 bg-slate-100/90 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900/60 dark:to-emerald-950/30 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Calculator className="h-5 w-5" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
                HSC ATAR & Scaling Estimator
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">
              UAC scaled mark predictor & NESA 50% School Assessment + 50% Exam Moderation Engine.
            </p>
          </div>

          {/* Unified ATAR Score Badge */}
          <div className="flex items-center gap-4 bg-white/90 dark:bg-slate-950/80 px-6 py-3 rounded-2xl border border-slate-200 dark:border-emerald-500/20 shrink-0 shadow-sm">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Estimated ATAR
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {validation.isValid ? results.atar.toFixed(2) : '--.--'}
              </span>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-emerald-500/20" />
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Best 10 Aggregate
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">
                {validation.isValid ? `${results.aggregate}/500` : '--/500'}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Mode Switcher & Eligibility Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-emerald-500/15">
          {/* Eligibility status */}
          <div>
            {validation.isValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>ATAR Eligible (10+ Units, English Included)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{validation.errors[0] || 'Ineligible Course Combination'}</span>
              </span>
            )}
          </div>

          {/* Mode Switcher Pills */}
          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-950 border border-slate-300 dark:border-emerald-500/20 rounded-xl">
            <button
              type="button"
              onClick={() => handleToggleMode('moderated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                calculationMode === 'moderated'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>50/50 Moderation</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                calculationMode === 'simple'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Direct Mark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warnings Banner if any */}
      {validation.warnings.length > 0 && (
        <div className="mb-6 p-3 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>{validation.warnings.join(' • ')}</span>
        </div>
      )}

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (Span 2): Course Selection & Compact Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border-slate-200 dark:border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Selected Subjects ({selectedCourses.length})</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {calculationMode === 'moderated'
                    ? 'Adjust School Mark, HSC Exam Mark, and School Rank.'
                    : 'Adjust overall composite mark.'}
                </p>
              </div>

              {/* Add Course Control */}
              <div className="flex items-center gap-2">
                <select
                  value={courseToAdd}
                  onChange={(e) => setCourseToAdd(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">+ Add Subject...</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.units}u)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCourse}
                  disabled={!courseToAdd}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Streamlined Courses List */}
            <div className="space-y-3">
              {selectedCourses.map((sc) => {
                const course = HSC_COURSES.find((c) => c.id === sc.courseId);
                if (!course) return null;

                const compositeMark = getEffectiveCourseMark(sc);
                const scaledMark = getScaledMarkPerUnit(course, compositeMark);

                return (
                  <div
                    key={sc.courseId}
                    className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:border-emerald-500/30"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                          {course.units}U
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{course.name}</h4>
                      </div>

                      {/* Right stats badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                          Mark: <strong className="text-slate-900 dark:text-slate-100 font-bold">{compositeMark}%</strong>
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                          Scaled: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">~{Math.round(scaledMark * 10) / 10}/50</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(sc.courseId)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove course"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Compact Input Row */}
                    {calculationMode === 'moderated' ? (
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase block">School Mark (50%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.schoolMark ?? sc.rawMark}
                            onChange={(e) => handleSchoolMarkChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Exam Mark (50%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.examMark ?? sc.rawMark}
                            onChange={(e) => handleExamMarkChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase block">School Rank Pct</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={sc.schoolRankPercentile ?? 80}
                            onChange={(e) => handleRankPercentileChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sc.rawMark}
                          onChange={(e) => handleRawMarkChange(sc.courseId, parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                        <div className="relative shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={sc.rawMark}
                            onChange={(e) => handleRawMarkChange(sc.courseId, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-center text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Goal Target & Tabbed Analytics Card */}
        <div className="space-y-6">
          {/* Target Goal Widget */}
          <div className="glass-card rounded-3xl p-5 border-slate-200 dark:border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-emerald-500" />
                <span>Target ATAR Goal</span>
              </h3>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{targetAtar.toFixed(2)}</span>
            </div>

            <input
              type="range"
              min="70"
              max="99.95"
              step="0.5"
              value={targetAtar}
              onChange={(e) => setTargetAtar(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer mb-3"
            />

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Target Gap:</span>
              <span className={`font-bold ${results.atar >= targetAtar ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {results.atar >= targetAtar ? 'Goal Achieved! 🎉' : `+${(targetAtar - results.atar).toFixed(2)} pts needed`}
              </span>
            </div>
          </div>

          {/* Tabbed Analytics & Chart Section */}
          <div className="glass-card rounded-3xl p-5 border-slate-200 dark:border-emerald-500/20">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <span>Scaling Analytics</span>
              </h3>

              {/* Chart Tabs */}
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('breakdown')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    activeChartTab === 'breakdown'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Best 10 Units
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('scalingCurves')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    activeChartTab === 'scalingCurves'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Scaling Curves
                </button>
              </div>
            </div>

            {/* Active Chart Display */}
            {activeChartTab === 'breakdown' ? (
              <div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contributionBarData} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} angle={-35} textAnchor="end" />
                      <YAxis domain={[0, 50]} stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          borderColor: 'var(--border)',
                          borderRadius: '12px',
                          fontSize: '11px',
                          color: 'var(--foreground)',
                        }}
                      />
                      <Bar dataKey="scaledScore" radius={[4, 4, 0, 0]}>
                        {contributionBarData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isBest10 ? '#10b981' : '#64748b'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-emerald-500" />
                    <span>Counted in Best 10</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-slate-400 dark:bg-slate-700" />
                    <span>Excess Unit</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scalingCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                      <XAxis dataKey="raw" stroke="#64748b" fontSize={10} />
                      <YAxis domain={[0, 50]} stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          borderColor: 'var(--border)',
                          borderRadius: '12px',
                          fontSize: '11px',
                          color: 'var(--foreground)',
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
                            strokeWidth={2}
                            dot={{ r: 2 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Scaled score per unit vs composite raw mark benchmark.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

