// A professional and modern color palette

export const lightColors = {
  // Main Colors
  background: '#F0F2F5', // Soft, light grey background (not extreme white)
  surface: '#FFFFFF',    // Pure white for cards to make them pop
  
  // Accent Colors
  primary: '#BB4711',     // Professional Orange
  primaryContrast: '#FFFFFF',
  secondary: '#007AFF',   // Professional Blue for secondary actions

  // Text Colors
  text: '#0B0C0E',         // Very dark gray/black for high contrast
  textSecondary: '#6C757D', // Muted gray for less important text

  // Utility Colors
  border: '#DADDDF',
  surfaceVariant: '#E7E9EC',
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
  text: '#FFFFFF',         // Pure white text
  textSecondary: '#8892B0', // Light slate gray for less important text

  // Utility Colors
  border: '#2A3F5C',
  surfaceVariant: '#1E3250',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
};

export type ColorScheme = typeof lightColors;