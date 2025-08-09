import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { ChevronRight } from 'lucide-react-native';
import { fetchTransactions, Transaction } from '@/services/transactionService';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function RecentTransactions() {
  const { colors } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = createStyles(colors);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions(colors);
        setTransactions(data.slice(0, 4)); // Show only recent 4
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [colors]);

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const isIncome = item.amount > 0;
    const amountColor = isIncome ? colors.success : colors.text;

    return (
      <Animated.View
        entering={FadeInUp.delay(500 + index * 100)
          .duration(600)
          .springify()}
      >
        <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
          <View style={styles.transactionLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              {item.icon}
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{item.title}</Text>
              <Text style={styles.transactionCategory}>{item.category}</Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: amountColor }]}>
              {isIncome ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
            </Text>
            <ChevronRight color={colors.textSecondary} size={16} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.skeletonItem}>
              <View style={styles.skeletonLeft}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonText}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonSubtitle} />
                </View>
              </View>
              <View style={styles.skeletonAmount} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllButton}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    viewAllButton: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    listContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    transactionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    transactionCategory: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    transactionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: '700',
    },
    // Loading skeleton styles
    loadingContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    skeletonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    skeletonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    skeletonIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceVariant,
      marginRight: 12,
    },
    skeletonText: {
      flex: 1,
    },
    skeletonTitle: {
      width: 120,
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.surfaceVariant,
      marginBottom: 8,
    },
    skeletonSubtitle: {
      width: 80,
      height: 14,
      borderRadius: 4,
      backgroundColor: colors.surfaceVariant,
    },
    skeletonAmount: {
      width: 60,
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.surfaceVariant,
    },
  });