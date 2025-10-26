// src/app/(main)/index.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { WelcomeHeader } from '@/features/dashboard/WelcomeHeader';
import MetricsGrid from '@/features/dashboard/MetricsGrid';
import SpendingTrends from '@/features/dashboard/SpendingTrends';
import BudgetAllocation from '@/features/dashboard/BudgetAllocation';
import BudgetOverview from '@/features/dashboard/BudgetOverview';
import AddTransactionModal from '@/features/transactions/AddTransactionModal';
import { Button } from '@/shared/components/Button'; // Changed to named import

// Hooks
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

// Types
import { DashboardMetricItem, DashboardMetrics } from '@/shared/types';

// Utils
import { formatCurrency } from '@/shared/utils/formatters';

// Icons
 import { PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';


export default function DashboardScreen() {
  const { theme: { colors } } = useTheme();
  const { profile } = useAuth();
  const { width } = useWindowDimensions();

  const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);

  const { metrics: data, loading: isLoading, error, refreshData } = useDashboardData();

  const handleAddTransaction = useCallback(() => {
    setIsAddTransactionModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsAddTransactionModalVisible(false);
  }, []);

  const handleTransactionAdded = useCallback(() => {
    refreshData();
    handleModalClose();
  }, [refreshData, handleModalClose]);

  const dashboardMetrics: DashboardMetricItem[] = useMemo(() => [
    {
      id: 'balance',
      label: 'Total Balance',
      value: data?.totalBalance ?? 0,
      icon: <Wallet color={colors.primary} size={24} />,
      format: formatCurrency,
    },
    {
      id: 'income',
      label: 'Monthly Income',
      value: data?.monthlyIncome ?? 0,
      icon: <TrendingUp color={colors.success} size={24} />,
      format: formatCurrency,
    },
    {
      id: 'expenses',
      label: 'Monthly Expenses',
      value: data?.monthlyExpenses ?? 0,
      icon: <TrendingDown color={colors.error} size={24} />,
      format: formatCurrency,
    },
    {
      id: 'savings',
      label: 'Savings Goal',
      value: data?.savingsGoal ?? 0,
      icon: <PiggyBank color={colors.warning} size={24} />,
      format: formatCurrency,
    },
  ], [data, colors]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={48} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Error loading dashboard data: {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
          <Button title="Retry" onPress={refreshData} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <WelcomeHeader />
        <MetricsGrid metricData={dashboardMetrics} /> {/* Changed prop to metricData */}
        <SpendingTrends incomeData={data?.incomeChartData || []} expenseData={data?.expenseChartData || []} /> {/* Changed prop to incomeData and expenseData */}
        <BudgetAllocation allocationData={data?.budgetAllocation || []} /> {/* Changed prop to allocationData */}
        <BudgetOverview budgetData={data?.budgets || []} /> {/* Changed prop to budgetData */}
      </ScrollView>

      <AddTransactionModal
        visible={isAddTransactionModalVisible}
        onClose={handleModalClose}
        onSuccess={handleTransactionAdded}
        clientId={profile?.id || null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
