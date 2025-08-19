import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Transaction } from '@/types';
import { Feather } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions'; // Import the hook

const TransactionItem = ({ item, colors }: { item: Transaction, colors: any }) => (
  <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
    <View style={styles.iconContainer}>
      <Feather name={item.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'} size={20} color={item.type === 'income' ? colors.success : colors.error} />
    </View>
    <View style={styles.detailsContainer}>
      <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>{item.category}</Text>
    </View>
    <Text style={[styles.itemAmount, { color: item.type === 'income' ? colors.success : colors.text }]}>
      {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
    </Text>
  </View>
);

const RecentTransactions = () => {
  const { colors } = useTheme();
  const { transactions, isLoading } = useTransactions(); // Use the hook

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Recent Transactions</Text>
      {transactions.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet.</Text>
      ) : (
        <FlatList
          data={transactions.slice(0, 5)} // Only show the 5 most recent
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TransactionItem item={item} colors={colors} />}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: { marginTop: 24 },
  title: { fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 16 },
  emptyText: { textAlign: 'center', paddingVertical: 20, fontFamily: 'Inter-Regular' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: { flex: 1 },
  itemTitle: { fontFamily: 'Inter-Bold', fontSize: 16 },
  itemCategory: { fontFamily: 'Inter-Regular', fontSize: 14, marginTop: 2 },
  itemAmount: { fontFamily: 'Inter-Bold', fontSize: 16 },
});


export default RecentTransactions;