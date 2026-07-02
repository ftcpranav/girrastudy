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
  refreshProfile: () => Promise<void>;
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
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Fetch enrolled subjects
      const { data: subjectData, error: subjectError } = await supabase
        .from('student_subjects')
        .select('*, subject:subjects(*)')
        .eq('user_id', userId);

      if (subjectError) {
        console.error('Error fetching enrolled subjects:', subjectError);
      } else {
        setEnrolledSubjects(subjectData || []);
      }
    } catch (err) {
      console.error('Unexpected error in fetchProfileAndSubjects:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndSubjects(user.id);
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
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfileAndSubjects(session.user.id);
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
      // Redirect unauthenticated users to landing/login, but allow them to access onboarding (Step 1)
      if (!isPublicRoute && !isOnboardingRoute) {
        router.push('/');
      }
    } else {
      // Authenticated user checks
      const hasCompletedOnboarding = 
        profile?.year_group !== null && 
        enrolledSubjects.length >= 2;

      if (!hasCompletedOnboarding) {
        // Force onboarding if they haven't finished it
        if (!isOnboardingRoute) {
          router.push('/onboarding');
        }
      } else {
        // If they have completed onboarding, prevent them from accessing landing or onboarding
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
