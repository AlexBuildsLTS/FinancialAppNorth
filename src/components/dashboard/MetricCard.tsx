import { useTheme } from '@/context/ThemeProvider';
import { Card } from '../common';
import type { DashboardMetricItem as DashboardMetric } from '@/types';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface MetricsGridProps {
  metrics: DashboardMetric[];
  isLoading: boolean;
}

type MetricCardProps = {
  title: string;
  value: string;
  change?: number;
  Icon?: React.ComponentType<any>;
  changeType?: 'positive' | 'negative' | string;
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change = 0, Icon, changeType }) => {
  const { colors } = useTheme();
  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? colors.success : colors.error;
  const formattedChange = typeof change === 'number' && !isNaN(change) ? change.toFixed(1) : '0.0';

  return (
    <Card style={{ ...metricCardStyles.metricCard, padding: 16 }}>
      <View style={metricCardStyles.cardHeader}>
        <Text style={[metricCardStyles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
        {Icon ? <Icon color={colors.textSecondary} size={20} /> : null}
      </View>
      <Text style={[metricCardStyles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[metricCardStyles.metricChange, { color: changeColor }]}>
        {isPositive ? '+' : ''}{formattedChange}% from last month
      </Text>
    </Card>
  );
};

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, isLoading }) => {
  const { colors } = useTheme();

  // Skeleton loader for when data is loading
  const renderSkeleton = () => (
    <View style={styles.container}>
      {[...Array(4)].map((_, i) => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface }]} />
      ))}
    </View>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <View style={styles.container}>
      {metrics.length > 0 ? (
        metrics.map((metric) => (
          <View key={metric.title} style={styles.cardWrapper}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              Icon={metric.Icon}
            />
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No metrics available.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  emptyText: {
    width: '100%',
    textAlign: 'center',
    paddingVertical: 40,
    fontFamily: 'Inter_400Regular',
  },
  skeletonCard: {
    width: '48%',
    height: 120, // Approximate height of a MetricCard
    borderRadius: 16,
    marginBottom: 16,
  },
});

const metricCardStyles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 },
  metricCard: { width: '48%', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metricTitle: { fontSize: 14, fontWeight: '500', fontFamily: 'Inter-SemiBold' },
  metricValue: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginBottom: 8 },
  metricChange: { fontSize: 12, fontFamily: 'Inter-Regular' },
});

export default React.memo(MetricsGrid);