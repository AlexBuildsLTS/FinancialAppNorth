import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeProvider';

export function ProfessionalServices() {
  const { theme } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Shield size={48} color={theme.colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
        Professional CPA Services
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        Premium members and above gain access to our exclusive CPA consultation service. Connect with certified public accountants who can provide professional financial guidance, tax planning assistance, and comprehensive financial reviews. Our CPAs are experienced professionals dedicated to helping you achieve your financial goals.
      </Text>
      <Text style={[styles.availability, { color: theme.colors.primary, fontFamily: theme.fonts.semiBold }]}>
        Available for Premium, CPA, and Administrator members
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginVertical: 32,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  availability: {
    fontSize: 14,
    textAlign: 'center',
  },
});
