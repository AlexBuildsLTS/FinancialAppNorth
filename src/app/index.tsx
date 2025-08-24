import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import { ChartSection } from '@/components/dashboard/ChartSection';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <DashboardHeader
        userName={user?.display_name || 'User'}
        avatarUrl={user?.avatar_url || ''}
        onPressProfile={() => router.push('/(tabs)/profile')}
        onPressSettings={() => { } } onPressMessages={function (): void {
          throw new Error('Function not implemented.');
        } }      />

      <MetricsGrid />
      <ChartSection />
      <QuickActions
        onAddTransaction={() => {
          // We will implement this next
          console.log('Add transaction pressed');
        }}
      />
      <RecentTransactions />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
