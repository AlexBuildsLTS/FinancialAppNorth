// src/features/auth/components/info/WhatWeOffer.tsx
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { TrendingUp, Target, BarChart3, BrainCircuit, FolderKanban, Users } from 'lucide-react-native';
import { OfferCard } from './OfferCard';
import { useTheme } from '@/context/ThemeProvider';
import { AppTheme } from '@/constants/theme';

const offers = [
  { icon: TrendingUp, title: "Smart Transaction Tracking", description: "Automatically categorize and analyze your financial transactions with AI-powered insights." },
  { icon: Target, title: "Intelligent Budgeting", description: "Set custom budgets and receive real-time alerts when approaching spending limits." },
  { icon: BarChart3, title: "Advanced Analytics", description: "Visualize your financial health with interactive charts and comprehensive reports." },
  { icon: BrainCircuit, title: "AI Financial Assistant", description: "Get instant answers to your financial questions powered by advanced AI technology." },
  { icon: FolderKanban, title: "Document Management", description: "Securely store and organize receipts, invoices, and important financial documents." },
  { icon: Users, title: "CPA Collaboration", description: "Connect with certified CPAs for professional financial guidance and tax preparation." }
];

export function WhatWeOffer() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme);

  // Responsive grid layout
  const numColumns = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const itemWidthPercentage = 100 / numColumns;

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fonts.bold }]}>
        What We Offer
      </Text>
      <View style={styles.gridContainer}>
        {offers.map((offer) => (
          <View key={offer.title} style={[styles.gridItem, { width: `${itemWidthPercentage}%` }]}>
            <OfferCard
              icon={offer.icon}
              title={offer.title}
              description={offer.description}
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
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm, // Negative margin to counteract item padding
  },
  gridItem: {
    padding: theme.spacing.sm,
    // marginBottom: theme.spacing.md, // Add bottom margin if needed on mobile
    ...Platform.select({ // Ensure consistent bottom spacing on web/tablet
      web: { marginBottom: theme.spacing.md }
    })
  },
});