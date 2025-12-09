import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  useRef
} from 'react';
import { Alert, AppState } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types'; 

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const mountedRef = useRef(true);

  // --- HELPER: RESOLVE AVATAR ---
  const resolveAvatarUrl = useCallback(async (avatarPath: string | null | undefined): Promise<string | null> => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath; 
    try {
      const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
      return data.publicUrl;
    } catch { return null; }
  }, []);

  // --- HELPER: FORCE LOGOUT (ZOMBIE KILLER) ---
  const forceLogout = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch (e) {}
    if (mountedRef.current) {
        setUser(null); setSession(null); setProfile(null); setIsLoading(false);
    }
    // Force Navigation to Login
    router.replace('/(auth)/login');
  }, [router]);

  // --- CORE: FETCH & SYNC PROFILE ---
  const fetchAndSetProfile = useCallback(async (userId: string, email: string) => {
    try {
      console.log(`🔍 [Auth] Fetching profile for user ${userId}`);
      // 1. Fetch Profile
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

      if (error) {
        console.error("❌ [Auth] Profile fetch error:", error);
        await forceLogout();
        return;
      }

      console.log(`✅ [Auth] Profile fetched:`, data ? 'exists' : 'null');

      let profileData = data as ProfileRow | null;

      // 2. Auto-Repair if Missing (Self-Healing)
      if (!profileData) {
        console.log(`🛠️ [Auth] Profile missing. Repairing ${userId}...`);
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                role: 'member',
                first_name: 'User',
                last_name: '',
                currency: 'USD',
                country: 'US',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
            .select().single();

        if (createError) {
            console.error("❌ [Auth] Repair Failed.", createError);
            await forceLogout();
            return;
        }
        console.log(`✅ [Auth] Profile repaired:`, newProfile);
        profileData = newProfile;
      }

      // 3. Update State
      if (mountedRef.current && profileData) {
          setProfile(profileData);
          const avatarUrl = await resolveAvatarUrl(profileData.avatar_url);
          
          setUser({
            id: userId,
            email,
            name: profileData.first_name ? `${profileData.first_name} ${profileData.last_name}` : email.split('@')[0],
            role: (profileData.role as UserRole) ?? 'member',
            status: 'active',
            avatar: avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${userId}`,
            currency: profileData.currency || 'USD', 
            country: profileData.country || 'US'
          });
      }
    } catch (err) {
      console.error('[Auth] Fetch Error:', err);
    }
  }, [resolveAvatarUrl, forceLogout]);

  // --- INIT SESSION ---
  useEffect(() => {
    mountedRef.current = true;
    let initComplete = false;

    const runInit = async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                if (mountedRef.current) setIsLoading(false);
                return;
            }
            
            if (mountedRef.current) {
                 setSession(data.session);
                 // Set auth for realtime
                 supabase.realtime.setAuth(data.session.access_token);
                 // Wait for profile, but timeout below protects us
                 await fetchAndSetProfile(data.session.user.id, data.session.user.email!);
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

    // SAFETY VALVE: Stop loading after 3s if DB is stuck
    const safetyTimeout = setTimeout(() => {
        if (mountedRef.current && !initComplete) {
            console.warn("⚠️ [Auth] Init Timeout - Forcing App Load");
            initComplete = true;
            setIsLoading(false); 
        }
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mountedRef.current) return;

      setSession(newSession);

      if (newSession?.user) {
        // Set auth for realtime subscriptions
        supabase.realtime.setAuth(newSession.access_token);
        await fetchAndSetProfile(newSession.user.id, newSession.user.email!);
      } else {
        setUser(null); setProfile(null); setIsLoading(false);
      }
    });

    return () => { 
        mountedRef.current = false; 
        clearTimeout(safetyTimeout);
        subscription.unsubscribe(); 
    };
  }, [fetchAndSetProfile]);

  // --- PUBLIC ACTIONS ---
  
  const refreshProfile = async () => { 
      if (session?.user) await fetchAndSetProfile(session.user.id, session.user.email!); 
  };
  
  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) throw error;
      // Wait up to 5 seconds for auth state change to set loading false
      setTimeout(() => {
        if (mountedRef.current) setIsLoading(false);
      }, 5000);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, fName: string, lName: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
        email, password, options: { data: { first_name: fName, last_name: lName } } 
    });
    if (error) { setIsLoading(false); throw error; }
    if (data.user) await fetchAndSetProfile(data.user.id, email);
    setIsLoading(false);
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } 
    finally {
        if (mountedRef.current) { 
            setUser(null); setSession(null); setProfile(null); setIsLoading(false); 
        }
        router.replace('/(auth)/login');
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
    user, session, isAuthenticated: !!session, login, register, logout,
    resetPassword, updatePassword, isLoading, refreshProfile, profile
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