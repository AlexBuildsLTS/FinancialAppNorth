// src/features/auth/components/info/MembershipTiers.tsx
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { TierCard } from './TierCard';
import { useTheme } from '@/context/ThemeProvider';
import { AppTheme } from '@/constants/theme';

const tiers = [
  { title: "Member", description: "Perfect for individuals starting their financial journey", color: "#3B82F6", features: ['Basic transaction tracking', 'Budget creation and monitoring', 'Financial document storage', 'Monthly spending reports'] },
  { title: "Premium", description: "For serious financial planners who want advanced insights", color: "#1DB954", features: ['Everything in Member', 'Advanced analytics and reports', 'AI-powered financial insights', 'Custom budget categories', 'CPA consultation requests', 'Priority support'] },
  { title: "CPA", description: "Certified professionals managing multiple clients", color: "#F59E0B", features: ['Everything in Premium', 'Multi-client management dashboard', 'Client-level oversight', 'Professional reporting tools', 'Dedicated CPA resources'] },
  { title: "Support", description: "Team members helping users succeed", color: "#9333EA", features: ['Everything in Premium', 'Ticket management system', 'User assistance tools', 'Community moderation'] }
];

export function MembershipTiers() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);

  // Responsive grid layout
  const numColumns = width >= 768 ? 2 : 1;
  const itemWidthPercentage = 100 / numColumns;

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fonts.bold }]}>
        Membership Tiers
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        Choose the membership level that fits your needs. From individuals tracking personal finances to certified professionals managing client portfolios, we have a plan for everyone.
      </Text>
      <View style={styles.gridContainer}>
        {tiers.map((tier) => (
          <View key={tier.title} style={[styles.gridItem, { width: `${itemWidthPercentage}%` }]}>
            <TierCard
              title={tier.title}
              description={tier.description}
              color={tier.color}
              features={tier.features}
            />
          </View>
        ))}
      </View>
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
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
  },
  gridItem: {
    padding: theme.spacing.sm,
     ...Platform.select({ // Ensure consistent bottom spacing on web/tablet
      web: { marginBottom: theme.spacing.md }
    })
  },
});