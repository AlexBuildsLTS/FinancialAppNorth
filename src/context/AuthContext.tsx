// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError, User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// --- State and Action Types for the Reducer ---

/**
 * Represents the complete authentication state managed by the reducer.
 */
type AuthState = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean; // Used for initial load and during sign-in/sign-up processes
};

/**
 * Defines all possible actions that can be dispatched to the authReducer.
 */
type AuthAction =
  | { type: 'INITIALIZE'; session: Session | null; profile: Profile | null }
  | { type: 'LOGIN'; session: Session; profile: Profile }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; profile: Profile }
  | { type: 'SET_LOADING'; isLoading: boolean };

// --- Auth Context Definition ---

/**
 * The shape of the context value provided to consuming components.
 */
export interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn: (params: { email: string; password: string }) => Promise<{ error: AuthError | null }>;
  signUp: (params: { email: string; password: string; displayName: string }) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => Promise<{ error: Error | null }>;
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
      // Reset to initial state on logout
      return { ...state, session: null, profile: null, isLoading: false };
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      // It's good practice to throw an error for unhandled action types
      throw new Error(`Unhandled action type in authReducer`);
  }
};

// --- Auth Provider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    session: null,
    profile: null,
    isLoading: true, // Start with loading true to check for an existing session
  });

  /**
   * Memoized function to fetch the user profile from the database.
   * If the profile cannot be fetched (e.g., RLS error), it signs the user out
   * to prevent the app from being in an inconsistent state. This is the logic
   * that can cause a loop if the profile is consistently inaccessible.
   */
  const loadUserProfile = useCallback(async (user: User): Promise<Profile | null> => {
    try {
      const { data, error, status } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error && status !== 406) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      await supabase.auth.signOut();
      return null;
    }
  }, []);

  useEffect(() => {
    /**
     * On initial mount, check if a session already exists in storage.
     * This keeps the user logged in across app launches.
     */
    const initializeAuth = async () => {
      // Supabase client automatically handles session restoration from storage
      const { data: { session } } = await supabase.auth.getSession();
      const profile = session?.user ? await loadUserProfile(session.user) : null;
      dispatch({ type: 'INITIALIZE', session, profile });
    };

    initializeAuth();

    /**
     * Subscribe to Supabase auth state changes. This is the central piece
     * that keeps the app's state in sync with Supabase's authentication.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session?.user ? await loadUserProfile(session.user) : null;

      // Only dispatch LOGIN if we have both a session and a profile.
      if (session && profile) {
        dispatch({ type: 'LOGIN', session, profile });
      } else {
        // If there's no session or the profile couldn't be loaded, log out.
        dispatch({ type: 'LOGOUT' });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // On success, onAuthStateChange will fire and update state via the reducer.
    // If there's an error, we need to manually stop the loading indicator.
    if (error) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
    return { error };
  };

  const signUp = async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will handle dispatching the LOGOUT action.
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => {
    if (!state.profile) return { error: new Error('User not logged in.') };

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
      console.error('Update profile error:', error);
      return { error };
    }
  };

  // --- Final Context Value ---
  const value: AuthContextType = {
    ...state,
    // **OPTIMIZATION**: A user is only truly authenticated if we have BOTH
    // a valid session AND their profile data loaded. This prevents UI flicker
    // and errors where components try to access `profile.name` before it exists.
    isAuthenticated: !!state.session && !!state.profile,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  // Render a loading screen while the initial session is being verified.
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook to use the Auth Context ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});