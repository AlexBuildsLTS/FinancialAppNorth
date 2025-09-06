import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { normalizeRole } from '@/utils/roleUtils';

interface SignUpParams {
  email: string;
  password: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  currency?: string;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (params: SignUpParams) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession?.user) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', initialSession.user.id).single();
          if (profileData) {
            profileData.role = normalizeRole(profileData.role);
          }
          setProfile(profileData);
        }
      } catch (e) {
        console.error('Failed to fetch initial session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        if (newSession?.user) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', newSession.user.id).single();
          if (profileData) profileData.role = normalizeRole(profileData.role);
          setProfile(profileData || null);
        } else {
          setProfile(null);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    session,
    profile,
    user: session?.user ?? null,
    isLoading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (params: SignUpParams) =>
      supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.displayName,
            first_name: params.firstName,
            last_name: params.lastName,
            country: params.country,
            currency: params.currency,
          },
        },
      }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};