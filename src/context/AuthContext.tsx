'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, StudentSubject } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  enrolledSubjects: StudentSubject[];
  loading: boolean;
  refreshProfile: (explicitUserId?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfileAndSubjects = async (userId: string) => {
    try {
      // 1. Fetch profile using maybeSingle
      let { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // If user profile is missing in public.users, create default profile row
      if (!profileData) {
        const { data: authUserRes } = await supabase.auth.getUser();
        const userAuth = authUserRes?.user;
        const newProfile = {
          id: userId,
          email: userAuth?.email || 'student@girrastudy.com',
          full_name: userAuth?.user_metadata?.full_name || 'Student',
          year_group: null,
          role: 'student',
          preferences_json: {},
        };

        await supabase.from('users').upsert(newProfile);
        profileData = newProfile as any;
      }

      setProfile(profileData);

      // 2. Fetch enrolled subjects
      const { data: subjectData, error: subjectError } = await supabase
        .from('student_subjects')
        .select('*, subject:subjects(*)')
        .eq('user_id', userId);

      if (!subjectError) {
        setEnrolledSubjects(subjectData || []);
      }
    } catch (err) {
      console.error('Unexpected error in fetchProfileAndSubjects:', err);
    }
  };

  const refreshProfile = async (explicitUserId?: string) => {
    const targetId = explicitUserId || user?.id;
    if (targetId) {
      await fetchProfileAndSubjects(targetId);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfileAndSubjects(session.user.id);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfileAndSubjects(currentUser.id);
        } else {
          setProfile(null);
          setEnrolledSubjects([]);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Onboarding & Route Protection logic
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === '/' || pathname === '/login';
    const isOnboardingRoute = pathname === '/onboarding';

    if (!user) {
      // Redirect unauthenticated users to landing/login if trying to access private routes
      if (!isPublicRoute && !isOnboardingRoute) {
        router.push('/');
      }
    } else {
      // Authenticated user checks
      const hasCompletedOnboarding =
        Boolean(profile?.year_group) &&
        enrolledSubjects.length >= 2;

      if (!hasCompletedOnboarding) {
        // Redirect to onboarding if incomplete
        if (!isOnboardingRoute) {
          router.push('/onboarding');
        }
      } else {
        // Prevent access to landing or onboarding once completed
        if (isPublicRoute || isOnboardingRoute) {
          router.push('/dashboard');
        }
      }
    }
  }, [user, profile, enrolledSubjects, loading, pathname, router]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setEnrolledSubjects([]);
    router.push('/');
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        enrolledSubjects,
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
