import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions'; // Import the hook
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import { ChartSection } from '@/components/dashboard/ChartSection';
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionModal from '@/components/forms/AddTransactionModal';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { refreshTransactions } = useTransactions(); // Get the refresh function

  const [isModalVisible, setIsModalVisible] = useState(false);

  // This function will now be called by the modal on a successful save
  const onTransactionAdded = () => {
    refreshTransactions(); // Trigger a data refresh
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
      >
        <DashboardHeader
          username={user?.displayName || 'User'}
          avatarUrl={user?.avatarUrl || ''}
          onPressProfile={() => router.push('/(tabs)/profile')}
          onPressSettings={() => {}}
        />
        
        <MetricsGrid />
        <ChartSection />
        <QuickActions onAddTransaction={() => setIsModalVisible(true)} />
        <RecentTransactions />

      </ScrollView>

      <AddTransactionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={onTransactionAdded}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 50,
  },
});