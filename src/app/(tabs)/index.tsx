import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import { ChartSection } from '@/components/dashboard/ChartSection'; // Corrected import
import QuickActions from '@/components/dashboard/QuickActions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionModal from '@/components/forms/AddTransactionModal';
import { Transaction } from '@/types'; // Import Transaction type

/**
 * Main dashboard screen of the application.
 * Displays an overview of financial metrics, charts, and recent activities.
 */
export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <DashboardHeader
            username="Alex"
            avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704d"
          />
          <MetricsGrid />
          <ChartSection />
          <QuickActions onAddTransaction={() => setModalVisible(true)} />
          <RecentTransactions />

          <AddTransactionModal
            visible={modalVisible} // Corrected prop name from isVisible
            onClose={() => setModalVisible(false)}
            onTransactionAdded={(transaction: Omit<Transaction, 'id'>) => {
              console.log('New Transaction:', transaction);
              // Here you would typically call a service to add the transaction
            }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
});