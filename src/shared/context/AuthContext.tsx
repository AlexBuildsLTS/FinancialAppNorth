import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
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

  const AVATARS_BUCKET = 'avatars';
  const SIGNED_URL_EXPIRES = 60;

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
    setIsLoading(false);
    try {
      router.replace('/login');
    } catch (e) {
      // ignore nav errors
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!session, login, register, logout, isLoading, refreshProfile, profile }}>
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