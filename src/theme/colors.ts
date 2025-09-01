// A professional and modern color palette

export const lightColors = {
  // Main Colors
  background: '#9faafbe7', // Soft, light grey background (not extreme white)
  surface: '#ffffffd4',    // Pure white for cards to make them pop
  
  // Accent Colors
  primary: '#d64705ff',     // Professional Orange
  primaryContrast: '#223127ff',
  secondary: '#204dc8ff',   // Professional Blue for secondary actions

  // Text Colors
  text: '#000000ff',         // Very dark gray/black for high contrast
  textSecondary: '#27417cff', // Muted gray for less important text

  // Tab Bar Colors
  tabBarActive: '#00134aff', // Use primary color for active tab
  tabBarInactive: '#6C757D', // Use secondary text color for inactive tab

  // Utility Colors
  border: '#135cefff',
  surfaceVariant: '#304e38ff',
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
  textSecondary: '#bbc7eaff', // Light slate gray for less important text

  // Tab Bar Colors
  tabBarActive: '#1DB954', // Use primary color for active tab
  tabBarInactive: '#8892B0', // Use secondary text color for inactive tab

  // Utility Colors
  border: '#2A3F5C',
  surfaceVariant: '#1E3250',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
};

export type ColorScheme = typeof lightColors;
