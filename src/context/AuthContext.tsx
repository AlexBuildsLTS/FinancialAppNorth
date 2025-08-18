import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User { // Exporting for use in other files
  id: string;
  uniqueUserId: string;
  email: string;
  role: 'Customer' | 'Support' | 'Accountant' | 'Administrator' | 'Moderator';
  displayName?: string;
  avatarUrl?: string;
  apiKeys?: {
    openai?: string;
    gemini?: string;
    claude?: string;
  };
}

export interface AuthContextType { // Exporting for use in other files
  user: User | null;
  signIn: (role: 'Customer' | 'Accountant') => void;
  signOut: () => void;
  initialized: boolean;
  updateUser: (updatedData: Partial<User>) => void;
  isLoading: boolean; // To show loading state while checking storage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setInitialized(true);
      }
    };
    loadUser();
  }, []);

  const signIn = async (role: 'Customer' | 'Accountant') => {
    const email = 'user@domain.com';
    const uniqueUserId = `USR_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newUser: User = { 
      id: '123', 
      uniqueUserId,
      email, 
      role, 
      displayName: role === 'Accountant' ? 'Alex Professional' : 'Alex Customer', 
      avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
      apiKeys: {}
    };
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, initialized, updateUser, isLoading: !initialized }}>
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