// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase'; // Corrected import path
import { Alert } from 'react-native';

// Define the shape of the context's value
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: any, password: any) => Promise<void>;
  signUp: (email: any, password: any) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes in authentication state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup the listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign up function with error handling
  const signUp = async (email: any, password: any) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Sign Up Error', error.message);
      throw error; // Re-throw to handle in the UI if needed
    }
    // Optional: Alert the user to check their email if confirmation is on
    Alert.alert('Success!', 'Please check your email to confirm your account.');
  };

  // Sign in function with error handling
  const signIn = async (email: any, password: any) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Sign In Error', error.message);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};