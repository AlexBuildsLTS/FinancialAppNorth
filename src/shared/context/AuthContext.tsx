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

  // Constants for Avatar Logic
  const AVATARS_BUCKET = 'avatars';
  const SIGNED_URL_EXPIRES = 60; 

  const resolveAvatarUrl = async (avatarPath: string | null | undefined, userId: string): Promise<string | null> => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath;

    try {
      const publicUrlResult = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
      const publicUrl = publicUrlResult?.data?.publicUrl ?? null;
      if (publicUrl) return publicUrl;

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

  // Fetch profile and set user state
  const fetchAndSetProfile = async (userId: string, email: string) => {
    // CRITICAL FIX: Do NOT set isLoading(true) here. This prevents global flashing.
    try {
      const res = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const data = res.data as ProfileRow | null;
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
    } 
    // Note: We don't need to set isLoading(false) here because initSession handles the initial load state
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
        // Only stop loading once after the initial check is complete
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session) {
        // Background update - keeps UI stable
        await fetchAndSetProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setProfile(null);
        setIsLoading(false); // Ensure loading stops on logout
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id || !session.user.email) return;
    await fetchAndSetProfile(session.user.id, session.user.email);
  }, [session]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true); // Manual actions like login SHOULD show loading
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
    router.replace('/login');
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

// Keep your existing useProfile hook exactly as is
export const useProfile = () => {
  const { profile, isLoading, refreshProfile, user } = useAuth();
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const resolve = async () => {
      if (!user) { if (mounted) setResolvedAvatar(null); return; }
      const avatarPath = profile?.avatar_url;
      if (!avatarPath) { if (mounted) setResolvedAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`); return; }
      
      if (avatarPath.startsWith('http')) { if (mounted) setResolvedAvatar(avatarPath); return; }
      const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
      if (mounted) setResolvedAvatar(data.publicUrl);
    };
    resolve();
    return () => { mounted = false; };
  }, [profile, user]);

  return { profile, isLoading, refreshProfile, avatar: resolvedAvatar };
};