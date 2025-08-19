import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError } from '@supabase/supabase-js';

// Define the shape of our User object
export interface User {
  id: string;
  email?: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
  apiKeys?: {
    openai?: string;
    gemini?: string;
    claude?: string;
  };
}

// Define the shape of the AuthContext
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  signOut: () => void;
  signUp: (params: any) => Promise<{ error: AuthError | null }>;
  signInWithPassword: (params: any) => Promise<{ error: AuthError | null }>;
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

  const value = {
    session,
    user,
    initialized,
    signOut,
    signUp,
    signInWithPassword,
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