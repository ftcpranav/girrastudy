'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, the AuthProvider redirects automatically, 
  // but we provide a fallback loading state here.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md animate-slide-up">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-violet-600/10 text-violet-400 border border-violet-500/20 mb-3 shadow-lg shadow-violet-500/5">
            <GraduationCap className="h-9 w-9 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-violet-400 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            GirraStudy
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">
            Girraween High School Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl relative border-indigo-950/20">
          <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-6">
            Log in to manage your HSC subjects, assessments, and study notes.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-fade-in">
                {errorMsg}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                School or Personal Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@student.nsw.edu.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-600/10 text-slate-200 placeholder-slate-600 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-indigo-950/20 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-600/10 text-slate-200 placeholder-slate-600 transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/10 flex items-center justify-center gap-2 border border-violet-500/35 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-indigo-950/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-3 text-slate-500 font-semibold tracking-wider">
                New to GirraStudy?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full py-2.5 bg-slate-900/30 hover:bg-slate-900/50 border border-indigo-950/20 text-slate-300 font-semibold text-sm rounded-xl hover:text-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Create Student Account
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-600 text-[10px] mt-6 leading-relaxed">
          This is a private dashboard designed for Girraween High School students.<br />
          NSW Higher School Certificate (HSC) study planner.
        </p>
      </div>
    </div>
  );
}
