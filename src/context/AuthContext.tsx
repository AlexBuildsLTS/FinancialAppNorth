import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Helper function to generate initials from an email
const getInitials = (email: string) => {
  const parts = email.split('@')[0].split('.');
  let initials = '';
  if (parts.length > 0) {
    initials += parts[0].charAt(0);
    if (parts.length > 1) {
      initials += parts[parts.length - 1].charAt(0);
    }
  }
  return initials.toUpperCase();
};

// Helper function to generate an SVG data URL for a profile picture
const generateAvatarUrl = (email: string) => {
  const initials = getInitials(email);
  const bgColor = getRandomColor();
  const textColor = '#FFFFFF'; // White text for contrast

  const svg = `
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" fill="${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="60">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export type UserRole = 'Member' | 'Premium Member' | 'Professional Accountant' | 'Support' | 'Administrator';

export interface User {
  id: string;
  uniqueUserId: string;
  email: string;
  role: UserRole;
  displayName?: string;
  avatarUrl?: string;
  apiKeys?: {
    openai?: string;
    gemini?: string;
    claude?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  signIn: (role: UserRole) => void;
  signOut: () => void;
  initialized: boolean;
  updateUser: (updatedData: Partial<User>) => void;
  isLoading: boolean;
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

  const signIn = async (role: UserRole) => {
    const mockEmail = `user${Math.random().toString(36).substring(2, 8)}@domain.com`; // Mock email
    const uniqueUserId = `USR_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    let displayName = 'New User';
    if (role === 'Professional Accountant') {
      displayName = 'Alex Professional';
    } else if (role === 'Member') {
      displayName = 'Alex Member';
    } else if (role === 'Premium Member') {
      displayName = 'Alex Premium';
    } else if (role === 'Administrator') {
      displayName = 'Admin User';
    } else if (role === 'Support') {
      displayName = 'Support Agent';
    }

    const newUser: User = { 
      id: '123', 
      uniqueUserId,
      email: mockEmail, 
      role, 
      displayName, 
      avatarUrl: generateAvatarUrl(mockEmail), // Generate avatar based on email
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
