import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Profile } from '../types';
import { ActivityIndicator, View } from 'react-native';
import { User } from 'lucide-react-native';

const STORAGE_KEYS = { REMEMBER_ME: 'northfinance_remember_me', EMAIL: 'northfinance_stored_email' } as const;

export interface AuthContextType {
  profile: Profile | null; session: Session | null; initialized: boolean; isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (params: { email: string; password: string; rememberMe?: boolean }) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialized, setInitialized] = useState(false);

  const isAuthenticated = !!session && !!profile;

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
        await loadUserProfile(initialSession.user);
      }
      setInitialized(true);
    };
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      await supabase.auth.signOut();
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    return supabase.auth.signUp({
      email, password, options: { data: { display_name: displayName || email.split('@')[0] } }
    });
  };

  const signIn = async ({ email, password, rememberMe = false }: { email: string; password: string; rememberMe?: boolean }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign-in error:', error.message);
      return { error };
    }
    if (rememberMe) {
      await SecureStore.setItemAsync(STORAGE_KEYS.REMEMBER_ME, 'true');
      await SecureStore.setItemAsync(STORAGE_KEYS.EMAIL, email);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.EMAIL);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: new Error('User not logged in') };
    try {
      const { data, error } = await supabase.from('profiles').update({
        display_name: updates.display_name, avatar_url: updates.avatar_url,
      }).eq('id', profile.id).select().single();
      if (error) throw error;
      setProfile(data as Profile);
      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value = { session, profile, initialized, isAuthenticated, signOut, signUp, signIn, updateProfile };

  if (!initialized) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
};