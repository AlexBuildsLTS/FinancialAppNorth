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
  StatusBar 
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
  X 
} from 'lucide-react-native';
// Use the unified dataService we fixed
import { 
  getTransactions, 
  getBudgets, 
  getFinancialSummary, 
  createTransaction,
  getUsers // Used for transfer recipient lookup
} from '../../services/dataService';
import { supabase } from '../../lib/supabase';
import { Transaction, BudgetWithSpent } from '@/types';
import { BarChart, LineChart } from "react-native-gifted-charts";

const getSymbol = (currencyCode?: string) => {
    switch(currencyCode) {
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'SEK': return 'kr';
        case 'JPY': return '¥';
        default: return '$';
    }
};

const StatCard = ({ title, value, icon: Icon, color, link, router, style }: any) => (
  <TouchableOpacity 
    onPress={() => link && router.push(link)}
    className={`bg-[#112240] p-5 rounded-2xl border border-white/5 mb-4 ${style}`}
    activeOpacity={0.7}
  >
    <View className="flex-row justify-between items-start mb-4">
      <View className={`w-10 h-10 rounded-xl items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
        <Icon size={20} color={color} />
      </View>
      {link && <ArrowUpRight size={16} color="#8892B0" />}
    </View>
    <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1">{title}</Text>
    <Text className="text-white text-2xl font-bold">{value}</Text>
  </TouchableOpacity>
);

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; 
  const symbol = getSymbol(user?.currency);

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [metrics, setMetrics] = useState({ balance: 0, income: 0, expense: 0, trend: [{value: 0}], activeBudgets: 0 });
  const [barTitle, setBarTitle] = useState("Cash Flow");

  // Transfer modal state
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [transferring, setTransferring] = useState(false);

  // --- Data Fetching ---
  const fetchData = async (showLoader = false) => {
    if (!user?.id) return;
    if (showLoader) setLoading(true);
    try {
      // Parallel fetch for speed
      const [txs, summary, budgetData] = await Promise.all([
        getTransactions(user.id),
        getFinancialSummary(user.id),
        getBudgets(user.id)
      ]);

      setTransactions(txs);
      setBudgets(budgetData);
      
      // Ensure trend has at least some data to prevent chart crash
      const safeTrend = (summary.trend && summary.trend.length > 0) 
        ? summary.trend.map(t => ({ value: t.value })) 
        : [{value: 0}, {value: 0}];

      setMetrics({
          ...summary,
          trend: safeTrend,
          activeBudgets: budgetData.length
      });

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(true); }, [user]);

  useFocusEffect(useCallback(() => { fetchData(false); }, [user]));

  // --- Chart Data Memoization ---
  const chartData = useMemo(() => {
    // If we have budgets, show budget adherence
    if (budgets.length > 0) {
      return budgets.slice(0, 4).map(b => ({
        value: b.spent,
        label: b.category_name.substring(0, 4),
        frontColor: b.spent > b.amount ? '#F87171' : '#64FFDA',
        topLabelComponent: () => (
          <Text style={{color: '#8892B0', fontSize: 10, marginBottom: 2}}>
            {b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0}%
          </Text>
        )
      }));
    } 
    // Fallback to Income/Expense if no budgets
    else {
      return [
        {value: metrics.income, label: 'In', frontColor: '#34D399', topLabelComponent: () => <Text style={{color:'#34D399', fontSize:10}}>{symbol}{metrics.income}</Text>},
        {value: metrics.expense, label: 'Out', frontColor: '#F472B6', topLabelComponent: () => <Text style={{color:'#F472B6', fontSize:10}}>{symbol}{metrics.expense}</Text>},
      ];
    }
  }, [budgets, metrics.income, metrics.expense]);

  useEffect(() => {
    setBarTitle(budgets.length > 0 ? "Budget Status" : "Monthly Cash Flow");
  }, [budgets.length]);

  // --- Transfer Handler ---
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
      // Find recipient by email
      const { data: recipient, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', transferRecipient.trim())
        .single();

      if (recipientError || !recipient) {
        throw new Error('Recipient not found');
      }

      // Create transfer transaction for sender (negative amount)
      await createTransaction({
        amount: -amount,
        description: transferDescription || `Transfer to ${transferRecipient}`,
        type: 'transfer',
        category: { id: 'transfer', name: 'Transfer' } // Optional category
      }, user.id);

      // Create transfer transaction for recipient (positive amount)
      // Note: In strict production apps, this second write should be a backend function to ensure atomicity
      await createTransaction({
        amount: amount,
        description: transferDescription || `Transfer from ${user.email}`,
        type: 'transfer',
        category: { id: 'transfer', name: 'Transfer' }
      }, recipient.id);

      Alert.alert('Success', 'Transfer completed successfully');
      setTransferModalVisible(false);
      setTransferRecipient('');
      setTransferAmount('');
      setTransferDescription('');
      fetchData(false); // Refresh data
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  if (!user) return null;

  return (
    <View className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      <ScrollView 
        className="flex-1 p-6" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchData(true)} tintColor="#64FFDA" />}
      >
        <View className="mb-8 flex-row justify-between items-center mt-4">
          <View>
            <Text className="text-white text-3xl font-bold mb-1">Dashboard</Text>
            <Text className="text-[#8892B0]">Overview for {user.name}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(main)/finances/transactions')} 
            className="bg-[#64FFDA] w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/20"
          >
            <Plus size={24} color="#0A192F" />
          </TouchableOpacity>
        </View>

        {/* Metrics */}
        <View className={`flex-row flex-wrap ${isDesktop ? 'justify-between' : ''}`}>
          <StatCard 
            title="Net Balance" 
            value={`${symbol}${metrics.balance.toFixed(2)}`} 
            icon={DollarSign} 
            color="#34D399" 
            link="/(main)/finances/transactions" 
            router={router} 
            style={isDesktop ? "flex-1 mr-4" : "w-full"} 
          />
          <StatCard 
            title="Month Expenses" 
            value={`${symbol}${metrics.expense.toFixed(2)}`} 
            icon={TrendingDown} 
            color="#F472B6" 
            link="/(main)/finances/budgets" 
            router={router} 
            style={isDesktop ? "flex-1 mr-4" : "w-full"} 
          />
          <StatCard 
            title="Active Budgets" 
            value={metrics.activeBudgets.toString()} 
            icon={BarChart3} 
            color="#60A5FA" 
            link="/(main)/finances/budgets" 
            router={router} 
            style={isDesktop ? "flex-1" : "w-full"} 
          />
        </View>

        {/* Quick Actions */}
        <View className="bg-[#112240] rounded-2xl border border-white/5 p-6 mt-6">
          <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-4">
            <TouchableOpacity
              onPress={() => setTransferModalVisible(true)}
              className="bg-[#64FFDA]/10 border border-[#64FFDA]/20 rounded-xl p-4 items-center flex-1 min-w-[100px]"
            >
              <Send size={24} color="#64FFDA" />
              <Text className="text-white text-xs font-medium mt-2 text-center">Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(main)/scan')}
              className="bg-[#F472B6]/10 border border-[#F472B6]/20 rounded-xl p-4 items-center flex-1 min-w-[100px]"
            >
              <Receipt size={24} color="#F472B6" />
              <Text className="text-white text-xs font-medium mt-2 text-center">Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(main)/finances/budgets')}
              className="bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-xl p-4 items-center flex-1 min-w-[100px]"
            >
              <PiggyBank size={24} color="#60A5FA" />
              <Text className="text-white text-xs font-medium mt-2 text-center">Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Charts */}
        <View className={`mt-6 ${isDesktop ? 'flex-row gap-6' : 'flex-col gap-6'}`}>
          
          {/* Bar Chart */}
          <View className={`bg-[#112240] p-5 rounded-2xl border border-white/5 ${isDesktop ? 'flex-1' : 'w-full'}`}>
            <View className="flex-row items-center gap-2 mb-6">
              <Activity size={20} color="#64FFDA" />
              <Text className="text-white font-bold text-lg">{barTitle}</Text>
            </View>
            <View className="items-center justify-center overflow-hidden pb-2">
               {/* Wrapped in a view to handle overflow safely */}
               <BarChart
                  data={chartData}
                  barWidth={30}
                  spacing={20}
                  roundedTop
                  roundedBottom
                  hideRules
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{color: '#8892B0', fontSize: 10}}
                  noOfSections={3}
                  maxValue={Math.max(metrics.income, metrics.expense, 1000) * 1.2} // Dynamic scaling
                  height={180}
                  width={width - 90} // Dynamic width adjustment
                  isAnimated
               />
            </View>
          </View>

          {/* Trend Chart (Line) */}
          <View className={`bg-[#112240] p-5 rounded-2xl border border-white/5 ${isDesktop ? 'flex-1' : 'w-full'}`}>
            <View className="flex-row items-center gap-2 mb-6">
              <TrendingUp size={20} color="#F472B6" />
              <Text className="text-white font-bold text-lg">Spending Trend</Text>
            </View>
            <View className="items-center justify-center overflow-hidden pb-2">
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
                  curved
                  hideRules
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{color: '#8892B0', fontSize: 10}}
                  height={180}
                  width={width - 90}
                  isAnimated
              />
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <View className="bg-[#112240] rounded-2xl border border-white/5 p-6 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-bold">Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/finances/transactions')}>
              <Text className="text-[#64FFDA] text-sm font-bold">View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#64FFDA" />
          ) : transactions.length === 0 ? (
            <View className="py-4 items-center">
                <Text className="text-[#8892B0]">No recent transactions.</Text>
            </View>
          ) : (
            <View className="gap-4">
              {transactions.slice(0, 5).map((tx) => (
                <View key={tx.id} className="flex-row items-center gap-4 border-b border-white/5 pb-3 last:border-0">
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${Number(tx.amount) >= 0 ? 'bg-[#34D399]/20' : 'bg-[#F472B6]/20'}`}>
                      {Number(tx.amount) >= 0 ? <TrendingUp size={16} color="#34D399"/> : <TrendingDown size={16} color="#F472B6"/>}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium text-base">{tx.description || 'Unknown'}</Text>
                    <Text className="text-[#8892B0] text-xs">{new Date(tx.date).toLocaleDateString()}</Text>
                  </View>
                  <Text className={`font-bold text-base ${Number(tx.amount) >= 0 ? 'text-[#34D399]' : 'text-white'}`}>
                    {Number(tx.amount) >= 0 ? '+' : ''}{symbol}{Math.abs(Number(tx.amount)).toFixed(2)}
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
          <View className="flex-1 bg-black/80 justify-center items-center p-6">
            <View className="bg-[#112240] rounded-2xl border border-white/5 p-6 w-full max-w-sm">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">Send Money</Text>
                <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                  <X size={24} color="#8892B0" />
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-[#8892B0] text-sm mb-2">Recipient Email</Text>
                  <TextInput
                    value={transferRecipient}
                    onChangeText={setTransferRecipient}
                    placeholder="user@example.com"
                    placeholderTextColor="#475569"
                    className="bg-[#0A192F] border border-white/5 rounded-lg p-4 text-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text className="text-[#8892B0] text-sm mb-2">Amount ({symbol})</Text>
                  <TextInput
                    value={transferAmount}
                    onChangeText={setTransferAmount}
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    className="bg-[#0A192F] border border-white/5 rounded-lg p-4 text-white font-bold text-xl"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View>
                  <Text className="text-[#8892B0] text-sm mb-2">Description</Text>
                  <TextInput
                    value={transferDescription}
                    onChangeText={setTransferDescription}
                    placeholder="What's this for?"
                    placeholderTextColor="#475569"
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
                    <Text className="text-[#0A192F] font-bold text-lg">Send Money</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}