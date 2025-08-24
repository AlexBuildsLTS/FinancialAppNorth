import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { VictoryPie, VictoryTooltip, VictoryLabel } from 'victory-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import Card from '@/components/common/Card';
import { useTransactions } from '@/hooks/useTransactions';
const screenWidth = Dimensions.get('window').width;

const categoryColors: { [key: string]: string } = {
  Groceries: '#FF6384',
  Transportation: '#36A2EB',
  'Food & Dining': '#FFCE56',
  Housing: '#4BC0C0',
  Salary: '#9966FF',
  Other: '#C9CBCF',
};

export const ChartSection = () => {
  const { colors } = useTheme();
  const { transactions, isLoading } = useTransactions(); // Using the hook
  const [activeSlice, setActiveSlice] = useState<number | null>(null);

  const expenseData = useMemo(() => {
    if (!transactions) return [];

    const expenseSummary = transactions
      .filter((t: { type: string }) => t.type === 'expense')
      .reduce(
        (
          acc: { [x: string]: { amount: number } },
          transaction: { category: string; amount: number }
        ) => {
          const category = transaction.category || 'Other';
          const amount = Math.abs(transaction.amount); // Ensure amount is positive for expenses
          if (!acc[category]) {
            acc[category] = { amount: 0 };
          }
          acc[category].amount += amount;
          return acc;
        },
        {} as { [key: string]: { category: string; amount: number } }
      );

    return (
      Object.values(expenseSummary) as { category: string; amount: number }[]
    ).map((item) => ({
      ...item,
      color: categoryColors[item.category] || categoryColors.Other,
    }));
  }, [transactions]);

  const totalExpenses = expenseData.reduce((acc, item) => acc + item.amount, 0);

  if (isLoading) {
    return (
      <Card>
        <ActivityIndicator color={colors.primary} size="large" />
      </Card>
    );
  }

  if (expenseData.length === 0) {
    return (
      <Animated.View entering={FadeInUp.duration(500).delay(200)}>
        <Card>
          <Text style={[styles.title, { color: colors.text }]}>
            Expense Breakdown
          </Text>
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.textSecondary }}>
              No expense data available for the chart.
            </Text>
          </View>
        </Card>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(200)}>
      <Card>
        <Text style={[styles.title, { color: colors.text }]}>
          Expense Breakdown
        </Text>
        <View style={styles.chartContainer}>
          <VictoryPie
            data={expenseData}
            x="category"
            y="amount"
            colorScale={expenseData.map((item) => item.color)}
            width={screenWidth * 0.8}
            height={250}
            innerRadius={60}
            padAngle={2}
            labelComponent={
              <VictoryTooltip
                active
                flyoutStyle={{ fill: colors.surface, stroke: colors.border }}
                style={{ fill: colors.text }}
                renderInPortal={false}
              />
            }
            labels={({ datum }) =>
              `${datum.category}: $${datum.amount.toFixed(2)}`
            }
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPressIn: (_, { index }) => {
                    setActiveSlice(index);
                    return null;
                  },
                  onPressOut: () => {
                    setActiveSlice(null);
                    return null;
                  },
                },
              },
            ]}
            style={{
              data: {
                fillOpacity: ({ index }) =>
                  activeSlice === null || activeSlice === index ? 1 : 0.6,
              },
            }}
          />
          <VictoryLabel
            textAnchor="middle"
            style={[
              { fontSize: 20, fill: colors.text, fontWeight: 'bold' },
              { fontSize: 14, fill: colors.textSecondary },
            ]}
            x={(screenWidth * 0.8) / 2}
            y={125}
            text={[`$${totalExpenses.toFixed(2)}`, 'Total Expenses']}
          />
        </View>
        <View style={styles.legendContainer}>
          {expenseData.map((item) => (
            <View key={item.category} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text
                style={[styles.legendText, { color: colors.textSecondary }]}
              >
                {item.category}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});
