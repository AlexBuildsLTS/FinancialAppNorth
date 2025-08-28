// src/app/(tabs)/index.tsx

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import LineChart from '@/components/dashboard/LineChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionModal from '@/components/forms/AddTransactionModal';

import { useDashboardData } from '@/hooks/useDashboardData';
import { Scale, TrendingUp, TrendingDown } from 'lucide-react-native';

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { metrics, chartData, loading, refreshData } = useDashboardData();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onTransactionAdded = () => {
    setIsModalVisible(false);
    refreshData();
  };

  const renderContent = () => {
    // Show a loader only on the initial fetch
    if (loading && !metrics) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    
    // Handle the case where there is no data to display
    if (!metrics) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={{color: colors.textSecondary}}>No dashboard data available.</Text>
            </View>
        )
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={colors.primary} />}
      >
        <View style={styles.metricsGrid}>
          <MetricCard title="Total Balance" value={`$${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} Icon={Scale} />
          <MetricCard title="Income (Month)" value={`$${metrics.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} Icon={TrendingUp} />
          <MetricCard title="Expenses (Month)" value={`$${metrics.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} Icon={TrendingDown} />
        </View>

        <LineChart title="Monthly Income (Last 6 Months)" data={chartData} />

        <RecentTransactions transactions={metrics.recentTransactions} onAddTransaction={() => setIsModalVisible(true)} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <DashboardHeader />
      {renderContent()}
      <AddTransactionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={onTransactionAdded} clientId={null}      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  metricsGrid: { flexDirection: 'row', gap: 16 },
});