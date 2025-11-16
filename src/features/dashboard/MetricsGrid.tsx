import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideProps } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Cards } from '@/components/Cards';
import { DashboardMetricItem } from '@/types';


interface MetricsGridProps {
  metricData: DashboardMetricItem[];
}

const MetricCards = ({ label, value, icon, format }: DashboardMetricItem) => {
    const { theme: { colors } } = useTheme();

    return (
        <Cards style={styles.metricCards} padding={20}>
            <View style={styles.CardsHeader}>
                {icon}
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{format(value)}</Text>
            <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{label}</Text>
        </Cards>
    );
};

export default function MetricsGrid({ metricData }: MetricsGridProps) {
  return (
    <View style={styles.container}>
      {metricData.map((metric) => (
        <MetricCards key={metric.id} {...metric} />
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
