import React from 'react';
import ScreenContainer from '@/components/ScreenContainer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricsGrid from '@/components/dashboard/MetricsGrid'; // This line is correct, no change needed for MetricsGrid
import { ChartSection as CashFlowChart } from '@/components/dashboard/ChartSection';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

export default function DashboardScreen() {
  return (
    <ScreenContainer>
      <DashboardHeader />
      <MetricsGrid />
      <CashFlowChart />
      <QuickActions />
      <RecentTransactions />
    </ScreenContainer>
  );
}
