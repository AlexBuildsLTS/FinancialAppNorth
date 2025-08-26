import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError } from '@supabase/supabase-js';

export interface User {
  id: string;
  email?: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
  storageLimit?: number;
  apiKeys?: {
    openai?: string;
    gemini?: string;
    claude?: string;
  };
}

export type UserRole =
  | 'Member'
  | 'Premium Member'
  | 'Professional Accountant'
  | 'Support'
  | 'Administrator';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  signOut: () => Promise<void>;
  signUp: (params: any) => Promise<{ error: AuthError | null }>;
  signInWithPassword: (params: any) => Promise<{ error: AuthError | null }>;
  updateUser: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setInitialized(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        if (!initialized) {
          setInitialized(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initialized]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
      } else if (data) {
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
    } finally {
      setInitialized(true);
    }
  };

  const signUp = async (params: any) => {
    const { data, error } = await supabase.auth.signUp(params);
    return { error };
  };

  const signInWithPassword = async (params: any) => {
    const { data, error } = await supabase.auth.signInWithPassword(params);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      return { error: new Error('User not logged in') };
    }

    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
          api_keys: updates.apiKeys,
        })
        .eq('id', user.id);

      if (dbError) {
        return { error: new Error(dbError.message) };
      }

      setUser((prevUser) => ({ ...prevUser!, ...updates }));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    session,
    user,
    initialized,
    signOut,
    signUp,
    signInWithPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};