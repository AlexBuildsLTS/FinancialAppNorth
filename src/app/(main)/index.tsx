import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Send,
  Receipt,
  PiggyBank,
  X,
  Radar,
  Zap,
} from 'lucide-react-native';

// 1. Import the Unified Data Service
import * as dataService from '../../services/dataService';
import { Transaction, BudgetWithSpent, DetectedSubscription } from '@/types';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { supabase } from '../../services/dataService';

const getSymbol = (currencyCode?: string) => {
  switch (currencyCode) {
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'SEK':
      return 'kr';
    case 'JPY':
      return '¥';
    default:
      return '$';
  }
};

// Enhanced Stat Card with "Titan" styling
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  link,
  router,
  style,
}: any) => (
  <TouchableOpacity
    onPress={() => link && router.push(link)}
    className={`bg-[#112240] p-5 rounded-2xl border border-white/5 mb-4 ${style}`}
  >
    <View className="flex-row items-start justify-between mb-4">
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center`}
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} color={color} />
      </View>
      {link && <ArrowUpRight size={16} color="#8892B0" />}
    </View>
    <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1">
      {title}
    </Text>
    <Text className="text-2xl font-bold text-white">{value}</Text>
    {subtitle && (
      <Text className="text-[#8892B0] text-xs mt-1">{subtitle}</Text>
    )}
  </TouchableOpacity>
);

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const symbol = getSymbol(user?.currency);

  const [loading, setLoading] = useState(true);

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [metrics, setMetrics] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    trend: [{ value: 0 }],
    activeBudgets: 0,
  });
  const [forecast, setForecast] = useState<{
    predictedAmount: number;
    trend: 'up' | 'down' | 'stable';
  }>({ predictedAmount: 0, trend: 'stable' });
  const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>(
    []
  );

  // Chart State
  const [barTitle, setBarTitle] = useState('Cash Flow');

  // Transfer Modal State
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [transferring, setTransferring] = useState(false);

  // --- 1. MEMOIZED CHART DATA ---
  const chartData = useMemo(() => {
    if (budgets.length > 0) {
      return budgets.slice(0, 3).map((b) => ({
        value: b.spent,
        label: b.category_name.substring(0, 3),
        frontColor: b.spent > b.amount ? '#F87171' : '#64FFDA',
        topLabelComponent: () => (
          <Text style={{ color: '#8892B0', fontSize: 10, marginBottom: 2 }}>
            {b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0}%
          </Text>
        ),
      }));
    } else {
      return [
        { value: metrics.income, label: 'In', frontColor: '#34D399' },
        { value: metrics.expense, label: 'Out', frontColor: '#F472B6' },
      ];
    }
  }, [budgets, metrics.income, metrics.expense]);

  useEffect(() => {
    setBarTitle(budgets.length > 0 ? 'Budget Status' : 'Cash Flow');
  }, [budgets.length]);

  // --- 2. UNIFIED DATA FETCHING (Titan Powered) ---
  const fetchData = async (showLoader = false) => {
    if (!user?.id) return;
    if (showLoader) setLoading(true);
    try {
      // Parallel execution for performance
      const [txs, summary, budgetData, forecastData, subData] =
        await Promise.all([
          dataService.getTransactions(user.id, 5),
          dataService.getFinancialSummary(user.id),
          dataService.getBudgets(user.id),
          dataService.getSpendingForecast(user.id), // Titan 2
          dataService.scanForSubscriptions(user.id), // Titan 1
        ]);

      setTransactions(txs);
      setBudgets(budgetData);
      setForecast(forecastData); // Assuming forecastData is already of type { predictedAmount: number, trend: 'up' | 'down' | 'stable' }
      setSubscriptions(subData);
      setMetrics({
        ...summary,
        trend:
          summary.trend && summary.trend.length > 1
            ? summary.trend
            : [{ value: 0 }, { value: 0 }],
        activeBudgets: budgetData.length,
      });
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [user]);
  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [user])
  );

  // --- 3. TRANSFER LOGIC (Using Unified Service) ---
  const handleTransfer = async () => {
    if (!user) return;
    if (!transferRecipient || !transferAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setTransferring(true);
    try {
      // Find recipient
      const { data: recipient, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', transferRecipient)
        .single();

      if (recipientError || !recipient) throw new Error('Recipient not found');

      // Sender Transaction (Negative)
      await dataService.createTransaction(
        {
          amount: -amount,
          description:
            transferDescription || `Transfer to ${transferRecipient}`,
          type: 'transfer',
          // Note: Payee logic can be handled in description or metadata json if you extend the schema
        },
        user.id
      );

      // Recipient Transaction (Positive)
      await dataService.createTransaction(
        {
          amount: amount,
          description: transferDescription || `Transfer from ${user.email}`,
          type: 'transfer',
        },
        recipient.id
      );

      Alert.alert('Success', 'Transfer completed successfully');
      setTransferModalVisible(false);
      setTransferRecipient('');
      setTransferAmount('');
      setTransferDescription('');
      fetchData(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView
      className="flex-1 bg-[#0A192F] p-6"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => fetchData(true)}
          tintColor="#64FFDA"
        />
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="mb-1 text-3xl font-bold text-white">Dashboard</Text>
          <Text className="text-[#8892B0]">Overview for {user.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(main)/finances/transactions')}
          className="bg-[#64FFDA] w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      {/* --- TITAN 2: AI FORECAST WIDGET --- */}
      {/* Replaces the standard metric if forecast data exists */}
      <View
        className={`flex-row flex-wrap ${isDesktop ? 'justify-between' : ''}`}
      >
        <StatCard
          title="Net Balance"
          value={`${symbol}${metrics.balance.toFixed(2)}`}
          icon={DollarSign}
          color="#34D399"
          link="/(main)/finances/transactions"
          router={router}
          style={isDesktop ? 'flex-1 mr-4' : 'w-full'}
        />

        {/* Titan 2 Forecast Card */}
        <StatCard
          title="Predicted Spend"
          value={`${symbol}${forecast.predictedAmount}`}
          subtitle={`Trend: ${forecast.trend.toUpperCase()}`}
          icon={Zap}
          color={forecast.trend === 'up' ? '#F87171' : '#64FFDA'}
          link="/(main)/finances/reports"
          router={router}
          style={isDesktop ? 'flex-1 mr-4' : 'w-full'}
        />

        <StatCard
          title="Active Budgets"
          value={metrics.activeBudgets.toString()}
          icon={BarChart3}
          color="#60A5FA"
          link="/(main)/finances/budgets"
          router={router}
          style={isDesktop ? 'flex-1' : 'w-full'}
        />
      </View>

      {/* --- TITAN 1: SUBSCRIPTION HAWK ALERT --- */}
      {subscriptions.length > 0 && (
        <View className="bg-[#112240] rounded-2xl border border-white/5 p-4 mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-[#F472B6]/20 items-center justify-center">
              <Radar size={20} color="#F472B6" />
            </View>
            <View>
              <Text className="font-bold text-white">Subscription Hawk</Text>
              <Text className="text-[#8892B0] text-xs">
                {subscriptions.length} recurring payments detected
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(main)/finances/budgets')}
          >
            <Text className="text-[#F472B6] font-bold text-sm">Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View className="bg-[#112240] rounded-2xl border border-white/5 p-6 mb-6">
        <Text className="mb-4 text-lg font-bold text-white">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-4">
          <TouchableOpacity
            onPress={() => setTransferModalVisible(true)}
            className="bg-[#64FFDA]/10 border border-[#64FFDA]/20 rounded-xl p-4 items-center flex-1 min-w-[120px]"
          >
            <Send size={24} color="#64FFDA" />
            <Text className="mt-2 text-sm font-medium text-white">
              Send Money
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(main)/scan')}
            className="bg-[#F472B6]/10 border border-[#F472B6]/20 rounded-xl p-4 items-center flex-1 min-w-[120px]"
          >
            <Receipt size={24} color="#F472B6" />
            <Text className="mt-2 text-sm font-medium text-white">
              Scan Receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(main)/finances/budgets')}
            className="bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-xl p-4 items-center flex-1 min-w-[120px]"
          >
            <PiggyBank size={24} color="#60A5FA" />
            <Text className="mt-2 text-sm font-medium text-white">
              Add Budget
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Charts Section */}
      <View
        className={`mb-6 ${isDesktop ? 'flex-row gap-6' : 'flex-col gap-6'}`}
      >
        {/* Bar Chart */}
        <View
          className={`bg-[#112240] p-5 rounded-2xl border border-white/5 ${
            isDesktop ? 'flex-1' : 'w-full'
          }`}
        >
          <View className="flex-row items-center gap-2 mb-6">
            <Activity size={20} color="#64FFDA" />
            <Text className="text-lg font-bold text-white">{barTitle}</Text>
          </View>
          <View className="items-center justify-center overflow-hidden">
            <BarChart
              data={chartData}
              barWidth={30}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="lightgray"
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: '#8892B0' }}
              xAxisLabelTextStyle={{ color: '#8892B0' }}
              hideRules
              isAnimated
              animationDuration={1000}
              height={180}
              width={isDesktop ? 300 : 250}
            />
          </View>
        </View>

        {/* Trend Chart */}
        <View
          className={`bg-[#112240] p-5 rounded-2xl border border-white/5 ${
            isDesktop ? 'flex-1' : 'w-full'
          }`}
        >
          <View className="flex-row items-center gap-2 mb-6">
            <TrendingUp size={20} color="#F472B6" />
            <Text className="text-lg font-bold text-white">Spending Trend</Text>
          </View>
          <View className="items-center justify-center overflow-hidden">
            <LineChart
              data={metrics.trend}
              color="#F472B6"
              thickness={3}
              dataPointsColor="#F472B6"
              startFillColor="#F472B6"
              endFillColor="#F472B6"
              startOpacity={0.2}
              endOpacity={0.0}
              areaChart
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: '#8892B0' }}
              hideRules
              isAnimated
              animationDuration={1000}
              height={180}
              width={isDesktop ? 300 : 250}
              curved
            />
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="bg-[#112240] rounded-2xl border border-white/5 p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-white">Recent Activity</Text>
          <TouchableOpacity
            onPress={() => router.push('/(main)/finances/transactions')}
          >
            <Text className="text-[#64FFDA] text-sm font-bold">View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#64FFDA" />
        ) : transactions.length === 0 ? (
          <Text className="text-[#8892B0] py-4">No transactions yet.</Text>
        ) : (
          <View className="gap-4">
            {transactions.slice(0, 5).map((tx) => (
              <View
                key={tx.id}
                className="flex-row items-center gap-4 pb-3 border-b border-white/5 last:border-0"
              >
                <View
                  className={`w-2 h-2 rounded-full ${
                    Number(tx.amount) >= 0 ? 'bg-[#64FFDA]' : 'bg-[#F472B6]'
                  }`}
                />
                <View className="flex-1">
                  <Text className="font-medium text-white">
                    {tx.description || 'Unknown'}
                  </Text>
                  <Text className="text-[#8892B0] text-xs">
                    {new Date(tx.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  className={`font-bold ${
                    Number(tx.amount) >= 0 ? 'text-[#64FFDA]' : 'text-white'
                  }`}
                >
                  {Number(tx.amount) >= 0 ? '+' : ''}
                  {symbol}
                  {Math.abs(Number(tx.amount)).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Transfer Modal */}
      <Modal
        visible={transferModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTransferModalVisible(false)}
      >
        <View className="items-center justify-center flex-1 p-6 bg-black/50">
          <View className="bg-[#112240] rounded-2xl border border-white/5 p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-white">Send Money</Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                <X size={24} color="#8892B0" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-[#8892B0] text-sm mb-2">
                  Recipient Email
                </Text>
                <TextInput
                  value={transferRecipient}
                  onChangeText={setTransferRecipient}
                  placeholder="user@example.com"
                  placeholderTextColor="#8892B0"
                  className="bg-[#0A192F] border border-white/5 rounded-lg p-4 text-white"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-[#8892B0] text-sm mb-2">
                  Amount ({symbol})
                </Text>
                <TextInput
                  value={transferAmount}
                  onChangeText={setTransferAmount}
                  placeholder="0.00"
                  placeholderTextColor="#8892B0"
                  className="bg-[#0A192F] border border-white/5 rounded-lg p-4 text-white"
                  keyboardType="decimal-pad"
                />
              </View>

              <View>
                <Text className="text-[#8892B0] text-sm mb-2">
                  Description (Optional)
                </Text>
                <TextInput
                  value={transferDescription}
                  onChangeText={setTransferDescription}
                  placeholder="What's this for?"
                  placeholderTextColor="#8892B0"
                  className="bg-[#0A192F] border border-white/5 rounded-lg p-4 text-white"
                />
              </View>

              <TouchableOpacity
                onPress={handleTransfer}
                disabled={transferring}
                className="bg-[#64FFDA] rounded-lg p-4 items-center mt-4"
              >
                {transferring ? (
                  <ActivityIndicator color="#0A192F" />
                ) : (
                  <Text className="text-[#0A192F] font-bold text-lg">
                    Send Money
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
