import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Search, Filter, Plus, Download, ShoppingBag, Car, Wallet as HomeIcon, Coffee, Briefcase } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import AddTransactionModal from '@/components/forms/AddTransactionModal';
import { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { exportToCSV } from '@/utils/fileUtils';

const { width } = Dimensions.get('window');

export default function TransactionsScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const { transactions, isLoading, refreshTransactions } = useTransactions();
  const styles = createStyles(colors, width);

  const getTransactionIcon = (category: string) => {
    switch (category) {
      case 'Groceries': return <ShoppingBag size={20} color={colors.primary} />;
      case 'Salary': return <Briefcase size={20} color={colors.success} />;
      case 'Transportation': return <Car size={20} color={colors.warning} />;
      case 'Food & Dining': return <Coffee size={20} color="#8b5cf6" />;
      case 'Housing': return <HomeIcon size={20} color={colors.error} />;
      default: return <ShoppingBag size={20} color={colors.primary} />;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || transaction.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleTransactionAdded = () => {
    refreshTransactions();
  };

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? colors.success : colors.text;
    const statusColor =
      transaction.status === 'completed' ? colors.success : transaction.status === 'pending' ? colors.warning : colors.error;

    return (
      <Animated.View key={transaction.id} entering={FadeInUp.delay(100 + index * 50).duration(400)}>
        <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
          <View style={styles.transactionIcon}>{getTransactionIcon(transaction.category)}</View>
          <View style={styles.transactionContent}>
            <Text style={styles.transactionTitle}>{transaction.title}</Text>
            <Text style={styles.transactionCategory}>{transaction.category}</Text>
            <Text style={styles.transactionDateTime}>{new Date(transaction.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: amountColor }]}>{isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{transaction.status}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7} onPress={() => exportToCSV(filteredTransactions, 'transactions')}>
            <Download size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.filterTabs}>
        {['all', 'income', 'expense'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, selectedFilter === filter && styles.activeFilterTab]}
            onPress={() => setSelectedFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, selectedFilter === filter && styles.activeFilterTabText]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => renderTransaction(transaction, index))
            ) : (
                <View style={{alignItems: 'center', marginTop: 50}}><Text style={{color: colors.textSecondary}}>No transactions found.</Text></View>
            )}
        </ScrollView>
      )}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        clientId={null}
        onSuccess={handleTransactionAdded}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, screenWidth: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    headerActions: { flexDirection: 'row', gap: 12 },
    headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
    addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    searchSection: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderWidth: 1, borderColor: colors.border },
    searchInput: { flex: 1, fontSize: 16, color: colors.text, minHeight: 24 },
    filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    filterTabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceVariant, minWidth: 80, alignItems: 'center' },
    activeFilterTab: { backgroundColor: colors.primary },
    filterTabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    activeFilterTabText: { color: colors.surface },
    transactionsList: { flex: 1, paddingHorizontal: 20 },
    scrollContent: { paddingBottom: 100 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    transactionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    transactionContent: { flex: 1 },
    transactionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
    transactionCategory: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
    transactionDateTime: { fontSize: 12, color: colors.textSecondary },
    transactionRight: { alignItems: 'flex-end', minWidth: 100 },
    transactionAmount: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  });