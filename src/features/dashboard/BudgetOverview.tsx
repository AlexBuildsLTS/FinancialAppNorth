import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/shared/components/GlassCard';
import { useTheme } from '@/shared/context/ThemeProvider';
import { BudgetItemData } from '@/shared/types'; // Import global type

interface Props {
  budgets?: BudgetItemData[]; 
  onManage?: () => void;
}

export const BudgetOverview = ({ budgets = [], onManage }: Props) => {
  const { theme, isDark } = useTheme();

  // Fallback if empty, matching your screenshot structure
  const data = budgets.length > 0 ? budgets : [
    { category: 'Groceries', spent: 125.50, budget: 500.00 },
    { category: 'Dining', spent: 0.00, budget: 300.00 },
    { category: 'Transport', spent: 0.00, budget: 200.00 },
  ];

  return (
    <GlassCard intensity={40} style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Budget Overview</Text>
        <TouchableOpacity onPress={onManage}>
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>Manage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {data.map((item, index) => {
          // Use 'budget' property from global type
          const total = item.budget || 1;
          const percent = (item.spent / total) * 100;
          
          return (
            <View key={index} style={styles.item}>
              <View style={styles.row}>
                <Text style={[styles.category, { color: theme.colors.textPrimary }]}>{item.category}</Text>
                <Text style={[styles.percent, { color: theme.colors.textSecondary }]}>{Math.round(percent)}%</Text>
              </View>

              <View style={styles.row}>
                 <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                   Spent <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>${item.spent.toLocaleString()}</Text>
                 </Text>
                 <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                   Budget ${item.budget.toLocaleString()}
                 </Text>
              </View>

              {/* Green Progress Line */}
              <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                <View 
                  style={[
                    styles.fill, 
                    { 
                      width: `${Math.min(percent, 100)}%`, 
                      backgroundColor: '#10B981' 
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 24, height: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '700' },
  list: { gap: 24 },
  item: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 13, fontWeight: '600' },
  percent: { fontSize: 12, fontWeight: '700' },
  track: { height: 6, borderRadius: 3, width: '100%', marginTop: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});