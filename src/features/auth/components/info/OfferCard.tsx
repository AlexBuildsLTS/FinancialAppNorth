// src/features/auth/components/info/OfferCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { AppTheme } from '@/constants/theme';
import { Cards } from '@/components/Cards'; // Use your Cards component

interface OfferCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function OfferCard({ icon: Icon, title, description }: OfferCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Cards style={styles.card}>
      <Icon size={28} color={theme.colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fonts.semiBold }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        {description}
      </Text>
    </Cards>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    // Inherits styles from Cards, add specifics here
    padding: theme.spacing.lg,
    height: '100%', // Ensure cards in a row have same height
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 17,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});