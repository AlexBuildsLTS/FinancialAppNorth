// src/shared/theme/theme.ts

// This is your exact color palette, mapped to semantic names.
interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  primaryContrast: string;
  surfaceContrast: string;
}

interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

interface ThemeFonts {
  light: string;
  regular: string;
  medium: string;
  semiBold: string;
  bold: string;
}

export interface AppTheme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  fonts: ThemeFonts;
}

const lightColors: ThemeColors = {
  primary: '#00b451ff',
  accent: '#2e9256ff',
  background: '#0F172A',
  surface: '#1f2227',
  text: '#00df82cc',
  textPrimary: '#ffffffff', 
  textSecondary: '#3f9604d3', 
  border: '#bdc8cfff',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F',
  primaryContrast: '#FFFFFF',
  surfaceContrast: '#0A192F', // For text on accent-colored buttons
};

const darkColors: ThemeColors = {
  primary: '#1DB954',
  accent: '#60f393ff',
  background: '#00002F',
  surface: '#111827',
  text: '#05bdc4ef',
  textPrimary: '#f7f1f1ff',
  textSecondary: '#067547ff',
  border: '#2A3F5C',
  success: '#487e4bff',
  warning: '#FFA726',
  error: '#EF5350',
  primaryContrast: '#FFFFFF',
  surfaceContrast: '#FFFFFF',
};

const spacing: ThemeSpacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 40,
};

const fonts: ThemeFonts = {
  light: 'InterLight',
  regular: 'InterRegular',
  medium: 'InterMedium',
  semiBold: 'InterSemiBold',
  bold: 'InterBold',
};

export const lightTheme: AppTheme = { colors: lightColors, spacing, fonts };
export const darkTheme: AppTheme = { colors: darkColors, spacing, fonts };
