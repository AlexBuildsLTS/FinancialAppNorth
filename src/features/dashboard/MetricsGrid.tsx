import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideProps } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Cards } from '@/shared/components/Cards';
import { DashboardMetricItem } from '@/shared/types';


interface MetricsGridProps {
  metricData: DashboardMetricItem[];
}

const MetricCards = ({ title, value, Icon, percentage }: DashboardMetricItem) => {
    const { theme: { colors } } = useTheme();
    const isPositive = percentage?.startsWith('+');
    const changeColor = isPositive ? colors.success : colors.error;

    return (
        <Cards style={styles.metricCards} padding={20}>
            <View style={styles.CardsHeader}>
                <Icon color={colors.textSecondary} size={22} />
                {percentage && (
                    <Text style={[styles.metricChange, { color: changeColor }]}>
                        {percentage}
                    </Text>
                )}
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{value}</Text>
            <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
        </Cards>
    );
};

export default function MetricsGrid({ metricData }: MetricsGridProps) {
  return (
    <View style={styles.container}>
      {metricData.map((metric) => (
        <MetricCards key={metric.title} {...metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  metricCards: { width: '48.5%', marginBottom: 16, },
  CardsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  metricValue: { fontSize: 26, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginBottom: 4 },
  metricChange: { fontSize: 13, fontFamily: 'Inter-Regular', fontWeight: 'bold' },
});
