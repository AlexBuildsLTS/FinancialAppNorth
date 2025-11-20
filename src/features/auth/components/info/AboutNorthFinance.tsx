// src/features/auth/components/info/AboutNorthFinance.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { AppTheme } from '@/shared/theme/theme';

export function AboutNorthFinance() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fonts.bold }]}>
        About NorthFinance
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses with intelligent tools for tracking, analyzing, and optimizing their financial health. We combine cutting-edge AI technology with professional CPA expertise to deliver a seamless, secure, and intuitive financial management experience.
      </Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  section: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});