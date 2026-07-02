'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  FileText,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  X,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfile, Subject } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'stats' | 'students' | 'subjects' | 'moderation'>('stats');

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    totalNotes: 0,
    mostPopular: [] as { name: string; count: number }[],
  });

  // Students list state
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [deleteWarningSubject, setDeleteWarningSubject] = useState<{ id: string; name: string; count: number } | null>(null);

  const [loading, setLoading] = useState(true);

  // Verification: Redirect non-admins
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [profile, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Stats counts
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: astCount } = await supabase.from('assessments').select('*', { count: 'exact', head: true });
      const { count: notesCount } = await supabase.from('notes').select('*', { count: 'exact', head: true });

      // 2. Fetch Enrolled subject mappings to compute popular
      const { data: mapping } = await supabase.from('student_subjects').select('*, subject:subjects(*)');
      const counts: Record<string, number> = {};
      mapping?.forEach((item: any) => {
        const name = item.subject?.name;
        if (name) counts[name] = (counts[name] || 0) + 1;
      });

      const sortedPopular = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalUsers: userCount || 0,
        totalAssessments: astCount || 0,
        totalNotes: notesCount || 0,
        mostPopular: sortedPopular,
      });

      // 3. Fetch Students directory
      const { data: usersList } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
        .order('full_name', { ascending: true });
      if (usersList) setStudents(usersList);

      // 4. Fetch Subjects list
      const { data: subsList } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });
      if (subsList) setSubjects(subsList);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminData();
    }
  }, [profile]);

  // Add / Edit Subject
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !subjectCode) {
      setSubjectError('Please complete all fields.');
      return;
    }

    setSubjectLoading(true);
    setSubjectError('');

    try {
      if (editingSubject) {
        // Update
        const { error } = await supabase
          .from('subjects')
          .update({ name: subjectName, code: subjectCode.toUpperCase().trim() })
          .eq('id', editingSubject.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('subjects')
          .insert({ name: subjectName, code: subjectCode.toUpperCase().trim() });

        if (error) throw error;
      }

      setSubjectName('');
      setSubjectCode('');
      setEditingSubject(null);
      setIsSubjectModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      setSubjectError(err.message || 'Error saving subject.');
    } finally {
      setSubjectLoading(false);
    }
  };

  const openEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectCode(sub.code);
    setSubjectError('');
    setIsSubjectModalOpen(true);
  };

  // Delete Subject check
  const confirmDeleteSubject = async (sub: Subject) => {
    // Check if students are enrolled
    const { count, error } = await supabase
      .from('student_subjects')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', sub.id);

    if (!error && count && count > 0) {
      setDeleteWarningSubject({ id: sub.id, name: sub.name, count });
    } else {
      if (confirm(`Are you sure you want to remove "${sub.name}"?`)) {
        await executeDeleteSubject(sub.id);
      }
    }
  };

  const executeDeleteSubject = async (id: string) => {
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (!error) {
        setDeleteWarningSubject(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Student list search filter
  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock moderation queue for V3 placeholder UI
  const mockReportedNotes = [
    {
      id: 'mock-1',
      title: 'HSC Economics Trial cheat sheet',
      author: 'John Doe',
      reports: 4,
      reason: 'Includes copyrighted teacher documents',
      date: '2026-06-05',
    },
    {
      id: 'mock-2',
      title: 'Biology Module 5 Notes',
      author: 'Jane Smith',
      reports: 2,
      reason: 'Spam contents',
      date: '2026-06-06',
    },
  ];

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md glass-card rounded-3xl p-8 text-center animate-fade-in">
          <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">
            You do not have administrative permissions to view this panel.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 bg-slate-900 border border-indigo-950/20 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
            Admin Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage subject catalogs, audit registered accounts, and verify platform statistics.
          </p>
        </div>

        {activeTab === 'subjects' && (
          <button
            onClick={() => {
              setEditingSubject(null);
              setSubjectName('');
              setSubjectCode('');
              setSubjectError('');
              setIsSubjectModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Subject</span>
          </button>
        )}
      </div>

      {/* Tab select strip */}
      <div className="flex border-b border-indigo-950/20 mb-8 overflow-x-auto select-none">
        {[
          { id: 'stats', label: 'Platform Stats' },
          { id: 'students', label: 'Registered Students' },
          { id: 'subjects', label: 'Subject Catalogue' },
          { id: 'moderation', label: 'Moderation Queue (V3)' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-semibold tracking-wider relative transition-colors cursor-pointer shrink-0 ${
                isSelected ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {isSelected && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-fade-in">
          {/* Big widgets grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Users</span>
                <span className="text-3xl font-black font-mono tracking-tight text-slate-200 mt-2 block">
                  {stats.totalUsers}
                </span>
              </div>
              <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Assessments</span>
                <span className="text-3xl font-black font-mono tracking-tight text-slate-200 mt-2 block">
                  {stats.totalAssessments}
                </span>
              </div>
              <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                <CheckSquare className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border-indigo-950/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Study Notes</span>
                <span className="text-3xl font-black font-mono tracking-tight text-slate-200 mt-2 block">
                  {stats.totalNotes}
                </span>
              </div>
              <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Popular courses */}
          <div className="glass-card rounded-3xl p-6 border-indigo-950/20 max-w-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              <span>Most Popular HSC Courses</span>
            </h3>
            
            <div className="space-y-4">
              {stats.mostPopular.map((sub, idx) => (
                <div key={sub.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500">0{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-300">{sub.name}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-mono">
                    {sub.count} enrolled
                  </span>
                </div>
              ))}
              {stats.mostPopular.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No subject enrolments logged.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENTS DIRECTORY TAB */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search bar */}
          <div className="glass-card rounded-xl p-3 max-w-md border-indigo-950/20 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 focus:outline-none placeholder-slate-650"
            />
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden border-indigo-950/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-indigo-950/25">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Name</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Year Group</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/15">
                  {filteredStudents.map((stud) => (
                    <tr key={stud.id} className="hover:bg-slate-900/10 transition-colors text-slate-300 text-xs">
                      <td className="p-4 font-bold text-slate-200">
                        {stud.full_name}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {stud.email}
                      </td>
                      <td className="p-4 font-semibold text-indigo-400">
                        {stud.year_group || 'Not on boarded'}
                      </td>
                      <td className="p-4 text-slate-500 font-mono">
                        {format(new Date(stud.created_at), 'dd MMM yyyy')}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-slate-500 italic font-medium">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBJECTS CATALOGUE TAB */}
      {activeTab === 'subjects' && (
        <div className="glass-card rounded-2xl overflow-hidden border-indigo-950/20 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-indigo-950/25">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Course Code</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject Name</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-950/15">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/10 transition-colors text-slate-300 text-xs">
                    <td className="p-4 font-mono font-bold text-indigo-400">
                      {sub.code}
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      {sub.name}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${sub.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => openEditSubject(sub)}
                          className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Edit subject"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDeleteSubject(sub)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Delete subject"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODERATION QUEUE PREVIEW TAB (V3) */}
      {activeTab === 'moderation' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/15 text-indigo-300 text-xs font-semibold rounded-2xl flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-indigo-400 shrink-0" />
            <p>
              <strong>V3 Feature Preview:</strong> Below is a preview placeholder of the content moderation queue. Students will be able to report public summaries, which flags them here for administrative review and safety removal.
            </p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border-indigo-950/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-indigo-950/25">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Reported Note Title</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Author</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Flags</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Report Reason</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/15">
                  {mockReportedNotes.map((note) => (
                    <tr key={note.id} className="text-slate-400 text-xs hover:bg-slate-900/5">
                      <td className="p-4 font-bold text-slate-300">{note.title}</td>
                      <td className="p-4">{note.author}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/10 px-2 py-0.5 rounded font-mono">
                          {note.reports} flags
                        </span>
                      </td>
                      <td className="p-4 italic text-[11px] text-slate-500">"{note.reason}"</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center select-none">
                          <button
                            disabled
                            className="px-2 py-1 bg-slate-950 text-[10px] font-bold text-slate-600 rounded border border-indigo-950/20 cursor-not-allowed"
                          >
                            Ignore
                          </button>
                          <button
                            disabled
                            className="px-2 py-1 bg-red-950/10 text-[10px] font-bold text-red-600 rounded border border-red-500/10 cursor-not-allowed"
                          >
                            Delete Note
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 md:p-8 bg-slate-900 border-indigo-950/20 relative shadow-2xl">
            <button
              onClick={() => setIsSubjectModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-100 mb-2">
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter subject catalog name and unique HSC course abbreviation code.
            </p>

            {subjectError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {subjectError}
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics Advanced"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-200 placeholder-slate-650"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. MATH_ADV"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-indigo-950/20 rounded-xl text-xs text-slate-200 placeholder-slate-655"
                  required
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-4 border-t border-indigo-950/15 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-950 border border-indigo-950/20 text-slate-400 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 border border-indigo-500/30 cursor-pointer"
                >
                  {subjectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Save Course</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLLMENT DELETION WARNING DIALOG */}
      {deleteWarningSubject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 md:p-8 bg-slate-900 border-red-500/20 relative shadow-2xl">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            
            <h2 className="text-lg font-bold text-slate-100 mb-2 text-center">
              Active Enrolments Warning
            </h2>
            <p className="text-xs text-slate-400 mb-6 text-center leading-relaxed">
              There are currently <strong className="text-red-400 font-bold">{deleteWarningSubject.count} students</strong> enrolled in <strong className="text-slate-200 font-bold">"{deleteWarningSubject.name}"</strong>. Removing this subject will automatically unenroll them and delete their associated grades!
            </p>

            <div className="flex gap-3 justify-center select-none mt-6">
              <button
                type="button"
                onClick={() => setDeleteWarningSubject(null)}
                className="px-4 py-2 bg-slate-950 border border-indigo-950/20 text-slate-400 text-xs rounded-xl cursor-pointer font-semibold"
              >
                Cancel Deletion
              </button>
              <button
                type="button"
                onClick={() => executeDeleteSubject(deleteWarningSubject.id)}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl border border-red-500/30 cursor-pointer"
              >
                Confirm Delete (Force Unenrol)
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
