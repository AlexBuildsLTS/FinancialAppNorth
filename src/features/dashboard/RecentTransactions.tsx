import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/shared/components/GlassCard';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Transaction } from '@/shared/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

interface Props {
  data?: Transaction[];
  onViewAll?: () => void;
}

export const RecentTransactions = ({ data = [], onViewAll }: Props) => {
  const { theme, isDark } = useTheme();

  const transactions = data.length > 0 ? data : [
    { id: '1', description: 'Apple Store', amount: 1200, type: 'expense', date: '2025-01-20', category: 'Electronics' },
    { id: '2', description: 'Freelance Project', amount: 3500, type: 'income', date: '2025-01-18', category: 'Business' },
    { id: '3', description: 'Grocery Market', amount: 85, type: 'expense', date: '2025-01-15', category: 'Food' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Recent Transactions</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 12 }}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12 }}>
        {transactions.map((tx: any, i) => {
          const isExpense = tx.type === 'expense';
          const color = isExpense ? '#EF4444' : '#10B981';
          const Icon = isExpense ? ArrowDownRight : ArrowUpRight;

          return (
            <GlassCard key={tx.id || i} intensity={30} style={styles.row}>
               <View style={styles.left}>
                  <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                     <Icon size={18} color={color} />
                  </View>
                  <View>
                     <Text style={[styles.desc, { color: theme.colors.textPrimary }]}>{tx.description}</Text>
                     <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{tx.category} • {tx.date}</Text>
                  </View>
               </View>
               <Text style={[styles.amount, { color: isExpense ? theme.colors.textPrimary : '#10B981' }]}>
                 {isExpense ? '-' : '+'}${tx.amount.toLocaleString()}
               </Text>
            </GlassCard>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  row: { padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  desc: { fontWeight: '600', fontSize: 14, marginBottom: 2 },
  amount: { fontWeight: '700', fontSize: 14 },
});