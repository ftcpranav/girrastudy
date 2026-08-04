import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabaseServer';

// -------------------------------------------------------------------------
// POST /api/notes/upvote  — upvote a public note
// Body: { noteId: string, userId: string }
//
// DELETE /api/notes/upvote — remove upvote
// Body: { noteId: string, userId: string }
// -------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const { noteId, userId } = await req.json();
    if (!noteId || !userId) {
      return NextResponse.json({ error: 'noteId and userId are required.' }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    const { error } = await supabase
      .from('note_upvotes')
      .insert({ note_id: noteId, user_id: userId });

    if (error) {
      // Unique constraint: already upvoted — treat as success
      if (error.code === '23505') {
        return NextResponse.json({ success: true, alreadyUpvoted: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { noteId, userId } = await req.json();
    if (!noteId || !userId) {
      return NextResponse.json({ error: 'noteId and userId are required.' }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    const { error } = await supabase
      .from('note_upvotes')
      .delete()
      .eq('note_id', noteId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
