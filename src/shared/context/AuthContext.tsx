import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  useRef
} from 'react';
import { Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types'; 

// Database Row Definition (Aligned with Supabase Schema)
export type ProfileRow = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole; // Enforced Enum
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
  const mountedRef = useRef(true);

  // --- HELPER: RESOLVE AVATAR ---
  const resolveAvatarUrl = useCallback((avatarPath: string | null | undefined): string | null => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath; 
    try {
      const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(avatarPath);
      return data.publicUrl;
    } catch { return null; }
  }, []);

  // --- HELPER: FORCE LOGOUT (ZOMBIE KILLER) ---
  const forceLogout = useCallback(async () => {
    console.warn("⚠️ [Auth] Forcing logout due to critical error or missing session.");
    try { await supabase.auth.signOut(); } catch (e) { /* Ignore signout errors */ }
    
    if (mountedRef.current) {
        setUser(null); 
        setSession(null); 
        setProfile(null); 
        setIsLoading(false);
    }
    // Navigate to login
    router.replace('/(auth)/login');
  }, [router]);

  // --- CORE: FETCH & SYNC PROFILE ---
  const fetchAndSetProfile = useCallback(async (userId: string, email: string) => {
    try {
      console.log(`🔍 [Auth] Fetching profile for user ${userId}`);
      
      // 1. Fetch Profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("❌ [Auth] Profile fetch error:", error);
        // Only logout on permission errors, not network glitches
        if (error.code === '401' || error.code === '403') {
           // Optional: forceLogout() here if strict security is needed
        }
        return;
      }

      console.log(`✅ [Auth] Profile fetched:`, data ? 'Found' : 'Missing');

      let profileData = data as ProfileRow | null;

      // 2. Auto-Repair if Missing (Self-Healing)
      if (!profileData) {
        console.log(`🛠️ [Auth] Profile missing. Repairing ${userId}...`);
        
        // Use upsert to be safe against race conditions
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                role: UserRole.MEMBER, // Default role
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
        console.log(`✅ [Auth] Profile repaired successfully.`);
        profileData = newProfile as ProfileRow;
      }

      // 3. Update State
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
    mountedRef.current = true;
    let initComplete = false;

    const runInit = async () => {
        try {
            // Get initial session
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("[Auth] Session Init Error:", error.message);
                if (error.message.includes("Refresh Token")) {
                    console.warn("⚠️ [Auth] Detected Invalid Token Loop -> Cleaning up.");
                    await forceLogout();
                    return;
                }
            }
            
            if (!data.session) {
                if (mountedRef.current) setIsLoading(false);
                return;
            }
            
            if (mountedRef.current) {
                 setSession(data.session);
                 // Note: Supabase v2 handles realtime auth automatically via session
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

    // SAFETY VALVE: Stop loading after 3s if DB/Network is stuck
    const safetyTimeout = setTimeout(() => {
        if (mountedRef.current && !initComplete) {
            console.warn("⚠️ [Auth] Init Timeout - Forcing App Load");
            initComplete = true;
            setIsLoading(false); 
        }
    }, 3000);

    // Subscribe to Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[Auth] Event: ${event}`);
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !newSession)) {
        await forceLogout();
        return;
      }

      setSession(newSession);

      if (newSession?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            await fetchAndSetProfile(newSession.user.id, newSession.user.email!);
        }
      } 
    });

    return () => { 
        mountedRef.current = false; 
        clearTimeout(safetyTimeout);
        subscription.unsubscribe(); 
    };
  }, [fetchAndSetProfile, forceLogout]);

  // --- PUBLIC ACTIONS ---
   
  const refreshProfile = async () => { 
      if (session?.user) await fetchAndSetProfile(session.user.id, session.user.email!); 
  };
   
  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) throw error;
      // Loading state will be handled by the onAuthStateChange listener
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
            options: { 
                data: { first_name: fName, last_name: lName } 
            } 
        });
        
        if (error) throw error;
        
        // If auto-confirm is enabled, fetch profile immediately
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
    } finally {
        if (mountedRef.current) { 
            setUser(null); 
            setSession(null); 
            setProfile(null); 
            setIsLoading(false); 
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

  // Memoize context value
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