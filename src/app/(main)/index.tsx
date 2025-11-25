import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, DimensionValue } from 'react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { useRouter } from 'expo-router';
import { Activity, ArrowUpRight, DollarSign, Users, ShieldCheck, FileText, Plus, TrendingUp, TrendingDown, BarChart } from 'lucide-react-native';
import { UserRole } from '@/types';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getTransactions } from '../../services/dataService';
import { Transaction } from '@/types';
import { useFocusEffect } from 'expo-router';
import { useGlobalSearchParams } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const ChartBar = ({ height, active }: { height: DimensionValue; active?: boolean }) => (
  <View className={`flex-1 rounded-t-sm ${active ? 'bg-[#64FFDA]' : 'bg-[#1D3255]'}`} style={{ height }} />
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="bg-[#112240] rounded-2xl border border-white/5 p-6 mb-6">
    <Text className="text-white text-lg font-bold mb-4">{title}</Text>
    {children}
  </View>
);

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const txs = await getTransactions(user.id);
      setTransactions(txs);
      // Calculate real balance from transactions
      const balance = txs.reduce((acc, tx) => acc + (tx.amount || 0), 0);
      setTotalBalance(balance);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) return null;

  const StatCard = ({ title, value, icon: Icon, color, link }: any) => (
    <TouchableOpacity 
      onPress={() => link && router.push(link)}
      className="bg-[#112240] p-5 rounded-2xl border border-white/5 flex-1 min-w-[150px] mb-4 mr-4"
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

  return (
    <ScrollView 
      className="flex-1 bg-[#0A192F] p-6" 
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#64FFDA" />}
    >
      <View className="mb-8 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-3xl font-bold mb-2">Dashboard</Text>
          <Text className="text-[#8892B0]">Welcome back, {user.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/(main)')}
          className="bg-[#64FFDA] w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap mb-6">
        <StatCard 
          title="Total Balance" 
          value={`$${totalBalance.toFixed(2)}`} // REAL VALUE 
          icon={DollarSign}  
          color="#34D399" 
          link="/(main)/transactions"
        />
        <StatCard 
          title="Active Docs" 
          value="0" // Placeholder for now until docs logic is connected
          icon={FileText} 
          color="#60A5FA" 
          link="/(main)/documents"
        />
      </View> 


      {/* Role Specific Sections */}
      {user.role === UserRole.ADMIN && (
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">Admin Controls</Text>
            <View className="flex-row flex-wrap">
            <StatCard title="System Users" value="-" icon={Users} color="#F472B6" link="/admin/users" />
            </View>

            {/* Charts */}
            <View>
            <Card title="Revenue Overview">
              <View style={{ height: 300 }} className="items-center justify-center">
              <Text className="text-[#8892B0]">Chart will be displayed here.</Text>
              </View>
            </Card>

            <Card title="Expense Breakdown">
              <View style={{ height: 300 }} className="items-center justify-center">
              <Text className="text-[#8892B0]">Chart will be displayed here.</Text>
              </View>
            </Card>
            </View>
        </View>
      )}
      {/* Recent Transactions List */}
      <View className="bg-[#112240] rounded-2xl border border-white/5 p-6">
        <Text className="text-white text-lg font-bold mb-4">Recent Activity</Text>
        {loading ? (
          <ActivityIndicator color="#64FFDA" />
        ) : transactions.length === 0 ? (
          <Text className="text-[#8892B0]">No transactions found. Tap + to add one.</Text>
        ) : (
          <View className="gap-4">
            {transactions.slice(0, 5).map((tx) => (
              <View key={tx.id} className="flex-row items-center gap-4 border-b border-white/5 pb-3 last:border-0">
                <View className={`w-2 h-2 rounded-full ${tx.amount >= 0 ? 'bg-[#64FFDA]' : 'bg-[#F472B6]'}`} />
                <View className="flex-1">
                  <Text className="text-white font-medium">{tx.description || 'Transaction'}</Text>
                  <Text className="text-[#8892B0] text-xs">{new Date(tx.date).toLocaleDateString()}</Text>
                </View>
                <Text className={`font-bold ${tx.amount >= 0 ? 'text-[#64FFDA]' : 'text-white'}`}>
                  {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}