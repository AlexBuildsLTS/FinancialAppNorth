import { supabase } from '@/shared/lib/supabase';
import { Profile as UserProfileType } from '@/shared/types';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

// This Profile type should be the single source of truth for the app
// It matches your database.types.ts and the schema changes from Step 2.1
export type Profile = UserProfileType & {
  id: string;
  role: string;
  first_name?: string;
  last_name?: string;
  full_name?: string; // This is the generated column
  avatar_url?: string;
  email: string;
};

type AuthContextType = {
  session: any | null;
  user: any | null;
  profile: Profile | null; // Use the corrected Profile type
  isLoading: boolean;
  isAuthenticated: boolean; // Added for convenience
  signIn: (credentials: any) => Promise<{ data: any; error: any | null }>;
  signUp: (credentials: any & { firstName?: string; lastName?: string }) => Promise<{ data: any; error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ data: any; error: any | null }>; // Added
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: any, session: any | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      // Select all columns, including the generated full_name
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(profileData as Profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  const signIn = async (credentials: any) => {
    const result = await supabase.auth.signInWithPassword(credentials);
    
    if (!result.error && result.data.user) {
      await loadProfile(result.data.user.id);
    }
    return result;
  };

  const signUp = async (credentials: any & { firstName?: string; lastName?: string }) => {
    const { firstName, lastName, ...authCredentials } = credentials;
    
    // Pass firstName and lastName to the trigger via raw_user_meta_data
    const result = await supabase.auth.signUp({
      ...authCredentials,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          // full_name is no longer needed here; database generates it
        }
      }
    });
    
    // Manually load profile if sign-up is successful but needs verification
    if (!result.error && result.data.user) {
        await loadProfile(result.data.user.id);
    }
    
    return result;
  };

  const signOut = async () => {
    const result = await supabase.auth.signOut();
    setProfile(null);
    return result;
  };
  
  // Added password reset function
  const sendPasswordResetEmail = async (email: string) => {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '/(auth)/change-password', // Specify your password reset page
    });
    return result;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No authenticated user');
    
    // Do not allow updating generated column
    const { full_name, ...validUpdates } = updates;

    const { data, error } = await supabase
      .from('profiles')
      .update(validUpdates)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Update local profile state with the returned data
    setProfile(data as Profile);
  };

  const value = {
    session,
    user,
    profile,
    isLoading: loading,
    isAuthenticated: !!session, // Added this property
    signIn,
    signUp,
    signOut,
    updateProfile,
    sendPasswordResetEmail, // Added this function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
