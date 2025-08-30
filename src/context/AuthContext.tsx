// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Profile } from '../types';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (params: { email: string; password: string }) => Promise<{ error: AuthError | null }>;
  signUp: (params: { email: string; password: string; displayName: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => Promise<{ error: Error | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (user: User): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const userProfile = await loadUserProfile(session.user);
        setProfile(userProfile);
      }
      setIsLoading(false);
    };
    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const userProfile = await loadUserProfile(newSession.user);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signIn = async (params: { email: string; password: string }) => {
    return await supabase.auth.signInWithPassword(params);
  };

  const signUp = async (params: { email: string; password: string; displayName: string }) => {
    return await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: { display_name: params.displayName } },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => {
    if (!profile) return { error: new Error('User not logged in') };
    try {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', profile.id).select().single();
      if (error) throw error;
      setProfile(data);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    // Note: You need to configure the redirect URL in your Supabase project settings.
    return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:8081/reset-password',
    });
  };

  const value = {
    session,
    profile,
    isLoading,
    isAuthenticated: !!session && !!profile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
  };

  if (isLoading) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" /></View>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});