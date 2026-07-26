'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  BookOpen,
  Target,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject } from '@/lib/types';

const FALLBACK_SUBJECTS: Subject[] = [
  { id: 'sub-eng-adv', name: 'English Advanced', code: 'ENG_ADV', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-eng-std', name: 'English Standard', code: 'ENG_STD', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-eng-ext1', name: 'English Extension 1', code: 'ENG_EXT1', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-eng-ext2', name: 'English Extension 2', code: 'ENG_EXT2', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-math-adv', name: 'Mathematics Advanced', code: 'MATH_ADV', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-math-ext1', name: 'Mathematics Extension 1', code: 'MATH_EXT1', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-math-ext2', name: 'Mathematics Extension 2', code: 'MATH_EXT2', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-chem', name: 'Chemistry', code: 'CHEM', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-phys', name: 'Physics', code: 'PHYS', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-biol', name: 'Biology', code: 'BIOL', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-econ', name: 'Economics', code: 'ECON', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-buss', name: 'Business Studies', code: 'BUSS', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-legl', name: 'Legal Studies', code: 'LEGL', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-hist-mod', name: 'Modern History', code: 'HIST_MOD', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-hist-anc', name: 'Ancient History', code: 'HIST_ANC', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-soft-eng', name: 'Software Engineering', code: 'SOFT_ENG', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-eng-stud', name: 'Engineering Studies', code: 'ENG_STUD', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-ipt', name: 'Information Processes & Technology', code: 'IPT', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-pdhpe', name: 'PDHPE', code: 'PDHPE', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-sor', name: 'Studies of Religion', code: 'SOR', is_active: true, created_at: new Date().toISOString() },
];

export default function OnboardingPage() {
  const { user, profile, enrolledSubjects, refreshProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState<string>('');

  // Step 1 states (User creation / verification)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [yearGroup, setYearGroup] = useState<'Year 11' | 'Year 12' | ''>('');

  // Step 2 states (Predefined subjects)
  const [subjectsList, setSubjectsList] = useState<Subject[]>(FALLBACK_SUBJECTS);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Step 3 states (Study preferences)
  const preferencesOptions = [
    { id: 'assessment', label: 'Assessment tracking', desc: 'Deadlines, reminders, and status cards' },
    { id: 'mark', label: 'Mark monitoring', desc: 'Average grade logs, progression, and ATAR indicator' },
    { id: 'note', label: 'Note organisation', desc: 'Private notes folders, tags, and document links' },
    { id: 'planning', label: 'Study planning', desc: 'Revision timelines and calendar lists' },
  ];
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // If user is already logged in but has incomplete profile, bypass step 1
  useEffect(() => {
    if (user && profile) {
      if (profile.full_name && profile.full_name !== 'Student') {
        setFullName(profile.full_name);
      }
      if (profile.year_group) {
        setYearGroup(profile.year_group);
      }
      // If user exists, go straight to Step 2
      if (step === 1) {
        setStep(2);
      }
    }
  }, [user, profile]);

  // Load subject list from Supabase with instant fallback
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          setSubjectsList(data);
        } else {
          setSubjectsList(FALLBACK_SUBJECTS);
        }
      } catch (e) {
        setSubjectsList(FALLBACK_SUBJECTS);
      }
    };
    fetchSubjects();
  }, []);

  // Run confetti on Step 4
  useEffect(() => {
    if (step === 4) {
      // Explode confetti!
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#8b5cf6', '#6366f1', '#a78bfa'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#6366f1', '#a78bfa'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [step]);

  // Step 1: Sign up user
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !yearGroup) {
      setErrorMsg('Please complete all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (userId) {
        setRegisteredUserId(userId);
        
        // Force-update the public profile fields
        const { error: profileError } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            year_group: yearGroup,
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Try automatic sign in immediately so session is active
        await supabase.auth.signInWithPassword({ email, password });
      }

      await refreshProfile();
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Enrol Subjects
  const handleEnrolSubjects = async () => {
    if (selectedSubjects.length < 2 || selectedSubjects.length > 6) {
      setErrorMsg('Please select between 2 and 6 subjects.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const currentUserId = user?.id || profile?.id || registeredUserId;
      if (!currentUserId) {
        setErrorMsg('Please complete Step 1 to create your student account first.');
        setStep(1);
        setLoading(false);
        return;
      }

      // 1. Delete any existing student subject joins
      await supabase
        .from('student_subjects')
        .delete()
        .eq('user_id', currentUserId);

      // Harmonious subject color array
      const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

      // Fetch DB subjects to match real UUIDs if available
      const { data: dbSubjects } = await supabase.from('subjects').select('id, code, name');
      
      const resolveSubjectId = (subIdOrCode: string) => {
        const localSub = subjectsList.find((s) => s.id === subIdOrCode);
        if (dbSubjects && dbSubjects.length > 0 && localSub) {
          const matchedDbSub = dbSubjects.find(
            (d: any) => d.code === localSub.code || d.name === localSub.name || d.id === localSub.id
          );
          if (matchedDbSub) return matchedDbSub.id;
        }
        return subIdOrCode;
      };

      // 2. Insert selected subjects
      const subjectInserts = selectedSubjects.map((subId, index) => ({
        user_id: currentUserId,
        subject_id: resolveSubjectId(subId),
        color_hex: colors[index % colors.length],
      }));

      const { error } = await supabase
        .from('student_subjects')
        .insert(subjectInserts);

      if (error) {
        setErrorMsg(error.message);
      } else {
        await refreshProfile();
        setStep(3);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error enrolling subjects.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Study Preferences
  const handleSavePreferences = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const currentUserId = user?.id || profile?.id;
      if (!currentUserId) throw new Error('No user session.');

      const { error } = await supabase
        .from('users')
        .update({
          preferences_json: {
            study_focus: selectedPreferences,
          },
        })
        .eq('id', currentUserId);

      if (error) {
        setErrorMsg(error.message);
      } else {
        await refreshProfile();
        setStep(4);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving preferences.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle subject selection
  const toggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subId));
    } else {
      if (selectedSubjects.length >= 6) {
        setErrorMsg('You can choose a maximum of 6 subjects.');
        return;
      }
      setErrorMsg('');
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  // Toggle preference selection
  const togglePreference = (prefId: string) => {
    if (selectedPreferences.includes(prefId)) {
      setSelectedPreferences(selectedPreferences.filter((id) => id !== prefId));
    } else {
      setSelectedPreferences([...selectedPreferences, prefId]);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header Indicator */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-10 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-violet-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Step {step} of 4
          </span>
        </div>

        {/* Wizard Panel */}
        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative border-indigo-950/20">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Account Setup */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Create Student Account</h2>
                  <p className="text-slate-400 text-xs">Let's set up your HSC study portal profile.</p>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <input
                      type="text"
                      placeholder="Pranav Guru"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Year Group</label>
                    <select
                      value={yearGroup}
                      onChange={(e: any) => setYearGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/40 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 transition-all"
                      required
                    >
                      <option value="" disabled className="bg-slate-950">Select Year Group</option>
                      <option value="Year 11" className="bg-slate-950">Year 11</option>
                      <option value="Year 12" className="bg-slate-950">Year 12</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">School or Personal Email</label>
                  <input
                    type="email"
                    placeholder="pranav@student.nsw.edu.au"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 text-slate-200 placeholder-slate-600 transition-all"
                    required
                  />
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <a href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                    Back to Login
                  </a>
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-violet-500/35 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Next</span><ArrowRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Predefined Subjects list */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Select HSC Subjects</h2>
                  <p className="text-slate-400 text-xs">Select between 2 and 6 pre-catalogued subjects you study.</p>
                </div>
              </div>

              {/* Grid of Subject Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto mt-6 pr-1.5">
                {subjectsList.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 text-slate-100 shadow-md shadow-violet-500/5'
                          : 'bg-slate-900/20 border-indigo-950/20 text-slate-400 hover:border-indigo-850/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-semibold">{sub.name}</span>
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-violet-500 border-violet-400 text-slate-950'
                            : 'border-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-indigo-950/10 mt-6">
                <span className="text-xs text-slate-400">
                  Selected: <strong className="text-violet-400 font-bold">{selectedSubjects.length}</strong> / 6
                </span>
                <button
                  onClick={handleEnrolSubjects}
                  disabled={loading || selectedSubjects.length < 2 || selectedSubjects.length > 6}
                  className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-violet-500/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Next</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Study Focus Preferences */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Study Preferences</h2>
                  <p className="text-slate-400 text-xs">What features do you plan to use the most?</p>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                {preferencesOptions.map((opt) => {
                  const isSelected = selectedPreferences.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => togglePreference(opt.id)}
                      className={`w-full flex items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 text-slate-100'
                          : 'bg-slate-900/20 border-indigo-950/20 text-slate-400 hover:border-indigo-850/40 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className={`h-4.5 w-4.5 mt-0.5 rounded border flex items-center justify-center mr-3.5 shrink-0 transition-all ${
                          isSelected
                            ? 'bg-violet-500 border-violet-400 text-white'
                            : 'border-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-indigo-950/10 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-violet-500/35 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Next</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Ready Confirmation Screen */}
          {step === 4 && (
            <div className="text-center py-6 animate-fade-in flex flex-col items-center">
              <div className="h-16 w-16 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-full flex items-center justify-center text-white mb-6 border border-violet-400/20 shadow-xl shadow-violet-500/10 animate-bounce">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-wide flex items-center gap-1.5 justify-center">
                <span>Dashboard Built!</span>
                <Sparkles className="h-5 w-5 text-violet-400 fill-violet-400" />
              </h2>
              <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">
                Welcome to GirraStudy, <strong className="text-violet-400 font-bold">{fullName}</strong>. Your private portal is ready. Go manage those HSC units!
              </p>

              <button
                onClick={() => router.push('/dashboard')}
                className="mt-8 py-3 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-violet-500/25 border border-violet-500/35 cursor-pointer flex items-center gap-2"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
