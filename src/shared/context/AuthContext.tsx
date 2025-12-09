import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

// --- Types ---
// Moved ProfileRow here to keep it close to usage and avoid external circular dependencies if types.ts imports AuthContext
export type ProfileRow = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  currency?: string | null;
  country?: string | null;
  updated_at?: string | null;
  [key: string]: any;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  profile?: ProfileRow | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const router = useRouter();

  // --- Constants ---
  const AVATARS_BUCKET = 'avatars';
  const SIGNED_URL_EXPIRES = 60;

  // --- Helper: Resolve Avatar URL ---
  // Memoized to prevent re-creation on every render
  const resolveAvatarUrl = useCallback(async (avatarPath: string | null | undefined): Promise<string | null> => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath;

    try {
      // 1. Try Public URL first (faster, no auth check needed for public buckets)
      const publicUrlResult = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
      if (publicUrlResult?.data?.publicUrl) return publicUrlResult.data.publicUrl;

      // 2. Fallback to Signed URL if bucket is private
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from(AVATARS_BUCKET)
        .createSignedUrl(avatarPath, SIGNED_URL_EXPIRES);

      if (signedError) return null;
      return signedData?.signedUrl ?? null;
    } catch (err) {
      console.warn('Avatar resolution failed:', err);
      return null;
    }
  }, []);

  // --- Helper: Fetch Profile & Construct User Object ---
  // This function centralizes all "User State" updates to ensure they happen atomically
  const fetchAndSetProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message);
      }

      const profileData = (data as ProfileRow) || null;
      
      // Update profile state
      setProfile(profileData);

      // Resolve Avatar
      let avatarUrl = profileData ? await resolveAvatarUrl(profileData.avatar_url) : null;
      if (!avatarUrl) {
        avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${userId}`;
      }

      // Construct User Object
      const appUser: User = {
        id: userId,
        email,
        name: profileData?.first_name ? `${profileData.first_name} ${profileData.last_name}` : email.split('@')[0],
        role: (profileData?.role as UserRole) ?? UserRole.MEMBER,
        status: 'active',
        avatar: avatarUrl,
        currency: profileData?.currency || 'USD', 
        country: profileData?.country || 'US'
      };

      // Set User State (Atomically updates everything needed for the UI)
      setUser(appUser);

    } catch (err) {
      console.error('fetchAndSetProfile error:', err);
      // Even if profile fails, we might still want a basic user object if session exists
      setUser({
        id: userId,
        email,
        name: email.split('@')[0],
        role: UserRole.MEMBER,
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/avataaars/png?seed=${userId}`,
        currency: 'USD',
        country: 'US'
      });
    }
  }, [resolveAvatarUrl]);

  // --- Deep Link Handling ---
  const handleDeepLink = useCallback(async (url: string) => {
    const { path, queryParams } = Linking.parse(url);

    if (path === 'reset-password' && queryParams?.access_token && queryParams?.refresh_token) {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: queryParams.access_token as string,
          refresh_token: queryParams.refresh_token as string,
        });

        if (error) throw error;
        router.replace('/(auth)/login?mode=reset');
      } catch (error) {
        console.error('Error handling password reset link:', error);
        Alert.alert('Error', 'Invalid or expired password reset link');
      }
    }
  }, [router]);

  // --- Session Monitoring ---
  // Handles token refresh logic
  const monitorSession = useCallback(() => {
    if (!session?.expires_at) return;

    const expiryTime = new Date(session.expires_at * 1000);
    const refreshTime = new Date(expiryTime.getTime() - 5 * 60 * 1000); // 5 mins before expiry
    const now = new Date();

    if (now >= refreshTime) {
      supabase.auth.refreshSession().catch(error => {
        console.error('Session refresh failed:', error);
        // Do NOT force logout immediately on refresh fail to avoid bad UX if offline
        // The next API call will fail typically, handling it naturally
      });
    }
  }, [session]);

  useEffect(() => {
    if (session) monitorSession();
  }, [session, monitorSession]);

  // --- Initialization & Auth State Listener ---
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        // 1. Get Initial Session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(data.session);
          if (data.session?.user) {
            await fetchAndSetProfile(data.session.user.id, data.session.user.email!);
          }
        }
      } catch (err) {
        console.error('Session init failed:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    // 2. Setup Deep Linking
    const handleUrl = (event: { url: string }) => handleDeepLink(event.url);
    const linkingSub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });

    // 3. Listen for Auth Changes (Login, Logout, Token Refresh)
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);

      if (session?.user) {
        // Only fetch profile if user ID changed or we don't have a profile yet
        // This prevents re-fetching on simple token refreshes if we wanted to optimize further
        await fetchAndSetProfile(session.user.id, session.user.email!);
      } else {
        // Clear state on logout
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      linkingSub.remove();
      authSubscription.unsubscribe();
    };
  }, [handleDeepLink, fetchAndSetProfile]);

  // --- Actions ---

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id || !session.user.email) return;
    // Small delay allows DB trigger/write to propagate before we read back
    await new Promise(r => setTimeout(r, 100));
    await fetchAndSetProfile(session.user.id, session.user.email);
  }, [session, fetchAndSetProfile]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    if (!password) {
      Alert.alert('Error', 'Password is required.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // AuthStateChange listener handles the rest
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    
    // 1. Sign Up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, role: 'member' } },
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    // 2. Upsert Profile (Ensure DB sync)
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'member',
        email,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
         console.error("Profile creation error", profileError);
         // Don't throw here, allow the user to exist, profile can be fixed later
      }
      
      await fetchAndSetProfile(data.user.id, email);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut error', err);
    } finally {
      // Always clear local state even if server logout fails (offline case)
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsLoading(false);
      // Navigation is handled by the consumer or the root layout redirecting based on !user
      try {
        if (router.canDismiss()) router.dismissAll();
        router.replace('/(auth)/login');
      } catch (e) {
        console.log('Navigation after logout handled by layout');
      }
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('reset-password'),
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  };

  // --- Context Value ---
  // Memoized to prevent unnecessary re-renders of consuming components
  const value = useMemo(() => ({
    user,
    session,
    isAuthenticated: !!session,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    isLoading,
    refreshProfile,
    profile
  }), [user, session, isLoading, profile, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Hook: useProfile ---
// Defined here to avoid Circular Dependency issues (AuthContext <-> useProfile)
export const useProfile = () => {
  const { profile, isLoading, refreshProfile, user } = useAuth();
  // We can derive avatar directly from the user object now, since AuthProvider handles it
  // But we keep this hook for compatibility with existing code that expects it.
  
  return { 
    profile, 
    isLoading, 
    refreshProfile, 
    avatar: user?.avatar || null 
  };
};