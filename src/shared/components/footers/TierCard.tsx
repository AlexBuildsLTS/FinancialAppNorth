import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeProvider';

interface TierCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  color: string;
}

export function TierCard({ icon: Icon, title, description, features, color }: TierCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: color, borderWidth: 2 }]}>
      <View style={styles.header}>
        <Icon size={28} color={color} style={styles.icon} />
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
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
            <Text style={[styles.featureText, { color: theme.colors.text, fontFamily: theme.fonts.regular }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});
