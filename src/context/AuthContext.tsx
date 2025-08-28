// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError, User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { View, ActivityIndicator } from 'react-native';

// --- State and Action Types for the Reducer ---
type AuthState = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
};

type AuthAction =
  | { type: 'INITIALIZE'; session: Session | null; profile: Profile | null }
  | { type: 'LOGIN'; session: Session; profile: Profile }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; profile: Profile }
  | { type: 'SET_LOADING'; isLoading: boolean };

// --- Auth Context Definition ---
export interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn: (params: { email: string; password: string }) => Promise<{ error: AuthError | null }>;
  signUp: (params: { email: string; password: string; displayName: string }) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Reducer Function ---
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, session: action.session, profile: action.profile, isLoading: false };
    case 'LOGIN':
      return { ...state, session: action.session, profile: action.profile, isLoading: false };
    case 'LOGOUT':
      return { ...state, session: null, profile: null };
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
};

// --- Auth Provider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    session: null,
    profile: null,
    isLoading: true,
  });

  const loadUserProfile = useCallback(async (user: User): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Log out the user if their profile is inaccessible
      await supabase.auth.signOut();
      return null;
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const profile = session?.user ? await loadUserProfile(session.user) : null;
      dispatch({ type: 'INITIALIZE', session, profile });
    };
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session?.user ? await loadUserProfile(session.user) : null;
      if (session && profile) {
        dispatch({ type: 'LOGIN', session, profile });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // The onAuthStateChange listener will handle the state update
    if (error) dispatch({ type: 'SET_LOADING', isLoading: false });
    return { error };
  };

  const signUp = async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    // The display_name is passed to the trigger we created in the SQL step
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { display_name: displayName } },
    });
    if (error) dispatch({ type: 'SET_LOADING', isLoading: false });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle dispatching LOGOUT
  };

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!state.profile) return { error: new Error('User not logged in') };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.profile.id)
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: 'UPDATE_PROFILE', profile: data });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const value: AuthContextType = {
    ...state,
    isAuthenticated: !!state.session,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  if (state.isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};