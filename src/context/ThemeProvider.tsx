import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@theme_preference';

interface ThemeContextType {
  isDark: boolean;
  colors: typeof lightColors;
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  // Load theme from storage on initial app load
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedScheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedScheme === 'dark' || storedScheme === 'light') {
          setIsDark(storedScheme === 'dark');
        } else {
          // Default to system scheme if nothing is stored
          setIsDark(systemScheme === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference.', e);
        setIsDark(systemScheme === 'dark');
      }
    };

    loadThemePreference();
  }, [systemScheme]);
  
  const setColorScheme = async (scheme: 'light' | 'dark' | 'system') => {
    try {
      if (scheme === 'system') {
        setIsDark(systemScheme === 'dark');
        await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        setIsDark(scheme === 'dark');
        await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      }
    } catch (e) {
        console.error('Failed to save theme preference.', e);
    }
  };
  
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};