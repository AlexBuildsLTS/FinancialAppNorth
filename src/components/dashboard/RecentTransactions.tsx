// src/components/dashboard/RecentTransactions.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownLeft, PlusCircle } from 'lucide-react-native';
import { format } from 'date-fns';

// CRITICAL FIX: The 'onAddTransaction' prop was missing from the interface.
interface RecentTransactionsProps {
  transactions?: Transaction[];
  onAddTransaction: () => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onAddTransaction }) => {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.type === 'income' ? `${colors.success}20` : `${colors.error}20` }]}>
        {item.type === 'income' ? <ArrowUpRight color={colors.success} size={20} /> : <ArrowDownLeft color={colors.error} size={20} />}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{format(new Date(item.transaction_date), 'MMM d, yyyy')}</Text>
      </View>
      <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.error }]}>
        {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Recent Transactions</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddTransaction}>
          <PlusCircle color={colors.primary} size={22} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Add New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>No recent transactions.</Text>}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addButtonText: { fontSize: 16, fontWeight: '600' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  detailsContainer: { flex: 1, marginLeft: 12 },
  description: { fontSize: 16, fontWeight: '500' },
  date: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: 'bold' },
});

export default RecentTransactions;