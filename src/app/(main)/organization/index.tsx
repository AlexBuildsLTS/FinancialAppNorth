import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Users, Building2, CreditCard, PlusCircle, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { orgService } from '@/services/orgService';
import { GlassCard } from '@/shared/components/GlassCard';
import { Organization } from '@/types';

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrg();
  }, [user]);

  const loadOrg = async () => {
    if (!user) return;
    try {
      const data = await orgService.getMyOrganization(user.id);
      setOrg(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createOrg = () => {
    Alert.prompt(
      "Create Organization",
      "Enter your company name:",
      async (name) => {
        if (!name || !user) return;
        try {
          setLoading(true);
          const newOrg = await orgService.createOrganization(user.id, name);
          setOrg(newOrg);
        } catch (e) {
          Alert.alert("Error", "Could not create organization");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  if (loading) return <View className="items-center justify-center flex-1 bg-slate-900"><ActivityIndicator color="#64FFDA"/></View>;

  if (!org) {
    return (
      <View className="items-center justify-center flex-1 p-6 bg-slate-900">
        <Building2 size={64} color="#64748B" />
        <Text className="mt-6 text-2xl font-bold text-center text-white">No Organization Found</Text>
        <Text className="mt-2 mb-8 text-center text-slate-400">
          Upgrade to Enterprise to manage teams, approvals, and corporate spend.
        </Text>
        <TouchableOpacity onPress={createOrg} className="bg-[#64FFDA] px-6 py-4 rounded-xl">
          <Text className="font-bold text-slate-900">Create Organization</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen options={{ title: org.name, headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
      
      <ScrollView className="p-4">
        {/* Admin Overview */}
        <View className="flex-row gap-4 mb-6">
           <GlassCard className="items-center flex-1 p-4">
              <Users size={24} color="#60A5FA" />
              <Text className="mt-2 text-xs uppercase text-slate-400">Team</Text>
              <Text className="text-xl font-bold text-white">1</Text>
           </GlassCard>
           <GlassCard className="items-center flex-1 p-4">
              <ShieldCheck size={24} color="#10B981" />
              <Text className="mt-2 text-xs uppercase text-slate-400">Role</Text>
              <Text className="text-xl font-bold text-white">Owner</Text>
           </GlassCard>
        </View>

        <Text className="mb-4 text-lg font-bold text-white">Management Console</Text>

        <View className="gap-3">
          <TouchableOpacity 
            onPress={() => router.push('/(main)/organization/members')}
            className="flex-row items-center justify-between p-4 bg-slate-800 rounded-xl"
          >
            <View className="flex-row items-center gap-4">
               <View className="p-2 rounded-lg bg-blue-500/20"><Users size={20} color="#60A5FA" /></View>
               <View>
                 <Text className="font-bold text-white">Member Management</Text>
                 <Text className="text-xs text-slate-400">Invite, promote, or remove users</Text>
               </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(main)/approvals')}
            className="flex-row items-center justify-between p-4 bg-slate-800 rounded-xl"
          >
            <View className="flex-row items-center gap-4">
               <View className="p-2 rounded-lg bg-orange-500/20"><CreditCard size={20} color="#F59E0B" /></View>
               <View>
                 <Text className="font-bold text-white">Expense Approvals</Text>
                 <Text className="text-xs text-slate-400">Review pending team requests</Text>
               </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}