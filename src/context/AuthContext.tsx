import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { Profile } from '@/types';

// This is the correct User type that includes your profile data
export interface User extends AuthUser, Omit<Profile, 'id' | 'email' | 'role'> {}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata: { display_name: string }) => Promise<any>;
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
          .select('*')
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

  const signUp = (email: string, password: string, metadata: { display_name: string }) => {
    return supabase.auth.signUp({ email, password, options: { data: metadata } });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
