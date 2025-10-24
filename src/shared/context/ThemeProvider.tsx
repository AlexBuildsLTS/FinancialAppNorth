// src/shared/context/ThemeProvider.tsx
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, AppTheme } from '@/shared/theme/theme';

interface ThemeContextType {
  theme: AppTheme & { name: 'light' | 'dark' };
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: { ...lightTheme, name: 'light' },
  isDark: false,
  toggleTheme: () => {},
});



export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => { setIsDark(systemScheme === 'dark'); }, [systemScheme]);

    const toggleTheme = () => setIsDark(prev => !prev);

  const theme = useMemo(() => {
    const baseTheme = isDark ? darkTheme : lightTheme;

    // Define fallback values for colors and spacing
    const fallbackColors = {
      primary: '#000',
      accent: '#000', 
      background: '#fff', 
      surface: '#eee', 
      text: '#000',
      textPrimary: '#000', 
      textSecondary: '#555', 
      border: '#ccc', 
      success: '#0f0', 
      warning: '#ff0', 
      error: '#f00', 
      primaryContrast: '#fff',
      surfaceContrast: '#000'
    };
    const fallbackSpacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 };

    // Ensure we have a valid theme object, defaulting to a structure with fallback colors/spacing if baseTheme is null/undefined.
    // This ensures that 'currentTheme' will always have 'colors' and 'spacing' properties,
    // even if baseTheme is null, undefined, or an empty object.
    const currentTheme = baseTheme ?? { colors: fallbackColors, spacing: fallbackSpacing };

    // Ensure colors and spacing are present, using fallback if they are missing from the current theme object.
    // This handles cases where currentTheme might be an object like { name: 'light' } without colors/spacing.
    const finalColors = currentTheme.colors ?? fallbackColors;
    const finalSpacing = currentTheme.spacing ?? fallbackSpacing;

    // Construct the final theme object, ensuring it conforms to the expected interface.
    const constructedTheme: AppTheme & { name: 'light' | 'dark' } = {
      colors: finalColors,
      spacing: finalSpacing,
      name: isDark ? 'dark' : 'light',
    };
    return constructedTheme;
  }, [isDark]);
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);