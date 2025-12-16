import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (e: string, p: string) => Promise<void>;
  register: (e: string, p: string, f: string, l: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState(); // Check if nav is ready

  // --- 1. Robust Profile Fetcher ---
  const fetchProfile = async (currentSession: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Robust Fallback if profile missing (Self-Healing)
      const profile = data || {
        first_name: 'Member',
        role: 'member' as UserRole,
        avatar_url: null,
        currency: 'USD',
        country: 'US',
      };

      setUser({
        id: currentSession.user.id,
        email: currentSession.user.email!,
        name: profile.first_name
          ? `${profile.first_name} ${profile.last_name || ''}`.trim()
          : currentSession.user.email!.split('@')[0],
        role: (profile.role || 'member') as UserRole,
        status: 'active',
        avatar: profile.avatar_url,
        currency: profile.currency || 'USD',
        country: profile.country || 'US',
      });
    } catch (e) {
      console.warn('[Auth] Profile Load Warning:', e);
      // Ensure we still set a user so the app doesn't hang
      setUser({
        id: currentSession.user.id,
        email: currentSession.user.email!,
        name: 'User',
        role: 'member' as UserRole,
        status: 'active',
        currency: 'USD',
        country: 'US',
      });
    }
  };

  // --- 2. Init session + listen for changes ---
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        if (initialSession) {
          await fetchProfile(initialSession);
        }
      } catch (error) {
        console.error('[Auth] Init Error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsMounted(true);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession) {
        if (!user || user.id !== newSession.user.id) {
          await fetchProfile(newSession);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('[Auth] Failsafe triggered - forcing load completion');
        setIsLoading(false);
      }
    }, 4000);

    return () => {
      mounted = false;
      setIsMounted(false);
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 3. Protection & Redirects (Optimized to prevent form interference) ---
  useEffect(() => {
    // Only redirect if:
    // 1. Loading is done
    // 2. Navigation is ready (RootState exists)
    // 3. Component is mounted
    if (isLoading || !navigationState?.key || !isMounted) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentPath = segments.join('/');
    
    // Prevent redirects when user is actively on auth pages (typing in forms)
    const isOnAuthPage = currentPath === '(auth)/login' || currentPath === '(auth)/register';
    
    // Use a longer delay and only redirect if not actively on auth page
    const redirectTimer = setTimeout(() => {
      // Double-check that we're still in the same state (user hasn't changed)
      if (!user && !inAuthGroup && !isOnAuthPage) {
        // User not logged in, trying to access protected area
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup && !isOnAuthPage) {
        // User logged in, trying to access login screen - redirect to main
        router.replace('/(main)');
      }
    }, 300); // Longer delay to prevent interference with typing

    return () => clearTimeout(redirectTimer);
  }, [user, isLoading, segments, navigationState, isMounted, router]);

  // --- Actions ---
  const login = async (email: string, p: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: p });
    if (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const register = async (email: string, p: string, f: string, l: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
        email, password: p, options: { data: { first_name: f, last_name: l } }
    });
    if (error) {
        setIsLoading(false);
        throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    // Explicitly navigate to ensure UI updates
    router.replace('/(auth)/login');
  };

  const refreshProfile = async () => {
    if (session) {
        await fetchProfile(session);
    }
  };

  // Memoize callbacks to prevent re-renders
  const loginMemo = useMemo(() => login, []);
  const registerMemo = useMemo(() => register, []);
  const logoutMemo = useMemo(() => logout, []);
  const refreshProfileMemo = useMemo(() => refreshProfile, [session]);

  const value = useMemo(() => ({
    user, session, isLoading, 
    login: loginMemo, 
    register: registerMemo, 
    logout: logoutMemo, 
    refreshProfile: refreshProfileMemo
  }), [user, session, isLoading, loginMemo, registerMemo, logoutMemo, refreshProfileMemo]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};