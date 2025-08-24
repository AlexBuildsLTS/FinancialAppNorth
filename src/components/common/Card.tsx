import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card = ({ children, style }: CardProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          // Use a subtle border in dark mode, and shadow in light mode
          borderColor: isDark ? colors.border : 'transparent',
          borderWidth: isDark ? 1 : 0,
        },
        !isDark && styles.lightShadow, // Apply shadow only in light mode
        style,
      ]}
    >
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
        shadowColor: 'rgb(0, 0, 0)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
});

export default Card;
