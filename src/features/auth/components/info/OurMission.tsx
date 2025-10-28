// src/features/auth/components/info/OurMission.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { AppTheme } from '@/shared/theme/theme';

export function OurMission() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fonts.bold }]}>
        Our Mission
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        We believe financial clarity should be accessible to everyone. Our mission is to democratize professional-grade financial management tools, making them intuitive enough for individuals while powerful enough for certified professionals. Through innovative technology and human expertise, we help our users make informed financial decisions with confidence.
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