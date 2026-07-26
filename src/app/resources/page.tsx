'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  RotateCw,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';

type TabType = 'syllabus' | 'past_papers' | 'flashcards';

interface DotPoint {
  id: string;
  topic: string;
  dotPoint: string;
  status: 'red' | 'yellow' | 'green';
}

interface Flashcard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  topic: string;
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('syllabus');

  // Syllabus tracker state
  const [dotPoints, setDotPoints] = useState<DotPoint[]>([
    { id: '1', topic: 'Calculus & Integration', dotPoint: 'Evaluate definite integrals using standard antiderivatives and substitution.', status: 'green' },
    { id: '2', topic: 'Calculus & Integration', dotPoint: 'Derive volumes of solids of revolution about the x-axis and y-axis.', status: 'yellow' },
    { id: '3', topic: 'Organic Chemistry', dotPoint: 'Analyze reaction pathways for primary, secondary and tertiary alcohols.', status: 'red' },
    { id: '4', topic: 'Organic Chemistry', dotPoint: 'Identify NMR & IR spectroscopy absorption bands for carboxylic acids.', status: 'yellow' },
    { id: '5', topic: 'Electromagnetism', dotPoint: 'Apply Lenz’s law and Faraday’s law to calculate induced EMF in moving conductors.', status: 'green' },
    { id: '6', topic: 'Economics', dotPoint: 'Evaluate macroeconomic policies used by the RBA to target 2-3% inflation.', status: 'green' },
  ]);

  // Flashcards deck
  const [flashcards] = useState<Flashcard[]>([
    {
      id: 'f1',
      subject: 'Chemistry',
      topic: 'Equilibrium',
      question: 'What happens to the position of equilibrium in an exothermic reaction when temperature is increased?',
      answer: 'According to Le Chatelier’s principle, increasing temperature shifts the equilibrium in the endothermic direction (reverse reaction, to absorb excess heat).',
    },
    {
      id: 'f2',
      subject: 'Physics',
      topic: 'Special Relativity',
      question: 'State Einstein’s two postulates of Special Relativity.',
      answer: '1. The laws of physics are the same in all inertial reference frames.\n2. The speed of light in a vacuum (c) is constant for all observers, regardless of the motion of the source or observer.',
    },
    {
      id: 'f3',
      subject: 'Mathematics Ext 1',
      topic: 'Combinatorics',
      question: 'What is the number of ways to arrange n distinct objects in a circle?',
      answer: '(n - 1)! ways, because rotation produces equivalent arrangements.',
    },
    {
      id: 'f4',
      subject: 'Economics',
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

  const currentCard = flashcards[currentCardIndex];

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
              HSC Resource Vault & Practice Hub
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Syllabus dot-point confidence checklists, past paper links, and interactive revision flashcard decks.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex p-1 bg-slate-900/60 border border-indigo-950/30 rounded-2xl">
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

      {/* TAB 1: SYLLABUS DOT-POINT TRACKER */}
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
              {dotPoints.map((dp) => (
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

      {/* TAB 2: PAST PAPERS HUB */}
      {activeTab === 'past_papers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <h3 className="text-sm font-bold text-slate-200 mb-2">NESA HSC Exam Papers Portal</h3>
            <p className="text-xs text-slate-400 mb-4">
              Direct access links to official NESA past HSC exam papers, sample answers, and marking guidelines.
            </p>
            <div className="space-y-3">
              {[
                { title: 'Mathematics Advanced & Ext 1 Papers', year: '2020 - 2025', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
                { title: 'Physics & Chemistry HSC Papers', year: '2020 - 2025', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
                { title: 'English Advanced Paper 1 & 2', year: '2020 - 2025', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
                { title: 'Economics & Business Studies Papers', year: '2020 - 2025', url: 'https://www.nsw.gov.au/nesa/hsc/hsc-exam-papers' },
              ].map((paper, idx) => (
                <a
                  key={idx}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-900/30 hover:bg-slate-900/50 border border-indigo-950/20 rounded-2xl flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {paper.title}
                    </h4>
                    <span className="text-[10px] text-slate-500">Includes solutions & marking criteria ({paper.year})</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
            <h3 className="text-sm font-bold text-slate-200 mb-2">Formula & Data Sheet Downloads</h3>
            <p className="text-xs text-slate-400 mb-4">
              Essential reference sheets allowed in official NESA examination rooms.
            </p>
            <div className="space-y-3">
              {[
                { title: 'HSC Mathematics Reference Sheet', info: 'Standard, Advanced, Extension 1 & 2 calculus formulas' },
                { title: 'HSC Chemistry Data Sheet & Periodic Table', info: 'Standard reduction potentials & infrared spectra' },
                { title: 'HSC Physics Reference Sheet & Constants', info: 'Physical constants and formula equations' },
              ].map((sheet, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900/30 border border-indigo-950/20 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{sheet.title}</h4>
                    <span className="text-[10px] text-slate-500">{sheet.info}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-1 rounded-lg">PDF</span>
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
                  {currentCard.subject} • {currentCard.topic}
                </span>
                <span className="font-mono text-slate-400 text-xs">
                  Card {currentCardIndex + 1} of {flashcards.length}
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
