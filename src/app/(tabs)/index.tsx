import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import ChartSection from '@/components/dashboard/ChartSection';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionModal from '@/components/forms/AddTransactionModal';
import { useTransactions } from '@/hooks/useTransactions';
import { 
  BarChart3, 
  Target, 
  FileText, 
  Calculator,
  TrendingUp,
  PieChart
} from 'lucide-react-native';

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { transactions, isLoading, error, refreshTransactions } = useTransactions();

  const onTransactionAdded = () => {
    setIsModalVisible(false);
    refreshTransactions(); // Refresh transactions after a new one is added
  };

  const metricData = [
    {
      title: 'Net Revenue',
      value: '$15,230',
      change: 12.5,
      Icon: TrendingUp,
      changeType: 'positive' as 'positive' | 'negative',
    },
    {
      title: 'Gross Profit',
      value: '$12,890',
      change: 8.2,
      Icon: PieChart,
      changeType: 'positive' as 'positive' | 'negative',
    },
    {
      title: 'Accounts Receivable',
      value: '$5,600',
      change: -2.1,
      Icon: FileText,
      changeType: 'negative' as 'positive' | 'negative',
    },
    {
      title: 'Accounts Payable',
      value: '$3,200',
      change: 5.7,
      Icon: Calculator,
      changeType: 'positive' as 'positive' | 'negative',
    },
  ];

  const quickNavItems = [
    {
      title: 'Analytics',
      icon: BarChart3,
      onPress: () => router.push('/(tabs)/analytics'),
      color: colors.primary,
    },
    {
      title: 'Budgets',
      icon: Target,
      onPress: () => router.push('/(tabs)/budgets'),
      color: colors.success,
    },
    {
      title: 'Reports',
      icon: FileText,
      onPress: () => router.push('/(tabs)/reports'),
      color: colors.warning,
    },
    {
      title: 'Journal',
      icon: Calculator,
      onPress: () => router.push('/(tabs)/journal'),
      color: colors.error,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
                  userName={profile?.display_name || 'User'}
                  avatarUrl={profile?.avatar_url || ''}
                  onPressProfile={() => router.push('/(tabs)/profile')}
                  onPressSettings={() => router.push('/(tabs)/settings')} onPressMessages={function (): void {
                      throw new Error('Function not implemented.');
                  } }        />

        <MetricsGrid metricData={metricData} />
        
        <View style={styles.quickNavSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Navigation
          </Text>
          <View style={styles.quickNavGrid}>
            {quickNavItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickNavItem, { backgroundColor: colors.surface }]}
                onPress={item.onPress}
              >
                <View style={[styles.quickNavIcon, { backgroundColor: `${item.color}20` }]}>
                  <item.icon color={item.color} size={24} />
                </View>
                <Text style={[styles.quickNavText, { color: colors.text }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ChartSection />
        <QuickActions onAddTransaction={() => setIsModalVisible(true)} />
        <RecentTransactions transactions={transactions} />
      </ScrollView>

      <AddTransactionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={onTransactionAdded} 
        clientId={profile?.id || ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  quickNavSection: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickNavItem: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  quickNavIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickNavText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
