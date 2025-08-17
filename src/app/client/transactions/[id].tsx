import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { getTransactions, getClientById } from '@/services/dataService';
import { Transaction, Client } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';
import AddTransactionModal from '@/components/forms/AddTransactionModal';
import { ArrowUp, ArrowDown, ChevronDown, Plus } from 'lucide-react-native';

type FilterType = 'all' | 'income' | 'expense';
type SortBy = 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

const TransactionListItem = ({ item, colors }: { item: Transaction; colors: any }) => {
  const isIncome = item.type === 'income';
  const amountColor = isIncome ? colors.success : colors.text;
  const sign = isIncome ? '+' : '-';

  return (
    <View style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconContainer, { backgroundColor: isIncome ? `${colors.success}20` : `${colors.error}20` }]}>
            {isIncome ? <ArrowUp color={colors.success} size={20} /> : <ArrowDown color={colors.error} size={20} />}
        </View>
        <View style={styles.itemDetails}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>{item.category}</Text>
        </View>
        <View style={styles.itemAmountContainer}>
            <Text style={[styles.itemAmount, { color: amountColor }]}>
              {sign}${Math.abs(item.amount).toFixed(2)}
            </Text>
            <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
                {new Date(item.date).toLocaleDateString()}
            </Text>
        </View>
    </View>
  );
};

const FilterControls = ({ onFilterChange, onSortChange, colors }: any) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const handleFilter = (newFilter: FilterType) => {
    setFilter(newFilter);
    onFilterChange(newFilter);
  };
  
  const handleSort = (newSortBy: SortBy) => {
      const newSortDir = sortBy === newSortBy ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc';
      setSortBy(newSortBy);
      setSortDir(newSortDir);
      onSortChange(newSortBy, newSortDir);
  }

  return (
    <View style={[styles.filterContainer, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => handleFilter('all')} style={[styles.filterButton, filter === 'all' && {backgroundColor: colors.primary}]}>
          <Text style={[styles.filterText, {color: colors.text}, filter === 'all' && {color: colors.primaryContrast}]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleFilter('income')} style={[styles.filterButton, filter === 'income' && {backgroundColor: colors.primary}]}>
          <Text style={[styles.filterText, {color: colors.text}, filter === 'income' && {color: colors.primaryContrast}]}>Income</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleFilter('expense')} style={[styles.filterButton, filter === 'expense' && {backgroundColor: colors.primary}]}>
          <Text style={[styles.filterText, {color: colors.text}, filter === 'expense' && {color: colors.primaryContrast}]}>Expense</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleSort('date')} style={styles.sortButton}>
          <Text style={[styles.filterText, {color: colors.text}]}>Date</Text>
          {sortBy === 'date' && <ChevronDown color={colors.text} size={16} style={{ transform: [{ scaleY: sortDir === 'asc' ? 1 : -1 }] }} />}
      </TouchableOpacity>
    </View>
  );
};

export default function ClientTransactionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [clientData, transactionData] = await Promise.all([
        getClientById(id),
        getTransactions(id)
      ]);
      setClient(clientData || null);
      setTransactions(transactionData);
    } catch (error) {
      console.error("Failed to load client transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransactionAdded = () => {
    loadData();
    setIsModalVisible(false);
  };
  
  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter(t => filterType === 'all' || t.type === filterType)
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === 'amount') {
          comparison = b.amount - a.amount;
        }
        return sortDirection === 'desc' ? comparison : -comparison;
      });
  }, [transactions, filterType, sortBy, sortDirection]);

  if (loading) {
    return (<ScreenContainer><ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} /></ScreenContainer>);
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: `${client?.name}'s Transactions` || 'Transactions' }} />
      
      <FilterControls 
        colors={colors}
        onFilterChange={setFilterType}
        onSortChange={(newSortBy: SortBy, newSortDir: SortDirection) => {
            setSortBy(newSortBy);
            setSortDirection(newSortDir);
        }}
      />
      
      <FlatList
        data={filteredAndSortedTransactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionListItem item={item} colors={colors} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.textSecondary }}>No transactions match the current filters.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Plus color={colors.primaryContrast} size={28} />
      </TouchableOpacity>
      
      {id && (
          <AddTransactionModal 
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSuccess={handleTransactionAdded}
            clientId={id}
          />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: { padding: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemCategory: { fontSize: 14, marginTop: 2 },
  itemAmountContainer: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 16, fontWeight: '700' },
  itemDate: { fontSize: 12, marginTop: 4 },
  filterContainer: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, gap: 8 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(128,128,128,0.1)' },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(128,128,128,0.1)', marginLeft: 'auto', gap: 4 },
  filterText: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { height: 2, width: 0 } },
});