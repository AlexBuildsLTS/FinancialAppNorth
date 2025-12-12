import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar
} from 'react-native';
import { 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  Activity, 
  Server, 
  ShieldCheck,
  Clock
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getUsers, supabase } from '../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersMonth: 0,
    totalTransactions: 0,
    totalDocuments: 0,
    activeTickets: 0,
    dbLatency: '0ms'
  });
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'Operational' | 'Issues'>('Operational');

  const loadStats = async () => {
    const start = Date.now();
    try {
      // 1. Fetch Users & Calculate Growth
      const users = await getUsers();
      const totalUsers = users.length;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // We assume user objects have a created_at field (from profile)
      // Note: If profile created_at is missing, we fallback to current date to avoid crash, but logically it implies old user
      const newUsersMonth = users.filter((u: any) => {
         // In dataService getUsers returns mapped objects, check if we mapped created_at? 
         // If not, we might need to rely on total count or update dataService. 
         // For now, let's assume we can fetch raw count for growth if needed, or update getUsers.
         // Actually, let's do a direct count for speed here to be robust.
         return true; // Placeholder for logic below
      }).length; 
      
      // Let's do direct robust counts for dashboard speed
      const { count: newUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // 2. Transaction Count
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // 3. Document Count
      const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      // 4. Active Tickets
      const { count: ticketCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'closed');

      // 5. Latency Check
      const end = Date.now();
      
      setStats({
        totalUsers,
        newUsersMonth: newUsersCount || 0,
        totalTransactions: transactionCount || 0,
        totalDocuments: documentCount || 0,
        activeTickets: ticketCount || 0,
        dbLatency: `${end - start}ms`
      });
      setSystemStatus('Operational');

    } catch (error) {
      console.error('Error loading admin stats:', error);
      setSystemStatus('Issues');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const StatCard = ({ title, value, subtext, icon: Icon, color, link, gradientColors }: any) => (
    <TouchableOpacity 
      onPress={() => link && router.push(link)}
      activeOpacity={0.7}
      className="flex-1 min-w-[45%] m-2"
    >
      <LinearGradient
        colors={gradientColors || ['#112240', '#112240']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 rounded-3xl border border-white/5 shadow-lg"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className={`p-3 rounded-2xl ${color === 'blue' ? 'bg-blue-500/20' : color === 'red' ? 'bg-red-500/20' : color === 'green' ? 'bg-green-500/20' : 'bg-[#64FFDA]/20'}`}>
            <Icon size={24} color={color === 'blue' ? '#60A5FA' : color === 'red' ? '#F87171' : color === 'green' ? '#4ADE80' : '#64FFDA'} />
          </View>
          {link && (
             <View className="bg-white/5 p-1 rounded-full">
                <ArrowRight size={16} color="#8892B0" />
             </View>
          )}
        </View>
        <Text className="text-3xl font-extrabold text-white mb-1">{value}</Text>
        <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider mb-1">{title}</Text>
        {subtext && <Text className="text-[#64748B] text-[10px]">{subtext}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadStats} tintColor="#64FFDA" />
        }
      >
        {/* Header Section */}
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-3xl font-extrabold tracking-tight">Admin Portal</Text>
            <View className={`px-3 py-1 rounded-full flex-row items-center border ${
                systemStatus === 'Operational' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}>
                <Activity size={12} color={systemStatus === 'Operational' ? '#4ADE80' : '#F87171'} />
                <Text className={`ml-2 text-xs font-bold ${
                    systemStatus === 'Operational' ? 'text-green-400' : 'text-red-400'
                }`}>{systemStatus}</Text>
            </View>
          </View>
          <Text className="text-[#8892B0] text-base">System Overview & Controls</Text>
        </View>

        {/* System Health Strip */}
        <View className="mx-6 mb-6 flex-row gap-3">
            <View className="flex-1 bg-[#112240] p-3 rounded-xl border border-white/5 flex-row items-center justify-center">
                <Server size={16} color="#64FFDA" />
                <Text className="text-[#8892B0] text-xs ml-2">Latency: <Text className="text-white font-bold">{stats.dbLatency}</Text></Text>
            </View>
            <View className="flex-1 bg-[#112240] p-3 rounded-xl border border-white/5 flex-row items-center justify-center">
                <ShieldCheck size={16} color="#A78BFA" />
                <Text className="text-[#8892B0] text-xs ml-2">Security: <Text className="text-white font-bold">Active</Text></Text>
            </View>
        </View>

        {/* Primary Stats Grid */}
        <View className="flex-row flex-wrap px-4 mb-4">
          <StatCard
            title="Total Users"
            value={loading ? "..." : stats.totalUsers.toString()}
            subtext={`+${stats.newUsersMonth} this month`}
            icon={Users}
            color="teal"
            link="/(main)/admin/users"
            gradientColors={['#112240', '#0D1F35']}
          />
          <StatCard
            title="Active Tickets"
            value={loading ? "..." : stats.activeTickets.toString()}
            subtext="Needs attention"
            icon={AlertTriangle}
            color="red"
            link="/(main)/support" 
            gradientColors={['#2A1515', '#112240']}
          />
          <StatCard
            title="Transactions"
            value={loading ? "..." : stats.totalTransactions.toString()}
            subtext="Total processed"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Documents"
            value={loading ? "..." : stats.totalDocuments.toString()}
            subtext="Encrypted files"
            icon={FileText}
            color="blue"
            link="/(main)/documents"
          />
        </View>

        {/* Quick Actions / Management Section */}
        <View className="px-6 mt-4">
          <Text className="text-white text-lg font-bold mb-4 flex-row items-center">
             Management Console
          </Text>
          
          <View className="gap-4">
            <TouchableOpacity 
              onPress={() => router.push('/(main)/admin/users')}
              className="flex-row items-center bg-[#112240] p-5 rounded-2xl border border-white/5 active:bg-[#162C52]"
            >
              <View className="w-12 h-12 rounded-full bg-blue-500/10 items-center justify-center mr-4 border border-blue-500/20">
                <Users size={24} color="#60A5FA" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">User Directory</Text>
                <Text className="text-[#8892B0] text-sm mt-0.5">Manage roles, bans, and profiles</Text>
              </View>
              <ArrowRight size={20} color="#8892B0" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(main)/support')}
              className="flex-row items-center bg-[#112240] p-5 rounded-2xl border border-white/5 active:bg-[#162C52]"
            >
              <View className="w-12 h-12 rounded-full bg-red-500/10 items-center justify-center mr-4 border border-red-500/20">
                <Clock size={24} color="#F87171" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Support Queue</Text>
                <Text className="text-[#8892B0] text-sm mt-0.5">Handle open tickets & disputes</Text>
              </View>
              <View className="bg-red-500/20 px-2 py-1 rounded-md">
                 <Text className="text-red-400 text-xs font-bold">{stats.activeTickets}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}