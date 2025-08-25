import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: object;
  padding?: number; // Allow custom padding
}

export default function Card({ children, style, padding = 20 }: CardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        shadowColor: isDark ? '#000' : '#4E5C79', // A softer shadow color for light mode
        padding: padding,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 25,
      }
    }),
  },
});