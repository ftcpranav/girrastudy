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
  Mail,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject } from '@/lib/types';

// ── Types ────────────────────────────────────────────────────
interface DbSubject {
  id: string;
  name: string;
  code: string;
}

// ── Constants ────────────────────────────────────────────────
const SUBJECT_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  // ── UI State ─────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // emailPending: true while waiting for user to click the confirmation email
  const [emailPending, setEmailPending] = useState(false);

  // ── Step 1: Account ───────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [yearGroup, setYearGroup] = useState<'Year 11' | 'Year 12' | ''>('');

  // ── Step 2: Subjects ──────────────────────────────────────
  // subjects loaded from DB (seeded). selectedSubjects stores their IDs.
  const [subjectsList, setSubjectsList] = useState<DbSubject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // ── Step 3: Preferences ───────────────────────────────────
  const preferencesOptions = [
    { id: 'assessment', label: 'Assessment tracking', desc: 'Deadlines, reminders, and status cards' },
    { id: 'mark', label: 'Mark monitoring', desc: 'Average grade logs, progression, and ATAR indicator' },
    { id: 'note', label: 'Note organisation', desc: 'Private notes folders, tags, and document links' },
    { id: 'planning', label: 'Study planning', desc: 'Revision timelines and calendar lists' },
  ];
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // ── Effect: Skip step 1 if user is already authenticated ──
  useEffect(() => {
    if (user && profile && step === 1) {
      if (profile.full_name && profile.full_name !== 'Student') setFullName(profile.full_name);
      if (profile.year_group) setYearGroup(profile.year_group);
      setEmail(profile.email || '');
      setStep(2);
    }
  }, [user, profile]);

  // ── Effect: Handle email confirmation redirect ─────────────
  // When a user clicks the confirmation link in their email, Supabase
  // redirects them back with an #access_token hash. detectSessionInUrl
  // handles this automatically. We just need to listen for the resulting
  // SIGNED_IN event and advance them to step 2.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session?.user && step === 1) {
          const userId = session.user.id;
          // Update their profile with the data they filled in before confirming
          if (fullName || yearGroup) {
            await supabase.from('users')
              .update({ full_name: fullName || 'Student', year_group: yearGroup || 'Year 12' })
              .eq('id', userId);
          }
          await refreshProfile(userId);
          setEmailPending(false);
          setStep(2);
        }
      }
    );
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, fullName, yearGroup]);

  // ── Effect: Load subjects from DB (no auth required — public read) ──
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        setSubjectsList(data);
      }
      // If DB is empty or errored, subjectsList stays [] — handled in UI
    };
    fetchSubjects();
  }, []);

  // ── Effect: Confetti on Step 4 ─────────────────────────────
  useEffect(() => {
    if (step !== 4) return;
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#8b5cf6', '#6366f1', '#a78bfa'] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#8b5cf6', '#6366f1', '#a78bfa'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [step]);

  // ────────────────────────────────────────────────────────────
  // STEP 1: Sign Up / Sign In
  // ────────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !yearGroup) {
      setErrorMsg('Please complete all fields.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      // ① Try signing in first (handles returning users and rate-limit retries)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (!signInError && signInData?.user) {
        // Existing user — update their profile with the latest info
        await supabase.from('users').update({
          full_name: fullName,
          year_group: yearGroup,
        }).eq('id', signInData.user.id);

        await refreshProfile(signInData.user.id);
        setStep(2);
        return;
      }

      // ② Not an existing user — sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) {
        // "User already registered" means wrong password — tell them
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setErrorMsg('An account with this email already exists. Please check your password.');
        } else if (signUpError.message.toLowerCase().includes('rate limit')) {
          setErrorMsg('Too many sign-up attempts. Please wait a moment and try again.');
        } else {
          setErrorMsg(signUpError.message);
        }
        return;
      }

      const newUser = signUpData?.user;
      if (!newUser) {
        setErrorMsg('Sign up succeeded but no user was returned. Please try signing in.');
        return;
      }

      // ③ Update public profile with year_group (trigger only sets email + full_name)
      // Must wait for the trigger to have created the row — retry with backoff
      let profileUpdated = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        const { error: updateErr } = await supabase
          .from('users')
          .update({ full_name: fullName, year_group: yearGroup })
          .eq('id', newUser.id);
        if (!updateErr) { profileUpdated = true; break; }
      }

      if (!profileUpdated) {
        // Non-fatal: user row might need a sign-in first for session
        console.warn('Could not update profile immediately; will retry after sign-in.');
      }

      // ④ Sign in immediately after sign-up (establishes session before DB writes)
      const { data: postSignInData, error: postSignInErr } = await supabase.auth.signInWithPassword({ email, password });

      if (postSignInErr || !postSignInData?.user) {
        // Supabase requires email confirmation — show the pending screen.
        // The onAuthStateChange listener above will detect when they confirm
        // and automatically advance to step 2.
        setEmailPending(true);
        return;
      }

      await refreshProfile(postSignInData.user.id);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // STEP 2: Enrol Subjects
  // ────────────────────────────────────────────────────────────
  const handleEnrolSubjects = async () => {
    if (selectedSubjects.length < 2 || selectedSubjects.length > 6) {
      setErrorMsg('Please select between 2 and 6 subjects.');
      return;
    }

    // CRITICAL: Must have a valid Supabase session before writing to student_subjects
    // RLS policy: auth.uid() = user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setErrorMsg('Session expired. Please go back and sign in again.');
      setStep(1);
      return;
    }

    const currentUserId = session.user.id;
    setLoading(true);
    setErrorMsg('');

    try {
      // Ensure profile row exists in public.users before inserting FK dependencies
      const userEmail = session.user.email || 'student@girrastudy.com';
      await supabase.from('users').upsert({
        id: currentUserId,
        email: userEmail,
        full_name: fullName || session.user.user_metadata?.full_name || 'Student',
        year_group: yearGroup || 'Year 12',
        role: 'student',
      });

      // Delete existing enrolments (idempotent re-entry)
      await supabase.from('student_subjects').delete().eq('user_id', currentUserId);

      // Insert new enrolments
      const inserts = selectedSubjects.map((subjectId, i) => ({
        user_id: currentUserId,
        subject_id: subjectId,
        color_hex: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      }));

      const { error: insertError } = await supabase.from('student_subjects').insert(inserts);

      if (insertError) {
        setErrorMsg(insertError.message);
        return;
      }

      await refreshProfile(currentUserId);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error enrolling subjects.');
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // STEP 3: Study Preferences
  // ────────────────────────────────────────────────────────────
  const handleSavePreferences = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Session expired.');

      await supabase
        .from('users')
        .update({ preferences_json: { study_focus: selectedPreferences } })
        .eq('id', session.user.id);

      await refreshProfile(session.user.id);
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving preferences.');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────
  const toggleSubject = (id: string) => {
    setErrorMsg('');
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
    } else {
      if (selectedSubjects.length >= 6) {
        setErrorMsg('Maximum 6 subjects allowed.');
        return;
      }
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // ── Render ─────────────────────────────────────────────────

  // ── Email Confirmation Pending Screen ─────────────────────
  if (emailPending) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass-card rounded-3xl p-10 shadow-2xl text-center border-indigo-950/20">
            <div className="h-16 w-16 bg-gradient-to-tr from-violet-600/20 to-indigo-500/20 rounded-full flex items-center justify-center text-violet-400 mb-6 mx-auto border border-violet-500/20">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-100 mb-2">Check Your Email</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-2">
              We sent a confirmation link to:
            </p>
            <p className="text-violet-400 font-bold text-sm mb-6">{email}</p>
            <p className="text-slate-500 text-xs leading-relaxed mb-8">
              Click the link in that email, then come back here — this page will automatically advance to the next step.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await supabase.auth.resend({ type: 'signup', email });
                  setLoading(false);
                }}
                className="w-full py-2.5 bg-slate-900/30 hover:bg-slate-900/50 border border-indigo-950/20 text-slate-300 font-semibold text-sm rounded-xl hover:text-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend confirmation email'}
              </button>
              <button
                type="button"
                onClick={() => { setEmailPending(false); setErrorMsg(''); }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                ← Back to sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background radial blurs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl animate-slide-up">
        {/* Step indicator */}
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

        {/* Wizard panel */}
        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative border-indigo-950/20">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* ── STEP 1: Account Setup ─────────────────────── */}
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
                    minLength={6}
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

          {/* ── STEP 2: Select Subjects ───────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Select HSC Subjects</h2>
                  <p className="text-slate-400 text-xs">Select between 2 and 6 subjects you study.</p>
                </div>
              </div>

              {subjectsList.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading subjects…
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[350px] overflow-y-auto mt-6 pr-1.5">
                  {subjectsList.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubject(sub.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600/15 border-violet-500 text-slate-100 shadow-md shadow-violet-500/5'
                            : 'bg-slate-900/20 border-indigo-950/20 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-semibold">{sub.name}</span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-violet-500 border-violet-400' : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-6 flex items-center justify-between border-t border-indigo-950/10 mt-6">
                <span className="text-xs text-slate-400">
                  Selected: <strong className="text-violet-400 font-bold">{selectedSubjects.length}</strong> / 6
                </span>
                <button
                  type="button"
                  onClick={handleEnrolSubjects}
                  disabled={loading || selectedSubjects.length < 2 || selectedSubjects.length > 6}
                  className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-violet-500/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Next</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Study Preferences ─────────────────── */}
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
                      type="button"
                      onClick={() => togglePreference(opt.id)}
                      className={`w-full flex items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600/15 border-violet-500 text-slate-100'
                          : 'bg-slate-900/20 border-indigo-950/20 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className={`h-4 w-4 mt-0.5 rounded border flex items-center justify-center mr-3.5 shrink-0 transition-all ${
                          isSelected ? 'bg-violet-500 border-violet-400 text-white' : 'border-slate-700'
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
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="py-2.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-violet-500/35 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Finish</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ──────────────────────────────── */}
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
                type="button"
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
