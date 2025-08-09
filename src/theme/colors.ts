export type ColorScheme = 'light' | 'dark';

export const palette = {
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  white: '#ffffff',
};

export const colors = {
  light: {
    background: '#f9fafb', // Off-white
    surface: '#ffffff', // Pure white for cards
    surfaceVariant: '#f1f5f9', // Light variant for secondary surfaces
    text: '#111827', // Dark gray
    textSecondary: '#6b7280', // Medium gray
    border: '#e5e7eb', // Light gray
    primary: palette.blue,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    tabBarActive: palette.blue,
    tabBarInactive: '#9ca3af',
  },
  dark: {
    background: '#111827', // Dark blue-gray
    surface: '#1f2937', // Slightly lighter card background
    surfaceVariant: '#374151', // Dark variant for secondary surfaces
    text: '#f9fafb', // Off-white
    textSecondary: '#9ca3af', // Medium gray
    border: '#374151', // Darker border
    primary: palette.blue,
    success: palette.green,
    warning: palette.yellow,
    error: palette.red,
    tabBarActive: palette.white,
    tabBarInactive: '#6b7280',
  },
};

export type ThemeColors = typeof colors.light;