// src/components/dashboard/RecentTransactions.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownLeft, PlusCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { Cards } from '@/components/Cards';

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const { theme: { colors } } = useTheme();

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.type === 'income' ? `${colors.success}20` : `${colors.error}20` }]}>
        {item.type === 'income' ? <ArrowUpRight color={colors.success} size={22} /> : <ArrowDownLeft color={colors.error} size={22} />}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={[styles.description, { color: colors.textPrimary }]}>{item.description}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{format(new Date(item.transaction_date), 'MMM d, yyyy')}</Text>
      </View>
      <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.error }]}>
        {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );

  return (
    <Cards style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Recent Transactions</Text>
      </View>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>No recent transactions.</Text>}
        scrollEnabled={false}
      />
    </Cards>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', fontFamily: 'Inter-Bold' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addButtonText: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  detailsContainer: { flex: 1, marginLeft: 14 },
  description: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  date: { fontSize: 13, marginTop: 3, fontFamily: 'Inter-Regular' },
  amount: { fontSize: 17, fontWeight: 'bold', fontFamily: 'Inter-Bold' },
});

export default RecentTransactions;
