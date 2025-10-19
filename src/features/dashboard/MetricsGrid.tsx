import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideProps } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Card } from '@/shared/components';
import { DashboardMetricItem } from '@/shared/types';


interface MetricsGridProps {
  metricData: DashboardMetricItem[];
}

const MetricCard = ({ title, value, change, Icon, changeType }: DashboardMetricItem) => {
    const { colors } = useTheme();
    const isPositive = changeType === 'positive';
    const changeColor = isPositive ? colors.success : colors.error;

    return (
        <Card style={styles.metricCard} padding={20}>
            <View style={styles.cardHeader}>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
                <Icon color={colors.textSecondary} size={22} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
            {change !== undefined && ( // Conditionally render change text
                <Text style={[styles.metricChange, { color: changeColor }]}>
                    {isPositive ? '▲' : '▼'} {change.toFixed(1)}% from last month
                </Text>
            )}
        </Card>
    );
};

export default function MetricsGrid({ metricData }: MetricsGridProps) {
  return (
    <View style={styles.container}>
      {metricData.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  metricCard: { width: '48.5%', marginBottom: 16, },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  metricValue: { fontSize: 26, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginBottom: 8 },
  metricChange: { fontSize: 13, fontFamily: 'Inter-Regular' },
});