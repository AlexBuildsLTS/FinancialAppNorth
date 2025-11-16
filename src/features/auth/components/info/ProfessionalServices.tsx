// src/features/auth/components/info/ProfessionalServices.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native'; // Using a more appropriate icon
import { useTheme } from '@/context/ThemeProvider';
import { AppTheme } from '@/constants/theme';
import { Cards } from '@/components/Cards'; // Use Cards

export function ProfessionalServices() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.outerContainer}>
      <Cards style={styles.section}>
        <ShieldCheck size={40} color={theme.colors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fonts.bold }]}>
          Professional CPA Services
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
          Premium members and above gain access to our exclusive CPA consultation service. Connect with certified public accountants who can provide professional financial guidance, tax planning assistance, and comprehensive financial reviews. Our CPAs are experienced professionals dedicated to helping you achieve your financial goals.
        </Text>
        <Text style={[styles.availability, { color: theme.colors.primary, fontFamily: theme.fonts.semiBold }]}>
          Available for Premium, CPA, and Administrator members
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
    marginBottom: theme.spacing.md,
  },
  availability: {
    fontSize: 13,
    textAlign: 'center',
  },
});