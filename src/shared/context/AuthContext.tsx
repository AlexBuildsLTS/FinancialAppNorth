import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  useRef
} from 'react';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types'; 

// Database Row Definition
export type ProfileRow = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  currency?: string | null;
  country?: string | null;
  updated_at?: string | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile?: ProfileRow | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, fName: string, lName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AVATARS_BUCKET = 'avatars';

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
   
  const router = useRouter();
  const segments = useSegments();
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // --- HELPER: RESOLVE AVATAR ---
  const resolveAvatarUrl = useCallback((avatarPath: string | null | undefined): string | null => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath; 
    try {
      const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
      return data.publicUrl;
    } catch { return null; }
  }, []);

  // --- CORE: FETCH & SYNC PROFILE ---
  const fetchAndSetProfile = useCallback(async (userId: string, email: string) => {
    if (!mountedRef.current) return;
    
    try {
      console.log(`🔍 [Auth] Fetching profile for user ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("❌ [Auth] Profile fetch error:", error);
        return;
      }

      let profileData = data as ProfileRow | null;

      // Auto-Repair if Missing
      if (!profileData) {
        console.log(`🛠️ [Auth] Profile missing. Repairing...`);
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                role: UserRole.MEMBER,
                first_name: 'Member',
                last_name: '',
                currency: 'USD',
                country: 'US',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
            .select()
            .single();

        if (createError) {
            console.error("❌ [Auth] Repair Failed:", createError);
            return;
        }
        profileData = newProfile as ProfileRow;
      }

      if (mountedRef.current && profileData) {
          setProfile(profileData);
          const avatarUrl = resolveAvatarUrl(profileData.avatar_url);
          
          setUser({
            id: userId,
            email,
            name: profileData.first_name ? `${profileData.first_name} ${profileData.last_name || ''}`.trim() : email.split('@')[0],
            role: profileData.role || UserRole.MEMBER,
            status: 'active',
            avatar: avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${userId}`,
            currency: profileData.currency || 'USD', 
            country: profileData.country || 'US',
            last_login: new Date().toISOString()
          });
      }
    } catch (err) {
      console.error('[Auth] Unexpected Fetch Error:', err);
    }
  }, [resolveAvatarUrl]);

  // --- INIT SESSION ---
  useEffect(() => {
    let initComplete = false;

    const runInit = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("[Auth] Session Init Error:", error.message);
                if (mountedRef.current) setIsLoading(false);
                return;
            }

            if (mountedRef.current) {
                setSession(data.session);
                if (data.session?.user) {
                    await fetchAndSetProfile(data.session.user.id, data.session.user.email!);
                }
            }
        } catch (err) {
            console.error('[Auth] Init Failed:', err);
        } finally {
            if (mountedRef.current && !initComplete) {
                initComplete = true;
                setIsLoading(false); 
            }
        }
    };

    runInit();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[Auth] Event: ${event}`);
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        router.replace('/(auth)/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        if (newSession?.user) {
            await fetchAndSetProfile(newSession.user.id, newSession.user.email!);
        }
        setIsLoading(false);
      }
    });

    return () => { 
        subscription.unsubscribe(); 
    };
  }, [fetchAndSetProfile, router]); // Minimized dependencies

  // --- PUBLIC ACTIONS ---
   
  const refreshProfile = async () => { 
      if (session?.user) await fetchAndSetProfile(session.user.id, session.user.email!); 
  };
   
  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, fName: string, lName: string) => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password, 
            options: { data: { first_name: fName, last_name: lName } } 
        });
        
        if (error) throw error;
        
        if (data.user) {
            await fetchAndSetProfile(data.user.id, email);
        }
    } catch (error) {
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = async () => {
    try { 
        await supabase.auth.signOut(); 
    } catch (e) {
        console.warn("SignOut Error", e);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { 
        redirectTo: Linking.createURL('reset-password') 
    });
    if (error) throw error;
  };

  const updatePassword = async (pw: string) => {
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) throw error;
  };

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const useProfile = () => {
  const { profile, isLoading, refreshProfile, user } = useAuth();
  return { profile, isLoading, refreshProfile, avatar: user?.avatar || null };
};