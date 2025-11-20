// src/components/dashboard/MetricCards.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideProps } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';

interface MetricCardsProps {
  title: string;
  value: string;
  Icon: React.FC<LucideProps>;
}

const MetricCards: React.FC<MetricCardsProps> = ({ title, value, Icon }) => {
  const { theme: { colors } } = useTheme();
  const IconComponent = Icon;


  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.iconContainer}>
        <Icon color={colors.textSecondary} size={24} />
      </View>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default MetricCards;