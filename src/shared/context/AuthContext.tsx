import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check
    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(data.session);
          if (data.session) {
            await fetchProfile(data.session.user.id, data.session.user.email!);
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    // 2. Real-time Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      // 1. Get Profile Data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      const profileData = data || {};
      
      // 2. Fix Avatar URL (CRITICAL STEP)
      let avatarUrl = profileData.avatar_url;
      
      // If we have a path but it's not a full URL, get the public URL from Supabase
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const { data: publicUrlData } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(avatarUrl);
          
        if (publicUrlData) {
          avatarUrl = publicUrlData.publicUrl;
        }
      }

      // Default avatar if none exists
      if (!avatarUrl) {
        avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${userId}`;
      }
      
      const appUser: User = {
        id: userId,
        email: email,
        name: profileData.first_name ? `${profileData.first_name} ${profileData.last_name}` : email.split('@')[0],
        role: profileData.role || UserRole.MEMBER,
        status: 'active',
        avatar: avatarUrl,
      };

      setUser(appUser);
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    if (!password) {
        Alert.alert("Error", "Password is required.");
        setIsLoading(false);
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    
    // 1. Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'member'
        }
      }
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    // 2. Create Profile (Failsafe)
    if (data.user) {
       const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        role: 'member',
        email: email,
        updated_at: new Date().toISOString(),
      });
      
      if (profileError) console.error("Profile creation error:", profileError);
    }
    
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error);
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!session, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};