import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartHandshake } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeProvider';

export function SupportTeam() {
  const { theme } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <HeartHandshake size={48} color={theme.colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
        Dedicated Support Team
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        Our support team is always here to help. Submit tickets directly through the platform to quickly resolve any issues or questions you may have. With our built-in ticketing system, you can easily track your requests, view responses, and get the help you need when you need it. Our support staff has read-only access to assist you effectively while maintaining your privacy.
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
  },
});
