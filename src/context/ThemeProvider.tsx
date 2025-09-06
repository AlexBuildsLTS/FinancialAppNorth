import { darkColors, lightColors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<Theme>(systemTheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem('app-theme')) as Theme | null;
        setTheme(savedTheme || systemTheme);
      } catch (error) {
        console.error("Failed to load theme from storage", error);
        setTheme(systemTheme);
      }
    };
    loadTheme();
  }, [systemTheme]);

  const handleSetTheme = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.error("Failed to save theme to storage", error);
    }
  };

  const colors = useMemo(() => (theme === 'light' ? lightColors : darkColors), [theme]);

  const value = { theme, setTheme: handleSetTheme, colors, isDark: theme === 'dark' };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// FIX: 'useTheme' is a named export. This resolves all related import errors.
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Backwards-compatible default export: many files import `useTheme` as the default.
export default useTheme;