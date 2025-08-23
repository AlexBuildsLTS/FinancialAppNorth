// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

// Define the shape of your profile data
// This should match the columns in your 'profiles' table
type Profile = {
  username: string;
  avatar_url: string;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Add profile to our context
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // This function fetches the user's profile from the database
  const fetchProfile = async (user: User) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', user.id)
        .single();
      
      if (error && status !== 406) throw error;

      if (data) setProfile(data);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error fetching profile', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    // Listen for changes in authentication state (login/logout)
    // The listener is called once with the initial session, and then on every auth change.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser); // fetchProfile sets loading to false
        } else {
          setProfile(null); // Clear profile on logout
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign Out Error', error.message);
  };

  const value = { session, user, profile, loading, signOut };

  if (loading) return null; // Or a loading spinner

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};