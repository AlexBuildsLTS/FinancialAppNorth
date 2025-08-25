import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { Profile } from '@/types';
import * as SecureStore from 'expo-secure-store';

// Secure storage keys
const REMEMBER_ME_KEY = 'remember_me';
const EMAIL_KEY = 'stored_email';
const PASSWORD_KEY = 'stored_password';

// This is the correct User type that includes your profile data
export interface User extends AuthUser {
  display_name?: string;
  avatar_url?: string;
  role?: Profile['role'];
  profession?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, full_name: string) => Promise<{ data: any | null; error: { message: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Correctly fetch the user's profile from your 'profiles' table
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, role, profession')
          .eq('id', session.user.id)
          .single();
        
        // Combine the auth user with your profile data
        setUser({ ...session.user, ...profile });
      } else {
        setUser(null);
      }
      setInitialized(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            setInitialized(true);
        }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signInWithEmail = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, full_name: string) => {
    const SUPABASE_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/signup`;

    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ email, password, full_name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred during signup.');
      }

      // The Edge Function handles the actual Supabase auth.signUp,
      // so the onAuthStateChange listener will pick up the session.
      // We can return the data from the Edge Function directly.
      return { data: data, error: null };
    } catch (error: any) {
      console.error("Edge Function Signup Error:", error);
      return { data: null, error: { message: error.message || 'An unexpected error occurred.' } };
    }
  };

  const signOut = async () => {
    try {
      // Your existing logout logic
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
      await SecureStore.deleteItemAsync(EMAIL_KEY);
      await SecureStore.deleteItemAsync(PASSWORD_KEY);
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const value = { session, user, initialized, signInWithEmail, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
