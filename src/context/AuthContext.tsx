import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError, PostgrestError } from '@supabase/supabase-js';

// Define the shape of our User object
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

// Define the shape of the AuthContext
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  signOut: () => void;
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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
          } else if (data) {
            setUser({
              id: data.id,
              email: session.user.email,
              role: data.role,
              displayName: data.display_name,
              avatarUrl: data.avatar_url,
              storageLimit: data.storage_limit_mb,
              apiKeys: data.api_keys || {},
            });
          }
        } else {
          setUser(null);
        }

        if (!initialized) {
          setInitialized(true);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initialized]);

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
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      return { error: new Error('User not logged in') };
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        avatar_url: updates.avatarUrl,
        api_keys: updates.apiKeys, // Assuming apiKeys is stored as JSONB in the database
      })
      .eq('id', user.id);

    if (dbError) {
      return { error: new Error(dbError.message) };
    }

    setUser((prevUser) => ({ ...prevUser!, ...updates }));
    return { error: null };
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
