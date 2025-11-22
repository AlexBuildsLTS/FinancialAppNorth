// src/shared/components/auth/AuthScreenFooter.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppTheme } from '@/shared/theme/theme';
import { useTheme } from '@/shared/context/ThemeProvider';
import { AboutNorthFinance } from '../footers/AboutNorthFinance';
// Import OurMission, WhatWeOffer, etc. here when they are created

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