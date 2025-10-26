import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeProvider';

interface OfferCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function OfferCard({ icon: Icon, title, description }: OfferCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Icon size={32} color={theme.colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semiBold }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
