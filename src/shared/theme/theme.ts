// src/shared/theme/theme.ts

// This is your exact color palette, mapped to semantic names.
const lightColors = {
  primary: '#BB4711',
  accent: '#BB4711',
  background: '#F0F2F5',
  surface: '#FFFFFF',
  text: '#0A192F',
  textPrimary: '#0A192F',
  textSecondary: '#6c757d',
  border: '#E0E0E0',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F',
  primaryContrast: '#FFFFFF',
  surfaceContrast: '#FFFFFF', // For text on accent-colored buttons
};

const darkColors = {
  primary: '#1DB954',
  accent: '#1DB954',
  background: '#0A192F',
  surface: '#172A45',
  text: '#E6F1FF',
  textPrimary: '#E6F1FF',
  textSecondary: '#8892B0',
  border: '#2A3F5C',
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  primaryContrast: '#FFFFFF',
  surfaceContrast: '#FFFFFF',
};

const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 40,
};

export const lightTheme = { colors: lightColors, spacing };
export const darkTheme = { colors: darkColors, spacing };

export type AppTheme = typeof lightTheme;