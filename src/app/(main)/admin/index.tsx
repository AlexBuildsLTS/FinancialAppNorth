import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Users, AlertTriangle, ArrowRight, TrendingUp, DollarSign, FileText, BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getUsers } from '../../../services/dataService';
import { supabase } from '../../../lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalDocuments: 0,
    activeTickets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get users count
      const users = await getUsers();
      const totalUsers = users.length;

      // Get transaction count
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Get document count
      const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      // Get active tickets
      const { count: ticketCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'closed');

      setStats({
        totalUsers,
        totalTransactions: transactionCount || 0,
        totalDocuments: documentCount || 0,
        activeTickets: ticketCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }: any) => (
    <TouchableOpacity 
      onPress={() => link && router.push(link)}
      className="bg-[#112240] p-5 rounded-2xl border border-white/5 flex-1 mx-1 min-w-[150px]"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-500/10' : color === 'red' ? 'bg-red-500/10' : 'bg-[#64FFDA]/10'}`}>
          <Icon size={20} color={color === 'blue' ? '#60A5FA' : color === 'red' ? '#F87171' : '#64FFDA'} />
        </View>
        {link && <ArrowRight size={16} color="#8892B0" />}
      </View>
      <Text className="text-2xl font-bold text-white mb-1">{value}</Text>
      <Text className="text-[#8892B0] text-xs font-medium uppercase">{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <ScrollView className="flex-1 px-4 py-6">
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold">Admin Portal</Text>
          <Text className="text-[#8892B0]">System Overview & Controls</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
          <StatCard
            title="Total Users"
            value={loading ? "..." : stats.totalUsers.toString()}
            icon={Users}
            color="teal"
            link="/(main)/admin/users"
          />
          <StatCard
            title="Transactions"
            value={loading ? "..." : stats.totalTransactions.toString()}
            icon={TrendingUp}
            color="green"
            link="/(main)/finances/transactions"
          />
          <StatCard
            title="Documents"
            value={loading ? "..." : stats.totalDocuments.toString()}
            icon={FileText}
            color="blue"
            link="/(main)/documents"
          />
          <StatCard
            title="Active Tickets"
            value={loading ? "..." : stats.activeTickets.toString()}
            icon={AlertTriangle}
            color="red"
            link="/(main)/support" // Added missing link
          />
        </View>

        {/* Quick Actions */}
        <Text className="text-white text-lg font-bold mb-4">Quick Management</Text>
        <View className="gap-3">
          <TouchableOpacity 
            onPress={() => router.push('/(main)/admin/users')}
            className="flex-row items-center bg-[#112240] p-4 rounded-xl border border-white/5"
          >
            <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-4">
              <Users size={20} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Manage Users</Text>
              <Text className="text-[#8892B0] text-sm">Roles, Bans, and Permissions</Text>
            </View>
            <ArrowRight size={20} color="#8892B0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}