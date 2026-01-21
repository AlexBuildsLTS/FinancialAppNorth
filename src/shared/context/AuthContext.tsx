import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
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

  // Use refs to track state without triggering re-renders or suffering from stale closures
  const lastUserId = useRef<string | null>(null);
  const lastAccessToken = useRef<string | undefined>(undefined);

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // --- 1. Robust Profile Fetcher ---
  const fetchProfile = async (currentSession: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

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
      // Fallback to avoid hanging
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

        if (initialSession) {
          setSession(initialSession);
          lastAccessToken.current = initialSession.access_token;

          if (initialSession.user.id !== lastUserId.current) {
            lastUserId.current = initialSession.user.id;
            await fetchProfile(initialSession);
          }
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

      // CRITICAL FIX: Only update if the access token actually changed.
      // This prevents the infinite loop when Supabase fires multiple events for the same session.
      if (newSession?.access_token === lastAccessToken.current) {
        return;
      }

      lastAccessToken.current = newSession?.access_token;
      setSession(newSession);

      if (newSession?.user) {
        // Only fetch profile if the user ID has changed
        if (newSession.user.id !== lastUserId.current) {
          lastUserId.current = newSession.user.id;
          await fetchProfile(newSession);
        }
      } else {
        lastUserId.current = null;
        setUser(null);
      }

      setIsLoading(false);
    });

    // Failsafe timeout
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
  }, []);

  // --- 3. Protection & Redirects ---
  useEffect(() => {
    if (isLoading || !navigationState?.key || !isMounted) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentPath = segments.join('/');
    const isOnAuthPage =
      currentPath === '(auth)/login' || currentPath === '(auth)/register';

    // Using a ref to prevent race conditions during redirects
    const checkRedirect = setTimeout(() => {
      if (!user && !inAuthGroup && !isOnAuthPage) {
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup && !isOnAuthPage) {
        router.replace('/(main)');
      }
    }, 100);

    return () => clearTimeout(checkRedirect);
  }, [user, isLoading, segments, navigationState, isMounted]);

  // --- Actions ---
  const login = async (email: string, p: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: p,
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, p: string, f: string, l: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: p,
      options: { data: { first_name: f, last_name: l } },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    lastUserId.current = null;
    lastAccessToken.current = undefined;
    setUser(null);
    setSession(null);
    router.replace('/(auth)/login');
  };

  const refreshProfile = async () => {
    if (session) {
      await fetchProfile(session);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
