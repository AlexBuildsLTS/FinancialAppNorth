
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { useRouter } from 'expo-router';
import { Activity, ArrowUpRight, DollarSign, Users, ShieldCheck, FileText } from 'lucide-react-native';
import { UserRole } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const StatCard = ({ title, value, icon: Icon, color, link }: any) => (
    <TouchableOpacity 
      onPress={() => link && router.push(link)}
      className="bg-[#112240] p-5 rounded-2xl border border-white/5 flex-1 min-w-[150px] mb-4 mr-4"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className={`w-10 h-10 rounded-xl items-center justify-center bg-${color}-500/10`}>
          <Icon size={20} color={color === 'emerald' ? '#34D399' : color === 'blue' ? '#60A5FA' : '#F472B6'} />
        </View>
        {link && <ArrowUpRight size={16} color="#8892B0" />}
      </View>
      <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1">{title}</Text>
      <Text className="text-white text-2xl font-bold">{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-8">
        <Text className="text-white text-3xl font-bold mb-2">Dashboard</Text>
        <Text className="text-[#8892B0]">Welcome back, {user.name}</Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap mb-6">
        <StatCard 
          title="Total Balance" 
          value="$124,500.00" 
          icon={DollarSign} 
          color="emerald" 
          link="/(main)/transactions"
        />
        <StatCard 
          title="Active Docs" 
          value="12" 
          icon={FileText} 
          color="blue" 
          link="/(main)/documents"
        />
      </View>

      {/* Role Specific Sections */}
      {user.role === UserRole.ADMIN && (
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">Admin Controls</Text>
          <View className="flex-row flex-wrap">
            <StatCard 
              title="System Users" 
              value="2,543" 
              icon={Users} 
              color="pink" 
              link="/(main)/admin/users"
            />
            <StatCard 
              title="System Health" 
              value="98.2%" 
              icon={Activity} 
              color="emerald" 
              link="/(main)/admin"
            />
          </View>
        </View>
      )}

      {user.role === UserRole.CPA && (
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">CPA Workspace</Text>
          <View className="flex-row flex-wrap">
            <StatCard 
              title="Pending Audits" 
              value="5" 
              icon={ShieldCheck} 
              color="pink" 
              link="/(main)/cpa"
            />
            <StatCard 
              title="Client Requests" 
              value="8" 
              icon={Users} 
              color="blue" 
              link="/(main)/cpa"
            />
          </View>
        </View>
      )}

      {/* Recent Activity Placeholder */}
      <View className="bg-[#112240] rounded-2xl border border-white/5 p-6">
        <Text className="text-white text-lg font-bold mb-4">Recent Insights</Text>
        <View className="gap-4">
           <View className="flex-row items-center gap-4">
             <View className="w-2 h-2 rounded-full bg-[#64FFDA]" />
             <Text className="text-[#8892B0] flex-1">Spending in "Software" increased by 12% this month.</Text>
           </View>
           <View className="flex-row items-center gap-4">
             <View className="w-2 h-2 rounded-full bg-[#F472B6]" />
             <Text className="text-[#8892B0] flex-1">Tax deadline approaching in 14 days.</Text>
           </View>
           <View className="flex-row items-center gap-4">
             <View className="w-2 h-2 rounded-full bg-[#60A5FA]" />
             <Text className="text-[#8892B0] flex-1">New document uploaded: Q3 Financials.</Text>
           </View>
        </View>
      </View>
    </ScrollView>
  );
}
