import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import Card from '@/components/common/Card';

// Dummy data for display purposes
const metrics = [
  { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', Icon: DollarSign, changeType: 'positive' },
  { title: 'Net Profit', value: '$12,890.50', change: '+15.2%', Icon: ArrowUpRight, changeType: 'positive' },
  { title: 'Expenses', value: '$8,420.00', change: '+5.4%', Icon: ArrowDownRight, changeType: 'negative' },
  { title: 'Cash Balance', value: '$50,123.45', change: '-2.1%', Icon: Wallet, changeType: 'negative' },
];

const MetricCard = ({ metric }: any) => {
    const { colors } = useTheme();
    const isPositive = metric.changeType === 'positive';
    const changeColor = isPositive ? colors.success : colors.error;

    return (
        <Card style={styles.metricCard}>
            <View style={styles.cardHeader}>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{metric.title}</Text>
                <metric.Icon color={colors.textSecondary} size={20} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
            <Text style={[styles.metricChange, { color: changeColor }]}>{metric.change} from last month</Text>
        </Card>
    );
}

export default function MetricsGrid() {
  return (
    <View style={styles.container}>
      {metrics.map((metric) => (
        <MetricCard key={metric.title} metric={metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  metricCard: {
    width: '48%',
    marginBottom: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricChange: {
    fontSize: 12,
  },
});