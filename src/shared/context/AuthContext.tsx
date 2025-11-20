import { supabase } from '@/shared/lib/supabase';
import { Profile as UserProfileType } from '@/shared/types';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

// Matches your Database exactly
export type Profile = UserProfileType & {
  id: string;
  role: 'member' | 'premium' | 'cpa' | 'support' | 'admin';
  first_name?: string;
  last_name?: string;
  full_name?: string; 
  avatar_url?: string;
  email: string;
};

type AuthContextType = {
  session: any | null; // Changed to 'any' to stop the namespace error
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: any) => Promise<{ data: any; error: any | null }>;
  signUp: (credentials: any & { firstName?: string; lastName?: string }) => Promise<{ data: any; error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ data: any; error: any | null }>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<any | null>(null); 
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch profile safely
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthContext: Error fetching profile:', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('AuthContext: Unexpected error loading profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userProfile = await loadProfile(session.user.id);
            setProfile(userProfile);
          }
        }
      } catch (e) {
        console.error('AuthContext: Init failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      // We use 'string' and 'any' here to FORCE TypeScript to accept it
      async (event: string, newSession: any | null) => {
        console.log(`Auth state changed: ${event}`); 
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (event === 'SIGNED_IN' && newSession?.user) {
            // Slight delay to allow DB trigger to finish creating profile
            setTimeout(async () => {
                const userProfile = await loadProfile(newSession.user.id);
                setProfile(userProfile);
            }, 500); 
          } else if (event === 'SIGNED_OUT') {
            setProfile(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: { email: string; password: string }) => {
    const result = await supabase.auth.signInWithPassword(credentials);
    if (result.data.user) {
      const userProfile = await loadProfile(result.data.user.id);
      setProfile(userProfile);
    }
    return result;
  };

  const signUp = async (credentials: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const { firstName, lastName, ...authCredentials } = credentials;
    
    const result = await supabase.auth.signUp({
      ...authCredentials,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName, 
        }
      }
    });
    
    if (result.data.user) {
        setTimeout(async () => {
             const userProfile = await loadProfile(result.data.user!.id);
             setProfile(userProfile);
        }, 1000);
    }
    return result;
  };

  const signOut = async () => {
    const result = await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
    return result;
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'northfinance://change-password',
    });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user');
    
    // Cast to any to forcefully ignore strict type checks on the update object
    const { full_name, id, email, ...validUpdates } = updates as any;

    const { data, error } = await supabase
      .from('profiles')
      .update(validUpdates)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) throw error;
    setProfile(data as Profile);
  };

  const refreshProfile = async () => {
    if (user) {
        const p = await loadProfile(user.id);
        setProfile(p);
    }
  }

  const value = {
    session,
    user,
    profile,
    isLoading: loading,
    isAuthenticated: !!session && !!user, 
    signIn,
    signUp,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};