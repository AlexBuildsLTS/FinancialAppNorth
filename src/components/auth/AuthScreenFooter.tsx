// src/shared/components/auth/AuthScreenFooter.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeProvider';
import { ScrollView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

interface AuthScreenFooterProps {
  scrollY: any;
}

const AboutNorthFinance = () => {
  const { theme: { colors } } = useTheme();
  return (
    <AnimatedInfoCards
      title="About NorthFinance"
      description="NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses with intelligent tools for tracking, analyzing, and optimizing their financial health."
      CardsIndex={0}
      scrollY={useSharedValue(0)} // Placeholder, will be replaced by actual scrollY
    />
  );
};

const OurMission = () => {
  const { theme: { colors } } = useTheme();
  return (
    <AnimatedInfoCards
      title="Our Mission"
      description="To democratize professional-grade financial management tools, making them intuitive enough for individuals while powerful enough for certified professionals."
      CardsIndex={1}
      scrollY={useSharedValue(0)} // Placeholder
    />
  );
};

const WhatWeOffer = () => {
  const { theme: { colors } } = useTheme();
  return (
    <AnimatedInfoCards
      title="What We Offer"
      description="Explore our suite of powerful tools: Smart Transaction Tracking, Intelligent Budgeting, and Advanced Analytics."
      CardsIndex={2}
      scrollY={useSharedValue(0)} // Placeholder
    />
  );
};

const MembershipTiers = () => {
  const { theme: { colors } } = useTheme();
  return (
    <AnimatedInfoCards
      title="Membership Tiers"
      description="Choose from our flexible membership tiers, offering tailored features for individuals, small businesses, and professional CPAs."
      CardsIndex={3}
      scrollY={useSharedValue(0)} // Placeholder
    />
  );
};
import AnimatedInfoCards from '@/components/AnimatedInfoCard';

export function AuthScreenFooter() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* This is the "About NorthFinance" card */}
      <AboutNorthFinance />

      {/* // TODO: Add these components here once they are created
        <OurMission />
        <WhatWeOffer />
        <MembershipTiers />
      */}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
});
