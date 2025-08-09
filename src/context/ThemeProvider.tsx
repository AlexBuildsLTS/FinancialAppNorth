import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme as useDeviceColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ColorScheme, ThemeColors } from '@/theme/colors';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  colorScheme: ColorScheme;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useDeviceColorScheme() ?? 'light';
  const [theme, setThemeState] = useState<Theme>('system');
  const colorScheme = theme === 'system' ? systemScheme : theme;
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = (await AsyncStorage.getItem('theme')) as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    };
    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system') {
        // This will trigger a re-render if the system theme changes
      }
    });

    return () => subscription.remove();
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const themeValues: ThemeContextProps = {
    theme,
    setTheme,
    colorScheme,
    colors: colors[colorScheme],
    isDark,
  };

  return (
    <ThemeContext.Provider value={themeValues}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};