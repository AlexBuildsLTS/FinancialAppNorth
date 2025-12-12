import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  RefreshControl,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator
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
  Database,
  Clock
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase, getUsers } from '../../../services/dataService';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Standard tablet/desktop breakpoint

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
      // 1. Fetch Users
      const users = await getUsers();
      
      // 2. Fetch Growth (Last 30 Days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // 3. Totals
      const { count: transactionCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
      const { count: documentCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
      const { count: ticketCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).neq('status', 'closed');

      const end = Date.now();
      
      setStats({
        totalUsers: users.length,
        newUsersMonth: newUsersCount || 0,
        totalTransactions: transactionCount || 0,
        totalDocuments: documentCount || 0,
        activeTickets: ticketCount || 0,
        dbLatency: `${end - start}ms`
      });
      setSystemStatus('Operational');

    } catch (error) {
      console.error('Admin Stats Error:', error);
      setSystemStatus('Issues');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  // --- Components ---

  const StatCard = ({ title, value, subtext, icon: Icon, color, link, gradientColors }: any) => (
    <TouchableOpacity 
      onPress={() => link && router.push(link)}
      activeOpacity={0.8}
      // Responsive Width: 48% on mobile (2 col), 23% on desktop (4 col)
      style={{ width: isDesktop ? '24%' : '48%' }} 
      className="mb-4"
    >
      <LinearGradient
        colors={gradientColors || ['#112240', '#0F2545']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 rounded-3xl border border-white/10 shadow-lg h-44 justify-between"
      >
        <View className="flex-row justify-between items-start">
          <View className={`p-3 rounded-2xl bg-${color}-500/20`}>
            {/* Color mapping fallback for dynamic classes */}
            <Icon 
              size={24} 
              color={
                color === 'blue' ? '#60A5FA' : 
                color === 'red' ? '#F87171' : 
                color === 'green' ? '#4ADE80' : 
                color === 'teal' ? '#2DD4BF' : '#64FFDA'
              } 
            />
          </View>
          {link && (
             <View className="bg-white/5 p-1.5 rounded-full border border-white/5">
                <ArrowRight size={14} color="#8892B0" />
             </View>
          )}
        </View>
        
        <View>
          {loading ? (
             <ActivityIndicator size="small" color="#8892B0" style={{alignSelf: 'flex-start'}} />
          ) : (
             <Text className="text-3xl font-extrabold text-white mb-1 tracking-tight">{value}</Text>
          )}
          <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider">{title}</Text>
          {subtext && <Text className="text-[#64748B] text-[10px] mt-1 font-medium">{subtext}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-[#0A192F] border-b border-white/5">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-3xl font-extrabold tracking-tight">Admin Portal</Text>
            <View className={`px-3 py-1.5 rounded-full flex-row items-center border ${
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

      <ScrollView 
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} tintColor="#64FFDA" />}
      >
        {/* System Health Strip */}
        <View className="flex-row gap-3 mb-8">
            <View className="flex-1 bg-[#112240] p-3 rounded-xl border border-white/5 flex-row items-center justify-center shadow-sm">
                <Database size={16} color="#64FFDA" />
                <Text className="text-[#8892B0] text-xs ml-2 font-medium">Latency: <Text className="text-white font-bold">{stats.dbLatency}</Text></Text>
            </View>
            <View className="flex-1 bg-[#112240] p-3 rounded-xl border border-white/5 flex-row items-center justify-center shadow-sm">
                <ShieldCheck size={16} color="#A78BFA" />
                <Text className="text-[#8892B0] text-xs ml-2 font-medium">Auth: <Text className="text-white font-bold">Secure</Text></Text>
            </View>
        </View>

        {/* Primary Stats Grid */}
        {/* 'justify-between' puts space between cards, flex-wrap allows them to flow to next line */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtext={`+${stats.newUsersMonth} this month`}
            icon={Users}
            color="teal"
            link="/(main)/admin/users"
            gradientColors={['#112240', '#0D1F35']}
          />
          <StatCard
            title="Active Tickets"
            value={stats.activeTickets}
            subtext="Needs attention"
            icon={AlertTriangle}
            color="red"
            link="/(main)/support" 
            gradientColors={['#2A1515', '#112240']}
          />
          <StatCard
            title="Transactions"
            value={stats.totalTransactions}
            subtext="Total processed"
            icon={TrendingUp}
            color="green"
            link="/(main)/finances/transactions"
          />
          <StatCard
            title="Documents"
            value={stats.totalDocuments}
            subtext="Encrypted files"
            icon={FileText}
            color="blue"
            link="/(main)/documents"
          />
        </View>

        {/* Management Console */}
        <View className="mt-8">
          <Text className="text-white text-lg font-bold mb-4 flex-row items-center">
             Management Console
          </Text>
          
          <View className="gap-4">
            <TouchableOpacity 
              onPress={() => router.push('/(main)/admin/users')}
              className="flex-row items-center bg-[#112240] p-5 rounded-2xl border border-white/5 active:bg-[#162C52] shadow-sm"
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
              className="flex-row items-center bg-[#112240] p-5 rounded-2xl border border-white/5 active:bg-[#162C52] shadow-sm"
            >
              <View className="w-12 h-12 rounded-full bg-red-500/10 items-center justify-center mr-4 border border-red-500/20">
                <Clock size={24} color="#F87171" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Support Queue</Text>
                <Text className="text-[#8892B0] text-sm mt-0.5">Handle open tickets & disputes</Text>
              </View>
              {stats.activeTickets > 0 && (
                <View className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/20">
                   <Text className="text-red-400 text-xs font-bold">{stats.activeTickets} Active</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(main)/finances')}
              className="flex-row items-center bg-[#112240] p-5 rounded-2xl border border-white/5 active:bg-[#162C52] shadow-sm"
            >
              <View className="w-12 h-12 rounded-full bg-green-500/10 items-center justify-center mr-4 border border-green-500/20">
                <TrendingUp size={24} color="#4ADE80" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Financial Overview</Text>
                <Text className="text-[#8892B0] text-sm mt-0.5">View global transaction volume</Text>
              </View>
              <ArrowRight size={20} color="#8892B0" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Spacer for bottom tab bar */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}