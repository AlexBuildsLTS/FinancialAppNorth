// src/shared/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

export type ProfileRow = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
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
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
      subscription.unsubscribe();
    };
  }, []);

  // Constants
  const AVATARS_BUCKET = 'avatars';
  const SIGNED_URL_EXPIRES = 60; // seconds; increase if needed

  // Resolve avatar: try public URL (synchronous) then signed URL (async) then null
  const resolveAvatarUrl = async (avatarPath: string | null | undefined, userId: string): Promise<string | null> => {
    if (!avatarPath) return null;

    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }

    try {
      // getPublicUrl is synchronous and returns { data: { publicUrl: string } }
      const publicUrlResult = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
      const publicUrl = publicUrlResult?.data?.publicUrl ?? null;
      if (publicUrl) return publicUrl;

      // Fallback: create signed URL (for private buckets)
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from(AVATARS_BUCKET)
        .createSignedUrl(avatarPath, SIGNED_URL_EXPIRES);

      if (signedError) {
        console.warn('createSignedUrl error', signedError);
        return null;
      }
      return signedData?.signedUrl ?? null;
    } catch (err) {
      console.error('resolveAvatarUrl error:', err);
      return null;
    }
  };

  // Fetch profile and set user state
  const fetchAndSetProfile = async (userId: string, email: string) => {
    setIsLoading(true);
    try {
      const res = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const data = res.data as ProfileRow | null;
      const error = res.error;

      if (error && (error as any)?.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      const profileData = data ?? null;
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
      };

      setUser(appUser);
    } catch (err) {
      console.error('fetchAndSetProfile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id || !session.user.email) return;
    await fetchAndSetProfile(session.user.id, session.user.email);
  }, [session]);

  // Auth actions
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
    // onAuthStateChange will fetch profile
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'member',
        },
      },
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'member',
        email,
        updated_at: new Date().toISOString(),
      });

      if (profileError) console.error('Profile creation error:', profileError);

      await fetchAndSetProfile(data.user.id, email);
    }

    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsLoading(false);
    try {
      router.replace('/login');
    } catch (e) {
      // ignore routing errors
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!session,
      login,
      register,
      logout,
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

/**
 * useProfile hook
 * returns profile row, loading, avatar (resolved URL), refreshProfile
 */
export const useProfile = () => {
  const { profile, isLoading, refreshProfile, user } = useAuth();
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const AVATARS_BUCKET = 'avatars';
    const SIGNED_URL_EXPIRES = 60;

    const resolve = async () => {
      if (!user) {
        if (mounted) setResolvedAvatar(null);
        return;
      }

      const avatarPath = profile?.avatar_url;
      if (!avatarPath) {
        if (mounted) setResolvedAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`);
        return;
      }

      try {
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
          if (mounted) setResolvedAvatar(avatarPath);
          return;
        }

        const publicUrlResult = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
        const publicUrl = publicUrlResult?.data?.publicUrl ?? null;
        if (publicUrl) {
          if (mounted) setResolvedAvatar(publicUrl);
          return;
        }

        const { data: signedData, error: signedError } = await supabase
          .storage
          .from(AVATARS_BUCKET)
          .createSignedUrl(avatarPath, SIGNED_URL_EXPIRES);

        if (!signedError && signedData?.signedUrl) {
          if (mounted) setResolvedAvatar(signedData.signedUrl);
          return;
        }

        if (mounted) setResolvedAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`);
      } catch (err) {
        console.error('useProfile resolve avatar error:', err);
        if (mounted) setResolvedAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`);
      }
    };

    resolve();
    return () => { mounted = false; };
  }, [profile, user]);

  return {
    profile,
    isLoading,
    refreshProfile,
    avatar: resolvedAvatar,
  };
};