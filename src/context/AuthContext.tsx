import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Profile } from '../types';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { updateProfile as updateProfileService } from '@/services/profileService';

export interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (params: { email: string; password: string }) => Promise<{ error: AuthError | null }>;
  signUp: (params: { email: string; password: string; displayName: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (user: User | null): Promise<Profile | null> => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw new Error(error.message);
      return { ...data, email: user.email };
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const userProfile = await loadUserProfile(session?.user ?? null);
      setProfile(userProfile);
      setIsLoading(false);
    };
    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, newSession: Session | null) => {
      setSession(newSession);
      const userProfile = await loadUserProfile(newSession?.user ?? null);
      setProfile(userProfile);
      if (isLoading) setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const refreshProfile = async () => {
      if (session?.user) {
          const userProfile = await loadUserProfile(session.user);
          setProfile(userProfile);
      }
  }

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => {
    if (!profile) return { error: new Error('User not logged in') };
    try {
      const { updatedProfile, error } = await updateProfileService(profile.id, updates);
      if (error) throw error;
      
      setProfile(currentProfile => ({ ...currentProfile, ...updatedProfile } as Profile));
      
      return { error: null };
    } catch (error: any) {
      // Ensure we always return a proper Error object
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signIn = async (params: { email: string; password: string }) => {
    if (!params.email || !params.password) {
      throw new Error('Email and password are required for sign-in.');
    }
    return await supabase.auth.signInWithPassword(params);
  };
  const signUp = async (params: { email: string; password: string; displayName: string }) => await supabase.auth.signUp({ email: params.email, password: params.password, options: { data: { display_name: params.displayName } } });
  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); };
  const sendPasswordResetEmail = async (email: string) => await supabase.auth.resetPasswordForEmail(email);

  const value = React.useMemo(() => ({
    session, profile, isLoading, isAuthenticated: !!session && !!profile,
    signIn, signUp, signOut, updateProfile, refreshProfile, sendPasswordResetEmail,
  }), [session, profile, isLoading]);

  if (isLoading) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" /></View>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});