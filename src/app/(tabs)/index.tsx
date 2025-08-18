import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import { ChartSection } from '@/components/dashboard/ChartSection'; // Corrected import
import QuickActions from '@/components/dashboard/QuickActions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionModal from '@/components/forms/AddTransactionModal';
import { Transaction } from '@/types'; // Import Transaction type
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { useRouter } from 'expo-router'; // Import useRouter
import Button from '@/components/common/Button'; // Import Button component

/**
 * Main dashboard screen of the application.
 * Displays an overview of financial metrics, charts, and recent activities.
 */
export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { signOut } = useAuth(); // Get signOut from AuthContext
  const router = useRouter(); // Get router instance

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* DashboardHeader is now handled by the consistent header in (tabs)/_layout.tsx */}
          <MetricsGrid />
          <ChartSection />
          <QuickActions onAddTransaction={() => setModalVisible(true)} />
          <RecentTransactions />

          <AddTransactionModal
            visible={modalVisible} // Corrected prop name from isVisible
            onClose={() => setModalVisible(false)}
            onSuccess={(transaction: Omit<Transaction, 'id'>) => console.log('New Transaction:', transaction)} clientId={''}          />

          {/* Temporary Logout Button for testing */}
          <Button 
            title="Logout (For Testing)" 
            onPress={() => {
              signOut(); // Call signOut from AuthContext
              router.replace('/(auth)/login'); // Redirect to login after logout
            }} 
            style={{ marginTop: 24, backgroundColor: 'red' }} // Make it visually distinct
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
