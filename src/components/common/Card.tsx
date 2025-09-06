// src/components/common/Card.tsx

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<any> = ({ children, style, padding = 24 }: CardProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        padding: padding,
        ...Platform.select({
          ios: { 
            shadowColor: isDark ? '#000' : '#555',
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 10 
          },
          android: { elevation: 5 },
          web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }
        }),
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
  },
});

// keep default export to be tolerant
export default Card;
