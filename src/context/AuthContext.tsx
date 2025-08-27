import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { setItem } from 'expo-secure-store';

// --- Secure storage keys for "Remember Me" feature ---
const STORAGE_KEYS = {
  REMEMBER_ME: 'remember_me',
  EMAIL: 'stored_email',
} as const;

// --- Custom User interface for your application ---
export interface User {
  id: string;
  email: string;
  role: string;
  displayName: string;
  avatarUrl: string;
  storageLimit?: number;
  apiKeys?: { [key: string]: string };
}

// --- The main context type definition ---
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signInWithPassword: (params: { 
    email: string; 
    password: string; 
    rememberMe?: boolean 
  }) => Promise<{ error: AuthError | null }>;
  updateUser: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Computed property for authentication status
  const isAuthenticated = !!session && !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        // Load user profile if session exists
        if (session?.user) {
          await loadUserProfile(session.user);
        }

        // Check for remembered email on initial load
        await checkRememberedEmail();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkRememberedEmail = async () => {
    try {
      const remembered = await SecureStore.getItemAsync(STORAGE_KEYS.REMEMBER_ME);
      if (remembered === 'true') {
        const savedEmail = await SecureStore.getItemAsync(STORAGE_KEYS.EMAIL);
        // Optional: You could potentially pre-fill email in login form
      }
    } catch (error) {
      console.error('Error checking remembered email:', error);
    }
  };

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const profileData = data || {};
      
      setUser({
        id: authUser.id,
        email: authUser.email || profileData.email || '',
        role: profileData.role || 'Member',
        displayName: profileData.display_name || authUser.email?.split('@')[0] || 'User',
        avatarUrl: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
        storageLimit: profileData.storage_limit_mb,
        apiKeys: profileData.api_keys || {},
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          display_name: displayName || email.split('@')[0] 
        } 
      }
    });
  };

 const signInWithPassword = async ({ 
  email, 
  password, 
  rememberMe = false 
}: { 
  email: string; 
  password: string; 
  rememberMe?: boolean 
}) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign-in error:', error.message);
      return { error };
    }

    if (!error && data.session) {
      // Manage remember me using new StorageAdapter
      if (rememberMe) {
        await setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        await setItem(STORAGE_KEYS.EMAIL, email);
      } else {
        await Promise.all([
          deleteItem(STORAGE_KEYS.REMEMBER_ME),
          deleteItem(STORAGE_KEYS.EMAIL)
        ]);
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected sign-in error:', error);
    return { error: error as AuthError };
  }
};

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear remembered email on logout
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME),
        SecureStore.deleteItemAsync(STORAGE_KEYS.EMAIL)
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
    }
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

      setUser((prev) => ({ 
        ...prev!, 
        ...updates 
      }));

      return { error: null };
    } catch (error: any) {
      console.error('Update user error:', error);
      return { error };
    }
  };

  const value = { 
    session, 
    user, 
    initialized, 
    isAuthenticated,
    signOut, 
    signUp, 
    signInWithPassword, 
    updateUser 
  };

  return (
    <AuthContext.Provider value={value}>
      {!initialized ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function deleteItem(REMEMBER_ME: string): any {
  throw new Error('Function not implemented.');
}
