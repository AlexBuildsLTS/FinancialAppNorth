// src/features/auth/components/info/SupportTeam.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartHandshake } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { AppTheme } from '@/constants/theme';
import { Cards } from '@/components/Cards'; // Use Cards

export function SupportTeam() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.outerContainer}>
      <Cards style={styles.section}>
        <HeartHandshake size={40} color={theme.colors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fonts.bold }]}>
          Dedicated Support Team
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
          Our support team is always here to help. Premium features plus powerful ticket management tools provide guidance on using the platform effectively. While they don't provide CPA services directly, they can help you connect with the right resources and ensure you get the most out of your NorthFinance experience.
        </Text>
      </Cards>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  outerContainer: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    // Uses Cards base styles
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});