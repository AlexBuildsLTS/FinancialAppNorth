import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: colors.surface,
        // Use a subtle border in dark mode, and shadow in light mode
        borderColor: isDark ? colors.border : 'transparent',
        borderWidth: isDark ? 1 : 0,
      },
      !isDark && styles.lightShadow, // Apply shadow only in light mode
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  lightShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      }
    }),
  }
});

export default Card;