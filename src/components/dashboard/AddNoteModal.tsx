'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { X, Loader2, FileText, Link as LinkIcon, PlayCircle, BookOpen, FileCheck, Users, Sparkles } from 'lucide-react';
import { StudentSubject } from '@/lib/types';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects: StudentSubject[];
}

type NoteType = 'google_doc' | 'google_drive' | 'youtube' | 'website' | 'typed' | 'textbook';

export default function AddNoteModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
}: AddNoteModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('typed');

  // Input states depending on type
  const [url, setUrl] = useState('');
  const [textbookTitle, setTextbookTitle] = useState('');
  const [textbookChapter, setTextbookChapter] = useState('');
  const [textbookPage, setTextbookPage] = useState('');

  // Rich Text Editor states
  const editorRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);

  if (!isOpen) return null;

  // Format Helper for the WYSIWYG Rich Editor
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title || !subjectId || !topic || !noteType) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let finalUrl = url;
      let finalContent = '';
      let tbTitle = '';
      let tbChapter = '';
      let tbPage = '';

      if (noteType === 'typed' && editorRef.current) {
        finalContent = editorRef.current.innerHTML;
        if (finalContent === '<br>' || finalContent === '') {
          setErrorMsg('Please enter some text in your note.');
          setLoading(false);
          return;
        }
      } else if (noteType === 'textbook') {
        tbTitle = textbookTitle;
        tbChapter = textbookChapter;
        tbPage = textbookPage;
      } else {
        if (!url) {
          setErrorMsg('Please enter a valid URL.');
          setLoading(false);
          return;
        }
      }

      const { data: insertedNote, error } = await supabase.from('notes').insert({
        user_id: user.id,
        subject_id: subjectId,
        title,
        topic: topic.replace('#', '').trim(),
        note_type: noteType,
        content_text: finalContent || null,
        url: finalUrl || null,
        textbook_title: tbTitle || null,
        textbook_chapter: tbChapter || null,
        textbook_page: tbPage || null,
        is_pinned: false,
        is_public: isPublic,
      }).select().single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        // If public and has text content, kick off AI parsing in background
        if (isPublic && insertedNote && (finalContent || finalUrl)) {
          setAiParsing(true);
          const parseContent = finalContent || `Title: ${title}\nTopic: ${topic}\nURL: ${finalUrl}`;
          try {
            await fetch('/api/ai/parse-note', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ noteId: insertedNote.id, content: parseContent }),
            });
          } catch (_) {
            // AI parse failure is non-blocking — note still saved successfully
          } finally {
            setAiParsing(false);
          }
        }

        onSuccess();
        // Reset states
        setTitle('');
        setSubjectId('');
        setTopic('');
        setNoteType('typed');
        setUrl('');
        setTextbookTitle('');
        setTextbookChapter('');
        setTextbookPage('');
        setIsPublic(false);
        if (editorRef.current) editorRef.current.innerHTML = '';
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-card rounded-3xl p-6 md:p-8 animate-fade-in shadow-2xl relative bg-slate-900 border-indigo-950/20 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-2">Create Note</h2>
        <p className="text-slate-400 text-xs mb-6">
          Add a study resource, textbook reference, shared Google document link, or write a typed rich note.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Note Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Note Title *</label>
            <input
              type="text"
              placeholder="e.g. Chapter 4: Photosynthesis Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 transition-all"
                required
              >
                <option value="" disabled>Choose Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.subject_id} className="bg-slate-950">
                    {sub.subject?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Tag */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Topic Tag (Free Text) *</label>
              <input
                type="text"
                placeholder="e.g. Organic Chemistry, Waves"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Note Type Selector Tiles */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Note Format *</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'typed', label: 'Rich Text', icon: FileText },
                { id: 'google_doc', label: 'G-Doc', icon: FileCheck },
                { id: 'google_drive', label: 'G-Drive', icon: LinkIcon },
                { id: 'youtube', label: 'YouTube', icon: PlayCircle },
                { id: 'website', label: 'Link', icon: LinkIcon },
                { id: 'textbook', label: 'Textbook', icon: BookOpen },
              ].map((item) => {
                const isSelected = noteType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setNoteType(item.id as NoteType);
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/15 border-violet-500 text-slate-100 shadow-md shadow-violet-500/5'
                        : 'bg-slate-950 border-indigo-950/25 text-slate-400 hover:border-indigo-850/40 hover:text-slate-200'
                    }`}
                  >
                    <item.icon className={`h-4.5 w-4.5 mb-1.5 ${isSelected ? 'text-violet-400' : 'text-slate-500'}`} />
                    <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC FIELD MODULE */}

          {/* 1. Links (Google Doc, Google Drive, YouTube, website) */}
          {noteType !== 'typed' && noteType !== 'textbook' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Paste Resource URL *</label>
              <input
                type="url"
                placeholder={
                  noteType === 'google_doc'
                    ? 'https://docs.google.com/document/d/...'
                    : noteType === 'google_drive'
                    ? 'https://drive.google.com/file/d/...'
                    : noteType === 'youtube'
                    ? 'https://youtube.com/watch?v=...'
                    : 'https://example.com/study-guide'
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-700 transition-all font-mono text-xs"
                required
              />
            </div>
          )}

          {/* 2. Textbook Reference Fields */}
          {noteType === 'textbook' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Textbook Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Pearson Physics 12"
                  value={textbookTitle}
                  onChange={(e) => setTextbookTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Chapter</label>
                <input
                  type="text"
                  placeholder="e.g. Ch 5: Electromagnetism"
                  value={textbookChapter}
                  onChange={(e) => setTextbookChapter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Page / Range</label>
                <input
                  type="text"
                  placeholder="e.g. pp. 192-205"
                  value={textbookPage}
                  onChange={(e) => setTextbookPage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                />
              </div>
            </div>
          )}

          {/* 3. WYSIWYG Rich Text Editor for Typed Notes */}
          {noteType === 'typed' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Note Content (Rich Text) *</label>
              
              {/* WYSIWYG Editor Container */}
              <div className="border border-indigo-950/30 rounded-xl overflow-hidden bg-slate-950 flex flex-col focus-within:border-violet-500/50 transition-colors">
                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 border-b border-indigo-950/20 select-none">
                  <button
                    type="button"
                    onClick={() => formatText('bold')}
                    className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded cursor-pointer"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('italic')}
                    className="px-2.5 py-1 text-xs italic text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded cursor-pointer"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('formatBlock', '<h1>')}
                    className="px-2 py-1 text-xs font-extrabold text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded cursor-pointer"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('formatBlock', '<h2>')}
                    className="px-2 py-1 text-xs font-extrabold text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded cursor-pointer"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText('insertUnorderedList')}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded cursor-pointer"
                    title="Bullet List"
                  >
                    • List
                  </button>
                </div>

                {/* Editable Sandbox Area */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[160px] max-h-[300px] overflow-y-auto p-4 text-sm outline-none text-slate-300 placeholder:text-slate-700 bg-slate-950/30"
                  style={{ wordBreak: 'break-word' }}
                />
              </div>
            </div>
          )}

          {/* Share with Community Toggle */}
          <div
            className={`rounded-2xl p-4 border transition-all ${
              isPublic
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${isPublic ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Share with GirraStudy Community</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your note will appear in the Community Hub. AI will automatically extract key takeaways, terms, and flashcards.
                  </p>
                  {isPublic && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400">AI note parsing will run automatically after saving</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic((v) => !v)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  isPublic ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-indigo-950/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-indigo-950/20 rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || aiParsing}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl transition-all border border-emerald-500/35 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Saving…</span></>
              ) : aiParsing ? (
                <><Sparkles className="h-4 w-4 animate-pulse" /><span>AI Parsing…</span></>
              ) : (
                <><FileText className="h-4 w-4" /><span>Save Note{isPublic ? ' & Share' : ''}</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
