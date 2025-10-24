// src/components/common/Cards.tsx

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';

interface CardsProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Cards: React.FC<CardsProps> = ({ children, style, padding = 24 }) => {
  const themeContext = useTheme();

  // Check if useTheme returned a valid context
  if (!themeContext) {
    throw new Error("ThemeContext is not provided. Please wrap your component within a ThemeProvider.");
  }

  const { theme: { colors } } = themeContext;
  if (!colors) {
    throw new Error("Colors are not defined in the theme.");
  }

  return (
    <View style={[
      styles.Cards,
      { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        padding: padding,
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  Cards: {
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }
    }),
  },
});

// Keep default export for backward compatibility
export default Cards;