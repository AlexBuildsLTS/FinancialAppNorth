import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { ChevronRight, ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { fetchTransactions } from '@/services/transactionService';
import type { Transaction } from '@/types';

type UITransaction = {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  category?: string | null;
  description?: string | null;
  title: string;
  date: string;
};

export function RecentTransactions() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<UITransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchTransactions(25);
        if (!mounted) return;
        const mapped: UITransaction[] = rows.map((t: Transaction | any) => {
          const created = t.created_at || new Date().toISOString();
          const amountNum = Number(t.amount) || 0;
          const category = t.category ?? null;
          return {
            id: t.id || Math.random().toString(36).slice(2),
            type: t.type || (amountNum >= 0 ? 'income' : 'expense'),
            amount: amountNum,
            created_at: created,
            category,
            description: t.description ?? null,
            title: t.description || category || 'Transaction',
            date: new Date(created).toLocaleDateString(),
          };
        });
        setTransactions(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load transactions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [colors]);

  const renderItem = ({ item, index }: { item: UITransaction; index: number }) => {
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? colors.success : colors.text;
    const IconCmp = isIncome ? ArrowUpCircle : ArrowDownCircle;
    return (
      <Animated.View entering={FadeInUp.delay(80 + index * 40).springify()}>
        <TouchableOpacity
          style={[
            styles.itemContainer,
            {
              borderBottomColor: colors.border,
              borderBottomWidth: index === transactions.length - 1 ? 0 : 1,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
            <IconCmp size={22} color={colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.category || item.type}
            </Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={[styles.amount, { color: amountColor }]}>
              {isIncome ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  let body: React.ReactNode;
  if (loading) {
    body = <View style={styles.stateBox}><Text style={{ color: colors.textSecondary }}>Loading...</Text></View>;
  } else if (error) {
    body = <View style={styles.stateBox}><Text style={{ color: colors.error }}>Error: {error}</Text></View>;
  } else if (!transactions.length) {
    body = <View style={styles.stateBox}><Text style={{ color: colors.textSecondary }}>No transactions yet.</Text></View>;
  } else {
    body = (
      <FlatList
        data={transactions.slice(0, 5)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    );
  }

  return (
    <View style={{ marginTop: 24 }}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {body}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  viewAllText: { fontSize: 14, fontWeight: '600' },
  listContainer: { borderRadius: 16, borderWidth: 1 },
  stateBox: { padding: 20 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  category: { fontSize: 14 },
  rightSection: { alignItems: 'flex-end', marginRight: 12 },
  amount: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  date: { fontSize: 12 },
});

