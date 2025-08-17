import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Plus,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { getAccounts } from '@/services/dataService';
import { Account } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';

export default function AccountsScreen() {
  const { colors, isDark } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const styles = createStyles(colors);

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
    const iconProps = { size: 24, color: colors.text };
    switch (type) {
      case 'checking': return <Wallet {...iconProps} />;
      case 'savings': return <PiggyBank {...iconProps} />;
      case 'credit': return <CreditCard {...iconProps} />;
      case 'investment': return <TrendingUp {...iconProps} />;
      default: return <Wallet {...iconProps} />;
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.type !== 'credit' ? acc.balance : 0), 0);
  const totalDebt = accounts.reduce((sum, acc) => sum + (acc.type === 'credit' ? acc.balance : 0), 0);
  const netWorth = totalBalance + totalDebt;


  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Accounts...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.card}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Net Worth</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? <Eye size={20} color={colors.textSecondary} /> : <EyeOff size={20} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>
          <Text style={styles.totalBalanceAmount}>
            {balanceVisible ? `$${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
          </Text>
        </Animated.View>

        {accounts.map((account, index) => (
          <Animated.View key={account.id} entering={FadeInUp.delay(300 + index * 100).springify()} style={styles.card}>
             <View style={styles.accountHeader}>
              <View style={[styles.accountIcon, { backgroundColor: colors.surfaceVariant }]}>
                  {getAccountIcon(account.type)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</Text>
              </View>
              <Text style={styles.balanceAmount}>
                {balanceVisible ? `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
              </Text>
             </View>
          </Animated.View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: colors.textSecondary },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: { padding: 16, gap: 16 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    balanceTitle: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
    totalBalanceAmount: { fontSize: 32, fontWeight: '800', color: colors.text },
    accountHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    accountIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    accountName: { fontSize: 16, fontWeight: '600', color: colors.text },
    accountType: { fontSize: 14, color: colors.textSecondary },
    balanceAmount: { fontSize: 18, fontWeight: '700', color: colors.text },
  });