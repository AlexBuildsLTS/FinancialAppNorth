import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Plus,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { getAccounts } from '@/services/dataService';
import { Account } from '@/types';
import Card from '@/components/common/Card';

const { width } = Dimensions.get('window');

export default function AccountsScreen() {
  const { colors, isDark } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const styles = createStyles(colors, width);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet size={24} color={colors.primary} />;
      case 'savings':
        return <PiggyBank size={24} color={colors.success} />;
      case 'credit':
        return <CreditCard size={24} color={colors.warning} />;
      case 'investment':
        return <TrendingUp size={24} color="#8b5cf6" />;
      default:
        return <Wallet size={24} color={colors.primary} />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking':
        return colors.primary;
      case 'savings':
        return colors.success;
      case 'credit':
        return colors.warning;
      case 'investment':
        return '#8b5cf6';
      default:
        return colors.primary;
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const renderAccount = (account: Account, index: number) => {
    const accountColor = getAccountColor(account.type);
    const isCredit = account.type === 'credit';

    return (
      <Animated.View
        key={account.id}
        entering={FadeInUp.delay(300 + index * 100).springify()}
        style={styles.accountCard}
      >
        <TouchableOpacity activeOpacity={0.7}>
          <View style={styles.accountHeader}>
            <View style={[styles.accountIcon, { backgroundColor: `${accountColor}20` }]}>
              {getAccountIcon(account.type)}
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountType}>
                {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
              </Text>
            </View>
            <View style={styles.accountActions}>
              {isCredit ? (
                <ArrowDownRight size={20} color={colors.error} />
              ) : (
                <ArrowUpRight size={20} color={colors.success} />
              )}
            </View>
          </View>

          <View style={styles.accountBalance}>
            <Text style={styles.balanceAmount}>
              {balanceVisible 
                ? `$${account.balance.toLocaleString()}` 
                : '••••••'
              }
            </Text>
            <Text style={styles.lastUpdated}>
              Updated {new Date(account.lastUpdated).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.accountFooter}>
            <View style={[styles.accountTypeBadge, { backgroundColor: `${accountColor}20` }]}>
              <Text style={[styles.accountTypeBadgeText, { color: accountColor }]}>
                {account.currency}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Accounts</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Balance Card */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.totalBalanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Total Balance</Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              style={styles.visibilityButton}
            >
              {balanceVisible ? (
                <Eye size={20} color={colors.textSecondary} />
              ) : (
                <EyeOff size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.totalBalanceAmount}>
            {balanceVisible 
              ? `$${totalBalance.toLocaleString()}` 
              : '••••••••'
            }
          </Text>

          <View style={styles.balanceChange}>
            <ArrowUpRight size={16} color={colors.success} />
            <Text style={styles.balanceChangeText}>
              +$1,250.75 (+2.8%) this month
            </Text>
          </View>
        </Animated.View>

        {/* Accounts List */}
        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Your Accounts</Text>
          <View style={styles.accountsList}>
            {accounts.map((account, index) => renderAccount(account, index))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, screenWidth: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100, paddingTop: 20 },
    totalBalanceCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    balanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    balanceTitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    visibilityButton: {
      padding: 4,
    },
    totalBalanceAmount: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    balanceChange: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    balanceChangeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
    },
    accountsSection: { paddingHorizontal: 20 },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    accountsList: { gap: 16 },
    accountCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    accountHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    accountIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    accountInfo: { flex: 1 },
    accountName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    accountType: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    accountActions: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountBalance: { marginBottom: 12 },
    balanceAmount: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    lastUpdated: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    accountFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    accountTypeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    accountTypeBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });