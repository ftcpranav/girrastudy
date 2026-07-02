'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Filter,
  Plus,
  Pin,
  Trash2,
  Edit2,
  FileText,
  Link as LinkIcon,
  PlayCircle,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Sparkles,
  X,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { Note, StudentSubject, Subject } from '@/lib/types';
import { format } from 'date-fns';
import AddNoteModal from '@/components/dashboard/AddNoteModal';

export default function NotesPage() {
  const { user, enrolledSubjects } = useAuth();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Data states
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');

  // Editing form states (pre-filled on edit click)
  const [editTitle, setEditTitle] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editTextbookTitle, setEditTextbookTitle] = useState('');
  const [editTextbookChapter, setEditTextbookChapter] = useState('');
  const [editTextbookPage, setEditTextbookPage] = useState('');
  const editEditorRef = useRef<HTMLDivElement>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchNotes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*, subject:subjects(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotes(data);
      }

      const { data: subsData } = await supabase.from('subjects').select('*');
      if (subsData) setSubjectsList(subsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  // Handle Pin / Unpin
  const handleTogglePin = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', note.id);

      if (!error) {
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Deletion
  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (!error) {
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-fill Edit form
  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditSubjectId(note.subject_id);
    setEditTopic(note.topic);
    setEditUrl(note.url || '');
    setEditTextbookTitle(note.textbook_title || '');
    setEditTextbookChapter(note.textbook_chapter || '');
    setEditTextbookPage(note.textbook_page || '');
    setEditError('');

    // Wait for modal render to populate contenteditable
    setTimeout(() => {
      if (editEditorRef.current && note.content_text) {
        editEditorRef.current.innerHTML = note.content_text;
      }
    }, 100);
  };

  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editEditorRef.current) {
      editEditorRef.current.focus();
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingNote) return;

    setEditLoading(true);
    setEditError('');

    try {
      let finalContent = '';
      if (editingNote.note_type === 'typed' && editEditorRef.current) {
        finalContent = editEditorRef.current.innerHTML;
      }

      const { error } = await supabase
        .from('notes')
        .update({
          title: editTitle,
          subject_id: editSubjectId,
          topic: editTopic.replace('#', '').trim(),
          url: editingNote.note_type !== 'typed' && editingNote.note_type !== 'textbook' ? editUrl : null,
          content_text: editingNote.note_type === 'typed' ? finalContent : null,
          textbook_title: editingNote.note_type === 'textbook' ? editTextbookTitle : null,
          textbook_chapter: editingNote.note_type === 'textbook' ? editTextbookChapter : null,
          textbook_page: editingNote.note_type === 'textbook' ? editTextbookPage : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingNote.id);

      if (error) {
        setEditError(error.message);
      } else {
        setEditingNote(null);
        fetchNotes();
      }
    } catch (err: any) {
      setEditError(err.message || 'Error updating note.');
    } finally {
      setEditLoading(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject ? note.subject_id === filterSubject : true;
    const matchesType = filterType ? note.note_type === filterType : true;
    return matchesSearch && matchesSubject && matchesType;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const regularNotes = filteredNotes.filter((n) => !n.is_pinned);

  // Return icons based on type
  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'google_doc': return <FileCheck className="h-5 w-5 text-blue-400" />;
      case 'google_drive': return <LinkIcon className="h-5 w-5 text-blue-300" />;
      case 'youtube': return <PlayCircle className="h-5 w-5 text-red-400" />;
      case 'website': return <ExternalLink className="h-5 w-5 text-cyan-400" />;
      case 'textbook': return <BookOpen className="h-5 w-5 text-amber-400" />;
      default: return <FileText className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <AppLayout>
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
            Private Notes Library
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Store summaries, references, YouTube revision videos, and Google documents securely.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg border border-violet-500/35 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Study Note</span>
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="glass-card rounded-2xl p-4 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-indigo-950/20">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes by title or #topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        {/* Subject select */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3.5 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Subjects</option>
          {enrolledSubjects.map((sub) => (
            <option key={sub.id} value={sub.subject_id}>
              {sub.subject?.name}
            </option>
          ))}
        </select>

        {/* Note format select */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3.5 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Formats</option>
          <option value="typed">Rich Text</option>
          <option value="google_doc">Google Doc Link</option>
          <option value="google_drive">Google Drive Link</option>
          <option value="youtube">YouTube Video</option>
          <option value="website">Website Link</option>
          <option value="textbook">Textbook Reference</option>
        </select>
      </div>

      {/* NOTES CARDS GRID */}
      <div className="space-y-8">
        
        {/* 1. PINNED NOTES */}
        {pinnedNotes.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Pin className="h-4.5 w-4.5 rotate-45 text-violet-400 fill-violet-400" />
              <span>Pinned Notes ({pinnedNotes.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  enrolledSubjects={enrolledSubjects}
                  onPin={handleTogglePin}
                  onEdit={openEditModal}
                  onDelete={handleDeleteNote}
                  getNoteIcon={getNoteIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. REGULAR NOTES */}
        <div>
          {pinnedNotes.length > 0 && (
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              All Notes ({regularNotes.length})
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                enrolledSubjects={enrolledSubjects}
                onPin={handleTogglePin}
                onEdit={openEditModal}
                onDelete={handleDeleteNote}
                getNoteIcon={getNoteIcon}
              />
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-16 bg-slate-900/10 border border-indigo-950/20 rounded-3xl">
              <p className="text-sm text-slate-500 italic">
                {loading ? 'Loading library...' : 'No study notes found.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NOTE MODAL */}
      <AddNoteModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchNotes}
        subjects={enrolledSubjects}
      />

      {/* EDIT NOTE MODAL */}
      {editingNote && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 md:p-8 bg-slate-900 border-indigo-950/20 relative animate-fade-in shadow-2xl max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setEditingNote(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-100 mb-2">Edit Note</h2>
            <p className="text-slate-400 text-xs mb-6">Modify note content and details.</p>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Note Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Subject *</label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm text-slate-200"
                    required
                  >
                    {enrolledSubjects.map((sub) => (
                      <option key={sub.id} value={sub.subject_id}>
                        {sub.subject?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Topic Tag *</label>
                  <input
                    type="text"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm text-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Editors */}
              {editingNote.note_type !== 'typed' && editingNote.note_type !== 'textbook' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Resource URL *</label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm text-slate-200 font-mono text-xs"
                    required
                  />
                </div>
              )}

              {editingNote.note_type === 'textbook' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Textbook Title *</label>
                    <input
                      type="text"
                      value={editTextbookTitle}
                      onChange={(e) => setEditTextbookTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm text-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Chapter</label>
                    <input
                      type="text"
                      value={editTextbookChapter}
                      onChange={(e) => setEditTextbookChapter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Page</label>
                    <input
                      type="text"
                      value={editTextbookPage}
                      onChange={(e) => setEditTextbookPage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm text-slate-200"
                    />
                  </div>
                </div>
              )}

              {editingNote.note_type === 'typed' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Note Content (Rich Text)</label>
                  <div className="border border-indigo-950/30 rounded-xl overflow-hidden bg-slate-950 flex flex-col focus-within:border-violet-500/50">
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 border-b border-indigo-950/20">
                      <button type="button" onClick={() => formatText('bold')} className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:bg-slate-900 rounded cursor-pointer">B</button>
                      <button type="button" onClick={() => formatText('italic')} className="px-2.5 py-1 text-xs italic text-slate-400 hover:bg-slate-900 rounded cursor-pointer">I</button>
                      <button type="button" onClick={() => formatText('formatBlock', '<h1>')} className="px-2 py-1 text-xs font-extrabold text-slate-400 hover:bg-slate-900 rounded cursor-pointer">H1</button>
                      <button type="button" onClick={() => formatText('formatBlock', '<h2>')} className="px-2 py-1 text-xs font-extrabold text-slate-400 hover:bg-slate-900 rounded cursor-pointer">H2</button>
                      <button type="button" onClick={() => formatText('insertUnorderedList')} className="px-2 py-1 text-xs text-slate-400 hover:bg-slate-900 rounded cursor-pointer">• List</button>
                    </div>
                    <div
                      ref={editEditorRef}
                      contentEditable
                      className="min-h-[160px] p-4 text-sm outline-none text-slate-300 bg-slate-950/30"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-indigo-950/15">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 bg-slate-950 border border-indigo-950/20 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update Note</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// Subcomponent: NoteCard representation
function NoteCard({
  note,
  enrolledSubjects,
  onPin,
  onEdit,
  onDelete,
  getNoteIcon,
}: {
  note: Note;
  enrolledSubjects: StudentSubject[];
  onPin: (n: Note) => void;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  getNoteIcon: (t: string) => React.ReactNode;
}) {
  const subEnroll = enrolledSubjects.find((s) => s.subject_id === note.subject_id);

  return (
    <div className="glass-card hover:bg-slate-900/10 border border-indigo-950/20 p-5 rounded-2xl flex flex-col justify-between relative group shadow-lg">
      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-slate-950 border border-indigo-950/20 rounded-xl shrink-0">
              {getNoteIcon(note.note_type)}
            </div>
            <div className="truncate">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">
                {note.subject?.name}
              </span>
              <span className="text-[10px] text-violet-400 font-semibold leading-none">
                #{note.topic}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onPin(note)}
              className={`p-1.5 rounded-lg border border-transparent transition-all cursor-pointer ${
                note.is_pinned
                  ? 'bg-violet-600/15 border-violet-500/20 text-violet-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
              title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin className={`h-3.5 w-3.5 ${note.is_pinned ? 'rotate-45 fill-violet-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs font-bold text-slate-200 leading-snug mb-3">
          {note.title}
        </h3>

        {/* Content Preview based on Note format */}
        {note.note_type === 'typed' && note.content_text && (
          <div
            className="text-[11px] text-slate-500 line-clamp-3 mb-4 leading-normal bg-slate-950/20 p-2.5 rounded-xl border border-indigo-950/10 prose prose-invert max-w-none font-sans"
            dangerouslySetInnerHTML={{ __html: note.content_text }}
          />
        )}

        {note.note_type === 'textbook' && (
          <div className="text-[11px] bg-slate-950/20 p-2.5 rounded-xl border border-indigo-950/10 mb-4 space-y-0.5">
            <p className="text-slate-400 font-bold">
              Book: <span className="font-normal text-slate-300">{note.textbook_title}</span>
            </p>
            {note.textbook_chapter && (
              <p className="text-slate-400 font-bold">
                Chapter: <span className="font-normal text-slate-300">{note.textbook_chapter}</span>
              </p>
            )}
            {note.textbook_page && (
              <p className="text-slate-400 font-bold">
                Page Reference: <span className="font-normal text-slate-300 font-mono">{note.textbook_page}</span>
              </p>
            )}
          </div>
        )}

        {note.note_type !== 'typed' && note.note_type !== 'textbook' && note.url && (
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] flex items-center justify-between gap-1.5 text-violet-400 hover:text-violet-300 bg-violet-600/5 hover:bg-violet-600/10 px-3 py-2 border border-violet-500/10 rounded-xl mb-4 font-mono transition-colors text-left"
          >
            <span className="truncate max-w-[170px]">{note.url}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          </a>
        )}
      </div>

      {/* Footer operations */}
      <div className="flex items-center justify-between pt-3.5 border-t border-indigo-950/10 text-[10px] text-slate-500">
        <span>Added {format(new Date(note.created_at), 'dd MMM yyyy')}</span>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1 text-slate-400 hover:text-violet-400 hover:bg-slate-900 rounded transition-colors cursor-pointer"
            title="Edit Note"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded transition-colors cursor-pointer"
            title="Delete Note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
