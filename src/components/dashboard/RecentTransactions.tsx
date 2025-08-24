import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { useTransactions } from '@/hooks/useTransactions'; // Live data hook
import Card from '@/components/common/Card';
import { Transaction } from '@/types'; // Import Transaction

interface RecentTransactionsProps {
  transactions?: Transaction[]; // Make it optional
}

export default function RecentTransactions({ transactions: propTransactions }: RecentTransactionsProps) { // Accept propTransactions
  const { colors } = useTheme();
  const { transactions, isLoading } = useTransactions(); // --- LIVE DATA ---

  const displayTransactions = propTransactions ? propTransactions : transactions.slice(0, 5); // Use propTransactions if available

  if (isLoading && !propTransactions) { // Only show loading if not using propTransactions
    return <Card><ActivityIndicator color={colors.primary} size="large" /></Card>;
  }

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(600)}>
      <Card>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity><Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text></TouchableOpacity>
        </View>

        {displayTransactions.length === 0 ? (
          <View style={styles.emptyContainer}><Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet.</Text></View>
        ) : (
          <View>
            {displayTransactions.map((transaction: Transaction) => {
              const isIncome = transaction.type === 'income';
              const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
              const amountColor = isIncome ? colors.success : colors.text;
              return (
                <TouchableOpacity key={transaction.id} style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.iconContainer, { backgroundColor: isIncome ? `${colors.success}20` : `${colors.error}20` }]}>
                    <Icon color={isIncome ? colors.success : colors.error} size={20} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, { color: colors.text }]}>{transaction.title}</Text>
                    <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>{transaction.category}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: amountColor }]}>
                      {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                    </Text>
                    <ChevronRight color={colors.textSecondary} size={16} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  viewAll: { fontSize: 14, fontWeight: '600' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  transactionCategory: { fontSize: 12 },
  transactionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
});
