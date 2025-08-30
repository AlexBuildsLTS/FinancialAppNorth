// src/app/(tabs)/index.tsx

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useTheme } from '@/context/ThemeProvider';
import { StatusBar } from 'expo-status-bar';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import ScreenContainer from '@/components/ScreenContainer';
import { useDashboardData } from '@/hooks/useDashboardData';
import MetricCard from '@/components/dashboard/MetricCard';
import LineChart from '@/components/dashboard/LineChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionModal from '@/components/forms/AddTransactionModal';
import { Scale, TrendingUp, TrendingDown } from 'lucide-react-native';

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { metrics, chartData, loading, refreshData } = useDashboardData();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (profile?.role === UserRole.CPA) { // FIX: Using correct UPPERCASE enum key
    return <Redirect href="/(tabs)/clients" />;
  }

  const onTransactionAdded = () => {
    setIsModalVisible(false);
    refreshData();
  };

  return (
    <ScreenContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <DashboardHeader title="Dashboard" />
      
      {loading && !metrics ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !metrics ? (
        <View style={styles.loaderContainer}>
            <Text style={{color: colors.textSecondary}}>No dashboard data available.</Text>
        </View>
      ) : (
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
      )}

      <AddTransactionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={onTransactionAdded} 
        clientId={null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24, paddingBottom: 100, gap: 24 },
  metricsGrid: { flexDirection: 'row', gap: 16 },
});