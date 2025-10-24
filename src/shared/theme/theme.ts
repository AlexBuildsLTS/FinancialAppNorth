// src/shared/theme/theme.ts

// This is your exact color palette, mapped to semantic names.
const lightColors = {
  primary: '#BB4711',
  accent: '#2e9256ff',
  background: '#ffffffff',
  surface: '#333333',
  text: '#658d5bff',
  textPrimary: '#bb4711',
  textSecondary: '#72eb82ff',
  border: '#D8DEE2',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F',
  primaryContrast: '#FFFFFF',
  surfaceContrast: '#0A192F', // For text on accent-colored buttons
};

const darkColors = {
  primary: '#1DB954',
  accent: '#60f393ff',
  background: '#0A192F',
  surface: '#172A45',
  text: '#afb0b1ff',
  textPrimary: '#E6F1FF',
  textSecondary: '#8892B0',
  border: '#2A3F5C',
  success: '#487e4bff',
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
