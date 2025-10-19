// src/theme/colors.ts

export const lightColors = {
  // Main Colors
  background: '#F0F2F5', // Light grey background
  surface: '#FFFFFF',    // White for cards, sidebars, etc.
  
  // Accent Colors
  primary: '#BB4711',     // Professional Orange
  primaryContrast: '#FFFFFF',
  secondary: '#6c757d',   // Muted gray for secondary actions

  // Text Colors
  text: '#0A192F',         // Dark navy for high contrast and professional feel
  textSecondary: '#6c757d', // Muted gray for less important text

  // Tab Bar Colors
  tabBarActive: '#BB4711',
  tabBarInactive: '#6c757d',

  // Utility Colors
  border: '#E0E0E0',       // Subtle border color
  surfaceVariant: '#E8E8E8',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#ED6C02',
};

export const darkColors = {
  // Main Colors
  background: '#0A192F', // Dark navy blue
  surface: '#172A45',    // Slightly lighter navy for cards
  
  // Accent Colors
  primary: '#1DB954',     // Vibrant Green
  primaryContrast: '#FFFFFF',
  secondary: '#BB4711',   // Professional Orange as a secondary accent

  // Text Colors
  text: '#E6F1FF',         // Soft white text for better readability on dark backgrounds
  textSecondary: '#8892B0', // Light slate gray for less important text

  // Tab Bar Colors
  tabBarActive: '#1DB954',
  tabBarInactive: '#8892B0',

  // Utility Colors
  border: '#2A3F5C',       // Border color that fits the dark theme
  surfaceVariant: '#1E3250',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
};

export type ColorScheme = typeof lightColors;
