import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';
import { createServiceSupabase } from '@/lib/supabaseServer';

// -------------------------------------------------------------------------
// POST /api/ai/parse-note
// Body: { noteId: string, content: string }
//
// Calls Gemini to:
//   1. Extract 3-bullet key takeaways
//   2. Pull out key terms & formulas
//   3. Map to NESA syllabus dot-points (heuristic tagging)
//   4. Generate 3 flashcards (Q&A pairs)
//
// Stores results in ai_note_metadata table.
// -------------------------------------------------------------------------

const PARSE_PROMPT = (content: string) => `
You are an expert NSW HSC tutor. Analyse the following student study note and return a structured JSON response.

STUDY NOTE:
"""
${content.slice(0, 8000)}
"""

Return ONLY valid JSON (no markdown, no explanation) in this exact shape:
{
  "summary_bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "key_terms": ["term1", "term2", "term3"],
  "key_formulas": ["formula1", "formula2"],
  "auto_dot_point_ids": ["syllabus tag 1", "syllabus tag 2"],
  "generated_flashcards": [
    { "question": "Q1", "answer": "A1" },
    { "question": "Q2", "answer": "A2" },
    { "question": "Q3", "answer": "A3" }
  ]
}

Rules:
- summary_bullets: Exactly 3 concise HSC-focused dot points.
- key_terms: Up to 5 technical terms a student should memorise.
- key_formulas: Up to 4 formulas, equations, or key quotes. Empty array if none.
- auto_dot_point_ids: NESA syllabus module tags in format "Subject Module: Topic" (e.g. "Chemistry Module 5: Equilibrium"). Up to 3.
- generated_flashcards: Exactly 3 Q&A flashcard pairs.
`;

export async function POST(req: NextRequest) {
  try {
    const { noteId, content } = await req.json();

    if (!noteId || !content) {
      return NextResponse.json({ error: 'noteId and content are required.' }, { status: 400 });
    }

    const model = getGeminiModel();
    if (!model) {
      return NextResponse.json(
        { error: 'AI parsing is not available. GEMINI_API_KEY is not configured.' },
        { status: 503 }
      );
    }

    // Call Gemini
    const result = await model.generateContent(PARSE_PROMPT(content));
    const raw = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Persist to Supabase
    const supabase = createServiceSupabase();
    const { error: upsertError } = await supabase
      .from('ai_note_metadata')
      .upsert({
        note_id: noteId,
        summary_bullets: parsed.summary_bullets ?? [],
        key_terms: parsed.key_terms ?? [],
        key_formulas: parsed.key_formulas ?? [],
        auto_dot_point_ids: parsed.auto_dot_point_ids ?? [],
        generated_flashcards: parsed.generated_flashcards ?? [],
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('[parse-note] Supabase upsert error:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, metadata: parsed });
  } catch (err: any) {
    console.error('[parse-note] Error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
  }
}
