// src/app/(main)/transactions.tsx

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useTransactions } from '@/features/transactions/useTransactions';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { Transaction } from '@/shared/types';
import { Button } from '@/shared/components/Button';
import { Cards } from '@/shared/components/Cards';
import { useAuth } from '@/shared/context/AuthContext';
import AddTransactionModal from '@/features/transactions/AddTransactionModal';
// These imports are here, ready for when you implement categories/accounts
// import { getCategories } from '@/shared/services/budgetService';
// import { getChartOfAccounts } from '@/shared/services/accountingService';

// --- THIS IS YOUR COMPONENT ---
// (No changes needed, it's great)
const TransactionListItem = ({ item, colors }: { item: Transaction, colors: any }) => {
  const isIncome = item.type === 'income';
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
  const amountColor = isIncome ? colors.success : colors.text;

  return (
    <Cards style={styles.transactionCards}>
      <View style={styles.leftContent}>
        <Icon color={isIncome ? colors.success : colors.error} size={32} />
        <View style={styles.details}>
          <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
          <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </Cards>
  );
};


// --- THIS IS THE MISSING COMPONENT ---
// This is the main screen component that you need to export.
export default function TransactionsScreen() {
  // --- State Hooks ---
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Context/Data Hooks ---
  const { theme: { colors } } = useTheme();
  const { user } = useAuth(); // Get user for data fetching
  
  // Use your custom hook to get transactions
  // This hook returns an object with a `transactions` array (not `data`)
  // It should ideally handle loading/error states
  const { transactions, isLoading, error } = useTransactions();

  // --- Memos ---
  // Filter transactions based on the search query
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (!searchQuery) return transactions;
    
    return transactions.filter((item: Transaction) => 
      ( (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ) ||
      ( (item.category ?? '').toLowerCase().includes(searchQuery.toLowerCase()) )
    );
  }, [transactions, searchQuery]);

  // --- Render Functions ---
  
  // Renders the header with title and "Add" button
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <PlusCircle color={colors.background} size={20} />
        <Text style={[styles.addButtonText, { color: colors.background }]}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  // Renders the search and filter bar
  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Search color={colors.textSecondary} size={20} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <SlidersHorizontal color={colors.textSecondary} size={20} />
      </TouchableOpacity>
    </View>
  );
  
  // Renders a message when the list is empty
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {isLoading ? 'Loading...' : 'No transactions found.'}
      </Text>
    </View>
  );

  // --- Main Component Return ---
  return (
    <ScreenContainer>
      <FlatList
        data={filteredTransactions}
        // Use your TransactionListItem component
        renderItem={({ item }) => <TransactionListItem item={item} colors={colors} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        // Add all other sections as ListHeaderComponent
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderFilterBar()}
          </>
        }
        ListEmptyComponent={renderEmptyList}
      />
      
      {/* The modal for adding a new transaction */}
      <AddTransactionModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => setModalVisible(false)}
        clientId={user?.id ?? ''}
      />
    </ScreenContainer>
  );
}

// --- THIS IS YOUR STYLESHEET ---
// (No changes needed, it's great)
const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    height: 48,
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  transactionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12, // Use margin for spacing between Cards
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  details: {},
  description: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    marginTop: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
