import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react-native';
import { useTransactions } from '@/hooks/useTransactions'; // Live data hook
import { MetricItem } from '@/types'; // Import MetricItem

const { width } = Dimensions.get('window');

interface MetricsGridProps {
  metrics?: MetricItem[]; // Make it optional
}

export default function MetricsGrid({ metrics: propMetrics }: MetricsGridProps) { // Accept propMetrics
  const { colors } = useTheme();
  const { transactions } = useTransactions(); // --- LIVE DATA ---

  let displayMetrics: { id: string; title: string; value: string; change?: string; isPositive?: boolean; icon?: any }[];

  if (propMetrics) {
    // If propMetrics are provided, use them directly
    displayMetrics = propMetrics.map((item, index) => ({
      id: String(index), // Generate a unique ID
      title: item.label,
      value: item.value,
      // Default values for change, isPositive, icon if not provided by propMetrics
      change: '',
      isPositive: true,
      icon: DollarSign, // Default icon, could be improved
    }));
  } else {
    // Otherwise, use the existing logic with useTransactions
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    displayMetrics = [
      { id: '1', title: 'Total Balance', value: `$${totalBalance.toLocaleString()}`, change: '+12.5%', isPositive: true, icon: DollarSign },
      { id: '2', title: 'Monthly Income', value: `$${totalIncome.toLocaleString()}`, change: '+8.2%', isPositive: true, icon: TrendingUp },
      { id: '3', title: 'Monthly Expenses', value: `$${totalExpenses.toLocaleString()}`, change: '-3.1%', isPositive: false, icon: TrendingDown },
      { id: '4', title: 'Savings Goal', value: '62%', change: '+5%', isPositive: true, icon: Target },
    ];
  }

  const styles = createStyles(colors, width);

  return (
    <View>
      {/* Only show "Financial Overview" title if not using propMetrics, as ClientDashboardScreen already has one */}
      {!propMetrics && <Text style={styles.sectionTitle}>Financial Overview</Text>}
      <View style={styles.grid}>
        {displayMetrics.map((item, index) => {
            const IconComponent = item.icon || DollarSign; // Use default if not provided
            const changeBgColor = item.isPositive ? `${colors.success}20` : `${colors.error}20`;
            const changeTextColor = item.isPositive ? colors.success : colors.error;
            return (
                <Animated.View key={item.id} entering={FadeInUp.delay(index * 100).duration(600).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}><IconComponent size={24} color={colors.primary} /></View>
                        {item.change && <View style={[styles.changeContainer, { backgroundColor: changeBgColor }]}><Text style={[styles.changeText, { color: changeTextColor }]}>{item.change}</Text></View>}
                    </View>
                    <Text style={styles.value}>{item.value}</Text>
                    <Text style={styles.title}>{item.title}</Text>
                </Animated.View>
            );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: any, screenWidth: number) => {
  const cardWidth = (screenWidth - 48) / 2;
  return StyleSheet.create({
    sectionTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
    card: { width: cardWidth, backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    changeContainer: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    changeText: { fontSize: 12, fontWeight: '600' },
    value: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
    title: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  });
};
