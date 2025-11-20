// src/features/auth/components/info/TierCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { AppTheme } from '@/shared/theme/theme';
import { Cards } from '@/shared/components/Cards'; // Use your Cards component

interface TierCardProps {
  title: string;
  description: string;
  features: string[];
  color: string;
}

export function TierCard({ title, description, features, color }: TierCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Cards style={StyleSheet.flatten([styles.card, { borderColor: color, shadowColor: color }])}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: color, fontFamily: theme.fonts.bold }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.description, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        {description}
      </Text>
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <ArrowRight size={16} color={color} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: theme.colors.textPrimary, fontFamily: theme.fonts.regular }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </Cards>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    // Inherits base styles from Cards
    borderWidth: 1.5, // Make border slightly thicker
    height: '100%',
    padding: theme.spacing.lg,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
  },
  description: {
    fontSize: 14,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  featuresContainer: {
    flex: 1, // Allow features to take remaining space
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align icon with top of text line
    marginBottom: theme.spacing.sm,
  },
  featureIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 3, // Adjust vertical alignment
  },
  featureText: {
    fontSize: 14,
    flex: 1, // Allow text to wrap
    lineHeight: 20,
  },
});