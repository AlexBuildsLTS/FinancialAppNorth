import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({ children, style, padding = 20 }: CardProps) {
  const { colors } = useTheme();

  const styles = createStyles(colors, padding);

  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors: any, padding: number) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  });