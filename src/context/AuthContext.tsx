import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// --- Secure storage keys for "Remember Me" feature ---
const REMEMBER_ME_KEY = 'remember_me';
const EMAIL_KEY = 'stored_email';

// --- Custom User interface for your application ---
export interface User {
  id: string;
  email?: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
  storageLimit?: number;
  apiKeys?: { [key: string]: string };
}

// --- The main context type definition ---
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signInWithPassword: (params: { email: string; password: string, rememberMe: boolean }) => Promise<{ error: AuthError | null }>;
  updateUser: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      setInitialized(true);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          role: data.role || 'Member',
          displayName: data.display_name,
          avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
          storageLimit: data.storage_limit_mb,
          apiKeys: data.api_keys || {},
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split('@')[0] } }
    });
  };

  const signInWithPassword = async ({ email, password, rememberMe }: { email: string; password: string, rememberMe: boolean }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    // Supabase handles session persistence by default with its client storage.
    // We only need to store the email for convenience.
    if (!error && data.session) {
if (rememberMe) {
  await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
  await SecureStore.setItemAsync(EMAIL_KEY, email);
} else {
  await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
  await SecureStore.deleteItemAsync(EMAIL_KEY);
}
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('User not logged in') };
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
          api_keys: updates.apiKeys,
        })
        .eq('id', user.id);
      if (dbError) throw dbError;
      setUser((prev) => ({ ...prev!, ...updates }));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const value = { session, user, initialized, signOut, signUp, signInWithPassword, updateUser };

  return <AuthContext.Provider value={value}>{!initialized ? null : children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};