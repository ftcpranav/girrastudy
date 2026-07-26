'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Award,
  Layers,
  FileText,
  Filter,
  GraduationCap,
} from 'lucide-react';

type TabType = 'past_papers' | 'syllabus' | 'flashcards';

interface DotPoint {
  id: string;
  subjectCode: string;
  topic: string;
  dotPoint: string;
  status: 'red' | 'yellow' | 'green';
}

interface Flashcard {
  id: string;
  subjectCode: string;
  subjectName: string;
  topic: string;
  question: string;
  answer: string;
}

interface PastPaperResource {
  id: string;
  subjectCode: string;
  subjectName: string;
  yearGroup: 'Year 11' | 'Year 12';
  title: string;
  type: 'NESA HSC Exam' | 'Year 11 Prelim' | 'Selective Trial Paper' | 'Marking Guidelines';
  url: string;
}

export default function ResourcesPage() {
  const { enrolledSubjects } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('past_papers');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Past Papers Registry tailored for HSC & Prelim subjects
  const pastPapersList: PastPaperResource[] = [
    {
      id: 'pp1',
      subjectCode: 'MATH_ADV',
      subjectName: 'Mathematics Advanced',
      yearGroup: 'Year 12',
      title: '2024 NESA HSC Mathematics Advanced Exam & Solutions',
      type: 'NESA HSC Exam',
      url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers',
    },
    {
      id: 'pp2',
      subjectCode: 'MATH_ADV',
      subjectName: 'Mathematics Advanced',
      yearGroup: 'Year 11',
      title: 'Year 11 Preliminary Mathematics Advanced Yearly Exam',
      type: 'Year 11 Prelim',
      url: 'https://www.thsc.online/hsc/maths_advanced/',
    },
    {
      id: 'pp3',
      subjectCode: 'MATH_EXT1',
      subjectName: 'Mathematics Extension 1',
      yearGroup: 'Year 12',
      title: 'Girraween & Selective High Schools Math Ext 1 Trial Papers',
      type: 'Selective Trial Paper',
      url: 'https://www.thsc.online/hsc/maths_extension_1/',
    },
    {
      id: 'pp4',
      subjectCode: 'PHYS',
      subjectName: 'Physics',
      yearGroup: 'Year 12',
      title: '2023 NESA HSC Physics Examination & Marking Guidelines',
      type: 'NESA HSC Exam',
      url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers',
    },
    {
      id: 'pp5',
      subjectCode: 'PHYS',
      subjectName: 'Physics',
      yearGroup: 'Year 11',
      title: 'Year 11 Physics Kinematics & Dynamics Progress Test',
      type: 'Year 11 Prelim',
      url: 'https://www.thsc.online/hsc/physics/',
    },
    {
      id: 'pp6',
      subjectCode: 'CHEM',
      subjectName: 'Chemistry',
      yearGroup: 'Year 12',
      title: '2024 NESA HSC Chemistry Exam & Solutions Data Sheet',
      type: 'NESA HSC Exam',
      url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers',
    },
    {
      id: 'pp7',
      subjectCode: 'CHEM',
      subjectName: 'Chemistry',
      yearGroup: 'Year 11',
      title: 'Year 11 Chemistry Structure & Atomic Theory Exam',
      type: 'Year 11 Prelim',
      url: 'https://www.thsc.online/hsc/chemistry/',
    },
    {
      id: 'pp8',
      subjectCode: 'ENG_ADV',
      subjectName: 'English Advanced',
      yearGroup: 'Year 12',
      title: 'NESA HSC English Advanced Paper 1 (Texts and Human Experiences)',
      type: 'NESA HSC Exam',
      url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers',
    },
    {
      id: 'pp9',
      subjectCode: 'ENG_ADV',
      subjectName: 'English Advanced',
      yearGroup: 'Year 11',
      title: 'Year 11 English Advanced Reading Task & Critical Analysis',
      type: 'Year 11 Prelim',
      url: 'https://www.thsc.online/hsc/english_advanced/',
    },
    {
      id: 'pp10',
      subjectCode: 'ECON',
      subjectName: 'Economics',
      yearGroup: 'Year 12',
      title: '2024 NESA HSC Economics Exam & Marking Guidelines',
      type: 'NESA HSC Exam',
      url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers',
    },
  ];

  // Syllabus tracker state
  const [dotPoints, setDotPoints] = useState<DotPoint[]>([
    { id: '1', subjectCode: 'MATH_ADV', topic: 'Calculus & Integration', dotPoint: 'Evaluate definite integrals using standard antiderivatives and substitution.', status: 'green' },
    { id: '2', subjectCode: 'MATH_EXT1', topic: 'Vectors & Motion', dotPoint: 'Derive projectile equations in two dimensions with drag parameters.', status: 'yellow' },
    { id: '3', subjectCode: 'CHEM', topic: 'Organic Chemistry', dotPoint: 'Analyze reaction pathways for primary, secondary and tertiary alcohols.', status: 'red' },
    { id: '4', subjectCode: 'CHEM', topic: 'Equilibrium & Acid/Base', dotPoint: 'Calculate pH and Ka for weak acids and polyprotic buffers.', status: 'yellow' },
    { id: '5', subjectCode: 'PHYS', topic: 'Electromagnetism', dotPoint: 'Apply Lenz’s law and Faraday’s law to calculate induced EMF in moving conductors.', status: 'green' },
    { id: '6', subjectCode: 'ECON', topic: 'Economic Issues', dotPoint: 'Evaluate macroeconomic policies used by the RBA to target 2-3% inflation.', status: 'green' },
  ]);

  // Flashcards deck
  const [flashcards] = useState<Flashcard[]>([
    {
      id: 'f1',
      subjectCode: 'CHEM',
      subjectName: 'Chemistry',
      topic: 'Equilibrium',
      question: 'What happens to the position of equilibrium in an exothermic reaction when temperature is increased?',
      answer: 'According to Le Chatelier’s principle, increasing temperature shifts the equilibrium in the endothermic direction (reverse reaction, to absorb excess heat).',
    },
    {
      id: 'f2',
      subjectCode: 'PHYS',
      subjectName: 'Physics',
      topic: 'Special Relativity',
      question: 'State Einstein’s two postulates of Special Relativity.',
      answer: '1. The laws of physics are the same in all inertial reference frames.\n2. The speed of light in a vacuum (c) is constant for all observers, regardless of the motion of the source or observer.',
    },
    {
      id: 'f3',
      subjectCode: 'MATH_EXT1',
      subjectName: 'Mathematics Ext 1',
      topic: 'Combinatorics',
      question: 'What is the number of ways to arrange n distinct objects in a circle?',
      answer: '(n - 1)! ways, because rotation produces equivalent arrangements.',
    },
    {
      id: 'f4',
      subjectCode: 'ECON',
      subjectName: 'Economics',
      topic: 'Balance of Payments',
      question: 'What are the two main accounts in the Balance of Payments?',
      answer: '1. Current Account (Goods, Services, Primary Income, Secondary Income)\n2. Capital and Financial Account (Direct, Portfolio, Derivatives & Reserve Assets)',
    },
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Status toggle handler
  const toggleDotPointStatus = (id: string) => {
    setDotPoints((prev) =>
      prev.map((dp) => {
        if (dp.id === id) {
          const nextStatus = dp.status === 'red' ? 'yellow' : dp.status === 'yellow' ? 'green' : 'red';
          return { ...dp, status: nextStatus };
        }
        return dp;
      })
    );
  };

  // Filtered resources
  const filteredPastPapers = pastPapersList.filter((pp) => {
    if (selectedSubjectFilter === 'all') return true;
    const matchEnroll = enrolledSubjects.find((s) => s.subject_id === selectedSubjectFilter);
    return matchEnroll ? pp.subjectName.toLowerCase().includes(matchEnroll.subject?.name.toLowerCase() || '') : true;
  });

  const filteredDotPoints = dotPoints.filter((dp) => {
    if (selectedSubjectFilter === 'all') return true;
    return true;
  });

  const currentCard = flashcards[currentCardIndex % flashcards.length];

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
            Curated Year 11 & 12 exam papers, THSC trial repos, syllabus dot-points & practice quizzes.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex p-1 bg-slate-900/60 border border-indigo-950/30 rounded-2xl">
          <button
            onClick={() => setActiveTab('past_papers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'past_papers'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Past Papers Hub
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'syllabus'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Syllabus Tracker
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flashcard Quiz
          </button>
        </div>
      </div>

      {/* Enrolled Subjects Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border-indigo-950/20 mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Filter by Enrolled HSC Subject:</span>
        </div>

        <select
          value={selectedSubjectFilter}
          onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          className="px-4 py-2 bg-slate-950 border border-indigo-950/30 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Enrolled Subjects</option>
          {enrolledSubjects.map((sub) => (
            <option key={sub.id} value={sub.subject_id}>
              {sub.subject?.name} ({sub.subject?.code})
            </option>
          ))}
        </select>
      </div>

      {/* TAB 1: PAST PAPERS & STUDY LINKS */}
      {activeTab === 'past_papers' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-950/15">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <GraduationCap className="h-4.5 w-4.5 text-amber-400" />
                  <span>Year 11 & Year 12 Past Papers Repository</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Official NESA HSC Papers (Year 12) & Preliminary Exams (Year 11).
                </p>
              </div>
            </div>

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
          </div>
        </div>
      )}

      {/* TAB 2: SYLLABUS DOT-POINT TRACKER */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-950/15">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Syllabus Dot-Point Confidence Checklist</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click status badges to cycle through confidence levels: 🔴 Need Revision ➔ 🟡 Medium ➔ 🟢 Mastered.
                </p>
              </div>

              {/* Progress Summary */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  {dotPoints.filter((d) => d.status === 'green').length} Mastered
                </span>
                <span className="text-amber-400 font-bold">
                  {dotPoints.filter((d) => d.status === 'yellow').length} Medium
                </span>
                <span className="text-red-400 font-bold">
                  {dotPoints.filter((d) => d.status === 'red').length} Revision Needed
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredDotPoints.map((dp) => (
                <div
                  key={dp.id}
                  className="p-4 bg-slate-900/30 border border-indigo-950/20 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      {dp.topic}
                    </span>
                    <p className="text-xs text-slate-200">{dp.dotPoint}</p>
                  </div>

                  <button
                    onClick={() => toggleDotPointStatus(dp.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                      dp.status === 'green'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                        : dp.status === 'yellow'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                        : 'bg-red-500/15 text-red-400 border-red-500/25'
                    }`}
                  >
                    {dp.status === 'green' ? '🟢 Mastered' : dp.status === 'yellow' ? '🟡 Medium' : '🔴 Revision Needed'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE FLASHCARD QUIZ DECK */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="glass-card rounded-3xl p-8 border-indigo-950/30 text-center shadow-2xl relative min-h-[280px] flex flex-col justify-between bg-slate-950/60">
            <div>
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                  {currentCard.subjectName} • {currentCard.topic}
                </span>
                <span className="font-mono text-slate-400 text-xs">
                  Card {(currentCardIndex % flashcards.length) + 1} of {flashcards.length}
                </span>
              </div>

              <div className="py-6">
                <h3 className="text-base font-bold text-slate-100 mb-4">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-indigo-950/20">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Previous
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-600/10"
              >
                <RotateCw className="h-4 w-4" />
                <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
              </button>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
