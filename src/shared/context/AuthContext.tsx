import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

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

  // Session monitoring
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  const AVATARS_BUCKET = 'avatars';
  const SIGNED_URL_EXPIRES = 60;

  // Handle deep linking for password reset
  const handleDeepLink = useCallback(async (url: string) => {
    const { path, queryParams } = Linking.parse(url);

    if (path === 'reset-password' && queryParams?.access_token && queryParams?.refresh_token) {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: queryParams.access_token as string,
          refresh_token: queryParams.refresh_token as string,
        });

        if (error) throw error;

        // Navigate to login with reset mode
        router.replace('/(auth)/login?mode=reset');
      } catch (error) {
        console.error('Error handling password reset link:', error);
        Alert.alert('Error', 'Invalid or expired password reset link');
      }
    }
  }, [router]);

  // Monitor session expiry and refresh tokens
  const monitorSession = useCallback(() => {
    if (!session?.expires_at) return;

    const expiryTime = new Date(session.expires_at * 1000);
    setSessionExpiry(expiryTime);

    // Refresh token 5 minutes before expiry
    const refreshTime = new Date(expiryTime.getTime() - 5 * 60 * 1000);
    const now = new Date();

    if (now >= refreshTime) {
      supabase.auth.refreshSession().catch(error => {
        console.error('Session refresh failed:', error);
        // Force logout if refresh fails
        logout();
      });
    }
  }, [session]);

  // Check if session needs refresh
  useEffect(() => {
    if (session) {
      monitorSession();
    }
  }, [session, monitorSession]);

  const resolveAvatarUrl = async (avatarPath: string | null | undefined, userId: string): Promise<string | null> => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath;

    try {
      // 1. Try Public URL
      const publicUrlResult = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
      const publicUrl = publicUrlResult?.data?.publicUrl ?? null;
      if (publicUrl) return publicUrl;

      // 2. Try Signed URL (Fallback)
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from(AVATARS_BUCKET)
        .createSignedUrl(avatarPath, SIGNED_URL_EXPIRES);

      if (signedError) return null;
      return signedData?.signedUrl ?? null;
    } catch (err) {
      return null;
    }
  };

  const fetchAndSetProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') console.error('Error fetching profile:', error.message);

      const profileData = (data as ProfileRow) || null;
      setProfile(profileData);

      let avatarUrl = profileData ? await resolveAvatarUrl(profileData.avatar_url, userId) : null;
      if (!avatarUrl) {
        avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${userId}`;
      }

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

      // Force new object reference to trigger re-render
      setUser({ ...appUser });

    } catch (err) {
      console.error('fetchAndSetProfile error:', err);
    }
    // Note: isLoading is handled in initSession and login/register
  };

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(data.session);
          if (data.session) {
            await fetchAndSetProfile(data.session.user.id, data.session.user.email!);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    // Handle deep links
    const handleUrl = (event: { url: string }) => {
      handleDeepLink(event.url);
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleUrl);

    // Check initial URL
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session) {
        await fetchAndSetProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, [handleDeepLink]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id || !session.user.email) return;
    // Small delay to allow DB write to propagate
    await new Promise(r => setTimeout(r, 100));
    await fetchAndSetProfile(session.user.id, session.user.email);
  }, [session]);

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
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, role: 'member' } },
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'member',
        email,
        updated_at: new Date().toISOString(),
      });
      await fetchAndSetProfile(data.user.id, email);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setSessionExpiry(null);
    setIsLoading(false);
    try {
      router.replace('/(auth)/login');
    } catch (e) {
      // ignore nav errors
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

  return (
    <AuthContext.Provider value={{
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Restored full useProfile hook implementation
export const useProfile = () => {
  const { profile, isLoading, refreshProfile, user } = useAuth();
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const AVATARS_BUCKET = 'avatars';
    const SIGNED_URL_EXPIRES = 60;

    const resolve = async () => {
      if (!user) { if (mounted) setResolvedAvatar(null); return; }
      const avatarPath = profile?.avatar_url;
      if (!avatarPath) { if (mounted) setResolvedAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`); return; }
      
      if (avatarPath.startsWith('http')) { if (mounted) setResolvedAvatar(avatarPath); return; }
      
      try {
        const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
        if (mounted) setResolvedAvatar(data.publicUrl);
      } catch (e) {
         if (mounted) setResolvedAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`);
      }
    };
    resolve();
    return () => { mounted = false; };
  }, [profile, user]);

  return { profile, isLoading, refreshProfile, avatar: resolvedAvatar };
};