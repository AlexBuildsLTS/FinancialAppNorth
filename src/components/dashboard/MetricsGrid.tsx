import { Card } from '@/components/common';
import { useTheme } from '@/context/ThemeProvider';
import { DashboardMetricItem } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MetricsGridProps {
  metrics: DashboardMetricItem[];
  isLoading: boolean;
}

// This MetricCard is defined locally as it's specific to the grid's visual style.
const MetricCard: React.FC<DashboardMetricItem> = ({ title, value, change = 0, Icon, changeType }) => {
  const { colors } = useTheme();
  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? colors.success : colors.error;
  
  return (
    <Card style={styles.metricCard}>
      <View style={styles.cardHeader}>
        <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
        {Icon && <Icon color={colors.textSecondary} size={20} />}
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricChange, { color: changeColor }]}>
        {isPositive ? '▲' : '▼'} {change.toFixed(1)}%
      </Text>
    </Card>
  );
};

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, isLoading }) => {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[...Array(4)].map((_, i) => <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface }]} />)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 },
  metricCard: { width: '100%', marginBottom: 16, padding: 16 },
  skeletonCard: { width: '48%', height: 120, borderRadius: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metricTitle: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  metricValue: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  metricChange: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});

export default React.memo(MetricsGrid);