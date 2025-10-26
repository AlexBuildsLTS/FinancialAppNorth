// src/features/dashboard/BudgetOverview.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Cards } from '../../shared/components/Cards'; // Adjusted path
import { useTheme } from '@/shared/context/ThemeProvider';
import { formatCurrency } from '@/shared/utils/formatters';


interface BudgetItemData {
  category: string;
  spent: number;
  budget: number;
}

interface BudgetOverviewProps {
  budgetData?: BudgetItemData[];
}

export default function BudgetOverview({ budgetData = [] }: BudgetOverviewProps) {
  const { theme } = useTheme();

  const renderBudgetItem = ({ item }: { item: BudgetItemData }) => {
    const percentage = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100); // Ensure percentage is between 0 and 100

    // Determine progress bar color based on percentage
    let progressBarColor = theme.colors.success; // Default green
    if (percentage > 75 && percentage <= 90) {
      progressBarColor = theme.colors.warning; // Yellow/Orange
    } else if (percentage > 90) {
      progressBarColor = theme.colors.error; // Red
    }

    return (
      <Cards style={styles.budgetItemCards}>
        <View style={styles.budgetItemHeader}>
          <Text style={[styles.categoryTitle, { color: theme.colors.text, fontFamily: theme.fonts.medium }]}>
            {item.category}
          </Text>
          <Text style={[styles.percentageText, { color: progressBarColor, fontFamily: theme.fonts.medium }]}>
            {clampedPercentage.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.amountContainer}>
           <Text style={[styles.amountLabel, {color: theme.colors.textSecondary, fontFamily: theme.fonts.regular}]}>Spent</Text>
           <Text style={[styles.amountValue, {color: theme.colors.text, fontFamily: theme.fonts.medium}]}>{formatCurrency(item.spent)}</Text>
         </View>
         <View style={styles.progressBarBackground}>
           <View style={[styles.progressBarFill, { width: `${clampedPercentage}%`, backgroundColor: progressBarColor }]} />
         </View>
         <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, {color: theme.colors.textSecondary, fontFamily: theme.fonts.regular}]}>Budget</Text>
            <Text style={[styles.amountValue, {color: theme.colors.text, fontFamily: theme.fonts.medium}]}>{formatCurrency(item.budget)}</Text>
         </View>
      </Cards>
    );
  };

  return (
    // Outer Cards removed, as each item is now a Cards
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semiBold }]}>
          Budget Overview
        </Text>
        <TouchableOpacity>
          <Text style={[styles.manageButton, { color: theme.colors.primary, fontFamily: theme.fonts.medium }]}>
            Manage
          </Text>
        </TouchableOpacity>
      </View>

       {budgetData.length > 0 ? (
          <FlatList
             data={budgetData}
             renderItem={renderBudgetItem}
             keyExtractor={(item) => item.category}
             numColumns={1} // Keep as single column list
             // Optional: Add horizontal scroll if needed for many budgets
             // horizontal
             // showsHorizontalScrollIndicator={false}
          />
       ) : (
          <Cards style={{ padding: 20 }}>
             <Text style={{color: theme.colors.textSecondary, textAlign: 'center'}}>No budgets set up yet.</Text>
          </Cards>
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
  },
  manageButton: {
    fontSize: 14,
  },
  budgetItemCards: {
    marginBottom: 12, // Space between budget Cards
    // Cards component provides base styling (padding, bg, border, shadow)
  },
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
  },
  percentageText: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden', // Ensure background adheres to borderRadius
    backgroundColor: '#E0E0E030', // Default light background for percentage
  },
  amountContainer: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginVertical: 4,
  },
   amountLabel: {
      fontSize: 12,
   },
   amountValue: {
      fontSize: 12,
   },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E050', // Lighter background for progress bar
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});