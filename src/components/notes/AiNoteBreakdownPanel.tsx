'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  FlaskConical,
  Tag,
  Brain,
} from 'lucide-react';
import type { AiNoteMetadata } from '@/hooks/useCommunityHub';

interface AiNoteBreakdownPanelProps {
  metadata: AiNoteMetadata;
}

/**
 * Displays the AI-parsed breakdown of a note:
 * bullet summaries, key terms, formulas, dot-point tags, and flashcards.
 */
export default function AiNoteBreakdownPanel({ metadata }: AiNoteBreakdownPanelProps) {
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (i: number) =>
    setFlippedCards((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="mt-4 space-y-4 border-t border-emerald-500/15 pt-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">AI Note Breakdown</span>
      </div>

      {/* Key Takeaways */}
      {metadata.summary_bullets.length > 0 && (
        <div className="rounded-xl bg-slate-900/60 border border-emerald-500/15 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            Key Takeaways
          </div>
          <ul className="space-y-1.5">
            {metadata.summary_bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Terms & Formulas Row */}
      <div className="grid grid-cols-2 gap-3">
        {metadata.key_terms.length > 0 && (
          <div className="rounded-xl bg-slate-900/60 border border-amber-500/15 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400/80 uppercase mb-2">
              <Lightbulb className="h-3.5 w-3.5" />
              Key Terms
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metadata.key_terms.map((term, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {metadata.key_formulas.length > 0 && (
          <div className="rounded-xl bg-slate-900/60 border border-violet-500/15 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-400/80 uppercase mb-2">
              <FlaskConical className="h-3.5 w-3.5" />
              Formulas
            </div>
            <div className="space-y-1">
              {metadata.key_formulas.map((f, i) => (
                <p key={i} className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-2 py-1 rounded-lg">
                  {f}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Syllabus Dot-Point Tags */}
      {metadata.auto_dot_point_ids.length > 0 && (
        <div className="flex items-start gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
          {metadata.auto_dot_point_ids.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Flashcards toggle */}
      {metadata.generated_flashcards.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowFlashcards((v) => !v)}
            className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <Brain className="h-3.5 w-3.5" />
            {showFlashcards ? 'Hide' : 'View'} {metadata.generated_flashcards.length} AI Flashcards
            {showFlashcards ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showFlashcards && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {metadata.generated_flashcards.map((card, i) => (
                <div
                  key={i}
                  onClick={() => toggleFlip(i)}
                  className="cursor-pointer rounded-xl p-4 border border-emerald-500/20 bg-slate-900/60 min-h-[80px] flex items-center justify-center text-center transition-all hover:border-emerald-500/40"
                >
                  {flippedCards[i] ? (
                    <p className="text-xs text-emerald-300 font-semibold">{card.answer}</p>
                  ) : (
                    <p className="text-xs text-slate-300">{card.question}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
