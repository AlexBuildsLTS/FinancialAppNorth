import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  ShoppingBag,
  Car,
  Chrome as Home,
  Coffee,
  Briefcase,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  icon: React.ReactNode;
}

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const styles = createStyles(isDark);

  const transactions: Transaction[] = [
    {
      id: '1',
      title: 'Whole Foods Market',
      category: 'Groceries',
      amount: -156.5,
      date: 'Jan 15, 2025',
      time: '2:30 PM',
      type: 'expense',
      status: 'completed',
      icon: <ShoppingBag size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
    },
    {
      id: '2',
      title: 'Monthly Salary',
      category: 'Salary',
      amount: 5200.0,
      date: 'Jan 15, 2025',
      time: '9:00 AM',
      type: 'income',
      status: 'completed',
      icon: <Briefcase size={20} color={isDark ? '#64ffda' : '#10b981'} />,
    },
    {
      id: '3',
      title: 'Shell Gas Station',
      category: 'Transportation',
      amount: -45.2,
      date: 'Jan 14, 2025',
      time: '6:45 PM',
      type: 'expense',
      status: 'completed',
      icon: <Car size={20} color={isDark ? '#64ffda' : '#f59e0b'} />,
    },
    {
      id: '4',
      title: 'Starbucks Coffee',
      category: 'Food & Dining',
      amount: -12.75,
      date: 'Jan 14, 2025',
      time: '8:15 AM',
      type: 'expense',
      status: 'pending',
      icon: <Coffee size={20} color={isDark ? '#64ffda' : '#8b5cf6'} />,
    },
    {
      id: '5',
      title: 'Apartment Rent',
      category: 'Housing',
      amount: -1200.0,
      date: 'Jan 1, 2025',
      time: '12:00 PM',
      type: 'expense',
      status: 'completed',
      icon: <Home size={20} color={isDark ? '#64ffda' : '#ef4444'} />,
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || transaction.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isIncome = transaction.type === 'income';
    const amountColor = isIncome
      ? isDark
        ? '#64ffda'
        : '#10b981'
      : isDark
      ? '#fbbf24'
      : '#ef4444';

    const statusColor =
      transaction.status === 'completed'
        ? isDark
          ? '#64ffda'
          : '#10b981'
        : transaction.status === 'pending'
        ? isDark
          ? '#fbbf24'
          : '#f59e0b'
        : '#ef4444';

    return (
      <Animated.View
        key={transaction.id}
        entering={FadeInUp.delay(index * 50).springify()}
      >
        <TouchableOpacity style={styles.transactionItem}>
          <View style={styles.transactionIcon}>{transaction.icon}</View>

          <View style={styles.transactionContent}>
            <Text style={styles.transactionTitle}>{transaction.title}</Text>
            <Text style={styles.transactionCategory}>
              {transaction.category}
            </Text>
            <Text style={styles.transactionDateTime}>
              {transaction.date} • {transaction.time}
            </Text>
          </View>

          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: amountColor }]}>
              {isIncome ? '+' : '-'}$
              {Math.abs(transaction.amount).toLocaleString()}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {transaction.status}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Download size={20} color={isDark ? '#64ffda' : '#3b82f6'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={isDark ? '#0a192f' : '#ffffff'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={isDark ? '#64748b' : '#9ca3af'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={isDark ? '#64ffda' : '#3b82f6'} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['all', 'income', 'expense'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter && styles.activeFilterTabText,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.map((transaction, index) =>
          renderTransaction(transaction, index)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a192f' : '#f8fafc',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? '#0a192f' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#64ffda' : '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchSection: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#1f2937',
    },
    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 16,
    },
    filterTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    },
    activeFilterTab: {
      backgroundColor: isDark ? '#64ffda' : '#3b82f6',
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#6b7280',
    },
    activeFilterTabText: {
      color: isDark ? '#0a192f' : '#ffffff',
    },
    transactionsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    transactionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? '#334155' : '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    transactionContent: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 2,
    },
    transactionCategory: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
      marginBottom: 2,
    },
    transactionDateTime: {
      fontSize: 12,
      color: isDark ? '#64748b' : '#9ca3af',
    },
    transactionRight: {
      alignItems: 'flex-end',
      marginRight: 8,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  });
7;
