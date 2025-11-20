import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native'
import {
  useLocalSearchParams,
  useFocusEffect,
  useRouter,
  Stack,
} from 'expo-router';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  ReceiptText,
} from 'lucide-react-native';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { useTheme } from '@/shared/context/ThemeProvider';
import { getClientDashboardData } from '@/shared/services/cpaService';
import { ClientDashboardData } from '@/shared/types';


// Child components
import MetricsGrid from '@/features/dashboard/MetricsGrid';
import RecentTransactions from '@/features/dashboard/RecentTransactions';

export default function ClientDashboardScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const clientId = Array.isArray(id) ? id[0] : id;

  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientData = useCallback(() => {
    if (!clientId) return;

    const load = async () => {
      try {
        setLoading(true);
        const result = await getClientDashboardData(clientId as string);
        setData(result);
      } catch (e) {
        console.error('Failed to fetch client dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  // Re‑fetch when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchClientData();
    }, [fetchClientData])
  );

  if (loading) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!data) {
    return (
      <ScreenContainer style={styles.centered}>
        <Text style={{ color: colors.text }}>Could not load client data.</Text>
      </ScreenContainer>
    );
  }

  /* ---- Build metrics for the MetricsGrid component ---- */
  const metrics: any[] = [
    {
      title: 'Total Balance',
      value:
        data.metrics?.totalBalance?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }) ?? '$0.00',
      change: data.metrics?.totalBalance ? 2.5 : 0,
      Icon: Wallet,
      changeType: data.metrics?.totalBalance ? 'positive' : 'positive',
    },
    {
      title: 'Monthly Income',
      value:
        data.metrics?.totalIncome?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }) ?? '$0.00',
      change: data.metrics?.totalIncome ? 1.8 : 0,
      Icon: TrendingUp,
      changeType: data.metrics?.totalIncome ? 'positive' : 'positive',
    },
    {
      title: 'Monthly Expenses',
      value:
        data.metrics?.totalExpenses?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }) ?? '$0.00',
      change: data.metrics?.totalExpenses ? -0.5 : 0,
      Icon: TrendingDown,
      changeType: data.metrics?.totalExpenses ? 'negative' : 'positive',
    },
    {
      title: 'Transactions',
      value: (data.recentTransactions?.length ?? 0).toString(),
      change: 0,
      Icon: ReceiptText,
      changeType: 'positive',
    },
  ];

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Image
            source={{
              uri:
                data.profile.avatar_url ||
                `https://i.pravatar.cc/150?u=${data.profile.id}`,
            }}
            style={styles.headerAvatar}
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {data.profile.display_name}'s Workspace
          </Text>
        </View>

        {/* Empty spacer – keeps the back‑arrow centered */}
        <View style={{ width: 32 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Financial Overview
        </Text>
        <MetricsGrid metricData={metrics} />

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, marginTop: 24 },
          ]}
        >
          Recent Client Transactions
        </Text>

        {/* Pass the transactions array directly */} 
        <RecentTransactions transactions={data.recentTransactions} />

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.actionButtonText}>Add New Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Generate Client Report
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#303030',
  },
  backButton: { padding: 4 },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  actionsContainer: { paddingHorizontal: 16, marginTop: 32 },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
