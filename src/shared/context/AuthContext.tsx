import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '@./../src/types';
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

    async function initSession() {
      try {
        // 1. Check for existing session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(data.session);
          if (data.session) {
            await fetchProfile(data.session.user.id, data.session.user.email!);
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        if (mounted) setIsLoading(false); // <--- THIS IS THE FIX: ALWAYS TURN OFF SPINNER
      }
    }

    initSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id, session.user.email!);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      const profileData = data || {};
      
      const appUser: User = {
        id: userId,
        email: email,
        name: profileData.first_name ? `${profileData.first_name} ${profileData.last_name}` : email.split('@')[0],
        role: profileData.role || UserRole.MEMBER,
        status: 'active',
        avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      };

      setUser(appUser);
    } catch (error) {
      console.error('Profile fetch error:', error);
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