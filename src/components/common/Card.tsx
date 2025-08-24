import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export default function Card({ children, style }: CardProps) {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.surface, borderColor: colors.border },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});