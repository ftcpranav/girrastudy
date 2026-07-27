'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { SYLLABUS_DATA } from '@/lib/syllabusData';
import {
  BookOpen,
  ExternalLink,
  RotateCw,
  Award,
  FileText,
  Filter,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  Search,
} from 'lucide-react';

type TabType = 'past_papers' | 'syllabus' | 'flashcards';
type DotStatus = 'red' | 'yellow' | 'green';

// Key used to store progress in preferences_json
const SYLLABUS_PREF_KEY = 'syllabus_progress';

interface PastPaperResource {
  id: string;
  subjectCode: string;
  subjectName: string;
  yearGroup: 'Year 11' | 'Year 12';
  title: string;
  type: 'NESA HSC Exam' | 'Year 11 Prelim' | 'Selective Trial Paper' | 'Marking Guidelines';
  url: string;
}

interface Flashcard {
  id: string;
  subjectCode: string;
  subjectName: string;
  topic: string;
  question: string;
  answer: string;
}

export default function ResourcesPage() {
  const { user, enrolledSubjects, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('past_papers');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Syllabus: dot point status map, keyed by dot point id
  const [statusMap, setStatusMap] = useState<Record<string, DotStatus>>({});
  const [statusSaving, setStatusSaving] = useState(false);
  // Which topics are expanded (collapsed by default)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  // Search filter
  const [syllabusSearch, setSyllabusSearch] = useState('');

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // ── Load saved status from profile preferences_json ──────
  useEffect(() => {
    if (profile?.preferences_json?.[SYLLABUS_PREF_KEY]) {
      setStatusMap(profile.preferences_json[SYLLABUS_PREF_KEY] as Record<string, DotStatus>);
    }
  }, [profile]);

  // ── Enrolled subject codes ─────────────────────────────────
  const enrolledCodes = useMemo(() => {
    return enrolledSubjects
      .map((es) => es.subject?.code)
      .filter(Boolean) as string[];
  }, [enrolledSubjects]);

  // ── Filter syllabus to enrolled subjects only ──────────────
  const enrolledSyllabusData = useMemo(() => {
    return SYLLABUS_DATA.filter((dp) => enrolledCodes.includes(dp.subjectCode));
  }, [enrolledCodes]);

  // ── Apply subject + search filter ─────────────────────────
  const filteredDotPoints = useMemo(() => {
    let items = enrolledSyllabusData;

    if (selectedSubjectFilter !== 'all') {
      const sub = enrolledSubjects.find((s) => s.subject_id === selectedSubjectFilter);
      if (sub?.subject?.code) {
        items = items.filter((dp) => dp.subjectCode === sub.subject!.code);
      }
    }

    if (syllabusSearch.trim()) {
      const q = syllabusSearch.toLowerCase();
      items = items.filter(
        (dp) =>
          dp.dotPoint.toLowerCase().includes(q) ||
          dp.topic.toLowerCase().includes(q)
      );
    }

    return items;
  }, [enrolledSyllabusData, selectedSubjectFilter, syllabusSearch, enrolledSubjects]);

  // ── Group dot points by subjectCode → topic ───────────────
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, typeof filteredDotPoints>> = {};
    for (const dp of filteredDotPoints) {
      if (!map[dp.subjectCode]) map[dp.subjectCode] = {};
      if (!map[dp.subjectCode][dp.topic]) map[dp.subjectCode][dp.topic] = [];
      map[dp.subjectCode][dp.topic].push(dp);
    }
    return map;
  }, [filteredDotPoints]);

  // ── Toggle status: red → yellow → green → red ─────────────
  const toggleStatus = async (id: string) => {
    const current = statusMap[id] || 'red';
    const next: DotStatus = current === 'red' ? 'yellow' : current === 'yellow' ? 'green' : 'red';

    const newMap = { ...statusMap, [id]: next };
    setStatusMap(newMap);

    if (!user) return;
    setStatusSaving(true);
    try {
      const existing = profile?.preferences_json || {};
      await supabase
        .from('users')
        .update({
          preferences_json: {
            ...existing,
            [SYLLABUS_PREF_KEY]: newMap,
          },
        })
        .eq('id', user.id);
      await refreshProfile(user.id);
    } catch (e) {
      console.error('Failed to persist syllabus progress', e);
    } finally {
      setStatusSaving(false);
    }
  };

  // ── Toggle topic accordion ─────────────────────────────────
  const toggleTopic = (key: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Expand all / collapse all ──────────────────────────────
  const expandAll = () => {
    const keys = new Set<string>();
    for (const code of Object.keys(grouped)) {
      for (const topic of Object.keys(grouped[code])) {
        keys.add(`${code}::${topic}`);
      }
    }
    setExpandedTopics(keys);
  };
  const collapseAll = () => setExpandedTopics(new Set());

  // ── Progress stats ─────────────────────────────────────────
  const totalDots = filteredDotPoints.length;
  const masteredCount = filteredDotPoints.filter((dp) => statusMap[dp.id] === 'green').length;
  const mediumCount = filteredDotPoints.filter((dp) => statusMap[dp.id] === 'yellow').length;
  const revisionCount = filteredDotPoints.filter((dp) => !statusMap[dp.id] || statusMap[dp.id] === 'red').length;
  const progressPct = totalDots > 0 ? Math.round((masteredCount / totalDots) * 100) : 0;

  // ── Past Papers list ───────────────────────────────────────
  const pastPapersList: PastPaperResource[] = [
    { id: 'pp1', subjectCode: 'MATH_ADV', subjectName: 'Mathematics Advanced', yearGroup: 'Year 12', title: '2024 NESA HSC Mathematics Advanced Exam & Solutions', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp2', subjectCode: 'MATH_ADV', subjectName: 'Mathematics Advanced', yearGroup: 'Year 11', title: 'Year 11 Preliminary Mathematics Advanced Yearly Exam', type: 'Year 11 Prelim', url: 'https://www.thsc.online/hsc/maths_advanced/' },
    { id: 'pp3', subjectCode: 'MATH_EXT1', subjectName: 'Mathematics Extension 1', yearGroup: 'Year 12', title: 'Girraween & Selective High Schools Math Ext 1 Trial Papers', type: 'Selective Trial Paper', url: 'https://www.thsc.online/hsc/maths_extension_1/' },
    { id: 'pp4', subjectCode: 'PHYS', subjectName: 'Physics', yearGroup: 'Year 12', title: '2023 NESA HSC Physics Examination & Marking Guidelines', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp5', subjectCode: 'PHYS', subjectName: 'Physics', yearGroup: 'Year 11', title: 'Year 11 Physics Kinematics & Dynamics Progress Test', type: 'Year 11 Prelim', url: 'https://www.thsc.online/hsc/physics/' },
    { id: 'pp6', subjectCode: 'CHEM', subjectName: 'Chemistry', yearGroup: 'Year 12', title: '2024 NESA HSC Chemistry Exam & Solutions Data Sheet', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp7', subjectCode: 'CHEM', subjectName: 'Chemistry', yearGroup: 'Year 11', title: 'Year 11 Chemistry Structure & Atomic Theory Exam', type: 'Year 11 Prelim', url: 'https://www.thsc.online/hsc/chemistry/' },
    { id: 'pp8', subjectCode: 'ENG_ADV', subjectName: 'English Advanced', yearGroup: 'Year 12', title: 'NESA HSC English Advanced Paper 1 (Texts and Human Experiences)', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp9', subjectCode: 'ENG_ADV', subjectName: 'English Advanced', yearGroup: 'Year 11', title: 'Year 11 English Advanced Reading Task & Critical Analysis', type: 'Year 11 Prelim', url: 'https://www.thsc.online/hsc/english_advanced/' },
    { id: 'pp10', subjectCode: 'ECON', subjectName: 'Economics', yearGroup: 'Year 12', title: '2024 NESA HSC Economics Exam & Marking Guidelines', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp11', subjectCode: 'BIOL', subjectName: 'Biology', yearGroup: 'Year 12', title: '2024 NESA HSC Biology Examination & Marking Guidelines', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp12', subjectCode: 'MATH_EXT2', subjectName: 'Mathematics Extension 2', yearGroup: 'Year 12', title: '2024 NESA HSC Mathematics Extension 2 Exam & Solutions', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp13', subjectCode: 'BUSS', subjectName: 'Business Studies', yearGroup: 'Year 12', title: '2024 NESA HSC Business Studies Exam & Marking Guidelines', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp14', subjectCode: 'LEGL', subjectName: 'Legal Studies', yearGroup: 'Year 12', title: '2024 NESA HSC Legal Studies Examination', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp15', subjectCode: 'HIST_MOD', subjectName: 'Modern History', yearGroup: 'Year 12', title: '2024 NESA HSC Modern History Exam & Marking Guidelines', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp16', subjectCode: 'ENG_EXT1', subjectName: 'English Extension 1', yearGroup: 'Year 12', title: '2024 NESA HSC English Extension 1 Exam', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp17', subjectCode: 'SOFT_ENG', subjectName: 'Software Engineering', yearGroup: 'Year 12', title: '2024 NESA HSC Software Engineering Examination', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
    { id: 'pp18', subjectCode: 'ENG_STD', subjectName: 'English Standard', yearGroup: 'Year 12', title: 'NESA HSC English Standard Paper 1 & 2', type: 'NESA HSC Exam', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
  ];

  // Filter past papers to enrolled subjects only
  const filteredPastPapers = pastPapersList.filter((pp) => {
    const isEnrolled = enrolledCodes.includes(pp.subjectCode);
    if (!isEnrolled) return false;
    if (selectedSubjectFilter === 'all') return true;
    const sub = enrolledSubjects.find((s) => s.subject_id === selectedSubjectFilter);
    return sub?.subject?.code === pp.subjectCode;
  });

  // ── Flashcards (only for enrolled subjects) ───────────────
  const allFlashcards: Flashcard[] = [
    { id: 'f1', subjectCode: 'CHEM', subjectName: 'Chemistry', topic: 'Equilibrium', question: 'What happens to equilibrium in an exothermic reaction when temperature increases?', answer: "According to Le Chatelier's principle, equilibrium shifts in the endothermic direction (reverse reaction) to absorb excess heat." },
    { id: 'f2', subjectCode: 'PHYS', subjectName: 'Physics', topic: 'Special Relativity', question: "State Einstein's two postulates of Special Relativity.", answer: "1. The laws of physics are the same in all inertial reference frames.\n2. The speed of light (c) is constant for all observers regardless of motion of source or observer." },
    { id: 'f3', subjectCode: 'MATH_EXT1', subjectName: 'Maths Ext 1', topic: 'Combinatorics', question: 'How many ways can n distinct objects be arranged in a circle?', answer: '(n - 1)! because one rotation produces equivalent arrangements.' },
    { id: 'f4', subjectCode: 'ECON', subjectName: 'Economics', topic: 'Balance of Payments', question: 'What are the two main accounts in the Balance of Payments?', answer: '1. Current Account (Goods, Services, Primary & Secondary Income)\n2. Capital & Financial Account (Direct, Portfolio, Derivatives & Reserve Assets)' },
    { id: 'f5', subjectCode: 'MATH_ADV', subjectName: 'Maths Advanced', topic: 'Calculus', question: 'State the Fundamental Theorem of Calculus.', answer: 'If F is an antiderivative of f on [a, b], then the integral from a to b of f(x)dx = F(b) - F(a).' },
    { id: 'f6', subjectCode: 'BIOL', subjectName: 'Biology', topic: 'Genetics', question: 'What is the Central Dogma of Molecular Biology?', answer: 'DNA is transcribed to mRNA which is translated into protein: DNA → RNA → Protein.' },
    { id: 'f7', subjectCode: 'LEGL', subjectName: 'Legal Studies', topic: 'Crime', question: 'What are the two elements required to establish criminal liability?', answer: "1. Actus reus (the guilty act)\n2. Mens rea (the guilty mind/intent)" },
    { id: 'f8', subjectCode: 'BUSS', subjectName: 'Business Studies', topic: 'Finance', question: 'What does the current ratio measure and what is considered healthy?', answer: 'Current Ratio = Current Assets / Current Liabilities. A ratio of 2:1 is generally considered healthy, indicating the business can cover short-term obligations.' },
    { id: 'f9', subjectCode: 'MATH_EXT2', subjectName: 'Maths Ext 2', topic: 'Complex Numbers', question: "State de Moivre's theorem.", answer: 'For any real n: (cos θ + i sin θ)^n = cos(nθ) + i sin(nθ). Equivalently, (r·e^(iθ))^n = r^n · e^(inθ).' },
    { id: 'f10', subjectCode: 'ENG_ADV', subjectName: 'English Advanced', topic: 'Critical Thinking', question: 'What is the difference between a theme and a motif?', answer: 'A theme is the central message or idea of a text (e.g. "redemption"). A motif is a recurring symbolic element (image, sound, colour) that reinforces the theme.' },
  ];

  const enrolledFlashcards = allFlashcards.filter((f) => enrolledCodes.includes(f.subjectCode));
  const displayCards = enrolledFlashcards.length > 0 ? enrolledFlashcards : allFlashcards;
  const currentCard = displayCards[currentCardIndex % displayCards.length];

  // ── Render subject name from code ─────────────────────────
  const subjectNameFromCode = (code: string) => {
    const found = enrolledSubjects.find((s) => s.subject?.code === code);
    return found?.subject?.name || code;
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
              HSC & Prelim Resource Vault
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Past papers, syllabus dot-point tracker and flashcards — filtered to your enrolled subjects.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex p-1 bg-slate-900/60 border border-indigo-950/30 rounded-2xl">
          {([
            { id: 'past_papers', label: 'Past Papers' },
            { id: 'syllabus', label: 'Syllabus Tracker' },
            { id: 'flashcards', label: 'Flashcards' },
          ] as { id: TabType; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border-indigo-950/20 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Filter by Enrolled Subject:</span>
        </div>
        <select
          value={selectedSubjectFilter}
          onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          className="px-4 py-2 bg-slate-950 border border-indigo-950/30 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All My Subjects</option>
          {enrolledSubjects.map((sub) => (
            <option key={sub.id} value={sub.subject_id}>
              {sub.subject?.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── TAB 1: PAST PAPERS ──────────────────────────────── */}
      {activeTab === 'past_papers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-950/15">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-amber-400" />
                  <span>Year 11 & 12 Past Papers Repository</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Showing papers for your enrolled subjects only.
                </p>
              </div>
            </div>

            {filteredPastPapers.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-8">
                No past papers found for your enrolled subjects.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPastPapers.map((pp) => (
                  <a
                    key={pp.id}
                    href={pp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-900/30 hover:bg-slate-900/60 border border-indigo-950/20 hover:border-amber-500/30 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                          {pp.yearGroup}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                          {pp.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                        {pp.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 block truncate">
                        Subject: {pp.subjectName}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SYLLABUS DOT-POINT TRACKER ──────────────── */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header with stats */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-indigo-950/15">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Syllabus Dot-Point Confidence Tracker</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click status badges to cycle: 🔴 Revision Needed → 🟡 Getting There → 🟢 Mastered. Progress auto-saves.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {masteredCount} Mastered
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <MinusCircle className="h-3.5 w-3.5" /> {mediumCount} Getting There
                </span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {revisionCount} Needs Revision
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
                <span className="text-xs font-mono font-bold text-violet-400">{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Search + Expand/Collapse controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search dot points..."
                  value={syllabusSearch}
                  onChange={(e) => setSyllabusSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                type="button"
                onClick={expandAll}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Collapse All
              </button>
              {statusSaving && (
                <span className="text-[10px] text-amber-400 font-bold animate-pulse">Saving…</span>
              )}
            </div>
          </div>

          {/* No subjects enrolled */}
          {enrolledCodes.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              You have no enrolled subjects. Complete onboarding first.
            </div>
          )}

          {/* Grouped dot points by subject → topic */}
          {Object.keys(grouped).map((code) => {
            const subjectName = subjectNameFromCode(code);
            const subjectTopics = grouped[code];
            const subjectDps = Object.values(subjectTopics).flat();
            const subjectMastered = subjectDps.filter((dp) => statusMap[dp.id] === 'green').length;
            const subjectPct = subjectDps.length > 0 ? Math.round((subjectMastered / subjectDps.length) * 100) : 0;

            return (
              <div key={code} className="glass-card rounded-3xl border-indigo-950/20 overflow-hidden">
                {/* Subject header */}
                <div className="p-5 border-b border-indigo-950/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/15">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-100">{subjectName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-emerald-400">{subjectMastered}/{subjectDps.length}</p>
                      <p className="text-[10px] text-slate-500">mastered</p>
                    </div>
                    <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${subjectPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Topics accordion */}
                <div className="divide-y divide-indigo-950/10">
                  {Object.keys(subjectTopics).map((topic) => {
                    const topicKey = `${code}::${topic}`;
                    const isOpen = expandedTopics.has(topicKey);
                    const topicDps = subjectTopics[topic];
                    const topicMastered = topicDps.filter((dp) => statusMap[dp.id] === 'green').length;

                    return (
                      <div key={topicKey}>
                        {/* Topic row */}
                        <button
                          type="button"
                          onClick={() => toggleTopic(topicKey)}
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-900/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-slate-200 truncate">{topic}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-slate-500">
                              {topicMastered}/{topicDps.length}
                            </span>
                            <div className="flex gap-0.5">
                              {topicDps.map((dp) => (
                                <div
                                  key={dp.id}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    statusMap[dp.id] === 'green'
                                      ? 'bg-emerald-400'
                                      : statusMap[dp.id] === 'yellow'
                                      ? 'bg-amber-400'
                                      : 'bg-red-400/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </button>

                        {/* Dot points (expanded) */}
                        {isOpen && (
                          <div className="px-5 pb-3 space-y-2">
                            {topicDps.map((dp) => {
                              const s = statusMap[dp.id] || 'red';
                              return (
                                <div
                                  key={dp.id}
                                  className="flex items-start justify-between gap-4 p-3.5 bg-slate-950/40 border border-indigo-950/15 rounded-xl"
                                >
                                  <p className="text-xs text-slate-300 leading-relaxed flex-1">{dp.dotPoint}</p>
                                  <button
                                    type="button"
                                    onClick={() => toggleStatus(dp.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
                                      s === 'green'
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25'
                                        : s === 'yellow'
                                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/25'
                                        : 'bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25'
                                    }`}
                                  >
                                    {s === 'green' ? '🟢 Mastered' : s === 'yellow' ? '🟡 Getting There' : '🔴 Needs Revision'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredDotPoints.length === 0 && enrolledCodes.length > 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No dot points match your search.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: FLASHCARD QUIZ ───────────────────────────── */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="glass-card rounded-3xl p-8 border-indigo-950/30 text-center shadow-2xl relative min-h-[280px] flex flex-col justify-between bg-slate-950/60">
            <div>
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                  {currentCard?.subjectName} · {currentCard?.topic}
                </span>
                <span className="font-mono text-slate-400 text-xs">
                  Card {(currentCardIndex % displayCards.length) + 1} of {displayCards.length}
                </span>
              </div>
              <div className="py-6">
                <h3 className="text-base font-bold text-slate-100 mb-4 leading-relaxed whitespace-pre-line">
                  {isFlipped ? currentCard?.answer : currentCard?.question}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-indigo-950/20">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : displayCards.length - 1));
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-600/10"
              >
                <RotateCw className="h-4 w-4" />
                <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev < displayCards.length - 1 ? prev + 1 : 0));
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {enrolledFlashcards.length === 0 && (
            <p className="text-xs text-slate-500 text-center italic">
              No flashcards match your enrolled subjects yet. Showing general cards.
            </p>
          )}
        </div>
      )}
    </AppLayout>
  );
}
