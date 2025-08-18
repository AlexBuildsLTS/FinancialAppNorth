/**
 * A professional color palette based on user specifications.
 * Light Theme: Off-White, Light Blue Primary, Orange Highlight, Black Text
 * Dark Theme: Dark Navy Blue, White Text, Green Accent, Orange Highlight
 */
export const lightColors = {
  background: '#A5A2A5FF',      // Soft off-white
  surface: '#FFFFFF',          // Pure white for cards
  surfaceVariant: '#E9ECEF',   // Light gray for subtle contrast
  text: '#0B0C0EFF',             // Very dark gray (Black) for primary text
  textSecondary: '#6C757D',    // Muted gray for secondary text
  border: '#DEE2E6',           // Light gray for borders
  
  primary: '#BB4711FF',          // Professional light blue
  primaryContrast: '#FFFFFF',
  
  success: '#2ECC71',          // Vibrant green
  warning: '#F39C12',          // Professional orange
  error: '#E74C3C',             // Clear red
  
  tabBarActive: '#3498DB',
  tabBarInactive: '#6C757D',
  purple: '#8A2BE2',            // Blue Violet for Food & Dining
};

export const darkColors = {
  background: '#0A192F',      // Dark navy blue
  surface: '#172A45',          // Slightly lighter navy for cards
  surfaceVariant: '#223A5E',   // Even lighter navy for contrast
  text: '#FFFFFF',             // Pure white text
  textSecondary: '#8892B0',    // Light slate gray for secondary text
  border: '#223A5E',           // Muted navy border
  
  primary: '#1DB954',          // Vibrant green accent
  primaryContrast: '#FFFFFF',

  success: '#1DB954',
  warning: '#FF7B00',          // Bright, professional orange
  error: '#E74C3C',
  purple: '#BF40BF',            // A shade of purple for Food & Dining
  
  tabBarActive: '#1DB954',
  tabBarInactive: '#8892B0',
};

export type ColorScheme = typeof lightColors;