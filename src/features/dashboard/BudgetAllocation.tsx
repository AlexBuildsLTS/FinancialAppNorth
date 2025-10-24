import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Cards } from '@/shared/components/Cards';
import { VictoryPie, VictoryLabel, VictoryTooltip } from 'victory-native';
import { Budget } from '@/shared/types';
import { formatCurrency } from '@/shared/utils/formatters';

interface BudgetAllocationProps {
  budgets: Budget[];
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56', '#C9CBCF'];

export const BudgetAllocation: React.FC<BudgetAllocationProps> = ({ budgets }) => {
  const { theme: { colors } } = useTheme();

  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent_amount, 0);

  if (budgets.length === 0 || totalSpent === 0) {
    return (
      <Cards style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Budget Allocation</Text>
        </View>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>No budget data available.</Text>
      </Cards>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartRadius = (screenWidth - 32 - 40) / 2; // Screen width - ScreenContainer padding - Cards padding

  const pieData = budgets.map((budget, index) => ({
    x: budget.category,
    y: budget.spent_amount,
    label: `${budget.category}: ${formatCurrency(budget.spent_amount)} (${((budget.spent_amount / totalSpent) * 100).toFixed(1)}%)`,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Cards style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Budget Allocation</Text>
      </View>
      <View style={styles.chartContainer}>
        <VictoryPie
          data={pieData}
          colorScale={pieData.map(d => d.color)}
          radius={chartRadius}
          innerRadius={chartRadius * 0.6}
          padAngle={2}
          labels={() => null} // Hide default labels, use custom center label and legend
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
          style={{
            data: {
              fill: ({ datum }) => datum.color,
              stroke: colors.background,
              strokeWidth: 2,
            },
          }}
          labelComponent={
            <VictoryTooltip
              cornerRadius={5}
              flyoutStyle={{ fill: colors.surface, stroke: colors.border, strokeWidth: 1 }}
              style={{ fill: colors.textPrimary, fontSize: 12 }}
            />
          }
          events={[
            {
              target: 'data',
              eventHandlers: {
                onPressIn: () => {
                  return [
                    {
                      target: 'data',
                      mutation: ({ style }) => {
                        return style.fill === colors.accent
                          ? null
                          : { style: { fill: colors.accent } };
                      },
                    },
                    {
                      target: 'labels',
                      mutation: ({ datum }) => {
                        return { text: `${datum.x}: ${formatCurrency(datum.y)}` };
                      },
                    },
                  ];
                },
                onPressOut: () => {
                  return [
                    {
                      target: 'data',
                      mutation: () => null, // Reset fill
                    },
                    {
                      target: 'labels',
                      mutation: () => ({ text: '' }), // Hide label
                    },
                  ];
                },
              },
            },
          ]}
        />
        <View style={styles.centerLabel}>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
            {formatCurrency(totalSpent)}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total Spent</Text>
        </View>
      </View>
      <View style={styles.legendContainer}>
        {pieData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{item.x}</Text>
          </View>
        ))}
      </View>
    </Cards>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0, // Remove horizontal margin as ScreenContainer handles it
    marginTop: 20,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
});