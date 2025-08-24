import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import Card from '@/components/common/Card';
import { useTransactions } from '@/hooks/useTransactions';
import { format, subDays } from 'date-fns';

export const ChartSection = () => {
  const { colors } = useTheme();
  const { transactions, isLoading } = useTransactions();

  const chartData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i));
    return last7Days.map(date => {
        const day = format(date, 'EEE');
        const total = transactions
            .filter(t => new Date(t.date).toDateString() === date.toDateString() && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return { day, total };
    }).reverse();
  }, [transactions]);
  
  if (isLoading) {
    return <Card><ActivityIndicator color={colors.primary} /></Card>;
  }

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(200)}>
      <Card>
        <Text style={[styles.title, { color: colors.text }]}>Weekly Spending</Text>
        <VictoryChart
            theme={VictoryTheme.material}
            width={Dimensions.get('window').width - 64}
            height={250}
            domainPadding={{ x: 20 }}
        >
            <VictoryAxis
                tickFormat={(x) => x}
                style={{
                    axis: { stroke: colors.border },
                    tickLabels: { fill: colors.textSecondary, fontSize: 10 },
                    grid: { stroke: 'transparent' }
                }}
            />
            <VictoryAxis
                dependentAxis
                tickFormat={(y) => `$${y / 1000}k`}
                style={{
                    axis: { stroke: 'transparent' },
                    tickLabels: { fill: colors.textSecondary, fontSize: 10 },
                    grid: { stroke: colors.border, strokeDasharray: '4, 8' }
                }}
            />
            <VictoryBar
                data={chartData}
                x="day"
                y="total"
                style={{
                    data: { fill: colors.primary }
                }}
                cornerRadius={{ topLeft: 5, topRight: 5 }}
                animate={{ duration: 500, onLoad: { duration: 500 } }}
            />
        </VictoryChart>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
});