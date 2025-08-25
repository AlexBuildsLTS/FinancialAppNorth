import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { getDashboardMetrics, DashboardMetrics } from '@/services/analyticsService';
import { Card } from '@/components/common';

interface DashboardMetricItem {
  title: string;
  value: string;
  change: number;
  Icon: any;
  changeType: 'positive' | 'negative';
}

const MetricCard = ({ title, value, change, Icon, changeType }: DashboardMetricItem) => {
    const { colors } = useTheme();
    const isPositive = changeType === 'positive';
    const changeColor = isPositive ? colors.success : colors.error;

    return (
        <Card style={styles.metricCard} padding={16}>
            <View style={styles.cardHeader}>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
                <Icon color={colors.textSecondary} size={20} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.metricChange, { color: changeColor }]}>{change.toFixed(1)}% from last month</Text>
        </Card>
    );
}

export default function MetricsGrid({ userId }: { userId?: string }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      setLoading(true);
      getDashboardMetrics(targetUserId)
        .then(setMetrics)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, userId]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40, height: 180 }}/>;
  }

  if (!metrics) {
    return <View style={{height: 180, justifyContent: 'center'}}><Text style={{color: colors.textSecondary, textAlign: 'center'}}>Could not load metrics.</Text></View>;
  }

  const metricData: DashboardMetricItem[] = [
    { title: 'Total Revenue', value: `$${metrics.totalRevenue.toLocaleString('en-US')}`, change: metrics.revenueChange, Icon: DollarSign, changeType: metrics.revenueChange >= 0 ? 'positive' : 'negative' },
    { title: 'Net Profit', value: `$${metrics.netProfit.toLocaleString('en-US')}`, change: metrics.profitChange, Icon: ArrowUpRight, changeType: metrics.profitChange >= 0 ? 'positive' : 'negative' },
    { title: 'Expenses', value: `$${metrics.expenses.toLocaleString('en-US')}`, change: -5.4, Icon: ArrowDownRight, changeType: 'negative' },
    { title: 'Cash Balance', value: `$${metrics.cashBalance.toLocaleString('en-US')}`, change: 2.1, Icon: Wallet, changeType: 'positive' },
  ];

  return (
    <View style={styles.container}>
      {metricData.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 },
  metricCard: { width: '48%', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metricTitle: { fontSize: 14, fontWeight: '500', fontFamily: 'Inter-SemiBold' },
  metricValue: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginBottom: 8 },
  metricChange: { fontSize: 12, fontFamily: 'Inter-Regular' },
});
