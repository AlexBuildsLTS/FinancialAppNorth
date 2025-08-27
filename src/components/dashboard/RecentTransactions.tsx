import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeProvider';
import { Transaction } from '../../types';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import Card from '../common/Card';

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export default function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'income';
    const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
    const amountColor = isIncome ? colors.success : colors.text;

    return (
      <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
        <View style={styles.leftContent}>
            <Icon color={isIncome ? colors.success : colors.error} size={32} />
            <View>
                <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
            </View>
        </View>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <Card style={styles.container}>
      {transactions.length > 0 ? (
        <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
        />
      ) : (
        <Text style={{color: colors.textSecondary, textAlign: 'center', padding: 20}}>No recent transactions.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, padding: 0 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  leftContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  description: { fontSize: 16, fontWeight: '600' },
  category: { fontSize: 14, marginTop: 4 },
  amount: { fontSize: 16, fontWeight: 'bold' },
});