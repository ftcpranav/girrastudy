import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabaseServer';

// -------------------------------------------------------------------------
// POST /api/notes/save-community  — save a shared note to personal vault
// Body: { noteId: string, userId: string }
//
// DELETE /api/notes/save-community — unsave
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
      .from('saved_community_notes')
      .insert({ note_id: noteId, user_id: userId });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true, alreadySaved: true });
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
      .from('saved_community_notes')
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
