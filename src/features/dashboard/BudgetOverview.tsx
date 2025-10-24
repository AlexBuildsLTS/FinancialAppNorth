import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Cards } from '@/shared/components/Cards';

import { Budget } from '@/shared/types';

interface BudgetOverviewProps {
  budgets: Budget[];
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets }) => {
  const { theme: { colors } } = useTheme();

  return (
    <Cards style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Budget Overview</Text>
        <Text style={[styles.manageText, { color: colors.accent }]}>Manage</Text>
      </View>
      {budgets.map((budget) => (
        <View key={budget.id} style={styles.budgetItem}>
          <View style={styles.budgetTextContainer}>
            <Text style={[styles.budgetName, { color: colors.textPrimary }]}>{budget.category}</Text>
            <Text style={[styles.budgetAmount, { color: colors.textSecondary }]}>
              ${budget.spent_amount.toFixed(2)} / ${budget.allocated_amount.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.accent, width: `${(budget.spent_amount / budget.allocated_amount) * 100}%` }]} />
          </View>
        </View>
      ))}
    </Cards>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  manageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 16,
  },
  budgetAmount: {
    fontSize: 16,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
});
