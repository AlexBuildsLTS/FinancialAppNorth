import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import ChartSection from '@/components/dashboard/ChartSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardScreen() {
  const { metrics, chartData, recentTransactions, isLoading } = useDashboardData();

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader />
        <MetricsGrid metrics={metrics} isLoading={isLoading} />
        <ChartSection chartData={chartData} isLoading={isLoading} />
        <QuickActions />
        <RecentTransactions />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    gap: 24,
    paddingBottom: 100,
  },
});