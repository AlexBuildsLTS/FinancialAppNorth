import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { DollarSign, Plus, ArrowUpRight, TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react-native';
import { getTransactions, getFinancialSummary, getBudgets } from '../../services/dataService';
import { Transaction } from '@/types';
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
  const [budgets, setBudgets] = useState<any[]>([]); // Store budgets for the chart
  const [metrics, setMetrics] = useState({ 
      balance: 0, 
      income: 0, 
      expense: 0, 
      trend: [{value: 0}], 
      activeBudgets: 0 
  });

  const fetchData = async (showLoader = false) => {
    if (!user?.id) return;
    if (showLoader) setLoading(true);
    try {
      const txs = await getTransactions(user.id);
      setTransactions(txs);
      
      const summary = await getFinancialSummary(user.id);
      const budgetList = await getBudgets(user.id); // Fetch real budgets
      setBudgets(budgetList);

      setMetrics({
          ...summary,
          // Ensure trend has valid data points
          trend: (summary.trend && summary.trend.length > 0) ? summary.trend : [{value: 0}],
          activeBudgets: budgetList.length
      });

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(true); }, [user]);

  useFocusEffect(
    useCallback(() => { fetchData(false); }, [user])
  );

  // --- DYNAMIC CHART LOGIC ---
  
  // 1. Bar Chart: Show Budget Utilization if budgets exist
  let barData = [];
  let barTitle = "Cash Flow";

  if (budgets.length > 0) {
      barTitle = "Budget Status";
      // Take top 3 budgets to show on dashboard
      barData = budgets.slice(0, 3).map(b => ({
          value: b.spent,
          label: b.category_name.substring(0, 3), // Short label (e.g. "Foo")
          frontColor: b.spent > b.amount ? '#F87171' : '#64FFDA', // Red if over budget
          topLabelComponent: () => (
              <Text style={{color: '#8892B0', fontSize: 10, marginBottom: 2}}>
                 {Math.round((b.spent / b.amount) * 100)}%
              </Text>
          )
      }));
  } else {
      // Fallback: Standard Income vs Expense
      barData = [
        {value: metrics.income, label: 'In', frontColor: '#34D399'},
        {value: metrics.expense, label: 'Out', frontColor: '#F472B6'},
      ];
  }
  
  // 2. Line Chart: Ensure it's not flat if there is data
  const lineData = metrics.trend.length > 1 ? metrics.trend : [{value: 0}, {value: 0}];

  if (!user) return null;

  return (
    <ScrollView 
      className="flex-1 bg-[#0A192F] p-6" 
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchData(true)} tintColor="#64FFDA" />}
    >
      <View className="mb-8 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-3xl font-bold mb-1">Dashboard</Text>
          <Text className="text-[#8892B0]">Overview for {user.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/(main)/finances/transactions')} 
          className="bg-[#64FFDA] w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

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

      <View className={`mt-4 ${isDesktop ? 'flex-row gap-6' : 'flex-col gap-6'}`}>
        
        {/* Dynamic Bar Chart (Budgets or Cash Flow) */}
        <View className={`bg-[#112240] p-5 rounded-2xl border border-white/5 ${isDesktop ? 'flex-1' : 'w-full'}`}>
          <View className="flex-row items-center gap-2 mb-6">
            <Activity size={20} color="#64FFDA" />
            <Text className="text-white font-bold text-lg">{barTitle}</Text>
          </View>
          <View className="items-center justify-center overflow-hidden">
             <BarChart 
                data={barData} 
                barWidth={30} 
                noOfSections={3} 
                barBorderRadius={4} 
                frontColor="lightgray" 
                yAxisThickness={0} 
                xAxisThickness={0} 
                yAxisTextStyle={{color: '#8892B0'}} 
                xAxisLabelTextStyle={{color: '#8892B0'}} 
                hideRules 
                isAnimated 
                animationDuration={1000} 
                height={180} 
                width={isDesktop ? 300 : 250} 
             />
          </View>
        </View>

        {/* Spending Trend (Line Chart) */}
        <View className={`bg-[#112240] p-5 rounded-2xl border border-white/5 ${isDesktop ? 'flex-1' : 'w-full'}`}>
          <View className="flex-row items-center gap-2 mb-6">
            <TrendingUp size={20} color="#F472B6" />
            <Text className="text-white font-bold text-lg">Spending Trend</Text>
          </View>
          <View className="items-center justify-center overflow-hidden">
            <LineChart 
                data={lineData} 
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
                yAxisTextStyle={{color: '#8892B0'}} 
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

      {/* Activity List */}
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
          <Text className="text-[#8892B0] py-4">No transactions yet. Tap the + button!</Text>
        ) : (
          <View className="gap-4">
            {transactions.slice(0, 5).map((tx) => (
              <View key={tx.id} className="flex-row items-center gap-4 border-b border-white/5 pb-3 last:border-0">
                <View className={`w-2 h-2 rounded-full ${Number(tx.amount) >= 0 ? 'bg-[#64FFDA]' : 'bg-[#F472B6]'}`} />
                <View className="flex-1">
                  <Text className="text-white font-medium">{tx.description || 'Unknown'}</Text>
                  <Text className="text-[#8892B0] text-xs">{new Date(tx.date).toLocaleDateString()}</Text>
                </View>
                <Text className={`font-bold ${Number(tx.amount) >= 0 ? 'text-[#64FFDA]' : 'text-white'}`}>
                  {Number(tx.amount) >= 0 ? '+' : ''}{symbol}{Math.abs(Number(tx.amount)).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}